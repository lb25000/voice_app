import { TouchableOpacity } from 'react-native';
import { Image, StyleSheet, Platform, View, Text, TouchableHighlight } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { HelloWave } from '@/components/HelloWave';
import { Audio } from 'expo-av';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, {useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { fetchSpeechAudio } from '../textToSpeechTransformer';
import CommonStyles from '../commonStyles';

export default function HomeScreen() {
  const router = useRouter();
  const [isNavigationMicActive, setIsNavigationMicActive] = useState(false); // Zustand für den Navigations-Mikrofon-Button
  const [isTalking, setIsTalking] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const introductionMessage = 'Welcome to VoiceApp! You can go to "New Form" to add a new entry or "Keywords" to explore available voice commands. To use a keyword, tap the microphone button, say your command, and stop recording. Say "Say keywords" into the microphone to hear the full list of commands straight away.';
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleVolumePress = async () => {
    if (isTalking && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsTalking(false);
      return;
    }
    if (isTalking) return;


    const audioBase64 = await fetchSpeechAudio(introductionMessage);
    if (audioBase64) {
      const { sound } = await Audio.Sound.createAsync({ uri: audioBase64 });
      soundRef.current = sound;

      await sound.playAsync();
      setIsTalking(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.positionMillis === status.durationMillis) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsTalking(false);
        }
      });
    }
  };

  const handleMicroNavigationPress = () => {
    setIsNavigationMicActive(prev => !prev); // Zustand umschalten
    console.log("Micro for navigation pressed", isNavigationMicActive);
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>Welcome to VoiceApp!</Text>
        <HelloWave />
      </View>

      {/* Content */}
      <View style={
      [{backgroundColor: '#454454'}]
    }>
        <TouchableOpacity
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={handleVolumePress}
          style={[
            styles.roundButton,
            {
              borderColor: isTalking ? 'green' : 'black',
              transform: isPressed ? [{ scale: 0.8 }] : [{ scale: 1 }],
            },
          ]}
        >
          <FontAwesome name="volume-up" size={50} color={isTalking ? 'green' : 'black'} />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#454454',
  },
  contentContainer: {
    //flex: 1,
    justifyContent: 'center', // 'space-around',
    alignItems: 'center',
    paddingVertical: 130,
    flexDirection: 'row',
    backgroundColor: '#454454',
  },
  titleText: {
    textAlign: 'center',
    fontSize: 24,
    //marginBottom: 40,
    color: "white",
    paddingRight: 10,
  },
  waveIcon: {
    //marginBottom: 20,
  },
  roundButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    left: '70%',
    top: 20,
    backgroundColor: '#e4DBff',
  },
});
