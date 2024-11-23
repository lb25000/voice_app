import { Audio } from 'expo-av';
import { useState, useRef } from "react";
import { GOOGLE_TEXT_TO_SPEECH_API_KEY } from '../api_key';

const GOOGLE_API_KEY = GOOGLE_TEXT_TO_SPEECH_API_KEY;

export async function fetchSpeechAudio(text: string): Promise<string | null> {
  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });

    const result = await response.json();

    if (response.ok && result.audioContent) {
      return `data:audio/mp3;base64,${result.audioContent}`;
    } else {
      console.error('Audio content not received from Google Text-to-Speech API');
      return null;
    }
  } catch (error) {
    console.error('Error with text-to-speech conversion:', error);
    return null;
  }
}
