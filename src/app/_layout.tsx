import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { signInAnonymously } from '../services/supabase';
import { useConversationStore } from '../stores/conversationStore';

export default function RootLayout() {
  const setUserId = useConversationStore((state) => state.setUserId);
  const setInitialized = useConversationStore((state) => state.setInitialized);

  useEffect(() => {
    async function initAuth() {
      try {
        const user = await signInAnonymously();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setInitialized(true);
      }
    }

    initAuth();
  }, [setUserId, setInitialized]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Parler',
        }}
      />
      <Stack.Screen
        name="conversation"
        options={{
          title: 'Conversation',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Summary',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
