import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Props define kiye hain taaki index.tsx se link ho sake
interface RawDataProps {
  onPlay: (data: string) => void;
}

export default function RawDataContainer({ onPlay }: RawDataProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rawText, setRawText] = useState('');
  const [dataLog, setDataLog] = useState<string[]>(['Waiting for hardware data...']);
  const expandAnim = useRef(new Animated.Value(60)).current;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 60 : 180, // Thoda height badha di hai readability ke liye
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleManualPlay = () => {
    if (rawText.trim() === '') return;

    // 1. Terminal log mein entry dikhao
    setDataLog(prev => [...prev.slice(-10), rawText]); 
    
    // 2. Main cards update karne ke liye data index.tsx ko bhejo
    onPlay(rawText); 
    
    // 3. Input clear kar do taaki agli entry kar sako
    setRawText('');
  };

  const clearLog = () => {
    setDataLog(['Buffer cleared...']);
    setRawText('');
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mainWrapper}>
        {/* Terminal Box */}
        <Animated.View style={[styles.terminalBox, { height: expandAnim }]}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            // Auto scroll to bottom taaki naya data dikhta rahe
            ref={(ref) => ref?.scrollToEnd({ animated: true })}
          >
            {dataLog.map((line, index) => (
              <Text key={index} style={styles.terminalText}>
                {`> ${line}`}
              </Text>
            ))}
          </ScrollView>
          
          {/* Input field: Ab ye manual data aur simulation dono ke liye ready hai */}
          <TextInput
            style={styles.hiddenInput}
            placeholder="Format: TDS:500,PH:7,TEMP:25"
            placeholderTextColor="#2a5a2a"
            value={rawText}
            onChangeText={setRawText}
            onSubmitEditing={handleManualPlay} // Enter dabane par bhi play ho jayega
          />
        </Animated.View>

        {/* Side Actions */}
        <View style={styles.sideActions}>
          <TouchableOpacity onPress={() => console.log("Copied")}>
            <MaterialCommunityIcons name="content-copy" size={20} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLog} style={styles.actionGap}>
            <MaterialCommunityIcons name="delete-sweep" size={22} color="#ff4136" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleManualPlay} style={styles.actionGap}>
            {/* Play button hi trigger karega parsing logic ko */}
            <MaterialCommunityIcons name="play-circle" size={28} color="#00ff00" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn}>
        <MaterialCommunityIcons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#00d4ff" 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { alignItems: 'center', marginVertical: 10 },
  mainWrapper: { flexDirection: 'row', width: '90%', alignItems: 'center' },
  terminalBox: {
    width: '85%',
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff0033',
    padding: 8,
    overflow: 'hidden',
    shadowColor: '#00ff00',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  terminalText: { color: '#00ff00', fontFamily: 'monospace', fontSize: 11 },
  hiddenInput: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a4a1a',
    marginTop: 5,
    paddingTop: 5,
  },
  sideActions: { width: '15%', alignItems: 'center', justifyContent: 'center' },
  actionGap: { marginTop: 15 },
  expandBtn: { marginTop: -5, backgroundColor: '#001529', borderRadius: 15, paddingHorizontal: 10 }
});