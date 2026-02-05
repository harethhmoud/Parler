import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

let currentSound: Audio.Sound | null = null;

export async function speakText(text: string): Promise<void> {
  // Stop any currently playing audio
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = null;
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'nova', // Good for French
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS API error: ${error}`);
  }

  const audioData = await response.arrayBuffer();
  const base64Audio = arrayBufferToBase64(audioData);

  const fileUri = FileSystem.cacheDirectory + 'tts_response.mp3';
  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { sound } = await Audio.Sound.createAsync(
    { uri: fileUri },
    { shouldPlay: true }
  );

  currentSound = sound;

  return new Promise((resolve) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
        resolve();
      }
    });

    // Timeout safety
    setTimeout(() => {
      resolve();
    }, 30000);
  });
}

export async function stopSpeaking(): Promise<void> {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
