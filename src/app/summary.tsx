import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useConversationStore } from '../stores/conversationStore';
import { MistakeCard } from '../components/MistakeCard';
import { getMistakesForConversation } from '../services/supabase';
import { Mistake } from '../types';

export default function SummaryScreen() {
  const router = useRouter();
  const { conversationId, mistakes: storeMistakes, setMistakes, reset } =
    useConversationStore();
  const [loading, setLoading] = useState(true);
  const [mistakes, setLocalMistakes] = useState<Mistake[]>([]);

  useEffect(() => {
    async function fetchMistakes() {
      if (conversationId) {
        try {
          const fetchedMistakes = await getMistakesForConversation(conversationId);
          setMistakes(fetchedMistakes);
          setLocalMistakes(fetchedMistakes);
        } catch (error) {
          console.error('Failed to fetch mistakes:', error);
          setLocalMistakes(storeMistakes);
        }
      } else {
        setLocalMistakes(storeMistakes);
      }
      setLoading(false);
    }

    fetchMistakes();
  }, [conversationId, storeMistakes, setMistakes]);

  const handleStartNew = () => {
    reset();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {mistakes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.congratsTitle}>Congratulations!</Text>
            <Text style={styles.emptyText}>
              No mistakes detected in this conversation. Excellent work!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Your Mistakes</Text>
              <Text style={styles.subtitle}>
                {mistakes.length} mistake{mistakes.length > 1 ? 's' : ''} detected
              </Text>
            </View>

            {mistakes.map((mistake, index) => (
              <MistakeCard key={mistake.id} mistake={mistake} index={index} />
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleStartNew}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>New Conversation</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
});
