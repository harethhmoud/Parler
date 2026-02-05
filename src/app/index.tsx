import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useConversationStore } from '../stores/conversationStore';
import { createConversation } from '../services/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const { userId, isInitialized, setConversationId, reset } = useConversationStore();

  const handleStartConversation = async () => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    try {
      reset();
      const conversation = await createConversation(userId);
      setConversationId(conversation.id);
      router.push('/conversation');
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Practice your French with voice conversations.
        </Text>
        <Text style={styles.description}>
          Speak in French, receive voice responses, and review your
          mistakes at the end of each session.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStartConversation}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Start Conversation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
