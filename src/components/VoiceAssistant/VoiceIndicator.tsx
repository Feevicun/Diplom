// components/VoiceAssistant/VoiceIndicator.tsx
import { Mic, Volume2 } from 'lucide-react';

interface VoiceIndicatorProps {
  isActive?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  transcript?: string;
  response?: string;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isActive = false,
  isListening = false,
  isSpeaking = false,
  transcript = '',
  response = ''
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/20">
        {isListening ? (
          <>
            <Mic className="h-4 w-4 animate-pulse text-red-400" />
            <span>Слухаю...</span>
            {transcript && (
              <span className="ml-2 text-green-300 max-w-xs truncate">"{transcript}"</span>
            )}
          </>
        ) : isSpeaking ? (
          <>
            <Volume2 className="h-4 w-4 animate-pulse text-blue-400" />
            <span>Відповідаю...</span>
            {response && (
              <span className="ml-2 text-blue-300 max-w-xs truncate">"{response}"</span>
            )}
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 text-green-400" />
            <span>Голосовий помічник активний</span>
          </>
        )}
      </div>
    </div>
  );
};