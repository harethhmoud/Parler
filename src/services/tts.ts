import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

let currentPlayer: AudioPlayer | null = null;

export async function speakText(text: string): Promise<void> {
  // Stop any currently playing audio
  if (currentPlayer) {
    currentPlayer.remove();
    currentPlayer = null;
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

  const fileUri = `${FileSystem.cacheDirectory}tts_response.mp3`;
  const base64Encoding = FileSystem.EncodingType?.Base64 ?? 'base64';
  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
    encoding: base64Encoding as FileSystem.EncodingType,
  });

  const player = createAudioPlayer({ uri: fileUri });
  currentPlayer = player;
  player.play();

  return new Promise((resolve) => {
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
        currentPlayer = null;
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
  if (currentPlayer) {
    currentPlayer.pause();
    currentPlayer.remove();
    currentPlayer = null;
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
