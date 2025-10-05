// components/VoiceAssistant/VoiceAssistantInterface.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mic, MicOff, Volume2, HelpCircle, Palette, Languages } from 'lucide-react';

interface VoiceAssistantInterfaceProps {
  onClose: () => void;
  isListening: boolean;
  transcript: string;
  response: string;
  onListenToggle: () => void;
}

export const VoiceAssistantInterface: React.FC<VoiceAssistantInterfaceProps> = ({
  onClose,
  isListening,
  transcript,
  response,
  onListenToggle
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window && response) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = 'uk-UA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const availableCommands = [
    { command: 'головна/дашборд', description: 'Головна панель' },
    { command: 'проекти/трекер', description: 'Проекти та завдання' },
    { command: 'чати/повідомлення', description: 'Чати та спілкування' },
    { command: 'календар/розклад', description: 'Календар подій' },
    { command: 'ai помічник', description: 'AI асистент' },
    { command: 'аналітика', description: 'Аналітика та статистика' },
    { command: 'ресурси/матеріали', description: 'Навчальні ресурси' },
    { command: 'профіль/налаштування', description: 'Профіль користувача' },
    { command: 'створи проект', description: 'Створити новий проект' },
    { command: 'світла/темна тема', description: 'Змінити тему' },
    { command: 'українська/англійська', description: 'Змінити мову' },
    { command: 'статус онлайн/офлайн', description: 'Змінити статус' },
    { command: 'допомога', description: 'Показати список команд' }
  ];

  const availableThemes = [
    { name: 'світла тема', command: 'світла тема' },
    { name: 'темна тема', command: 'темна тема' },
    { name: 'рожева тема', command: 'рожева тема' },
    { name: 'м\'ятна тема', command: 'м\'ятна тема' }
  ];

  const availableLanguages = [
    { name: 'українська мова', command: 'українська мова' },
    { name: 'англійська мова', command: 'англійська мова' }
  ];

  return (
    <div className="absolute bottom-20 right-0 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-800">Голосовий помічник</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-blue-700">Слухаю...</span>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Ви сказали:</div>
            <div className="text-sm text-gray-800">{transcript}</div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-600 mb-1">Помічник:</div>
            <div className="text-sm text-green-800">{response}</div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1"
            variant={isListening ? "destructive" : "default"}
            onClick={onListenToggle}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Стоп' : 'Говорити'}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowThemes(!showThemes)}
            title="Швидкі теми"
          >
            <Palette className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowLanguages(!showLanguages)}
            title="Швидкі мови"
          >
            <Languages className="h-4 w-4" />
          </Button>
          
          {response && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSpeak}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Themes */}
        {showThemes && (
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium mb-2 text-sm">Швидкі теми:</div>
            <div className="grid grid-cols-2 gap-2">
              {availableThemes.map((theme, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onListenToggle()}
                >
                  {theme.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Languages */}
        {showLanguages && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium mb-2 text-sm">Швидкі мови:</div>
            <div className="grid grid-cols-2 gap-2">
              {availableLanguages.map((lang, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onListenToggle()}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        {showHelp && (
          <div className="p-3 bg-yellow-50 rounded-lg text-sm">
            <div className="font-medium mb-2">Доступні команди:</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableCommands.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="font-medium text-xs">{item.command}</div>
                  <div className="text-xs text-gray-600 text-right ml-2">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};