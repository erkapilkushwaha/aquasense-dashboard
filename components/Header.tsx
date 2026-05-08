import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SerialService } from '../services/SerialService';

export default function Header({ onDataReceived }: { onDataReceived: (data: string) => void }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUsbConnected, setIsUsbConnected] = useState(false);

  const toggleSwitch = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    if (nextState) {
      // USB Connection Start (Web Only)
      if (Platform.OS === 'web') {
        try {
          await SerialService.startConnection((data) => {
            setIsUsbConnected(true);
            onDataReceived(data);
          });
        } catch (err) {
          console.log("USB Error:", err);
          setIsEnabled(false);
        }
      }
    } else {
      setIsUsbConnected(false);
      // Connection stop logic agar zarurat ho
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <MaterialCommunityIcons name="water-check" size={30} color="#00d4ff" />
        <Text style={styles.appName}>AquaSense <Text style={{color: '#fff'}}>Live</Text></Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.toggleGroup}>
          <Text style={[styles.statusText, {color: isEnabled ? '#00ff00' : '#4489ea'}]}>
            {isEnabled ? 'LIVE' : 'OFF'}
          </Text>
          <Switch
            trackColor={{ false: "#ff3131", true: "#00d4ff" }}
            thumbColor={isEnabled ? "#eb0e0e" : "#da16da"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={[styles.dot, {backgroundColor: isUsbConnected ? '#00ff00' : '#ff4136'}]} />
      </View>
    </View>
  );
}

// styles same rahenge...
const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 50, paddingBottom: 15, backgroundColor: '#001f3f', borderBottomWidth: 1, borderBottomColor: '#003366' },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#00d4ff', marginLeft: 8 },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  toggleGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginRight: 5 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }
});
