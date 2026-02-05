import { create } from 'zustand';
import { Message, Mistake, RecordingStatus } from '../types';

interface ConversationState {
  conversationId: string | null;
  userId: string | null;
  messages: Message[];
  mistakes: Mistake[];
  status: RecordingStatus;
  isInitialized: boolean;

  setUserId: (userId: string) => void;
  setConversationId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  addMistake: (mistake: Mistake) => void;
  setMistakes: (mistakes: Mistake[]) => void;
  setStatus: (status: RecordingStatus) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversationId: null,
  userId: null,
  messages: [],
  mistakes: [],
  status: 'idle',
  isInitialized: false,

  setUserId: (userId) => set({ userId }),

  setConversationId: (id) => set({ conversationId: id }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  addMistake: (mistake) =>
    set((state) => ({ mistakes: [...state.mistakes, mistake] })),

  setMistakes: (mistakes) => set({ mistakes }),

  setStatus: (status) => set({ status }),

  setInitialized: (initialized) => set({ isInitialized: initialized }),

  reset: () =>
    set({
      conversationId: null,
      messages: [],
      mistakes: [],
      status: 'idle',
    }),
}));
