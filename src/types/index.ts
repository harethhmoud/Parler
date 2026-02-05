export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Mistake {
  id: string;
  conversation_id: string;
  message_id?: string;
  original: string;
  correction: string;
  explanation: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
}

export interface AIResponse {
  reply: string;
  mistakes: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
}

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'playing';
