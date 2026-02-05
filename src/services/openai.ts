import { AIResponse, Message } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const SYSTEM_PROMPT = `Tu es un partenaire de conversation français amical.
Réponds naturellement et brièvement en français (1-2 phrases).
Analyse le message de l'utilisateur pour des erreurs de grammaire ou vocabulaire.
Retourne UNIQUEMENT du JSON valide:
{
  "reply": "Ta réponse courte en français",
  "mistakes": [
    {
      "original": "ce que l'utilisateur a dit",
      "correction": "la forme correcte",
      "explanation": "explication brève en français"
    }
  ]
}
Si le message est correct, retourne un tableau mistakes vide.`;

export async function getConversationResponse(
  userMessage: string,
  conversationHistory: Message[]
): Promise<AIResponse> {
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.role === 'assistant' ? extractReplyFromContent(msg.content) : msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    const parsed = JSON.parse(content) as AIResponse;
    return parsed;
  } catch {
    return {
      reply: content,
      mistakes: [],
    };
  }
}

function extractReplyFromContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return parsed.reply || content;
  } catch {
    return content;
  }
}
