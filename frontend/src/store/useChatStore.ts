import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  type?: 'text' | 'swap_proposal';
  data?: any;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          role: 'model',
          parts: [{ text: "Hello! I'm Nexus-Sentry, your onchain co-pilot. How can I help you today?" }]
        }
      ],
      isOpen: false,
      isLoading: false,
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clearHistory: () => set({ 
        messages: [{
          role: 'model',
          parts: [{ text: "Hello! I'm Nexus-Sentry, your onchain co-pilot. How can I help you today?" }]
        }] 
      }),
    }),
    {
      name: 'nexus-sentry-chat',
    }
  )
);
