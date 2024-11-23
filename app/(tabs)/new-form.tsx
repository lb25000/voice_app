import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import CommonStyles from '../commonStyles';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { fetchSpeechAudio } from '../textToSpeechTransformer';
import Toast from 'react-native-toast-message';
import { eventEmitter } from '@/eventDispatcher';


const NewForm = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isNameMicActive, setIsNameMicActive] = useState(false);
  const [isPhoneMicActive, setIsPhoneMicActive] = useState(false);
  const [isNoteMicActive, setIsNoteMicActive] = useState(false);
  const [isNavigationMicActive, setIsNavigationMicActive] = useState(false);
  const [isNamePressed, setIsNamePressed] = useState(false);
  const [isPhonePressed, setIsPhonePressed] = useState(false);
  const [isNotePressed, setIsNotePressed] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isNoteValid, setIsNoteValid] = useState(true);
  const [nameFeedback, setNameFeedback] = useState('');
  const [phoneFeedback, setPhoneFeedback] = useState('');
  const [noteFeedback, setNoteFeedback] = useState('');
  const [inputHeightName, setInputHeightName] = useState(40);
  const [inputHeightPhone, setInputHeightPhone] = useState(40);
  const [inputHeightNote, setInputHeightNote] = useState(100);
  const [isTalking, setIsTalking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [canBeSaved, setCanBeSaved] = useState(isNameValid && isPhoneValid);
  const [isSavePressed, setIsSavePressed] = useState(false);


  const showToast = async() => {
    if (canBeSaved) {
      Toast.show({
        type:'success',
        text1: '',
        text2: 'Saved',
        position: 'top',
        visibilityTime: 1000,
      });
      setName('');
      setPhone('');
      setNote('');
      setIsNameValid(false);
      setIsPhoneValid(false);
    }
  }

  useEffect(() => {
    const saveViaVoice = () => {
      console.log("Saving via Voice...");
      if (canBeSaved) {
          Toast.show({
            type:'success',
            text1: '',
            text2: 'Saved',
            position: 'top',
            visibilityTime: 1000,
          });
          speakFeedback("Your entries have been saved.");
          setName('');
          setPhone('');
          setNote('');
          setIsNameValid(false);
          setIsPhoneValid(false);
      } else {
        speakFeedback("Saving is not yet possible. Please check your entries.");
      }
    }
    eventEmitter.on('voiceSaveCommand', saveViaVoice);
    return () => {
      eventEmitter.off('voiceSaveCommand', saveViaVoice);
    };
  }, [canBeSaved]);


  const save = () => {
    showToast();
  }

  useEffect(() => {
    setCanBeSaved(isNameValid && isPhoneValid);
    //setCanSave(isNameValid && isPhoneValid);
  }, [isNameValid, isPhoneValid]);

  const{
    isRecording: isNameRecording,
    startRecording: startNameRecording,
    stopRecording: stopNameRecording,
  } = useVoiceRecorder(setName, setIsNameValid, setNameFeedback, "name");

  const {
    isRecording: isPhoneRecording,
    startRecording: startPhoneRecording,
    stopRecording: stopPhoneRecording,
  } = useVoiceRecorder(setPhone, setIsPhoneValid, setPhoneFeedback, "phone");

  const {
    isRecording: isNoteRecording,
    startRecording: startNoteRecording,
    stopRecording: stopNoteRecording,
  } = useVoiceRecorder(setNote, setIsNoteValid, setNoteFeedback, "note");

  const handleMicrophoneNamePress = async () => {
    setIsNameMicActive(prev => !prev);
    setIsPhoneMicActive(false);
    setIsNoteMicActive(false);
    setIsNavigationMicActive(false);

    if (!isNameRecording) {
      console.log("start recording name");
      await startNameRecording();
    } else {
      console.log("stop recording name");
      await stopNameRecording();
      }
  };

  const handleMicrophonePhonePress = async () => {
    setIsPhoneMicActive(prev => !prev);
    setIsNameMicActive(false);
    setIsNoteMicActive(false);
    setIsNavigationMicActive(false);

    if (!isPhoneRecording) {
      console.log("start recording phone");
      await startPhoneRecording();
    } else {
      console.log("stop recording phone");
      await stopPhoneRecording();

      }
  };

  const handleMicrophoneNotePress = async () => {
    setIsNoteMicActive(prev => !prev);
    setIsNameMicActive(false);
    setIsPhoneMicActive(false);
    setIsNavigationMicActive(false);

    if (!isNoteRecording) {
      console.log("start recording note");
      await startNoteRecording();
    } else {
      console.log("stop recording note");
      await stopNoteRecording();
      }
  };

  const handleMicroNavigationPress = () => {
    setIsNavigationMicActive(prev => !prev);
    setIsNameMicActive(false);
    setIsPhoneMicActive(false);
    setIsNoteMicActive(false);

    console.log("Micro for navigation pressed", isNavigationMicActive);
  };

  const validateInput = async (text: string, field: string) => {
    console.log("Validate Entry:", text, "for Field:", field);
    let feedback = "";
    const cleanedTranscription = text.replace(/\s+/g, '');
    if ((field == "name") && cleanedTranscription == "") {
      setIsNameValid(false);
      //feedback = "No Transcription found. Don't forget to enter a name. ";
      //setNameFeedback(feedback);
    }
    else if ((field == "phone") && text == "") {
      setIsPhoneValid(false);
      //feedback = "No Transcription found. Don't forget to enter a phone number. ";
      //setPhoneFeedback(feedback);
;    }
    else if (field == "phone") {
      let feedback = "";
      const cleanedTranscription = text.replace(/\s+/g, '');
      const cleanedTranscription2 = cleanedTranscription.replace('plus', '+');
      if (/^\+?(\d+)?$/.test(cleanedTranscription2) == false) {
        setIsPhoneValid(false);
        feedback += "Please check the phone number.\n It contains invalid characters. ";
        setPhoneFeedback(feedback);
      }
      else if (((cleanedTranscription2.charAt(0) == '0') && (cleanedTranscription2.length < 10)) || ((cleanedTranscription2.charAt(0) == '+') && (cleanedTranscription2.length < 12))) {
        setIsPhoneValid(false);
        feedback += "The phone number is too short. ";
        setPhoneFeedback(feedback);
      }
      else if ((cleanedTranscription2.charAt(0) == '0' && cleanedTranscription2.length > 10) || (cleanedTranscription2.charAt(0) == '+' && cleanedTranscription2.length > 12)) {
        setIsPhoneValid(false);
        feedback += "The phone number is too long. ";
        setPhoneFeedback(feedback);
      }
      else if (cleanedTranscription2.charAt(0) != '0' && cleanedTranscription2.charAt(0) != '+') {
        setIsPhoneValid(false);
        feedback += "The phone number should start with + or 0. "
        setPhoneFeedback(feedback);
      }
      else {
        setIsPhoneValid(true);
        setPhoneFeedback("");
      }
    }
    else {
      if (field == "name") {
      setIsNameValid(true);
      setNameFeedback("");
      }
      if (field == "phone") {
      setPhoneFeedback("");
      setIsPhoneValid(true);
      }
    }
  }

  const speakFeedback = async (feedback: string) => {
    console.log("Speak Feedback:", feedback);
    if (isTalking && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsTalking(false);
        return;
    }
    const audioBase64 = await fetchSpeechAudio(feedback);
    console.log(audioBase64);
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



  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={CommonStyles.container}>

      <View>
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Name</Text>
      <Text style={ isNameValid ? styles.label : styles.star}>*</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.inputSpacing,
            (isNameValid && (name != "")) ? styles.validInput : styles.invalidInput,
            {height: inputHeightName}
          ]}
          multiline
          // placeholder="Name"
          value={name}
          onChangeText={(text) => {
            validateInput(text, "name");
            setName(text);
          }}
          onContentSizeChange={(event) => setInputHeightName(event.nativeEvent.contentSize.height)}
        />
        <TouchableOpacity
          onPressIn={() => setIsNamePressed(true)}
          onPressOut={() => setIsNamePressed(false)}
          onPress={handleMicrophoneNamePress}
          style={ [ styles.iconButton,
          {
            borderColor: isNameMicActive ? "green" : "black",
            transform: isNamePressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
            shadowOpacity: isNamePressed ? 0.4 : 0,
          } ]}>
          <FontAwesome
            name="microphone"
            size={24}
            color={isNameMicActive ? "green" : "black"}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.feedback}> {nameFeedback} </Text>
      </View>

      <View>
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Phone number</Text>
      <Text style={ isPhoneValid ? styles.label : styles.star}>*</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.inputSpacing,
            (isPhoneValid && (phone != "")) ? styles.validInput : styles.invalidInput,
            { height: inputHeightPhone}
          ]}
          multiline
          // placeholder="Phone"
          value={phone}
          keyboardType="numeric"
          onChangeText={(text) => {
            validateInput(text, "phone");
            setPhone(text);
          }}
          onContentSizeChange={(event) => setInputHeightPhone(event.nativeEvent.contentSize.height)}
        />
        <TouchableOpacity
          onPressIn={() => setIsPhonePressed(true)}
          onPressOut={() => setIsPhonePressed(false)}
          onPress={handleMicrophonePhonePress}
          style={ [ styles.iconButton,
          {
            borderColor: isPhoneMicActive ? "green" : "black",
            transform: isPhonePressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
            shadowOpacity: isPhonePressed ? 0.4 : 0,
          } ]}>
          <FontAwesome
            name="microphone"
            size={24}
            color={isPhoneMicActive ? "green" : "black"}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.feedback}> {phoneFeedback} </Text>
      </View>

      <View>
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Notes</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.inputSpacing,
            (note == '') ? styles.invalidInput : styles.validInput,
            { height: inputHeightNote}
          ]}
          multiline
          // placeholder="Note"
          value={note}
          onChangeText={setNote}
          onContentSizeChange={(event) => setInputHeightNote(Math.max(100, event.nativeEvent.contentSize.height))}
        />
        <TouchableOpacity
          onPressIn={() => setIsNotePressed(true)}
          onPressOut={() => setIsNotePressed(false)}
          onPress={handleMicrophoneNotePress}
          style={ [ styles.iconButton,
          {
            borderColor: isNoteMicActive ? "green" : "black",
            transform: isNotePressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
            shadowOpacity: isNotePressed ? 0.4 : 0,
          } ]}>
          <FontAwesome
            name="microphone"
            size={24}
            color={isNoteMicActive ? "green" : "black"}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.feedback}> {noteFeedback} </Text>
    </View>
    </View>
    <TouchableOpacity
      onPressIn={() => setIsSavePressed(true)}
      onPressOut={() => setIsSavePressed(false)}
      onPress={save}
      disabled={!canBeSaved}
      style={ [ styles.saveButton,
      {
        borderColor: "black",
        transform: isSavePressed ? [{ scale: 0.9 }] : [{ scale: 1 }],
        opacity: canBeSaved ? 1 : 0.4,
      } ]}>
      <Text style={{ color: "black", fontSize: 20, marginBottom: 4 }}> save </Text>
    </TouchableOpacity>
    <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 150,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  centeredContainer:{
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    marginBottom: 1,
    paddingLeft: 45,
    //justifyContent: 'center'
  },
  validInput: {
    height: 40,
    width: '70%',
    color: 'black',
    borderColor: '#33E393', //'green',
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  invalidInput: {
    height: 40,
    width: '70%',
    color: '#abaaba',
    borderColor: '#454454',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  iconButton: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222222',
    backgroundColor: '#e4DBff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    width: 80,
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    paddingTop: 0,
    borderColor: '#222222',
    backgroundColor: '#e4DBff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSpacing: {
    marginTop: 0,
    marginBottom: 0,
    // paddingBottom: 10,
  },
  label: {
    color: "#454454",
    marginBottom: 2,
    fontSize: 14,
    paddingBottom: 0,
    paddingTop: 16,
    paddingLeft: 0,
    textAlign: 'left',
  },
  star:{
    color: "red",
    marginBottom: 2,
    fontSize: 14,
    paddingBottom: 0,
    paddingTop: 16,
    textAlign: 'left',
  },
  feedback: {
    color: "#F5B6C0",
    width: '70%',
    fontSize: 11,
    paddingLeft: 45,
  }
});

export default NewForm;
