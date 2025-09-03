import { useState, useEffect, useRef } from 'react';
import { 
  Send, Users, Plus, Search, MessageCircle, 
  Check, X, ArrowLeft, Paperclip, Phone, 
  Video, Pin, Trash2, Edit, Reply,
  Image as ImageIcon, File, Download, ThumbsUp, Smile,
  Mic, VideoOff, PhoneOff, UserPlus, BellOff,
  Archive, BellRing, ChevronDown, ChevronUp,
  Play, Pause, StopCircle, AlertCircle, Info, Menu
} from 'lucide-react';

// Import components
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Типи даних
type Attachment = {
  name: string;
  url?: string;
  type: 'image' | 'file' | 'audio' | 'video';
  size?: string;
  blob?: Blob;
};

type Message = {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  content: string;
  timestamp: string;
  attachment?: Attachment;
  chatId: number;
  isEdited?: boolean;
  reactions?: { [key: string]: number };
  replyTo?: number;
  readBy?: number[];
  isDeleted?: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: 'online' | 'offline' | 'away' | 'dnd';
  avatar?: string;
  lastSeen?: string;
  isContact?: boolean;
  phone?: string;
};

type Chat = {
  id: number;
  name: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  description?: string;
  admins?: number[];
  image?: string;
};

type Call = {
  id: number;
  type: 'audio' | 'video';
  participants: number[];
  status: 'ringing' | 'ongoing' | 'ended' | 'missed';
  startTime: string;
  endTime?: string;
  duration?: number;
};

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupChatName, setGroupChatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [, setOnlineUsers] = useState<number[]>([]);
  const [, setCalls] = useState<Call[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  // Стани для голосових повідомлень
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [hasAudioSupport, setHasAudioSupport] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [usingAudioWorkaround, setUsingAudioWorkaround] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{
    isSafari: boolean;
    isIOS: boolean;
    version: number;
  }>({
    isSafari: false,
    isIOS: false,
    version: 0
  });

  // Стани для контекстного меню та архіву
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    chat: Chat | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    chat: null
  });

  const [showArchived, setShowArchived] = useState(false);
  const [showArchiveHint, setShowArchiveHint] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioDataRef = useRef<Float32Array[]>([]);

  // Мокові дані
  useEffect(() => {
    const initialCurrentUser: User = {
      id: 1,
      name: "Ваше Ім'я",
      email: "you@example.com",
      role: "Користувач",
      status: "online",
      phone: "+380991234567"
    };
    
    const initialUsers: User[] = [
      { id: 2, name: "Олексій Петренко", email: "alex@example.com", role: "Викладач", status: "online", lastSeen: new Date().toISOString(), isContact: true, phone: "+380991234568" },
      { id: 3, name: "Марія Коваленко", email: "maria@example.com", role: "Студент", status: "away", lastSeen: new Date().toISOString(), isContact: true, phone: "+380991234569" },
      { id: 4, name: "Анна Сидорова", email: "anna@example.com", role: "Адмін", status: "offline", lastSeen: new Date().toISOString(), isContact: false, phone: "+380991234570" },
      { id: 5, name: "Іван Іваненко", email: "ivan@example.com", role: "Студент", status: "online", lastSeen: new Date().toISOString(), isContact: true, phone: "+380991234571" },
      { id: 6, name: "Катерина Мельник", email: "kate@example.com", role: "Викладач", status: "online", lastSeen: new Date().toISOString(), isContact: true, phone: "+380991234572" }
    ];
    
    const initialChats: Chat[] = [
      {
        id: 1,
        name: "Олексій Петренко",
        type: 'direct',
        participants: [initialCurrentUser, initialUsers[0]],
        unreadCount: 3,
        lastMessage: {
          id: 1,
          senderId: 2,
          senderName: "Олексій Петренко",
          senderEmail: "alex@example.com",
          content: "Привіт! Як справи з проектом?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chatId: 1,
          readBy: [1, 2]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: true
      },
      {
        id: 2,
        name: "Команда розробки",
        type: 'group',
        participants: [initialCurrentUser, initialUsers[0], initialUsers[1], initialUsers[4]],
        unreadCount: 0,
        lastMessage: {
          id: 2,
          senderId: 3,
          senderName: "Марія Коваленко",
          senderEmail: "maria@example.com",
          content: "Завтра о 10:00 зустріч",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chatId: 2,
          readBy: [1, 3, 4]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "Чат для обговорення проектів",
        admins: [1, 3]
      },
      {
        id: 3,
        name: "Анна Сидорова",
        type: 'direct',
        participants: [initialCurrentUser, initialUsers[2]],
        unreadCount: 0,
        lastMessage: {
          id: 3,
          senderId: 4,
          senderName: "Анна Сидорова",
          senderEmail: "anna@example.com",
          content: "Дякую за допомогу! 👍",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chatId: 3,
          readBy: [1, 4]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        name: "Навчальний чат",
        type: 'group',
        participants: [initialCurrentUser, initialUsers[0], initialUsers[3], initialUsers[4]],
        unreadCount: 12,
        lastMessage: {
          id: 4,
          senderId: 5,
          senderName: "Іван Іваненко",
          senderEmail: "ivan@example.com",
          content: "Хто буде на лекції?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chatId: 4,
          readBy: [5, 6, 7]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "Загальний чат для навчання",
        admins: [1],
        isPinned: true,
        isMuted: true
      },
      {
        id: 5,
        name: "Старий чат",
        type: 'direct',
        participants: [initialCurrentUser, initialUsers[3]],
        unreadCount: 0,
        lastMessage: {
          id: 5,
          senderId: 5,
          senderName: "Іван Іваненко",
          senderEmail: "ivan@example.com",
          content: "До зустрічі!",
          timestamp: new Date(Date.now() - 86400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chatId: 5,
          readBy: [1, 5]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: true
      }
    ];
    
    const initialMessages: Message[] = [
      {
        id: 1,
        senderId: 2,
        senderName: "Олексій Петренко",
        senderEmail: "alex@example.com",
        content: "Привіт! Як справи з проектом?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId: 1,
        readBy: [1, 2]
      },
      {
        id: 2,
        senderId: 1,
        senderName: "Ви",
        senderEmail: "you@example.com",
        content: "Привіт! Все йде добре. Сьогодні закінчив основний функціонал.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId: 1,
        readBy: [1, 2]
      },
      {
        id: 3,
        senderId: 2,
        senderName: "Олексій Петренко",
        senderEmail: "alex@example.com",
        content: "Чудово! Можеш показати результат завтра?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId: 1,
        readBy: [1, 2]
      },
      {
        id: 4,
        senderId: 1,
        senderName: "Ви",
        senderEmail: "you@example.com",
        content: "Так, звісно. Ось скріншоти інтерфейсу:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId: 1,
        readBy: [1, 2],
        attachment: {
          name: "interface-preview.png",
          url: "#",
          type: "image",
          size: "2.4 MB"
        }
      },
      {
        id: 5,
        senderId: 2,
        senderName: "Олексій Петренко",
        senderEmail: "alex@example.com",
        content: "Виглядає дуже добре! 👍",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chatId: 1,
        readBy: [1, 2],
        reactions: { "👍": 1 }
      }
    ];
    
    setCurrentUser(initialCurrentUser);
    setUsers(initialUsers);
    setChats(initialChats);
    setMessages(initialMessages);
    setOnlineUsers([1, 2, 5, 6]);

    // Виявлення браузера
    detectBrowser();

    // Встановити початковий стан для мобільних пристроїв
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      } else {
        setShowChatList(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Виявлення браузера
  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const versionMatch = userAgent.match(/Version\/(\d+)/);
    const version = versionMatch ? parseInt(versionMatch[1]) : 0;
    
    setBrowserInfo({ isSafari, isIOS, version });
    
    // Перевірка підтримки аудіо
    checkAudioSupport(isSafari, version);
  };

  // Перевірка підтримки аудіо
  const checkAudioSupport = (isSafari: boolean, version: number) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasAudioSupport(false);
      setRecordingError("Ваш браузер не підтримує запис аудіо");
      return;
    }
    
    // Спеціальна перевірка для Safari
    if (isSafari) {
      if (version < 14.1) {
        setHasAudioSupport(false);
        setRecordingError("Ваша версія Safari не підтримує запис аудіо. Оновіть браузер до версії 14.1 або новішої");
        return;
      }
      
      const safariMimeTypes = [
        'audio/mp4',
        'audio/mpeg',
        'audio/aac',
        'audio/wav'
      ];
      
      const hasSafariSupport = safariMimeTypes.some(mimeType => 
        MediaRecorder.isTypeSupported(mimeType)
      );
      
      setHasAudioSupport(hasSafariSupport);
      
      if (!hasSafariSupport) {
        setRecordingError("Safari не підтримує запис аудіо в цьому форматі");
      }
      return;
    }
    
    // Для інших браузерів
    const hasSupport = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ].some(mimeType => MediaRecorder.isTypeSupported(mimeType));
    
    setHasAudioSupport(hasSupport);
    if (!hasSupport) {
      setRecordingError("Браузер не підтримує запис аудіо");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, replyingTo]);

  // Ефект для імітації набору тексту
  useEffect(() => {
    if (newMessage && activeChat) {
      const otherParticipants = activeChat.participants.filter(p => p.id !== currentUser?.id);
      if (otherParticipants.length > 0 && Math.random() > 0.7) {
        const typingUserId = otherParticipants[0].id;
        if (!typingUsers.includes(typingUserId)) {
          setTypingUsers(prev => [...prev, typingUserId]);
          
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== typingUserId));
          }, 3000);
        }
      }
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, activeChat]);

  // Ефект для обробки скролу до архіву
  useEffect(() => {
    const chatList = chatListRef.current;
    if (!chatList) return;

    const handleScroll = () => {
      const isNearBottom = chatList.scrollTop + chatList.clientHeight >= chatList.scrollHeight - 50;
      
      if (isNearBottom && showArchiveHint) {
        setShowArchiveHint(false);
      } else if (!isNearBottom && !showArchiveHint) {
        setShowArchiveHint(true);
      }
    };

    chatList.addEventListener('scroll', handleScroll);
    return () => chatList.removeEventListener('scroll', handleScroll);
  }, [showArchiveHint]);

  // Ефект для закриття контекстного меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contextMenu.visible) {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [contextMenu.visible]);

  // Ефект для очищення URL при unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Очистити всі аудіо URL
      messages.forEach(msg => {
        if (msg.attachment?.type === 'audio' && msg.attachment.url) {
          URL.revokeObjectURL(msg.attachment.url);
        }
      });
    };
  }, [audioUrl, messages]);

  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Розділяємо чати на закріплені та незакріплені
  const pinnedChats = chats.filter(chat => chat.isPinned && !chat.isArchived);
  const unpinnedChats = chats.filter(chat => !chat.isPinned && !chat.isArchived);
  const archivedChats = chats.filter(chat => chat.isArchived);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !file) || !activeChat || !currentUser) return;

    const message: Message = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: file ? { 
        name: file.name, 
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 
              file.type.startsWith('audio/') ? 'audio' : 'file',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      } : undefined,
      chatId: activeChat.id,
      readBy: [currentUser.id],
      replyTo: replyingTo?.id
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setFile(null);
    setReplyingTo(null);
    setTypingUsers([]);
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id 
        ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString(), unreadCount: 0 }
        : chat
    ));
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isDeleted: true, content: "Повідомлення видалено", attachment: undefined } 
        : msg
    ));
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeChat || !currentUser) return;
    
    const call: Call = {
      id: Date.now(),
      type,
      participants: [currentUser.id, ...activeChat.participants.filter(p => p.id !== currentUser.id).map(p => p.id)],
      status: 'ringing',
      startTime: new Date().toISOString()
    };
    
    setActiveCall(call);
    setCalls(prev => [...prev, call]);
    
    // Імітація відповіді на дзвінок через 5 секунд
    setTimeout(() => {
      if (activeCall?.id === call.id) {
        setActiveCall(prev => prev ? { ...prev, status: 'ongoing' } : null);
        setCalls(prev => prev.map(c => c.id === call.id ? { ...c, status: 'ongoing' } : c));
      }
    }, 5000);
  };

  const handleEndCall = () => {
  if (!activeCall) return;
  
  const endedCall: Call = {
    ...activeCall,
    status: 'ended', // This matches the union type
    endTime: new Date().toISOString(),
    duration: Math.floor((new Date().getTime() - new Date(activeCall.startTime).getTime()) / 1000)
  };
  
  setCalls(prev => prev.map(call => call.id === activeCall.id ? endedCall : call));
  setActiveCall(null);
};

  const handleAddToContacts = (userId: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isContact: true } : user
    ));
  };

  // Функція для відкриття налаштувань браузера
  const openBrowserSettings = () => {
    if (browserInfo.isIOS) {
      // Для iOS
      window.open('app-settings:');
    } else {
      // Інструкції для десктопних браузерів
      setRecordingError(
        "Будь ласка, дозвольте доступ до мікрофона в налаштуваннях браузера. " +
        "Зазвичай це можна знайти в налаштуваннях приватності або дозволів сайту."
      );
    }
  };

  // Функція для початку запису
  const startRecording = async () => {
    try {
      setRecordingError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecordingError("Ваш браузер не підтримує запис аудіо");
        setHasAudioSupport(false);
        return;
      }

      // Спеціальні налаштування для Safari
      let mimeTypes;
      if (browserInfo.isSafari) {
        mimeTypes = [
          'audio/mp4',
          'audio/mpeg', 
          'audio/aac',
          'audio/wav'
        ];
      } else {
        mimeTypes = [
          'audio/webm',
          'audio/webm;codecs=opus',
          'audio/mp4',
          'audio/mpeg',
          'audio/wav'
        ];
      }
      
      let supportedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }
      
      if (!supportedMimeType) {
        setRecordingError("Браузер не підтримує жоден з доступних аудіо форматів");
        setHasAudioSupport(false);
        return;
      }

      // Особливі налаштування для Safari
      const constraints = browserInfo.isSafari ? {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      } : {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const options = { mimeType: supportedMimeType };
      
      // Обробка помилок для Safari
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (error) {
        console.error('Помилка створення MediaRecorder:', error);
        
        // Спробувати без options для Safari
        if (browserInfo.isSafari) {
          try {
            recorder = new MediaRecorder(stream);
          } catch (fallbackError) {
            throw new Error('Не вдається створити записувач аудіо');
          }
        } else {
          throw error;
        }
      }
      
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          setRecordingError("Не вдалося записати аудіо");
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: supportedMimeType || 'audio/mp4'
        });
        
        if (audioBlob.size > 10 * 1024 * 1024) {
          setRecordingError("Розмір голосового повідомлення занадто великий");
          return;
        }
        
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.onerror = (event) => {
        console.error('Помилка запису:', event);
        setRecordingError("Сталася помилка під час запису");
        stopRecording();
      };
      
      try {
        recorder.start(1000);
        setIsRecording(true);
        
        let time = 0;
        const timer = setInterval(() => {
          time += 1;
          setRecordingTime(time);
        }, 1000);
        
        setRecordingTimer(timer);
        
        setTimeout(() => {
          if (isRecording) {
            stopRecording();
          }
        }, 120000);
        
      } catch (error) {
        console.error('Помилка запуску запису:', error);
        setRecordingError("Не вдалося запустити запис");
        stopRecording();
      }
      
    } catch (error) {
      console.error('Помилка доступу до мікрофона:', error);
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            setRecordingError("Доступ до мікрофона заборонено. Дозвольте доступ у налаштуваннях браузера");
            break;
          case 'NotFoundError':
            setRecordingError("Мікрофон не знайдено");
            break;
          case 'NotReadableError':
            setRecordingError("Не вдається отримати доступ до мікрофона");
            break;
          case 'NotSupportedError':
            setRecordingError("Функція не підтримується вашим браузером");
            break;
          default:
            setRecordingError("Помилка доступу до мікрофона: " + error.message);
        }
      } else {
        setRecordingError("Не вдалося отримати доступ до мікрофона");
      }
      
      setHasAudioSupport(false);
    }
  };

  // Альтернативний спосіб запису для Safari
  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      audioDataRef.current = [];
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        audioDataRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      
      audioContextRef.current = audioContext;
      audioProcessorRef.current = processor;
      
      setIsRecording(true);
      setUsingAudioWorkaround(true);
      
      let time = 0;
      const timer = setInterval(() => {
        time += 1;
        setRecordingTime(time);
      }, 1000);
      
      setRecordingTimer(timer);
      
      // Зупинити запис через 60 секунд
      setTimeout(() => {
        if (isRecording) {
          stopRecordingFallback();
        }
      }, 60000);
      
    } catch (error) {
      console.error('Помилка fallback запису:', error);
      setRecordingError("Не вдалося запустити запис");
    }
  };

  // Зупинка fallback запису
  const stopRecordingFallback = () => {
    if (audioContextRef.current && audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioContextRef.current.close();
      
      // Конвертувати дані в WAV
      const wavBlob = convertToWav(audioDataRef.current, 44100);
      setRecordedAudio(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));
      
      setIsRecording(false);
      setUsingAudioWorkaround(false);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingTime(0);
    }
  };

  // Функція конвертації в WAV
  const convertToWav = (audioData: Float32Array[], sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, audioData.length * 2, true);
    
    // Audio data
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
      const samples = audioData[i];
      for (let j = 0; j < samples.length; j++) {
        const sample = Math.max(-1, Math.min(1, samples[j]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Функція для зупинки запису
  const stopRecording = () => {
    if (usingAudioWorkaround) {
      stopRecordingFallback();
      return;
    }

    if (audioRecorderRef.current && isRecording) {
      try {
        if (audioRecorderRef.current.state === 'recording') {
          audioRecorderRef.current.stop();
        }
      } catch (error) {
        console.error('Помилка зупинки запису:', error);
      }
      setIsRecording(false);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingTime(0);
    }
  };

  // Функція для відтворення записаного аудіо
  const playRecordedAudio = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Помилка відтворення аудіо:', error);
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      });
    }
  };

  // Функція для паузи аудіо
  const pauseRecordedAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Функція для відправки голосового повідомлення
  const sendVoiceMessage = () => {
    if (!recordedAudio || !activeChat || !currentUser) return;

    const message: Message = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      content: "Голосове повідомлення",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: { 
        name: usingAudioWorkaround ? "voice-message.wav" : "voice-message.webm",
        type: "audio",
        size: `${(recordedAudio.size / 1024).toFixed(1)} KB`,
        blob: recordedAudio
      },
      chatId: activeChat.id,
      readBy: [currentUser.id]
    };

    setMessages(prev => [...prev, message]);
    setRecordedAudio(null);
    setAudioUrl('');
    setIsPlaying(false);
    setUsingAudioWorkaround(false);
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id 
        ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString(), unreadCount: 0 }
        : chat
    ));
  };

  // Функція для скасування запису
  const cancelRecording = () => {
    stopRecording();
    setRecordedAudio(null);
    setAudioUrl('');
    setRecordingError(null);
    setUsingAudioWorkaround(false);
  };

  // Функція для відтворення аудіо повідомлення
  const playAudioMessage = (messageId: number, blob: Blob) => {
    if (currentlyPlaying === messageId) {
      // Якщо вже відтворюється це повідомлення - зупинити
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentlyPlaying(null);
      return;
    }
    
    // Зупинити поточне відтворення
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Створити нове аудіо
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => {
      setCurrentlyPlaying(null);
      URL.revokeObjectURL(url);
    };
    
    audio.onerror = () => {
      setCurrentlyPlaying(null);
      URL.revokeObjectURL(url);
    };
    
    audio.play().catch(error => {
      console.error('Помилка відтворення аудіо:', error);
      setCurrentlyPlaying(null);
      URL.revokeObjectURL(url);
    });
    
    setCurrentlyPlaying(messageId);
  };

  const handleCreateDirectChat = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user || !currentUser) return;

    const existingChat = chats.find(chat => 
      chat.type === 'direct' && chat.participants.some(p => p.id === userId)
    );

    if (existingChat) {
      setActiveChat(existingChat);
      setShowNewChatDialog(false);
      setMessages(messages.filter(m => m.chatId === existingChat.id));
      return;
    }

    const newChat: Chat = {
      id: Date.now(),
      name: user.name,
      type: 'direct',
      participants: [currentUser, user],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat);
    setMessages([]);
    setShowNewChatDialog(false);
  };

  const handleCreateGroupChat = () => {
    if (!groupChatName.trim() || selectedUsers.length === 0 || !currentUser) return;

    const participants = [currentUser, ...users.filter(u => selectedUsers.includes(u.id))];

    const newChat: Chat = {
      id: Date.now(),
      name: groupChatName,
      type: 'group',
      participants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      admins: [currentUser.id]
    };

    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat);
    setMessages([]);
    setShowNewGroupDialog(false);
    setGroupChatName('');
    setSelectedUsers([]);
    setSearchTerm('');
  };

  const handleReaction = (messageId: number, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (reactions[reaction]) {
          reactions[reaction] += 1;
        } else {
          reactions[reaction] = 1;
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const handleEditMessage = () => {
    if (!editingMessage || !newMessage.trim()) return;

    setMessages(prev => prev.map(msg => 
      msg.id === editingMessage.id 
        ? { ...msg, content: newMessage, isEdited: true }
        : msg
    ));
    
    setEditingMessage(null);
    setNewMessage('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]?.toUpperCase()).join('');
  };

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const seenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now.getTime() - seenDate.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'щойно';
    if (diffMinutes < 60) return `${diffMinutes} хв тому`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} год тому`;
    return `${Math.floor(diffMinutes / 1440)} дн тому`;
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAvatar = (name: string, isOnline?: boolean, size: 'small' | 'default' | 'large' = 'default') => {
  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    default: 'w-8 h-8 text-xs',
    large: 'w-10 h-10 text-sm'
  } as const; // Add 'as const' for type safety
  
  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold`}>
        {getInitials(name)}
      </div>
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-card"></div>
      )}
    </div>
  );
};

  // Обробник правого кліку миші
  const handleRightClick = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      chat
    });
  };

  // Закриття контекстного меню
  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      chat: null
    });
  };

  // Функції для обробки дій меню
  const handleTogglePinChat = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
    closeContextMenu();
  };

  const handleToggleMuteChat = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
    ));
    closeContextMenu();
  };

  const handleToggleArchiveChat = (chatId: number) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
    ));
    closeContextMenu();
  };

  const handleDeleteChat = (chatId: number) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat?.id === chatId) {
      setActiveChat(null);
    }
    closeContextMenu();
  };

  // Функція для перемикання відображення архіву
  const toggleArchived = () => {
    setShowArchived(!showArchived);
  };

  // Компонент для відображення інструкцій Safari
  const renderSafariInstructions = () => {
    if (!browserInfo.isSafari) return null;

    return (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-800 mb-1">
              Інструкція для Safari:
            </p>
            <ol className="text-xs text-blue-700 space-y-1">
              <li>1. Натисніть "Safari" в меню → "Налаштування"</li>
              <li>2. Перейдіть в "Вебсайти" → "Мікрофон"</li>
              <li>3. Знайдіть цей сайт і встановіть "Дозволити"</li>
              <li>4. Перезавантажте сторінку</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  const renderAttachment = (attachment: Message['attachment'], messageId: number) => {
    if (!attachment) return null;

    if (attachment.type === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden bg-muted max-w-xs">
          <div className="h-32 bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="p-2">
            <p className="text-xs font-medium truncate text-foreground">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{attachment.size}</p>
          </div>
        </div>
      );
    }

    if (attachment.type === 'audio') {
      const isPlaying = currentlyPlaying === messageId;
      
      return (
        <div className="mt-2 p-2 bg-muted rounded-lg border border-border flex items-center gap-2 max-w-xs">
          <button 
            onClick={() => {
              if (attachment.blob) {
                playAudioMessage(messageId, attachment.blob);
              }
            }}
            className={`p-1.5 rounded-full flex-shrink-0 ${
              isPlaying ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-foreground">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{attachment.size}</p>
          </div>
          <div className="w-16 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/2"></div>
          </div>
          <button 
            className="p-1 hover:bg-accent rounded-md flex-shrink-0 transition-colors"
            onClick={() => {
              if (attachment.blob) {
                const url = URL.createObjectURL(attachment.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachment.name;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 100);
              }
            }}
          >
            <Download className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      );
    }

    if (attachment.type === 'video') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden bg-muted max-w-xs">
          <div className="h-32 bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="p-2">
            <p className="text-xs font-medium truncate text-foreground">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{attachment.size}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 p-2 bg-muted rounded-lg border border-border flex items-center gap-2 max-w-xs">
        <File className="h-6 w-6 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate text-foreground">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">{attachment.size}</p>
        </div>
        <button className="p-1 hover:bg-accent rounded-md flex-shrink-0 transition-colors">
          <Download className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  };

  const renderNewChatDialog = () => (
    <div className={`fixed inset-0 z-50 ${showNewChatDialog ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowNewChatDialog(false)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-popover rounded-xl shadow-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-popover-foreground">Новий чат</h2>
          <button onClick={() => setShowNewChatDialog(false)} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук користувачів..."
            className="w-full pl-9 pr-3 py-2 bg-input border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Користувачів не знайдено
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                onClick={() => handleCreateDirectChat(user.id)}
              >
                {renderAvatar(user.name, user.status === 'online')}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {!user.isContact && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToContacts(user.id);
                    }}
                    className="p-1 hover:bg-accent rounded-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderNewGroupDialog = () => (
    <div className={`fixed inset-0 z-50 ${showNewGroupDialog ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowNewGroupDialog(false)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-popover rounded-xl shadow-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-popover-foreground">Нова група</h2>
          <button onClick={() => setShowNewGroupDialog(false)} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">Назва групи</label>
            <input
              type="text"
              placeholder="Введіть назву групи..."
              className="w-full px-3 py-2 bg-input border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring transition-all text-sm"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1 text-foreground">Учасники</label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Пошук користувачів..."
                className="w-full pl-9 pr-3 py-2 bg-input border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.id]);
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user.id));
                        }
                      }}
                      className="w-4 h-4 rounded border border-border text-primary focus:ring-ring"
                    />
                    {renderAvatar(user.name, user.status === 'online', 'small')}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mt-3 p-2 bg-accent/10 rounded-lg">
                <p className="text-xs font-medium text-accent-foreground mb-1">
                  Обрано: {selectedUsers.length} учасників
                </p>
                <div className="flex flex-wrap gap-1">
                  {users
                    .filter(u => selectedUsers.includes(u.id))
                    .map(user => (
                      <span 
                        key={user.id}
                        className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-md text-xs"
                      >
                        {user.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <button
            onClick={handleCreateGroupChat}
            disabled={!groupChatName.trim() || selectedUsers.length === 0}
            className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg font-medium transition-colors text-sm"
          >
            Створити групу
          </button>
        </div>
      </div>
    </div>
  );

  // Компонент контекстного меню
  const renderContextMenu = () => {
    if (!contextMenu.visible || !contextMenu.chat) return null;

    return (
      <div 
        ref={contextMenuRef}
        className="fixed z-50 bg-popover rounded-lg shadow-lg border border-border py-1 min-w-[180px]"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleTogglePinChat(contextMenu.chat!.id)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
        >
          <Pin className="w-4 h-4 text-muted-foreground" />
          <span>{contextMenu.chat.isPinned ? 'Відкріпити' : 'Закріпити'}</span>
        </button>
        
        <button
          onClick={() => handleToggleMuteChat(contextMenu.chat!.id)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
        >
          {contextMenu.chat.isMuted ? (
            <>
              <BellRing className="w-4 h-4 text-muted-foreground" />
              <span>Увімкнути сповіщення</span>
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 text-muted-foreground" />
              <span>Вимкнути сповіщення</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => handleToggleArchiveChat(contextMenu.chat!.id)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
        >
          <Archive className="w-4 h-4 text-muted-foreground" />
          <span>{contextMenu.chat.isArchived ? 'Розархівувати' : 'Архівувати'}</span>
        </button>
        
        <div className="h-px bg-border my-1"></div>
        
        <button
          onClick={() => handleDeleteChat(contextMenu.chat!.id)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
        >
          <Trash2 className="w-4 h-4" />
          <span>Видалити чат</span>
        </button>
      </div>
    );
  };

  const renderCallInterface = () => {
    if (!activeCall) return null;
    
    const otherParticipants = activeCall.participants.filter(id => id !== currentUser?.id);
    const participantNames = otherParticipants.map(id => users.find(u => u.id === id)?.name).join(', ');
    
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-popover rounded-xl p-6 w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-popover-foreground mb-2">
              {activeCall.type === 'audio' ? 'Аудіодзвінок' : 'Відеодзвінок'}
            </h2>
            <p className="text-muted-foreground">
              {activeCall.status === 'ringing' ? 'Дзвінок...' : participantNames}
            </p>
            {activeCall.status === 'ongoing' && (
              <p className="text-muted-foreground mt-2">
                {formatCallDuration(Math.floor((new Date().getTime() - new Date(activeCall.startTime).getTime()) / 1000))}
              </p>
            )}
          </div>
          
          <div className="flex justify-center gap-4">
            {activeCall.status === 'ringing' ? (
              <>
                <button 
                  onClick={handleEndCall}
                  className="p-3 bg-destructive text-destructive-foreground rounded-full"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button className="p-3 bg-muted text-muted-foreground rounded-full">
                  <Mic className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleEndCall}
                  className="p-3 bg-destructive text-destructive-foreground rounded-full"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                {activeCall.type === 'video' && (
                  <button className="p-3 bg-muted text-muted-foreground rounded-full">
                    <VideoOff className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <Header />
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Sidebar - показується тільки коли showChatList = true */}
          {showChatList && (
            <div className="w-full md:w-64 bg-card border-r border-border flex flex-col">
              {/* Заголовок з кнопками */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-bold text-card-foreground">Повідомлення</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowChatList(false)}
                      className="p-1 hover:bg-muted rounded-md transition-colors md:hidden"
                      title="Сховати чати"
                    >
                      <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setShowChatList(false)}
                      className="p-1 hover:bg-muted rounded-md transition-colors hidden md:block"
                      title="Сховати чати"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewChatDialog(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Новий чат</span>
                  </button>
                  <button
                    onClick={() => setShowNewGroupDialog(true)}
                    className="p-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    title="Створити групу"
                  >
                    <Users className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Список чатів */}
              <div ref={chatListRef} className="flex-1 overflow-y-auto">
                <div className="p-2">
                  {/* Закріплені чати */}
                  {pinnedChats.length > 0 && (
                    <div className="mb-4">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                        Закріплені
                      </div>
                      <div className="space-y-1">
                        {pinnedChats.map(chat => (
                          <div
                            key={chat.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              activeChat?.id === chat.id 
                                ? 'bg-accent border border-accent-foreground/20' 
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              setActiveChat(chat);
                              if (window.innerWidth < 768) {
                                setShowChatList(false);
                              }
                            }}
                            onContextMenu={(e) => handleRightClick(e, chat)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                {chat.type === 'group' ? (
                                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-accent-foreground font-semibold">
                                    <Users className="w-4 h-4" />
                                  </div>
                                ) : (
                                  renderAvatar(chat.name, true)
                                )}
                                {chat.unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h3 className="font-medium text-card-foreground truncate text-sm">{chat.name}</h3>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {chat.lastMessage?.timestamp}
                                  </span>
                                </div>
                                {chat.lastMessage && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {chat.type === 'group' && `${chat.lastMessage.senderName}: `}
                                    {chat.lastMessage.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Незакріплені чати */}
                  {unpinnedChats.length > 0 && (
                    <div className="mb-4">
                      {pinnedChats.length > 0 && (
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                          Всі чати
                        </div>
                      )}
                      <div className="space-y-1">
                        {unpinnedChats.map(chat => (
                          <div
                            key={chat.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              activeChat?.id === chat.id 
                                ? 'bg-accent border border-accent-foreground/20' 
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              setActiveChat(chat);
                              if (window.innerWidth < 768) {
                                setShowChatList(false);
                              }
                            }}
                            onContextMenu={(e) => handleRightClick(e, chat)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                {chat.type === 'group' ? (
                                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-accent-foreground font-semibold">
                                    <Users className="w-4 h-4" />
                                  </div>
                                ) : (
                                  renderAvatar(chat.name, true)
                                )}
                                {chat.unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h3 className="font-medium text-card-foreground truncate text-sm">{chat.name}</h3>
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    {chat.lastMessage?.timestamp}
                                  </span>
                                </div>
                                {chat.lastMessage && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {chat.type === 'group' && `${chat.lastMessage.senderName}: `}
                                    {chat.lastMessage.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Архів */}
                  {archivedChats.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <button
                        onClick={toggleArchived}
                        className="w-full flex items-center justify-between px-2 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <span>Архівовані чати</span>
                        {showArchived ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {showArchived && (
                        <div className="mt-2 space-y-1">
                          {archivedChats.map(chat => (
                            <div
                              key={chat.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                activeChat?.id === chat.id 
                                  ? 'bg-accent border border-accent-foreground/20' 
                                  : 'hover:bg-muted'
                              } opacity-70`}
                              onClick={() => {
                                setActiveChat(chat);
                                if (window.innerWidth < 768) {
                                  setShowChatList(false);
                                }
                              }}
                              onContextMenu={(e) => handleRightClick(e, chat)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  {chat.type === 'group' ? (
                                    <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-accent-foreground font-semibold">
                                      <Users className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    renderAvatar(chat.name, true)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="font-medium text-card-foreground truncate text-sm">{chat.name}</h3>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      {chat.lastMessage?.timestamp}
                                    </span>
                                  </div>
                                  {chat.lastMessage && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {chat.type === 'group' && `${chat.lastMessage.senderName}: `}
                                      {chat.lastMessage.content}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Оберіть чат
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Виберіть існуючий чат або створіть новий для початку спілкування
                  </p>
                  <button
                    onClick={() => setShowChatList(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors text-sm"
                  >
                    {window.innerWidth >= 768 ? 'Показати чати' : 'Переглянути чати'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-card border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveChat(null);
                          setShowChatList(true);
                        }}
                        className="p-1 hover:bg-muted rounded-md transition-colors md:hidden"
                        title="Назад до чатів"
                      >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setShowChatList(true)}
                        className="p-1 hover:bg-muted rounded-md transition-colors hidden md:block"
                        title="Показати чати"
                      >
                        <Menu className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      {activeChat.type === 'group' ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-accent-foreground font-semibold">
                          <Users className="w-4 h-4" />
                        </div>
                      ) : (
                        renderAvatar(activeChat.name, true, 'default')
                      )}
                      
                      <div>
                        <h2 className="text-base font-semibold text-card-foreground">{activeChat.name}</h2>
                        {activeChat.type === 'group' ? (
                          <p className="text-xs text-muted-foreground">
                            {activeChat.participants.length} учасників
                            {activeChat.description && ` • ${activeChat.description}`}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {users.find(u => u.id === activeChat.participants.find(p => p.id !== currentUser?.id)?.id)?.status === 'online' 
                              ? 'В мережі' 
                              : `Був(ла) ${formatLastSeen(users.find(u => u.id === activeChat.participants.find(p => p.id !== currentUser?.id)?.id)?.lastSeen || new Date().toISOString())}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleStartCall('audio')}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Аудіодзвінок"
                      >
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => handleStartCall('video')}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Відеодзвінок"
                      >
                        <Video className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.filter(m => m.chatId === activeChat.id).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-md">
                        {message.senderId !== currentUser?.id && activeChat.type === 'group' && (
                          renderAvatar(message.senderName, false, 'small')
                        )}
                        <div className="flex flex-col">
                          {activeChat.type === 'group' && message.senderId !== currentUser?.id && (
                            <span className="text-xs text-muted-foreground mb-0.5 px-1">
                              {message.senderName}
                            </span>
                          )}
                          <div className="group relative">
                            <div
                              className={`rounded-xl px-3 py-2 max-w-xs ${
                                message.senderId === currentUser?.id
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-card border border-border text-card-foreground rounded-bl-sm'
                              }`}
                            >
                              {message.replyTo && (
                                <div className={`text-xs border-l-2 pl-2 mb-1 ${
                                  message.senderId === currentUser?.id 
                                    ? 'border-primary-foreground/30 text-primary-foreground/70' 
                                    : 'border-border text-muted-foreground'
                                }`}>
                                  <p className="italic">У відповідь на:</p>
                                  <p className="truncate">"{messages.find(m => m.id === message.replyTo)?.content}"</p>
                                </div>
                              )}
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              {message.attachment && renderAttachment(message.attachment, message.id)}
                              {message.reactions && (
                                <div className="flex items-center gap-1 mt-1">
                                  {Object.entries(message.reactions).map(([reaction, count]) => (
                                    <div key={reaction} className={`px-1 py-0.5 rounded-full flex items-center text-xs ${
                                      message.senderId === currentUser?.id 
                                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                    }`}>
                                      <span>{reaction}</span>
                                      <span className="ml-0.5 font-medium">{count}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex items-center mt-0.5 text-xs text-muted-foreground ${
                              message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>
                                {message.timestamp}
                                {message.isEdited && <span className="italic ml-0.5">(ред.)</span>}
                              </span>
                              {message.senderId === currentUser?.id && (
                                <div className="ml-1 flex">
                                  <Check className="w-3 h-3" />
                                  <Check className="w-3 h-3 -ml-0.5" />
                                </div>
                              )}
                            </div>
                            
                            {/* Message actions */}
                            <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                              message.senderId === currentUser?.id ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                            }`}>
                              <div className="flex bg-popover rounded-lg shadow-lg border border-border p-0.5">
                                {message.senderId === currentUser?.id ? (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setEditingMessage(message);
                                        setNewMessage(message.content);
                                      }}
                                      className="p-1 hover:bg-muted rounded-md transition-colors"
                                    >
                                      <Edit className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className="p-1 hover:bg-muted rounded-md transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => setReplyingTo(message)}
                                      className="p-1 hover:bg-muted rounded-md transition-colors"
                                    >
                                      <Reply className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                    <button 
                                      onClick={() => handleReaction(message.id, '👍')}
                                      className="p-1 hover:bg-muted rounded-md transition-colors"
                                    >
                                      <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2 max-w-md">
                        {activeChat.type === 'group' && (
                          renderAvatar(users.find(u => u.id === typingUsers[0])?.name || '', false, 'small')
                        )}
                        <div className="bg-card border border-border rounded-xl px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply indicator */}
                {replyingTo && (
                  <div className="px-4 py-2 bg-accent/10 border-t border-accent/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                                                <p className="text-xs font-medium text-accent-foreground">
                          Відповідь {replyingTo.senderId === currentUser?.id ? 'собі' : replyingTo.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                      </div>
                      <button 
                        onClick={() => setReplyingTo(null)}
                        className="p-1 hover:bg-accent/20 rounded-md ml-2 transition-colors"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit indicator */}
                {editingMessage && (
                  <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Редагування повідомлення</p>
                        <p className="text-xs text-muted-foreground truncate">{editingMessage.content}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingMessage(null);
                          setNewMessage('');
                        }}
                        className="p-1 hover:bg-yellow-500/20 rounded-md ml-2 transition-colors"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 bg-card border-t border-border">
                  {/* Аудіо елемент для відтворення */}
                  <audio 
                    ref={audioRef}
                    className="hidden"
                  />
                  
                  {/* Помилки запису */}
                  {recordingError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-destructive mb-2">{recordingError}</p>
                          {recordingError.includes("заборонено") && (
                            <button 
                              onClick={openBrowserSettings}
                              className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-md hover:bg-destructive/90 transition-colors"
                            >
                              Відкрити налаштування
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {renderSafariInstructions()}

                  {!hasAudioSupport && browserInfo.isSafari && browserInfo.version < 14.1 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-amber-800 mb-1">
                            Оновіть Safari
                          </p>
                          <p className="text-xs text-amber-700">
                            Ваша версія Safari ({browserInfo.version}) не підтримує запис аудіо. 
                            Оновіть до версії 14.1 або новішої.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!hasAudioSupport && !browserInfo.isSafari && (
                    <div className="p-3 bg-muted rounded-lg mb-3">
                      <p className="text-xs text-muted-foreground">
                        Голосові повідомлення не підтримуються у вашому браузері
                      </p>
                    </div>
                  )}

                  {recordedAudio ? (
                    // Відображення записаного аудіо перед відправкою
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-3">
                      <button 
                        onClick={isPlaying ? pauseRecordedAudio : playRecordedAudio}
                        className="p-2 bg-primary text-primary-foreground rounded-full"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="w-full h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: isPlaying ? '50%' : '0%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={cancelRecording}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={sendVoiceMessage}
                          className="p-2 bg-primary text-primary-foreground rounded-md"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : isRecording ? (
                    // Відображення процесу запису
                    <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg mb-3">
                      <div className="p-2 bg-destructive text-destructive-foreground rounded-full animate-pulse">
                        <Mic className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <p className="text-xs text-destructive mt-1">
                          Запис: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      
                      <button 
                        onClick={stopRecording}
                        className="p-2 bg-destructive text-destructive-foreground rounded-md"
                        title="Зупинити запис"
                      >
                        <StopCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}

                  <div className="flex items-end gap-3">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        title="Прикріпити файл"
                      >
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" title="Емоції">
                        <Smile className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => {
                          if (browserInfo.isSafari && !hasAudioSupport) {
                            startRecordingFallback();
                          } else if (hasAudioSupport) {
                            startRecording();
                          }
                        }}
                        disabled={!hasAudioSupport && !browserInfo.isSafari}
                        className="p-2 hover:bg-muted rounded-md transition-colors disabled:opacity-50"
                        title={hasAudioSupport || browserInfo.isSafari ? 
                          "Записати голосове повідомлення" : 
                          "Голосові повідомлення не підтримуються"}
                      >
                        <Mic className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Напишіть повідомлення..."
                          className="w-full px-3 py-2 bg-input border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-ring resize-none transition-all text-sm"
                          rows={1}
                          style={{ minHeight: '40px', maxHeight: '100px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (editingMessage) {
                                handleEditMessage();
                              } else {
                                handleSendMessage();
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {file && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-foreground flex-1 truncate">{file.name}</span>
                          <button 
                            onClick={() => setFile(null)}
                            className="p-0.5 hover:bg-accent rounded-md transition-colors"
                            title="Видалити файл"
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={editingMessage ? handleEditMessage : handleSendMessage} 
                      disabled={!newMessage.trim() && !file}
                      className="p-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-md transition-colors"
                      title={editingMessage ? "Зберегти зміни" : "Надіслати повідомлення"}
                    >
                      {editingMessage ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {renderNewChatDialog()}
      {renderNewGroupDialog()}
      {renderCallInterface()}
      {renderContextMenu()}
    </div>
  );
};

export default ChatPage;