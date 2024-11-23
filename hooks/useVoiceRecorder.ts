import React, { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system"
import { GOOGLE_TEXT_TO_SPEECH_API_KEY } from '../api_key';
import { fetchSpeechAudio } from '../app/textToSpeechTransformer';


export const useVoiceRecorder = (
  onTranscription: (transcription: string) => void,
  onValid: (valid: boolean) => void,
  onFeedback: (feedback: string) => void,
  field: string
) => {
  const audioRecordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTalking, setIsTalking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const startRecording = async () => {
    await recordSpeech(audioRecordingRef, setIsRecording);
  };

  const stopRecording = async () => {
    await stopRecordingAndTranscribe(audioRecordingRef, setIsRecording, onTranscription);
  };

  const recordSpeech = async (
    audioRecordingRef: MutableRefObject<Audio.Recording | null>,
    setIsRecording: Dispatch<SetStateAction<boolean>>,
  ) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      let permissionResponse = await Audio.requestPermissionsAsync();


      if ( permissionResponse.status === "granted") {
        const recordingStatus = await audioRecordingRef.current?.getStatusAsync();
        setIsRecording(true);

        // Falls das Recording nicht erlaubt ist, eine neue Instanz erstellen
        if (!recordingStatus?.canRecord) {
          audioRecordingRef.current = new Audio.Recording();

          const recordingOptions = {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
            android: {
              extension: ".amr",
              outputFormat: Audio.AndroidOutputFormat.AMR_WB,
              audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 128000,
            },
            ios: {
              extension: ".wav",
              audioQuality: Audio.IOSAudioQuality.HIGH,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
          };

          await audioRecordingRef.current.prepareToRecordAsync(recordingOptions);
        }
        if (audioRecordingRef.current){
        await audioRecordingRef.current.startAsync();}
      } else {
        console.error("Permission to record audio is required!");
        return;
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      return;
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = (reader.result as string).split(',')[1]; // Strip metadata
        resolve(base64Audio); // Make sure the base64 string is returned
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };


  const stopRecordingAndTranscribe = async (
    audioRecordingRef: MutableRefObject<Audio.Recording | null>,
    setIsRecording: Dispatch<SetStateAction<boolean>>,
    onTranscription: (transcription: string) => void
  ) => {
    try {
      if (audioRecordingRef.current) {
        await audioRecordingRef.current.stopAndUnloadAsync();
        setIsRecording(false);
        const uri = audioRecordingRef.current.getURI();
        console.log("Recording URI: ", uri); // URI der aufgenommenen Audiodatei

        if (uri) {
          let audioBase64;
          if (Platform.OS === "web") {
            // Fetch the Blob and convert it to base64 for the web
            const response = await fetch(uri);
            const blob = await response.blob();
            audioBase64 = await blobToBase64(blob);
          } else {
            // Use FileSystem for Android and iOS
            audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          }
          //const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          const transcription = await sendAudioToGoogleSpeechToText(audioBase64);

          if (field == 'phone') {
            const cleanedTranscription = transcription.replace(/\s+/g, '').toLowerCase().replace("plus", '+').replace('zero', '0');;
            onTranscription(cleanedTranscription);
          }
          else onTranscription(transcription); // Callback, um die Transkription zu setzen
        } else {
          console.error("No URI for recording found.");
        }
      } else {
        console.error("Recording reference is null.");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const sendAudioToGoogleSpeechToText = async (audioBase64: string) => {
    console.log("Audio base64 string length:", audioBase64.length);
    const apiKey = GOOGLE_TEXT_TO_SPEECH_API_KEY;
    const audioConfig = {
      encoding: Platform.select({
        "android" : "AMR_WB",
        "ios" : "LINEAR16",
        "web" : "WEBM_OPUS"
      }),
      sampleRateHertz: Platform.select({
        "android" : 16000,
        "ios" : 16000,
        "web" : 48000
      }),
      languageCode: "en-US",
    };

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: {
          content: audioBase64, // Das Audio in Base64
        },
        config: audioConfig,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Error from Speech API: ", errorDetails);
      return //"Fehler bei der Transkription.";
    }

    const { results } = await response.json();
    const transcription = results
      ? results.map((result: any) => result.alternatives[0].transcript).join('\n')
      : ""; //"Keine Transkription verfügbar.";

    if (field == "name" || field == "phone" || field == "note") validateInput(transcription, field);
    return transcription;
  };

  const validateInput = async (transcription: string, field: string) => {
    console.log("Validiere Trans:", transcription, "für Feld:", field);
    let feedback = "";
    if ((field === "name" || field === "phone") && transcription === "") {
        onValid(false);
        feedback = `No transcription found. \n Don't forget to enter a ${field}.`;
        onFeedback(feedback);
        await speakFeedback(feedback)
        return;
    }

    if (field === "phone") {
        const cleanedTranscription = transcription.replace(/\s+/g, '')
        .toLowerCase()
        .replace('plus', '+')
        .replace('zero', '0');
        if (/^\+?(\d+)?$/.test(cleanedTranscription) === false) {
            feedback += "Please check the phone number.\n It contains invalid characters. ";
            await speakFeedback(feedback)
        } else if ((cleanedTranscription.startsWith("0") && cleanedTranscription.length < 10) ||
                   (cleanedTranscription.startsWith("+") && cleanedTranscription.length < 12)) {
            feedback += "The phone number is too short. ";
            await speakFeedback(feedback)
        } else if ((cleanedTranscription.startsWith("0") && cleanedTranscription.length > 10) ||
                   (cleanedTranscription.startsWith("+") && cleanedTranscription.length > 12)) {
            feedback += "The phone number is too long. ";
            await speakFeedback(feedback)
        } else if (!cleanedTranscription.startsWith("0") && !cleanedTranscription.startsWith("+")) {
            feedback += "The phone number should start with + or 0. ";
            await speakFeedback(feedback)
        } else {
            onValid(true);
            onFeedback("");
            return;
        }

        // Falls es noch Fehler im Feedback gibt, wird hier auf ungültig gesetzt
        if (feedback) {
            onValid(false);
            onFeedback(feedback);
        }
    } else {
        // Bei validen Feldern (ohne Fehler) Feedback zurücksetzen
        onValid(true);
        onFeedback("");
    }
};

const speakFeedback = async (feedback: string) => {
  console.log("Spreche Feedback:", feedback);
  if (isTalking && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsTalking(false);
      return;
  }
  const audioBase64 = await fetchSpeechAudio(feedback);
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
  };
};
