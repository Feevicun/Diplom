// components/VoiceAssistant/VoiceAssistant.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, MessageCircle } from 'lucide-react';
import { VoiceAssistantInterface } from './VoiceAssistantInterface';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Типи для Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const VoiceAssistant = () => {
  const navigate = useNavigate();
  const {setTheme } = useTheme();
  const {i18n } = useTranslation();
  
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Мапінг голосових команд до шляхів з Sidebar
  const getNavigationMap = () => {
    return {
      // Головне меню
      'головна': '/dashboard',
      'дашборд': '/dashboard',
      'dashboard': '/dashboard',
      
      'проекти': '/tracker',
      'трекер': '/tracker',
      'завдання': '/tracker',
      'дипломні': '/tracker',
      'курсові': '/tracker',
      
      'чати': '/chat',
      'повідомлення': '/chat',
      'месенджер': '/chat',
      
      'календар': '/calendar',
      'розклад': '/calendar',
      'події': '/calendar',
      
      // Інструменти
      'ai помічник': '/ai-assistant',
      'штучний інтелект': '/ai-assistant',
      'ai': '/ai-assistant',
      
      'аналітика': '/analytics',
      'статистика': '/analytics',
      
      'ресурси': '/resources',
      'матеріали': '/resources',
      'книги': '/resources',
      
      // Профіль та інше
      'профіль': '/profile',
      'налаштування': '/profile',
      'аккаунт': '/profile',

      // Створення проектів
      'створи проект': '/tracker?create=project',
      'нова курсова': '/tracker?type=coursework',
      'новий диплом': '/tracker?type=diploma',
      'нова практика': '/tracker?type=practice'
    };
  };

  // Мапінг тем
  const getThemeMap = () => {
    return {
      'світла тема': 'light',
      'темна тема': 'dark',
      'рожева тема': 'rose',
      'мятна тема': 'mint',
      'світлий режим': 'light',
      'темний режим': 'dark',
      'рожевий': 'rose',
      'мятний': 'mint'
    };
  };

  // Мапінг мов
  const getLanguageMap = () => {
    return {
      'українська': 'ua',
      'українська мова': 'ua',
      'англійська': 'en',
      'англійська мова': 'en',
      'українську': 'ua',
      'англійську': 'en'
    };
  };

  // Функція пошуку шляху за голосовою командою
  const findRouteByCommand = (command: string): { path: string | null; name: string } => {
    const navigationMap = getNavigationMap();
    const normalizedCommand = command.toLowerCase().trim();
    
    // Прямий пошук
    if (navigationMap[normalizedCommand as keyof typeof navigationMap]) {
      return {
        path: navigationMap[normalizedCommand as keyof typeof navigationMap],
        name: command
      };
    }
    
    // Пошук за частиною команди
    for (const [key, path] of Object.entries(navigationMap)) {
      if (normalizedCommand.includes(key)) {
        return { path, name: key };
      }
    }
    
    return { path: null, name: command };
  };

  // Функція для зміни теми
  const handleThemeChange = (themeCommand: string): string => {
    const themeMap = getThemeMap();
    const normalizedCommand = themeCommand.toLowerCase().trim();
    
    for (const [key, themeValue] of Object.entries(themeMap)) {
      if (normalizedCommand.includes(key)) {
        setTheme(themeValue as any);
        return `Змінюю тему на ${key}`;
      }
    }
    
    return `Не знайшов тему "${themeCommand}". Доступні: світла, темна, рожева, м'ятна`;
  };

  // Функція для зміни мови
  const handleLanguageChange = (languageCommand: string): string => {
    const languageMap = getLanguageMap();
    const normalizedCommand = languageCommand.toLowerCase().trim();
    
    for (const [key, langValue] of Object.entries(languageMap)) {
      if (normalizedCommand.includes(key)) {
        i18n.changeLanguage(langValue);
        localStorage.setItem('i18nextLng', langValue);
        return `Змінюю мову на ${key}`;
      }
    }
    
    return `Не знайшов мову "${languageCommand}". Доступні: українська, англійська`;
  };

  // Функція для створення проектів
  const handleCreateProject = (projectType: string): string => {
    const projectMap = {
      'курсова': 'coursework',
      'диплом': 'diploma',
      'практика': 'practice',
      'проект': 'project'
    };

    const normalizedType = projectType.toLowerCase().trim();
    
    for (const [key, typeValue] of Object.entries(projectMap)) {
      if (normalizedType.includes(key)) {
        navigate(`/tracker?type=${typeValue}`);
        return `Створюю ${key}`;
      }
    }
    
    return `Не розпізнав тип проекту "${projectType}". Доступні: курсова, диплом, практика`;
  };

  const processVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log('Розпізнана команда:', command);

    let commandResponse = '';

    // Спеціальні команди
    if (lowerCommand.includes('допомога') || lowerCommand.includes('команди')) {
      commandResponse = 'Доступні команди: "головна", "проекти", "чати", "календар", "ai помічник", "аналітика", "ресурси", "профіль", "створи проект", "світла тема", "темна тема", "українська мова", "англійська мова"';
    }
    // Команди тем
    else if (lowerCommand.includes('тема') || lowerCommand.includes('режим')) {
      commandResponse = handleThemeChange(command);
    }
    // Команди мов
    else if (lowerCommand.includes('мова') || lowerCommand.includes('мову')) {
      commandResponse = handleLanguageChange(command);
    }
    // Команди створення проектів
    else if (lowerCommand.includes('створи') || lowerCommand.includes('нова') || lowerCommand.includes('новий')) {
      if (lowerCommand.includes('проект') || lowerCommand.includes('курсова') || lowerCommand.includes('диплом') || lowerCommand.includes('практика')) {
        commandResponse = handleCreateProject(command);
      } else {
        commandResponse = 'Що саме створити? Скажіть "створи проект", "нова курсова", "новий диплом" або "нова практика"';
      }
    }
    // Статус онлайн
    else if (lowerCommand.includes('статус') || lowerCommand.includes('онлайн') || lowerCommand.includes('офлайн')) {
      if (lowerCommand.includes('онлайн')) {
        localStorage.setItem('userStatus', 'online');
        commandResponse = 'Статус змінено на онлайн';
      } else if (lowerCommand.includes('офлайн')) {
        localStorage.setItem('userStatus', 'offline');
        commandResponse = 'Статус змінено на офлайн';
      } else {
        const currentStatus = localStorage.getItem('userStatus') || 'online';
        commandResponse = `Ваш статус: ${currentStatus === 'online' ? 'онлайн' : 'офлайн'}`;
      }
    }
    else {
      // Навігаційні команди
      const { path, name } = findRouteByCommand(command);
      
      if (path) {
        commandResponse = `Переходжу до "${name}"`;
        // Навігація з затримкою для озвучення
        setTimeout(() => {
          navigate(path);
        }, 1500);
      } else {
        commandResponse = `Не знайшов розділ "${command}". Скажіть "допомога" для списку команд.`;
      }
    }

    setResponse(commandResponse);
    speakResponse(commandResponse);
  }, [navigate, setTheme, i18n]);

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'ua' ? 'uk-UA' : 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setResponse('');
        recognitionRef.current.lang = i18n.language === 'ua' ? 'uk-UA' : 'en-US';
        recognitionRef.current.start();
      } catch (error) {
        console.error('Помилка запуску прослуховування:', error);
      }
    }
  }, [isListening, i18n.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Ініціалізація голосового розпізнавання
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = i18n.language === 'ua' ? 'uk-UA' : 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
          
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Помилка голосового розпізнавання:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [i18n.language]);

  // Обробка транскрипту після закінчення слухання
  useEffect(() => {
    if (transcript && !isListening) {
      processVoiceCommand(transcript);
    }
  }, [transcript, isListening, processVoiceCommand]);

  const toggleAssistant = () => {
    const newState = !isActive;
    setIsActive(newState);
    
    if (!newState) {
      stopListening();
    }
  };

  const handleListenToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Main assistant button */}
      <Button
        onClick={toggleAssistant}
        className={`rounded-full w-14 h-14 transition-all ${
          isActive 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isActive ? <MessageCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>

      {/* Assistant interface */}
      {isActive && (
        <VoiceAssistantInterface 
          onClose={toggleAssistant}
          isListening={isListening}
          transcript={transcript}
          response={response}
          onListenToggle={handleListenToggle}
        />
      )}
    </div>
  );
};