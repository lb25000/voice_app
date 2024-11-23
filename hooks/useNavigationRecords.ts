// hooks/useNavigationRecords.ts
import { useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Importiere den Navigation-Hook
import { fetchSpeechAudio } from '../app/textToSpeechTransformer';
import { dispatchSaveEvent } from '@/eventDispatcher';


export const useNavigationRecords = (
) => {
  const navigation = useNavigation<any>();
  const [isTalking, setIsTalking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isValid, setValid] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const availableKeywords = "Use the keywords 'Home', 'Keywords' and 'New Form' to navigate to these tabs and use the keyword 'save' to save a new entry within the new form tab.";

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsTalking(false);
    }
  };

  const playKeywords = async () => {
    stopPlayback();
    if (isTalking && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsTalking(false);
      return;
    }

    const audioBase64 = await fetchSpeechAudio(availableKeywords);
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

  const {
    isRecording,
    startRecording,
    stopRecording,
  } = useVoiceRecorder(async (transcription) => {
    handleTranscription(transcription);
  }, setValid, setFeedback, "no field");

  const handleTranscription = async (transcription: string) => {
    const normalizedText = transcription.toLowerCase();
    console.log("Transcription received:", transcription);
    console.log("Normalized text:", normalizedText);

    if (normalizedText.includes('home')) {
      console.log("Navigating to Home");
      navigation.navigate('Home');
    } else if ((normalizedText.includes('keywords') || normalizedText.includes('key words')) && (!(normalizedText.includes('say key words') || normalizedText.includes('say keywords')))) {
      console.log("Navigating to Keywords");
      navigation.navigate('Keywords');
    } else if (normalizedText.includes('newform') || normalizedText.includes('new form')) {
      console.log("Navigating to NewForm");
      navigation.navigate('NewForm');
    } else if (normalizedText.includes('say keywords') || normalizedText.includes('say key words')) {
      console.log("playing keywords")
      playKeywords();
    } else if (normalizedText.includes('save') || normalizedText.includes('safe')) {
      console.log("Saving...");
      //onSave(true); //isNameValid, isPhoneValid, phoneFeedback);
      dispatchSaveEvent();
      console.log("Saving..."); //save();
    } else {
      let unrecognizedCommand = "Unrecognized command: ";
      unrecognizedCommand += transcription;
      console.log(unrecognizedCommand);
      setFeedback(unrecognizedCommand);
      await speakCommand(unrecognizedCommand);
    }
  };

  const speakCommand = async (text: string) => {
    console.log("speak command:", text);
    if (isTalking && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsTalking(false);
        return;
    }
    const audioBase64 = await fetchSpeechAudio(text);
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


  return {
    isRecording,
    startRecording,
    stopRecording,
    //setCanBeSaved: onSave,
    //setSaveVoice: onSaveVoice,
  };
};
