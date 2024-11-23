// app/NavigationMicrophone.tsx
import React, { useState, useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigationRecords } from '../hooks/useNavigationRecords'; // Importiere die neue Hook
import CommonStyles from './commonStyles';
import { Audio } from 'expo-av';

const NavigationMicrophone = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useNavigationRecords(); // Verwende die neue Hook

  const handleMicrophonePress = async () => {
    if (!isRecording) {
      console.log("Start recording for navigation");
      await startRecording();
    } else {
      console.log("Stop recording for navigation");
      await stopRecording();
    }
  };

  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={
      [{backgroundColor: '#454454'}]
    }>
    <TouchableOpacity
    onPressIn={() => setIsPressed(true)}
    onPressOut={() => setIsPressed(false)}
    onPress={handleMicrophonePress}
    style={[ CommonStyles.roundButton,
    {
      borderColor: isRecording ? "green" : "black",
      transform: isPressed ? [{ scale: 0.8 }] : [{ scale: 1 }],
      shadowOpacity: isPressed ? 0.4 : 0, // Schatten nur beim Drücken
    } ]}>
      <FontAwesome
        name="microphone"
        size={50}
        color={isRecording ? "green" : "black"}
      />
    </TouchableOpacity>
    </View>
  );
};

export default NavigationMicrophone;

