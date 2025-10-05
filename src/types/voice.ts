// types/voice.ts
export interface VoiceCommand {
  pattern: RegExp;
  handler: (match: string[], transcript: string) => void;
  description: string;
}

export interface VoiceAssistantState {
  isActive: boolean;
  isListening: boolean;
  transcript: string;
  lastResponse: string;
  isSpeaking: boolean;
}