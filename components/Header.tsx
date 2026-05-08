import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SerialService } from '../services/SerialService';

// Props mein onReset add kiya gaya hai
interface HeaderProps {
  onDataReceived: (data: string) => void;
  onReset: () => void; 
}

export default function Header({ onDataReceived, onReset }: HeaderProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUsbConnected, setIsUsbConnected] = useState(false);

  const toggleSwitch = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);

    if (nextState) {
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
      // Yahan disconnect logic add kar sakte hain
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <MaterialCommunityIcons name="water-check" size={28} color="#00d4ff" />
        <Text style={styles.appName}>AquaSense <Text style={{color: '#fff'}}>Live</Text></Text>
      </View>

      <View style={styles.rightSection}>
        {/* Naya "NEW" Button (Plus Icon ke saath) */}
        <TouchableOpacity 
          onPress={onReset} 
          activeOpacity={0.7}
          style={styles.newButton}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#00d4ff" />
          <Text style={styles.newButtonText}>NEW</Text>
        </TouchableOpacity>

        <View style={styles.toggleGroup}>
          <Text style={[styles.statusText, {color: isEnabled ? '#00ff00' : '#4489ea'}]}>
            {isEnabled ? 'LIVE' : 'OFF'}
          </Text>
          <Switch
            trackColor={{ false: "#333", true: "#00d4ff" }}
            thumbColor={isEnabled ? "#00ff00" : "#999"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={[styles.dot, {backgroundColor: isUsbConnected ? '#00ff00' : '#ff4136'}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 50, paddingBottom: 15, backgroundColor: '#001f3f', borderBottomWidth: 1, borderBottomColor: '#003366' },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  appName: { fontSize: 18, fontWeight: 'bold', color: '#00d4ff', marginLeft: 8 },
  rightSection: { flexDirection: 'row', alignItems: 'center' },
  toggleGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold', marginRight: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  newButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 212, 255, 0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 15, 
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#00d4ff'
  },
  newButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 2 }
});
