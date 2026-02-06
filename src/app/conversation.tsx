import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { useConversationStore } from '../stores/conversationStore';
import { RecordButton } from '../components/RecordButton';
import { transcribeAudio } from '../services/whisper';
import { getConversationResponse } from '../services/openai';
import { speakText, stopSpeaking } from '../services/tts';
import {
  saveMessage,
  saveMistake,
  endConversation,
} from '../services/supabase';

export default function ConversationScreen() {
  const router = useRouter();
  const {
    conversationId,
    messages,
    status,
    setStatus,
    addMessage,
    addMistake,
  } = useConversationStore();

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function setupAudio() {
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to use this app.'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    }

    setupAudio();

    return () => {
      stopSpeaking();
    };
  }, []);

  const startRecording = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      setStatus('processing');
      await recorder.stop();

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const uri = recorder.uri;

      if (!uri || !conversationId) {
        setStatus('idle');
        return;
      }

      // Transcribe audio
      const transcript = await transcribeAudio(uri);
      setLastTranscript(transcript);

      // Save user message
      const userMessage = await saveMessage(conversationId, 'user', transcript);
      addMessage(userMessage);

      // Get AI response
      const aiResponse = await getConversationResponse(transcript, messages);

      // Save assistant message
      const assistantMessage = await saveMessage(
        conversationId,
        'assistant',
        aiResponse.reply
      );
      addMessage(assistantMessage);

      // Save mistakes
      for (const mistake of aiResponse.mistakes) {
        const savedMistake = await saveMistake(
          conversationId,
          userMessage.id,
          mistake.original,
          mistake.correction,
          mistake.explanation
        );
        addMistake(savedMistake);
      }

      // Speak the response
      setStatus('playing');
      await speakText(aiResponse.reply);
      setStatus('idle');
    } catch (error) {
      console.error('Error processing recording:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  const handleRecordPress = () => {
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'idle') {
      startRecording();
    }
  };

  const handleEndConversation = async () => {
    if (conversationId) {
      await endConversation(conversationId);
    }
    router.replace('/summary');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Tap the button to start speaking in French.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user'
                    ? styles.userText
                    : styles.aiText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))
        )}

        {lastTranscript && status === 'processing' && (
          <View style={[styles.messageBubble, styles.userBubble]}>
            <Text style={[styles.messageText, styles.userText]}>
              {lastTranscript}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.controls}>
        <RecordButton status={status} onPress={handleRecordPress} />

        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndConversation}
        >
          <Text style={styles.endButtonText}>End Conversation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 250,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1F2937',
  },
  controls: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  endButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  endButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});
