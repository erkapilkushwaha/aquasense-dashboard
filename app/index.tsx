import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, View, SafeAreaView, StatusBar, Animated, Platform } from 'react-native';

// Components Import
import Header from '../components/Header';
import SubHeader from '../components/SubHeader';
import RawDataContainer from '../components/RawDataContainer';
import SensorCard from '../components/SensorCard';
import ImageCard from '../components/ImageCard';
import GraphSection from '../components/GraphSection';
import AnalysisReport from '../components/AnalysisReport';
import StandardSection from '../components/StandardSection';
import Footer from '../components/Footer';

// Serial Service Import
import { SerialService } from '../services/SerialService';

export default function AquaSenseApp() {
  // --- STATE ---
  const [sensorData, setSensorData] = useState({
    tds: 0, ph: 7.0, temp: 0, turb: 0, flow: 0 
  });

  const [history, setHistory] = useState({
    PH: [7, 7, 7, 7, 7], 
    TDS: [0, 0, 0, 0, 0], 
    TURB: [0, 0, 0, 0, 0],
    TEMP: [0, 0, 0, 0, 0], 
    FLOW: [0, 0, 0, 0, 0], 
    OVERALL: [100, 100, 100, 100, 100]
  });

  // --- REFS & ANIMATION ---
  const mainScroll = useRef<ScrollView>(null);
  const dashboardRef = useRef<View>(null);
  const graphsRef = useRef<View>(null);
  const analysisRef = useRef<View>(null);
  const standardsRef = useRef<View>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // --- LOGIC: RESET DATA ---
  const resetData = () => {
    setSensorData({ tds: 0, ph: 7.0, temp: 0, turb: 0, flow: 0 });
    setHistory({
      PH: [7, 7, 7, 7, 7], 
      TDS: [0, 0, 0, 0, 0], 
      TURB: [0, 0, 0, 0, 0],
      TEMP: [0, 0, 0, 0, 0], 
      FLOW: [0, 0, 0, 0, 0], 
      OVERALL: [100, 100, 100, 100, 100]
    });
    console.log("Data Reset Successfully");
  };

  // --- LOGIC: PARSE & UPDATE ---
  const parseAndUpdate = (rawString: string) => {
    if (!rawString || rawString.trim() === "" || rawString.includes("STOP")) {
      resetData();
      return;
    }

    try {
      console.log("Processing Data:", rawString);
      let tds = 0, ph = 7, temp = 25, turb = 0;

      // Format 1: TDS:500,PH:7 (Key-Value)
      if (rawString.includes(':')) {
        const parts = rawString.split(',');
        parts.forEach(part => {
          const item = part.split(':');
          if (item.length === 2) {
            const key = item[0].trim().toUpperCase();
            const val = parseFloat(item[1].trim());
            if (!isNaN(val)) {
              if (key.includes('TDS')) tds = val;
              if (key.includes('PH')) ph = val;
              if (key.includes('TURB')) turb = val;
              if (key.includes('TEMP')) temp = val;
            }
          }
        });
      } 
      // Format 2: 500|7|25|0.5 (Separator)
      else {
        const values = rawString.split('|');
        tds = parseFloat(values[0]) || 0;
        ph = parseFloat(values[1]) || 7;
        temp = parseFloat(values[2]) || 25;
        turb = parseFloat(values[3]) || 0;
      }

      // State Update
      setSensorData({ tds, ph, temp, turb, flow: 0 });

      // History/Graph Update
      setHistory(prev => ({
        PH: [...prev.PH.slice(1), ph],
        TDS: [...prev.TDS.slice(1), tds],
        TURB: [...prev.TURB.slice(1), turb],
        TEMP: [...prev.TEMP.slice(1), temp],
        FLOW: [...prev.FLOW.slice(1), 0],
        OVERALL: [...prev.OVERALL.slice(1), (tds < 600 && ph > 6.5) ? 98 : 40]
      }));

    } catch (e) {
      console.log("Parsing Error in App.tsx");
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    const initSerial = async () => {
      if (Platform.OS === 'android') {
        try { await SerialService.startConnection(parseAndUpdate); } 
        catch (e) { console.log("Serial Connection Failed"); }
      }
    };
    initSerial();
    return () => { if (Platform.OS === 'android') SerialService.stopConnection(); };
  }, []);

  // --- UI HELPERS ---
  const highlightSection = (ref: any) => {
    ref.current?.measureLayout(mainScroll.current, (x: any, y: any) => {
      mainScroll.current?.scrollTo({ y: y - 50, animated: true });
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: false })
      ]).start();
    }, () => {});
  };

  const highlightStyle = {
    backgroundColor: pulseAnim.interpolate({
      inputRange: [0, 1], outputRange: ['transparent', 'rgba(0, 212, 255, 0.05)']
    })
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView ref={mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Pass parseAndUpdate to Header for the Switch logic */}
        <Header onDataReceived={parseAndUpdate} />
        
        <SubHeader status={sensorData.tds > 0 ? "LIVE: Receiving Data" : "System Offline / Waiting..."} />

        {/* Play button uses parseAndUpdate */}
        <RawDataContainer onPlay={parseAndUpdate} />

        <Animated.View ref={dashboardRef} style={[styles.section, highlightStyle]}>
          <View style={styles.grid}>
            <SensorCard label="pH VALUE" value={sensorData.ph} unit="pH" icon="ph" color="#A020F0" />
            <SensorCard label="TDS PURITY" value={sensorData.tds} unit="PPM" icon="water-opacity" color="#00d4ff" />
            <SensorCard label="TEMPERATURE" value={sensorData.temp} unit="°C" icon="thermometer" color="#FF4136" />
            <SensorCard label="TURBIDITY" value={sensorData.turb} unit="NTU" icon="waves" color="#FFB800" />
            <SensorCard label="FLOW RATE" value={0} unit="L/m" icon="speedometer" color="#00FF00" />
            <ImageCard />
          </View>
        </Animated.View>

        <Animated.View ref={graphsRef} style={[styles.section, highlightStyle]}>
          <GraphSection allData={history} />
        </Animated.View>

        <Animated.View ref={analysisRef} style={[styles.section, highlightStyle]}>
          <AnalysisReport sensorData={sensorData} />
        </Animated.View>

        <Animated.View ref={standardsRef} style={[styles.section, highlightStyle]}>
          <StandardSection />
        </Animated.View>

        <Footer 
          scrollRefs={{ mainScroll, dashboard: dashboardRef, graphs: graphsRef, analysis: analysisRef, standards: standardsRef }}
          onNavPress={highlightSection}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000814' },
  scrollContent: { paddingBottom: 40 },
  section: { marginVertical: 8, borderRadius: 15, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 5 },
});
