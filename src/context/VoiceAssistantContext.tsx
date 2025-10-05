// context/VoiceAssistantContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { chatCommandProcessor } from '@/utils/voiceCommandProcessor';

interface VoiceAssistantState {
  isActive: boolean;
  isListening: boolean;
  transcript: string;
  lastResponse: string;
  isSpeaking: boolean;
}

type VoiceAssistantAction = 
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_RESPONSE'; payload: string }
  | { type: 'SET_SPEAKING'; payload: boolean };

const initialState: VoiceAssistantState = {
  isActive: false,
  isListening: false,
  transcript: '',
  lastResponse: '',
  isSpeaking: false
};

const voiceAssistantReducer = (state: VoiceAssistantState, action: VoiceAssistantAction): VoiceAssistantState => {
  switch (action.type) {
    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload };
    case 'SET_RESPONSE':
      return { ...state, lastResponse: action.payload };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    default:
      return state;
  }
};

const VoiceAssistantContext = createContext<{
  state: VoiceAssistantState;
  dispatch: React.Dispatch<VoiceAssistantAction>;
} | null>(null);

// Головний компонент провайдера
const VoiceAssistantProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(voiceAssistantReducer, initialState);
  
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();
  const { speak, isSpeaking } = useSpeechSynthesis();

  // Sync with voice recognition state
  useEffect(() => {
    dispatch({ type: 'SET_LISTENING', payload: isListening });
  }, [isListening]);

  useEffect(() => {
    dispatch({ type: 'SET_TRANSCRIPT', payload: transcript });
  }, [transcript]);

  useEffect(() => {
    dispatch({ type: 'SET_SPEAKING', payload: isSpeaking });
  }, [isSpeaking]);

  // Process commands when transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      const wasProcessed = chatCommandProcessor.process(transcript);
      
      if (!wasProcessed) {
        const response = "Не розпізнав команду. Скажіть 'допомога' для списку команд.";
        dispatch({ type: 'SET_RESPONSE', payload: response });
        speak(response);
      }
    }
  }, [transcript, isListening, speak]);

  const value = {
    state,
    dispatch,
    actions: {
      startListening,
      stopListening,
      speak
    }
  };

  return (
    <VoiceAssistantContext.Provider value={value}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const VoiceAssistantProvider = VoiceAssistantProviderComponent;

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  }
  return context;
};

