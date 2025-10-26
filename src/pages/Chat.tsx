import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Send, 
  Paperclip, 
  Mic, 
  Square, 
  Smile,
  Search,
  Phone,
  Video,
  Info,
  MoreVertical,
  Users,
  Plus,
  Archive,
  Trash2,
  Bell,
  BellOff,
  LogOut,
  Pin,
  MessageCircle,
  Reply,
  X,
  Image,
  File,
  Video as VideoIcon,
  Download,
  Calendar,
  Filter,
  UserPlus,
  Settings,
  Clock,
  Check,
  CheckCheck,
  Edit,
  Save,
  Pause,
  Play,
  Eye,
  Shield,
  Sliders,
  Wifi,
  WifiOff,
  Palette,
  Type,
  User,
  Globe,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

// Додамо просту реалізацію Switch
const Switch = ({ 
  checked, 
  onCheckedChange,
  id,
  className 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    } ${className || ''}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Типи
type Message = {
  id: string;
  sender: string;
  name: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'file' | 'image' | 'video' | 'location' | 'system';
  isPinned?: boolean;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    name: string;
    content: string;
    type: string;
  };
  attachment?: {
    name: string;
    url: string;
    type: string;
    size?: number;
    previewUrl?: string;
    uploadProgress?: number;
  };
  voiceMessage?: {
    url: string;
    duration: number;
    isPlaying?: boolean;
    currentTime?: number;
  };
  reactions?: {
    [key: string]: string[];
  };
  status?: 'sent' | 'delivered' | 'read';
  expiresAt?: string;
  chatId: string;
};

type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  type: 'student' | 'supervisor' | 'group' | 'admin';
  isOnline: boolean;
  lastSeen?: string;
  unreadCount?: number;
  lastMessage?: string;
  isMuted?: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
  members?: ChatUser[];
  createdAt?: string;
  description?: string;
  settings?: {
    allowInvites: boolean;
    slowMode: boolean;
    adminOnlyMessages: boolean;
  };
};

type CreateGroupData = {
  name: string;
  members: string[];
  description?: string;
  avatar?: File;
  settings: {
    allowInvites: boolean;
    slowMode: boolean;
    adminOnlyMessages: boolean;
  };
};

type MediaItem = {
  type: 'image' | 'video' | 'file' | 'voice';
  url: string;
  name: string;
  timestamp: string;
  messageId: string;
  thumbnail?: string;
};

type SearchFilter = {
  type: 'all' | 'text' | 'file' | 'image' | 'video' | 'voice' | 'link' | 'location';
  date?: Date;
  sender?: string;
};

interface ChatSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  messageSound: boolean;
  notificationSound: boolean;
  autoDownload: boolean;
  language: 'uk' | 'en';
  chatBackground: string;
  backgroundBlur: 'none' | 'light' | 'medium';
  messageBubbles: 'rounded' | 'square' | 'minimal' | 'modern';
  bubbleOpacity: number;
  messageShadow: boolean;
  messageDensity: 'comfortable' | 'cozy' | 'compact';
  showAvatars: boolean;
  showMessageTime: 'always' | 'hover' | 'never';
  typingIndicators: true;
  typingAnimation: 'dots' | 'wave' | 'pulse';
  readReceipts: boolean;
  readReceiptsStyle: 'classic' | 'modern' | 'minimal';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  privacyMode: 'all' | 'contacts' | 'none';
  autoDeleteMessages: 'never' | '1h' | '24h' | '7d' | '30d';
  autoDeleteMedia: boolean;
  emojiStyle: 'native' | 'apple' | 'google' | 'twitter' | 'facebook';
  animatedEmoji: boolean;
  emojiSize: 'small' | 'medium' | 'large';
  messageFormatting: boolean;
  markdownSupport: boolean;
  linkPreview: boolean;
  codeHighlighting: boolean;
}

interface EnhancedChatSettingsProps {
  showChatSettings: boolean;
  setShowChatSettings: (show: boolean) => void;
  chatSettings: ChatSettings;
  setChatSettings: (settings: ChatSettings | ((prev: ChatSettings) => ChatSettings)) => void;
  onChatSettingsChange?: (settings: ChatSettings) => void;
  onSaveAndStartNewChat?: () => void;
}

// WebSocket message types
interface WSMessage {
  type: 'auth' | 'message' | 'typing' | 'read_receipt' | 'user_status' | 'error' | 'chat_list' | 'reaction';
  payload: unknown;
}

interface AuthMessage {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ChatListMessage {
  chats: ChatUser[];
}

interface TypingMessage {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface UserStatusMessage {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface ErrorMessage {
  message: string;
}

interface ReadReceiptMessage {
  messageId: string;
  userId: string;
  userName: string;
  chatId: string;
}

interface ReactionMessage {
  messageId: string;
  emoji: string;
  action: 'add' | 'remove';
  userId: string;
  chatId: string;
}

// Кастомна toast функція
const toast = {
  success: (message: string) => {
    console.log(`✅ ${message}`);
    alert(`✅ ${message}`);
  },
  error: (message: string) => {
    console.log(`❌ ${message}`);
    alert(`❌ ${message}`);
  },
  info: (message: string) => {
    console.log(`ℹ️ ${message}`);
    alert(`ℹ️ ${message}`);
  }
};

// Емодзі для реакцій
const REACTION_EMOJIS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👏', label: 'Clap' }
];

const EMOJI_STYLES = [
  { id: 'native' as const, name: 'Системні', preview: '😊' },
  { id: 'apple' as const, name: 'Apple', preview: '😊' },
  { id: 'google' as const, name: 'Google', preview: '😊' },
  { id: 'twitter' as const, name: 'Twitter', preview: '😊' },
  { id: 'facebook' as const, name: 'Facebook', preview: '😊' },
];

// Current user info - буде отримуватися з API
const getCurrentUser = () => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : {
    id: 'current-user',
    name: 'Ви',
    email: 'you@university.edu',
    type: 'student' as const,
    avatar: 'В',
    avatarUrl: '/avatars/current-user.jpg'
  };
};

const BACKGROUND_PRESETS = [
  { id: 'gradient-blue', name: 'Блакитний градієнт', color: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950' },
  { id: 'gradient-purple', name: 'Фіолетовий градієнт', color: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950' },
  { id: 'gradient-green', name: 'Зелений градієнт', color: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950' },
  { id: 'dark', name: 'Темний', color: 'bg-gradient-to-br from-gray-900 to-gray-800' },
  { id: 'pattern', name: 'Текстура', color: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950' },
];

const BACKGROUND_PRESETS_WITH_DEFAULT = [
  { id: 'default', name: 'Системна тема', color: '' },
  ...BACKGROUND_PRESETS
];

// CSS змінні та стилі
const chatStyles = `
  @keyframes wave {
    0%, 60%, 100% { transform: scaleY(0.5); }
    30% { transform: scaleY(1); }
  }
  .animate-wave {
    animation: wave 1.2s infinite ease-in-out;
  }
`;

const cssVariables = `
  :root {
    --bubble-radius: 16px;
    --bubble-opacity: 0.9;
    --message-shadow: 0 2px 8px rgba(0,0,0,0.1);
    --message-gap: 1rem;
  }
`;

const ChatPage = () => {
  // Стани
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'archived' | 'blocked'>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [newGroupData, setNewGroupData] = useState<CreateGroupData>({
    name: '',
    members: [],
    description: '',
    settings: {
      allowInvites: true,
      slowMode: false,
      adminOnlyMessages: false
    }
  });
  const [showMembersTooltip, setShowMembersTooltip] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({ type: 'all' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [userSettings, setUserSettings] = useState<ChatSettings>({
    theme: 'system',
    fontSize: 'medium',
    messageSound: true,
    notificationSound: true,
    autoDownload: true,
    language: 'uk',
    chatBackground: 'default',
    backgroundBlur: 'none',
    messageBubbles: 'rounded',
    bubbleOpacity: 0.9,
    messageShadow: true,
    messageDensity: 'comfortable',
    showAvatars: true,
    showMessageTime: 'always',
    typingIndicators: true,
    typingAnimation: 'dots',
    readReceipts: true,
    readReceiptsStyle: 'classic',
    showOnlineStatus: true,
    showLastSeen: true,
    privacyMode: 'all',
    autoDeleteMessages: 'never',
    autoDeleteMedia: false,
    emojiStyle: 'native',
    animatedEmoji: true,
    emojiSize: 'medium',
    messageFormatting: true,
    markdownSupport: true,
    linkPreview: true,
    codeHighlighting: true,
  });
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [playingVoiceMessage, setPlayingVoiceMessage] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<{ [key: string]: number }>({});
  const [messageSearchResults, setMessageSearchResults] = useState<Message[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser] = useState(getCurrentUser());
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [messageToPinId, setMessageToPinId] = useState<string | null>(null);
  const [pinForBoth, setPinForBoth] = useState(false);

  // Референси
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const voiceProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // WebSocket з'єднання
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `${protocol}//${window.location.host}/ws`
      : `${protocol}//localhost:4000/ws`;

    const websocket = new WebSocket(`${wsUrl}?token=${token}`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setWs(websocket);
      toast.success('Підключено до чату');
    };

    websocket.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setWs(null);
      
      if (event.code !== 4001) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return websocket;
  }, []);

  // Обробка повідомлень від WebSocket
  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'auth': {
        const authPayload = message.payload as AuthMessage;
        if (authPayload.success) {
          console.log('Authentication successful');
          sendWebSocketMessage('chat_list', {});
        } else {
          toast.error('Помилка аутентифікації в чаті');
        }
        break;
      }
        
      case 'chat_list': {
        const chatListPayload = message.payload as ChatListMessage;
        setUsers(chatListPayload.chats || []);
        break;
      }
        
      case 'message': {
        const messagePayload = message.payload as Message;
        
        setMessages(prev => {
          const existingMessageIndex = prev.findIndex(msg => 
            msg.id === messagePayload.id
          );
          
          if (existingMessageIndex !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[existingMessageIndex] = {
              ...updatedMessages[existingMessageIndex],
              ...messagePayload,
              status: 'delivered'
            };
            return updatedMessages;
          } else {
            return [...prev, messagePayload];
          }
        });
        
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        break;
      }
        
      case 'typing': {
        const typingPayload = message.payload as TypingMessage;
        
        if (typingPayload.userId !== currentUser.id) {
          if (typingPayload.isTyping) {
            setIsTyping(true);
            setTypingUser(typingPayload.userName);
          } else {
            setIsTyping(false);
            setTypingUser('');
          }
        }
        break;
      }
        
      case 'user_status': {
        const statusPayload = message.payload as UserStatusMessage;
        setUsers(prev => prev.map(chat => 
          chat.id === statusPayload.userId 
            ? { 
                ...chat, 
                isOnline: statusPayload.isOnline, 
                lastSeen: statusPayload.lastSeen 
              }
            : chat
        ));
        break;
      }
        
      case 'read_receipt': {
        const receiptPayload = message.payload as ReadReceiptMessage;
        setMessages(prev => prev.map(msg => 
          msg.id === receiptPayload.messageId 
            ? { ...msg, status: 'read' as const }
            : msg
        ));
        break;
      }

      case 'reaction': {
        const reactionPayload = message.payload as ReactionMessage;
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === reactionPayload.messageId) {
            const reactions = { ...(msg.reactions || {}) };
            
            if (reactionPayload.action === 'add') {
              if (!reactions[reactionPayload.emoji]) {
                reactions[reactionPayload.emoji] = [];
              }
              if (!reactions[reactionPayload.emoji].includes(reactionPayload.userId)) {
                reactions[reactionPayload.emoji].push(reactionPayload.userId);
              }
            } else {
              if (reactions[reactionPayload.emoji]) {
                reactions[reactionPayload.emoji] = reactions[reactionPayload.emoji].filter(
                  id => id !== reactionPayload.userId
                );
                if (reactions[reactionPayload.emoji].length === 0) {
                  delete reactions[reactionPayload.emoji];
                }
              }
            }
            
            return { ...msg, reactions };
          }
          return msg;
        }));
        break;
      }
        
      case 'error': {
        const errorPayload = message.payload as ErrorMessage;
        console.error('WebSocket error:', errorPayload.message);
        toast.error(errorPayload.message);
        break;
      }
        
      default: {
        console.warn('Unknown message type:', message.type);
        break;
      }
    }
  }, [currentUser.id]);

  // Функція для відправки повідомлень через WebSocket
  const sendWebSocketMessage = useCallback((type: string, payload: unknown) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [ws]);

  // Завантаження доступних користувачів для нових чатів
  const loadAvailableUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const usersData = await response.json();
        const formattedUsers = usersData
          .filter((user: { id: number; name: string; email: string; role: string }) => user.id.toString() !== currentUser.id)
          .map((user: { id: number; name: string; email: string; role: string }) => ({
            id: user.id.toString(),
            name: user.name,
            avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
            email: user.email,
            type: user.role === 'teacher' ? 'supervisor' as const : 'student' as const,
            isOnline: false
          }));
        
        setAvailableUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  }, [currentUser.id]);

  // Завантаження історії повідомлень для вибраного чату
  const loadChatHistory = useCallback(async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const messagesData = await response.json();
        const messagesWithSenderInfo = messagesData.map((msg: any) => ({
          ...msg,
          sender: msg.sender.toString(),
          name: msg.name || 'Unknown'
        }));
        setMessages(messagesWithSenderInfo);
        
        sendWebSocketMessage('read_receipt', { chatId });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [sendWebSocketMessage]);

  // Функції для голосових повідомлень
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleVoiceMessage(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Не вдалося отримати доступ до мікрофона');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (isRecording && mediaRecorderRef.current) {
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      setRecordingTime(0);
    }
  }, [isRecording]);

  const handleVoiceMessage = useCallback(async (audioBlob: Blob) => {
    if (!selectedUser) {
      toast.error('Виберіть чат для відправки повідомлення');
      return;
    }

    try {
      const voiceUrl = URL.createObjectURL(audioBlob);
      
      const messageId = Date.now().toString();
      const timestamp = new Date().toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
      });

      const localMessage: Message = {
        id: messageId,
        sender: currentUser.id,
        name: currentUser.name,
        content: 'Голосове повідомлення',
        timestamp: timestamp,
        type: 'voice',
        chatId: selectedUser.id,
        status: 'sent',
        voiceMessage: {
          url: voiceUrl,
          duration: recordingTime,
          isPlaying: false,
          currentTime: 0
        }
      };

      setMessages(prev => [...prev, localMessage]);

      const voiceMessageData = {
        chatId: selectedUser.id,
        content: 'Голосове повідомлення',
        type: 'voice' as const,
        voiceMessage: {
          duration: recordingTime
        }
      };

      sendWebSocketMessage('message', voiceMessageData);
      
      toast.success('Голосове повідомлення відправлено');
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Помилка відправки голосового повідомлення');
    }
  }, [selectedUser, recordingTime, currentUser, sendWebSocketMessage]);

  // Мемоізовані значення
  const allMedia = useMemo(() => {
    return messages.reduce<MediaItem[]>((acc, message) => {
      if (message.attachment) {
        const mediaType = message.attachment.type.startsWith('image/') ? 'image' :
                         message.attachment.type.startsWith('video/') ? 'video' : 'file';
        
        acc.push({
          type: mediaType,
          url: message.attachment.url,
          name: message.attachment.name,
          timestamp: message.timestamp,
          messageId: message.id,
          thumbnail: message.attachment.previewUrl
        });
      }
      if (message.type === 'voice' && message.voiceMessage) {
        acc.push({
          type: 'voice',
          url: message.voiceMessage.url,
          name: 'Голосове повідомлення',
          timestamp: message.timestamp,
          messageId: message.id
        });
      }
      return acc;
    }, []);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (messageSearchResults.length > 0) {
      return messageSearchResults;
    }
    
    return messages.filter(message => {
      if (searchFilter.type !== 'all' && message.type !== searchFilter.type) {
        return false;
      }
      
      if (searchFilter.sender && message.sender !== searchFilter.sender) {
        return false;
      }
      
      if (globalSearchTerm) {
        const searchLower = globalSearchTerm.toLowerCase();
        return message.content.toLowerCase().includes(searchLower) ||
               (message.attachment?.name.toLowerCase().includes(searchLower)) ||
               message.name.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }, [messages, searchFilter, globalSearchTerm, messageSearchResults]);

  const performGlobalSearch = useCallback((term: string) => {
    const results = messages.filter(message => 
      message.content.toLowerCase().includes(term.toLowerCase()) ||
      (message.attachment?.name.toLowerCase().includes(term.toLowerCase()))
    );
    setMessageSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    return results;
  }, [messages]);

  const filteredChats = useMemo(() => {
    return users.filter(chat => {
      if (activeTab === 'groups') return chat.type === 'group' && !chat.isArchived && !chat.isBlocked;
      if (activeTab === 'archived') return chat.isArchived;
      if (activeTab === 'blocked') return chat.isBlocked;
      return !chat.isArchived && !chat.isBlocked;
    });
  }, [users, activeTab]);

  const filteredUsers = useMemo(() => {
    return filteredChats.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredChats, searchTerm]);

  // Функції для роботи з файлами
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Файл занадто великий. Максимальний розмір: 50MB');
        return;
      }
      
      const uploadId = Date.now().toString();
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
      
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress >= 100) {
            clearInterval(interval);
            setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[uploadId];
                return newProgress;
              });
              setAttachment(file);
            }, 500);
          } else {
            setUploadProgress(prev => ({ ...prev, [uploadId]: progress }));
          }
        }, 200);
      };
      
      simulateUpload();
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // Компонент для відображення прев'ю файлів
  const FilePreview = ({ file, onRemove, uploadProgress }: { 
    file: File; 
    onRemove: () => void;
    uploadProgress?: number;
  }) => {
    const fileSize = useMemo(() => {
      const size = file.size;
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }, [file.size]);

    if (file.type.startsWith('image/')) {
      return (
        <div className="relative inline-block">
          <div className="relative">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="h-20 w-20 object-cover rounded-lg"
            />
            {uploadProgress !== undefined && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-xs text-center">
                  <div className="font-semibold">{uploadProgress}%</div>
                  <Progress value={uploadProgress} className="w-16 h-1 mt-1" />
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <div className="relative p-3 bg-blue-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <VideoIcon className="w-8 h-8 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium text-sm text-blue-800">{file.name}</div>
              <div className="text-xs text-blue-600">{fileSize}</div>
              {uploadProgress !== undefined && uploadProgress < 100 && (
                <Progress value={uploadProgress} className="w-32 h-1 mt-1" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            >
              ×
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
        <FileText className="w-8 h-8 text-blue-600" />
        <div className="flex-1">
          <div className="font-medium text-sm text-blue-800">{file.name}</div>
          <div className="text-xs text-blue-600">{fileSize}</div>
          {uploadProgress !== undefined && uploadProgress < 100 && (
            <Progress value={uploadProgress} className="w-32 h-1 mt-1" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
        >
          ×
        </Button>
      </div>
    );
  };

  // Компонент для медіа галереї
  const MediaGallery = () => {
    const images = allMedia.filter(media => media.type === 'image');
    const videos = allMedia.filter(media => media.type === 'video');
    const files = allMedia.filter(media => media.type === 'file');
    const voiceMessages = allMedia.filter(media => media.type === 'voice');

    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    return (
      <>
        <Dialog open={showMediaGallery} onOpenChange={setShowMediaGallery}>
          <DialogContent className="max-w-6xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>Медіа, файли та голосові повідомлення</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="images" className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="images">
                  <Image className="h-4 w-4 mr-2" />
                  Фото ({images.length})
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <VideoIcon className="h-4 w-4 mr-2" />
                  Відео ({videos.length})
                </TabsTrigger>
                <TabsTrigger value="files">
                  <File className="h-4 w-4 mr-2" />
                  Файли ({files.length})
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Mic className="h-4 w-4 mr-2" />
                  Голосові ({voiceMessages.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="images" className="flex-1 overflow-auto">
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {images.map((media, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer aspect-square"
                        onClick={() => setSelectedMedia(media)}
                      >
                        <img 
                          src={media.thumbnail || media.url} 
                          alt={media.name}
                          className="w-full h-full object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {media.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Немає зображень</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="flex-1 overflow-auto">
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((media, index) => (
                      <div key={index} className="relative group">
                        <video 
                          src={media.url}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer"
                          controls
                        />
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                          {media.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <VideoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Немає відео</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="files" className="flex-1 overflow-auto">
                {files.length > 0 ? (
                  <div className="space-y-3">
                    {files.map((media, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                        <FileText className="h-10 w-10 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium">{media.name}</div>
                          <div className="text-sm text-muted-foreground">{media.timestamp}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(media.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Немає файлів</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="voice" className="flex-1 overflow-auto">
                {voiceMessages.length > 0 ? (
                  <div className="space-y-3">
                    {voiceMessages.map((media, index) => (
                      <VoiceMessagePlayer 
                        key={index}
                        media={media}
                        isPlaying={playingVoiceMessage === media.messageId}
                        currentProgress={voiceProgress[media.messageId] || 0}
                        onPlay={() => handlePlayVoiceMessage(media.messageId)}
                        onPause={() => handlePauseVoiceMessage()}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Немає голосових повідомлень</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl">
            {selectedMedia && (
              <div className="relative">
                {selectedMedia.type === 'image' ? (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.name}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />
                ) : selectedMedia.type === 'video' ? (
                  <video 
                    src={selectedMedia.url}
                    controls
                    className="w-full h-auto max-h-[70vh] rounded-lg"
                  />
                ) : null}
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{selectedMedia.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedMedia.timestamp}</div>
                  </div>
                  <Button
                    onClick={() => window.open(selectedMedia.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Завантажити
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  // Компонент для відтворення голосових повідомлень
  const VoiceMessagePlayer = ({ 
    media, 
    isPlaying, 
    currentProgress, 
    onPlay, 
    onPause 
  }: {
    media: MediaItem;
    isPlaying: boolean;
    currentProgress: number;
    onPlay: () => void;
    onPause: () => void;
  }) => {
    const duration = 30;
    
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
        <Button
          variant="outline"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          className="h-12 w-12 rounded-full"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <div className="flex-1">
          <div className="font-medium text-sm">{media.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={currentProgress} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground w-12">
              {Math.floor((currentProgress / 100) * duration)}s
            </span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {media.timestamp}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(media.url, '_blank')}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Функції для роботи з голосовими повідомленнями
  const handlePlayVoiceMessage = useCallback((messageId: string) => {
    setPlayingVoiceMessage(messageId);
    let progress = 0;
    voiceProgressIntervalRef.current = setInterval(() => {
      progress += 1;
      if (progress >= 100) {
        if (voiceProgressIntervalRef.current) {
          clearInterval(voiceProgressIntervalRef.current);
        }
        setPlayingVoiceMessage(null);
        setVoiceProgress(prev => ({ ...prev, [messageId]: 0 }));
      } else {
        setVoiceProgress(prev => ({ ...prev, [messageId]: progress }));
      }
    }, 300);
  }, []);

  const handlePauseVoiceMessage = useCallback(() => {
    if (voiceProgressIntervalRef.current) {
      clearInterval(voiceProgressIntervalRef.current);
    }
    setPlayingVoiceMessage(null);
  }, []);

  // Функції для реакцій
  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...(msg.reactions || {}) };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (!reactions[emoji].includes(currentUser.id)) {
          reactions[emoji].push(currentUser.id);
        } else {
          reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
          if (selectedUser) {
            sendWebSocketMessage('reaction', {
              messageId,
              emoji,
              action: 'remove',
              userId: currentUser.id,
              chatId: selectedUser.id
            } as ReactionMessage);
          }
          return { ...msg, reactions };
        }
        return { ...msg, reactions };
      }
      return msg;
    }));

    if (selectedUser) {
      sendWebSocketMessage('reaction', {
        messageId,
        emoji,
        action: 'add',
        userId: currentUser.id,
        chatId: selectedUser.id
      } as ReactionMessage);
    }
  }, [currentUser.id, selectedUser, sendWebSocketMessage]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...(msg.reactions || {}) };
        if (reactions[emoji]) {
          reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        }
        return { ...msg, reactions };
      }
      return msg;
    }));

    if (selectedUser) {
      sendWebSocketMessage('reaction', {
        messageId,
        emoji,
        action: 'remove',
        userId: currentUser.id,
        chatId: selectedUser.id
      } as ReactionMessage);
    }
  }, [currentUser.id, selectedUser, sendWebSocketMessage]);

  // Навігація по результатах пошуку
  const navigateSearchResults = useCallback((direction: 'next' | 'prev') => {
    if (messageSearchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % messageSearchResults.length;
    } else {
      newIndex = (currentSearchIndex - 1 + messageSearchResults.length) % messageSearchResults.length;
    }
    
    setCurrentSearchIndex(newIndex);
    
    const messageElement = document.querySelector(`[data-message-id="${messageSearchResults[newIndex].id}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 2000);
    }
  }, [messageSearchResults, currentSearchIndex]);

  // Функції для редагування повідомлень
  const startEditing = useCallback((message: Message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingMessage(null);
    setNewMessage('');
  }, []);

  const saveEditedMessage = useCallback(() => {
    if (!editingMessage || !newMessage.trim()) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === editingMessage.id 
        ? { ...msg, content: newMessage, isEdited: true }
        : msg
    ));
    
    setEditingMessage(null);
    setNewMessage('');
    toast.success('Повідомлення відредаговано');
  }, [editingMessage, newMessage]);

  // Функція для вибору чату
  const handleSelectChat = useCallback((user: ChatUser) => {
    console.log('Вибір чату:', user.id);
    
    setMessages([]);
    setSelectedUser(user);
    setReplyingTo(null);
    setEditingMessage(null);
    setAttachment(null);
    setNewMessage('');
    setMessageSearchResults([]);
    setCurrentSearchIndex(-1);
    setGlobalSearchTerm('');
    setShowGlobalSearch(false);
    
    loadChatHistory(user.id);
    
    setUsers(prev => prev.map(chat => 
      chat.id === user.id ? { ...chat, unreadCount: 0 } : chat
    ));

    sendWebSocketMessage('read_receipt', { chatId: user.id });
  }, [loadChatHistory, sendWebSocketMessage]);

  // Функція створення групи
  const createGroup = useCallback(async () => {
    if (!newGroupData.name || newGroupData.members.length === 0) {
      toast.error('Введіть назву групи та оберіть учасників');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newGroupData.name,
          memberIds: newGroupData.members,
          description: newGroupData.description,
          settings: newGroupData.settings
        })
      });

      if (response.ok) {
        await response.json();
        toast.success(`Група "${newGroupData.name}" успішно створена`);
        
        sendWebSocketMessage('chat_list', {});
        
        setNewGroupData({ 
          name: '', 
          members: [], 
          description: '',
          settings: {
            allowInvites: true,
            slowMode: false,
            adminOnlyMessages: false
          }
        });
        setShowCreateGroup(false);
      } else {
        toast.error('Помилка створення групи');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Помилка створення групи');
    }
  }, [newGroupData, sendWebSocketMessage]);

  // Функція створення нового чату
  const createNewChat = useCallback(async (user: ChatUser) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId: user.id
        })
      });

      if (response.ok) {
        await response.json();
        toast.success('Чат створено');
        
        sendWebSocketMessage('chat_list', {});
        
        setShowCreateGroup(false);
      } else {
        toast.error('Помилка створення чату');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Помилка створення чату');
    }
  }, [sendWebSocketMessage]);

  // Функції керування чатами
  const toggleMuteChat = useCallback((chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
    ));
    if (selectedUser?.id === chatId) {
      setSelectedUser(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    }
    toast.info(users.find(chat => chat.id === chatId)?.isMuted ? 'Сповіщення увімкнено' : 'Сповіщення вимкнено');
  }, [selectedUser, users]);

  const toggleBlockChat = useCallback((chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isBlocked: !chat.isBlocked } : chat
    ));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.info(users.find(chat => chat.id === chatId)?.isBlocked ? 'Користувача розблоковано' : 'Користувача заблоковано');
  }, [selectedUser, users]);

  const archiveChat = useCallback((chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: true } : chat
    ));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.success('Чат архівовано');
  }, [selectedUser]);

  const unarchiveChat = useCallback((chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: false } : chat
    ));
    toast.success('Чат розархівовано');
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setUsers(prev => prev.filter(chat => chat.id !== chatId));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.success('Чат видалено');
  }, [selectedUser]);

  const leaveGroup = useCallback((chatId: string) => {
    setUsers(prev => prev.filter(chat => chat.id !== chatId));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.success('Ви покинули групу');
  }, [selectedUser]);

  // Функції для закріплення повідомлень
  const pinMessage = useCallback((messageId: string, forBoth: boolean = false) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
    
    const message = messages.find(msg => msg.id === messageId);
    const willBePinned = !message?.isPinned;
    
    if (!willBePinned) {
      toast.info('Повідомлення відкріплено');
    } else {
      toast.info(forBoth ? 'Повідомлення закріплено для всіх' : 'Повідомлення закріплено у вас');
      
      if (forBoth && selectedUser) {
        sendWebSocketMessage('pin_message', {
          messageId,
          chatId: selectedUser.id,
          forBoth: true
        });
      }
    }
    
    setShowPinDialog(false);
    setMessageToPinId(null);
  }, [messages, selectedUser, sendWebSocketMessage]);

  const openPinDialog = useCallback((messageId: string) => {
    setMessageToPinId(messageId);
    setPinForBoth(false);
    setShowPinDialog(true);
  }, []);

  const confirmPinMessage = useCallback(() => {
    if (messageToPinId) {
      pinMessage(messageToPinId, pinForBoth);
    }
  }, [messageToPinId, pinForBoth, pinMessage]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success('Повідомлення видалено');
  }, []);

  const replyToMessage = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Симуляція набору тексту
  const simulateTyping = useCallback(() => {
    if (!selectedUser) return;
    
    setIsTyping(true);
    setTypingUser(selectedUser.name);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingUser('');
    }, 3000);
  }, [selectedUser]);

  const sendStopTyping = useCallback(() => {
    setIsTyping(false);
    setTypingUser('');
    
    if (selectedUser) {
      sendWebSocketMessage('typing', {
        chatId: selectedUser.id,
        isTyping: false,
        userId: currentUser.id,
        userName: currentUser.name
      } as TypingMessage);
    }
  }, [selectedUser, sendWebSocketMessage, currentUser]);

  const handleTyping = useCallback(() => {
    simulateTyping();
    
    if (selectedUser) {
      sendWebSocketMessage('typing', {
        chatId: selectedUser.id,
        isTyping: true,
        userId: currentUser.id,
        userName: currentUser.name
      } as TypingMessage);

      setTimeout(() => {
        sendWebSocketMessage('typing', {
          chatId: selectedUser.id,
          isTyping: false,
          userId: currentUser.id,
          userName: currentUser.name
        } as TypingMessage);
      }, 3000);
    }
  }, [simulateTyping, selectedUser, sendWebSocketMessage, currentUser]);

  // Основна функція відправки повідомлень
  const handleSend = useCallback(() => {
    if (!newMessage.trim() && !attachment) return;

    if (!selectedUser) {
      toast.error('Виберіть чат для відправки повідомлення');
      return;
    }

    const messageType = attachment ? 
      (attachment.type.startsWith('image/') ? 'image' :
       attachment.type.startsWith('video/') ? 'video' : 'file') : 'text';

    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString('uk-UA', {
      hour: '2-digit', minute: '2-digit'
    });

    const localMessage: Message = {
      id: messageId,
      sender: currentUser.id,
      name: currentUser.name,
      content: newMessage,
      timestamp: timestamp,
      type: messageType,
      chatId: selectedUser.id,
      status: 'sent',
      replyTo: replyingTo || undefined,
      attachment: attachment ? {
        name: attachment.name,
        url: URL.createObjectURL(attachment),
        type: attachment.type,
        size: attachment.size,
        previewUrl: attachment.type.startsWith('image/') || attachment.type.startsWith('video/') 
          ? URL.createObjectURL(attachment) 
          : undefined
      } : undefined
    };

    setMessages(prev => [...prev, localMessage]);

    const messageData = {
      chatId: selectedUser.id,
      content: newMessage,
      type: messageType,
      replyTo: replyingTo,
      attachment: attachment ? {
        name: attachment.name,
        url: 'uploaded-file-url',
        type: attachment.type,
        size: attachment.size
      } : undefined
    };

    sendWebSocketMessage('message', messageData);

    setNewMessage('');
    setAttachment(null);
    setReplyingTo(null);
    setEditingMessage(null);
    sendStopTyping();

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [newMessage, attachment, replyingTo, selectedUser, currentUser, sendWebSocketMessage, sendStopTyping]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        saveEditedMessage();
      } else {
        handleSend();
      }
    } else if (e.key === 'Escape') {
      if (editingMessage) {
        cancelEditing();
      } else if (replyingTo) {
        cancelReply();
      }
    }
  }, [handleSend, editingMessage, saveEditedMessage, cancelEditing, replyingTo, cancelReply]);

  // ВИПРАВЛЕНА ФУНКЦІЯ СКРОЛУ
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, 100);
  }, []);

  const removeAttachment = useCallback(() => {
    setAttachment(null);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getStatusIcon = useCallback((status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  }, []);

  // Компонент для відображення статусу повідомлення
  const MessageStatus = ({ status, timestamp, isEdited }: { 
    status: Message['status']; 
    timestamp: string;
    isEdited?: boolean;
  }) => (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>{timestamp}</span>
      {isEdited && <span className="italic">(ред.)</span>}
      {status && getStatusIcon(status)}
    </div>
  );

  // ВИПРАВЛЕНИЙ КОМПОНЕНТ ПОВІДОМЛЕННЯ
  const MessageItem = useCallback(({ message }: { message: Message }) => {
    const isOwnMessage = message.sender === currentUser.id;
    
    return (
      <div
        key={message.id}
        data-message-id={message.id}
        className={`flex message-container group mb-3 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`flex items-end max-w-xl gap-2 ${
            isOwnMessage ? 'flex-row-reverse' : ''
          }`}
        >
          {/* Аватар для чужих повідомлень */}
          {userSettings.showAvatars && !isOwnMessage && (
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                {message.name ? message.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={`flex flex-col ${
              isOwnMessage ? 'items-end' : 'items-start'
            }`}
          >
            {/* Ім'я для групових чатів */}
            {selectedUser?.type === 'group' && !isOwnMessage && (
              <span className="text-xs font-medium text-gray-600 mb-1 ml-1">
                {message.name}
              </span>
            )}

            <div className="flex items-start gap-2">
              <div
                className={`px-3 py-2 shadow-md transition-all duration-300 relative max-w-xs ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white rounded-tl-2xl rounded-tr-md rounded-br-md rounded-bl-2xl'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-tr-2xl rounded-tl-md rounded-bl-md rounded-br-2xl'
                }`}
                style={{ 
                  opacity: userSettings.bubbleOpacity,
                  borderRadius: `var(--bubble-radius, 16px)`,
                  boxShadow: `var(--message-shadow, 0 2px 8px rgba(0,0,0,0.1))`
                }}
              >
                {/* Reply preview */}
                {message.replyTo && (
                  <div className={`mb-2 p-2 rounded-lg border-l-4 ${
                    isOwnMessage
                      ? 'bg-blue-500/20 border-l-blue-400'
                      : 'bg-gray-100 border-l-gray-400'
                  }`}>
                    <div className="flex items-center gap-1 mb-1">
                      <Reply className="h-3 w-3" />
                      <span className="text-xs font-medium">{message.replyTo.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {message.replyTo.content}
                    </p>
                  </div>
                )}

                {/* Вміст повідомлення */}
                {message.type === 'voice' ? (
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-2 bg-white/20 rounded-full"
                      onClick={() => 
                        playingVoiceMessage === message.id 
                          ? handlePauseVoiceMessage()
                          : handlePlayVoiceMessage(message.id)
                      }
                    >
                      {playingVoiceMessage === message.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-white/30 rounded-full">
                        <div 
                          className="h-2 bg-white rounded-full transition-all" 
                          style={{ width: `${voiceProgress[message.id] || 0}%` }}
                        />
                      </div>
                      <span className="text-sm">
                        {formatTime(message.voiceMessage?.duration || 0)}
                      </span>
                    </div>
                  </div>
                ) : message.type === 'image' && message.attachment ? (
                  <div className="space-y-2">
                    <img 
                      src={message.attachment.previewUrl} 
                      alt={message.attachment.name}
                      className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() => window.open(message.attachment!.url, '_blank')}
                    />
                    {message.content && <p className="text-sm mt-2">{message.content}</p>}
                  </div>
                ) : message.type === 'file' && message.attachment ? (
                  <div className={`flex items-center gap-3 p-2 rounded-lg ${
                    isOwnMessage ? 'bg-blue-500/20' : 'bg-gray-100'
                  }`}>
                    <FileText className="h-8 w-8" />
                    <div className="flex-1">
                      <div className="font-medium">{message.attachment.name}</div>
                      <div className="text-sm opacity-75">
                        {(message.attachment.size! / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(message.attachment!.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                    {message.content}
                  </p>
                )}

                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(message.reactions).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() => 
                          users.includes(currentUser.id)
                            ? removeReaction(message.id, emoji)
                            : addReaction(message.id, emoji)
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer hover:scale-105 transition-transform ${
                          users.includes(currentUser.id)
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400'
                        }`}
                        title={`Реагували: ${users.map(userId => 
                          userId === currentUser.id ? 'Ви' : 
                          messages.find(m => m.sender === userId)?.name || 'Користувач'
                        ).join(', ')}`}
                      >
                        <span>{emoji}</span>
                        <span className="font-semibold">{users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Меню повідомлення */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {
                    if (message.isPinned) {
                      pinMessage(message.id, false);
                    } else {
                      openPinDialog(message.id);
                    }
                  }}>
                    <Pin className="h-4 w-4 mr-2" />
                    {message.isPinned ? 'Відкріпити' : 'Закріпити'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => replyToMessage(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Відповісти
                  </DropdownMenuItem>
                  {message.sender === currentUser.id && (
                    <DropdownMenuItem onClick={() => startEditing(message)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Редагувати
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Копіювати текст
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {message.sender === currentUser.id && (
                    <DropdownMenuItem 
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Видалити
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Кнопки реакцій */}
            <div className={`flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwnMessage ? 'justify-end' : 'justify-start'
            }`}>
              {REACTION_EMOJIS.map(({ emoji, label }) => {
                const hasReacted = message.reactions?.[emoji]?.includes(currentUser.id);
                return (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 hover:scale-110 transition-transform ${
                      hasReacted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => 
                      hasReacted 
                        ? removeReaction(message.id, emoji)
                        : addReaction(message.id, emoji)
                    }
                    title={label}
                  >
                    <span className="text-xs">{emoji}</span>
                  </Button>
                );
              })}
            </div>

            {/* Статус повідомлення */}
            <div className={`flex items-center gap-2 mt-1 ${
              isOwnMessage ? 'justify-end' : 'justify-start'
            }`}>
              <MessageStatus 
                status={message.status} 
                timestamp={message.timestamp}
                isEdited={message.isEdited}
              />
            </div>
          </div>

          {/* Аватар для своїх повідомлень */}
          {userSettings.showAvatars && isOwnMessage && (
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                В
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  }, [currentUser.id, selectedUser, userSettings, playingVoiceMessage, voiceProgress, messages]);

  // Оптимізований рендеринг списку повідомлень
  const renderMessages = useMemo(() => {
    return filteredMessages.map((message) => (
      <MessageItem key={message.id} message={message} />
    ));
  }, [filteredMessages, MessageItem]);

  // Застосовуємо налаштування до області чату
  useEffect(() => {
    applySettingsToChatArea(userSettings);
  }, [userSettings, selectedUser]);

  const applySettingsToChatArea = (settings: ChatSettings) => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    const backgroundPreset = BACKGROUND_PRESETS.find(preset => preset.id === settings.chatBackground);
    
    chatArea.className = chatArea.className.replace(/bg-gradient-to-br\sfrom-[\w-]+\sto-[\w-]+/g, '');
    chatArea.className = chatArea.className.replace(/\bbg-[\w-]+\b/g, '');
    
    if (backgroundPreset) {
      chatArea.classList.add(...backgroundPreset.color.split(' '));
    }

    const fontSize = settings.fontSize === 'small' ? 'text-sm' : 
                    settings.fontSize === 'large' ? 'text-lg' : 'text-base';
    
    chatArea.className = chatArea.className.replace(/\btext-(sm|base|lg)\b/g, '');
    chatArea.classList.add(fontSize);

    const blurValue = settings.backgroundBlur === 'light' ? 'backdrop-blur-sm' :
                     settings.backgroundBlur === 'medium' ? 'backdrop-blur-md' : '';
    
    chatArea.className = chatArea.className.replace(/\bbackdrop-blur-(sm|md|lg|xl)\b/g, '');
    if (blurValue) {
      chatArea.classList.add(blurValue);
    }

    const root = document.documentElement;
    const bubbleRadius = 
      settings.messageBubbles === 'square' ? '8px' : 
      settings.messageBubbles === 'minimal' ? '4px' :
      settings.messageBubbles === 'modern' ? '20px' : '16px';
    
    root.style.setProperty('--bubble-radius', bubbleRadius);
    root.style.setProperty('--bubble-opacity', settings.bubbleOpacity.toString());
    root.style.setProperty('--message-shadow', settings.messageShadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none');
    
    const messageGap = 
      settings.messageDensity === 'compact' ? '0.25rem' : 
      settings.messageDensity === 'cozy' ? '0.5rem' : '1rem';
    root.style.setProperty('--message-gap', messageGap);
  };

  // Ініціалізація WebSocket та завантаження даних
  useEffect(() => {
    // Додаємо CSS змінні
    const styleElement = document.createElement('style');
    styleElement.textContent = cssVariables + chatStyles;
    document.head.appendChild(styleElement);

    connectWebSocket();
    loadAvailableUsers();
    
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      document.head.removeChild(styleElement);
    };
  }, []);

  // Resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // ВИПРАВЛЕНИЙ USEFFECT ДЛЯ СКРОЛУ
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-area]');
    if (scrollContainer) {
      const observer = new MutationObserver(() => {
        scrollToBottom();
      });
      
      observer.observe(scrollContainer, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    }
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, replyingTo, editingMessage, scrollToBottom]);

  const EnhancedChatSettings = ({
    showChatSettings,
    setShowChatSettings,
    chatSettings,
  }: EnhancedChatSettingsProps) => {
    const [activeTab, setActiveTab] = useState('appearance');
    const [localSettings, setLocalSettings] = useState(chatSettings);

    useEffect(() => {
      if (showChatSettings) {
        setLocalSettings(userSettings);
        const savedTab = localStorage.getItem('chat-settings-active-tab');
        setActiveTab(savedTab || 'appearance');
        
        setTimeout(() => applySettingsToChatArea(userSettings), 100);
      }
    }, [showChatSettings, userSettings]);

    const applySettingsToChatArea = (settings: ChatSettings) => {
      const chatArea = document.querySelector('.chat-area-preview') as HTMLElement;
      if (!chatArea) return;

      if (settings.chatBackground !== 'default') {
        const backgroundPreset = BACKGROUND_PRESETS.find(preset => preset.id === settings.chatBackground);
        if (backgroundPreset) {
          chatArea.className = chatArea.className.replace(/bg-gradient-to-br\sfrom-[\w-]+\sto-[\w-]+/g, '');
          chatArea.className = chatArea.className.replace(/\bbg-[\w-]+\b/g, '');
          
          chatArea.classList.add(...backgroundPreset.color.split(' '));
          chatArea.classList.add('chat-area-preview');
        }
      } else {
        chatArea.className = chatArea.className.replace(/bg-gradient-to-br\sfrom-[\w-]+\sto-[\w-]+/g, '');
        chatArea.className = chatArea.className.replace(/\bbg-[\w-]+\b/g, '');
        chatArea.classList.add('chat-area-preview');
      }

      const blurClass = 
        settings.backgroundBlur === 'light' ? 'backdrop-blur-sm' :
        settings.backgroundBlur === 'medium' ? 'backdrop-blur-md' : '';
      
      chatArea.className = chatArea.className.replace(/\bbackdrop-blur-(sm|md|lg|xl)\b/g, '');
      if (blurClass) {
        chatArea.classList.add(blurClass);
      }

      const fontSize = settings.fontSize === 'small' ? 'text-sm' : 
                      settings.fontSize === 'large' ? 'text-lg' : 'text-base';
      
      chatArea.className = chatArea.className.replace(/\btext-(sm|base|lg)\b/g, '');
      chatArea.classList.add(fontSize);

      const messageGap = 
        settings.messageDensity === 'compact' ? '0.25rem' : 
        settings.messageDensity === 'cozy' ? '0.5rem' : '1rem';
      
      chatArea.style.setProperty('--message-gap', messageGap);

      const bubbleRadius = 
        settings.messageBubbles === 'square' ? '8px' : 
        settings.messageBubbles === 'minimal' ? '4px' :
        settings.messageBubbles === 'modern' ? '20px' : '16px';
      
      chatArea.style.setProperty('--bubble-radius', bubbleRadius);
      chatArea.style.setProperty('--bubble-opacity', settings.bubbleOpacity.toString());
      
      if (settings.messageShadow) {
        chatArea.style.setProperty('--message-shadow', '0 2px 8px rgba(0,0,0,0.1)');
      } else {
        chatArea.style.setProperty('--message-shadow', 'none');
      }

      const messageContainers = chatArea.querySelectorAll('.preview-message');
      messageContainers.forEach(container => {
        (container as HTMLElement).style.marginBottom = messageGap;
      });
    };

    useEffect(() => {
      if (showChatSettings) {
        applySettingsToChatArea(localSettings);
      }
    }, [localSettings, showChatSettings]);

    useEffect(() => {
      if (showChatSettings) {
        localStorage.setItem('chat-settings-active-tab', activeTab);
      }
    }, [activeTab, showChatSettings]);

    const defaultSettings: ChatSettings = {
      theme: 'system',
      fontSize: 'medium',
      messageSound: true,
      notificationSound: true,
      autoDownload: true,
      language: 'uk',
      chatBackground: 'default',
      backgroundBlur: 'none',
      messageBubbles: 'rounded',
      bubbleOpacity: 0.9,
      messageShadow: true,
      messageDensity: 'comfortable',
      showAvatars: true,
      showMessageTime: 'always',
      typingIndicators: true,
      typingAnimation: 'dots',
      readReceipts: true,
      readReceiptsStyle: 'classic',
      showOnlineStatus: true,
      showLastSeen: true,
      privacyMode: 'all',
      autoDeleteMessages: 'never',
      autoDeleteMedia: false,
      emojiStyle: 'native',
      animatedEmoji: true,
      emojiSize: 'medium',
      messageFormatting: true,
      markdownSupport: true,
      linkPreview: true,
      codeHighlighting: true,
    };

    const handleResetSettings = () => {
      setLocalSettings(defaultSettings);
      toast.success('Налаштування скинуті до стандартних');
    };

    const handleSaveSettings = () => {
      setUserSettings(localSettings);
      localStorage.setItem('chat-settings', JSON.stringify(localSettings));
      
      applySettingsToMainChatArea(localSettings);
      
      setShowChatSettings(false);
      toast.success('Налаштування збережено');
    };

    const applySettingsToMainChatArea = (settings: ChatSettings) => {
      const chatArea = document.querySelector('.chat-area') as HTMLElement;
      if (!chatArea) return;

      if (settings.chatBackground !== 'default') {
        const backgroundPreset = BACKGROUND_PRESETS.find(preset => preset.id === settings.chatBackground);
        if (backgroundPreset) {
          chatArea.className = chatArea.className.replace(/bg-gradient-to-br\sfrom-[\w-]+\sto-[\w-]+/g, '');
          chatArea.className = chatArea.className.replace(/\bbg-[\w-]+\b/g, '');
          
          chatArea.classList.add(...backgroundPreset.color.split(' '));
          chatArea.classList.add('chat-area');
        }
      } else {
        chatArea.className = chatArea.className.replace(/bg-gradient-to-br\sfrom-[\w-]+\sto-[\w-]+/g, '');
        chatArea.className = chatArea.className.replace(/\bbg-[\w-]+\b/g, '');
        chatArea.classList.add('chat-area');
      }

      const blurValue = settings.backgroundBlur === 'light' ? 'backdrop-blur-sm' :
                       settings.backgroundBlur === 'medium' ? 'backdrop-blur-md' : '';
      
      chatArea.className = chatArea.className.replace(/\bbackdrop-blur-(sm|md|lg|xl)\b/g, '');
      if (blurValue) {
        chatArea.classList.add(blurValue);
      }

      const fontSize = settings.fontSize === 'small' ? 'text-sm' : 
                      settings.fontSize === 'large' ? 'text-lg' : 'text-base';
      
      chatArea.className = chatArea.className.replace(/\btext-(sm|base|lg)\b/g, '');
      chatArea.classList.add(fontSize);

      const messageGap = 
        settings.messageDensity === 'compact' ? '0.25rem' : 
        settings.messageDensity === 'cozy' ? '0.5rem' : '1rem';
      
      chatArea.style.setProperty('--message-gap', messageGap);

      const bubbleRadius = 
        settings.messageBubbles === 'square' ? '8px' : 
        settings.messageBubbles === 'minimal' ? '4px' :
        settings.messageBubbles === 'modern' ? '20px' : '16px';
      
      chatArea.style.setProperty('--bubble-radius', bubbleRadius);
      chatArea.style.setProperty('--bubble-opacity', settings.bubbleOpacity.toString());
      
      if (settings.messageShadow) {
        chatArea.style.setProperty('--message-shadow', '0 2px 8px rgba(0,0,0,0.1)');
      } else {
        chatArea.style.setProperty('--message-shadow', 'none');
      }

      const messageContainers = chatArea.querySelectorAll('.message-container');
      messageContainers.forEach(container => {
        (container as HTMLElement).style.marginBottom = messageGap;
      });
    };

    const updateLocalSettings = (updater: (prev: ChatSettings) => ChatSettings) => {
      setLocalSettings(prev => {
        const newSettings = updater(prev);
        return newSettings;
      });
    };

    const DemoMessage = ({ isOwn = false }) => (
      <div className={`flex preview-message ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs px-4 py-2 ${
          isOwn ? 'bg-blue-600 text-white rounded-tl-2xl rounded-tr-md rounded-br-md rounded-bl-2xl' : 'bg-white border border-gray-200 text-gray-900 rounded-tr-2xl rounded-tl-md rounded-bl-md rounded-br-2xl'
        }`} style={{
          opacity: localSettings.bubbleOpacity,
          boxShadow: `var(--message-shadow, 0 2px 8px rgba(0,0,0,0.1))`,
        }}>
          <div className="text-sm">{isOwn ? 'Привіт! Як справи?' : 'Все добре, дякую! Працюю над проектом.'}</div>
          <div className="text-xs opacity-70 mt-1 flex justify-between items-center">
            <span>10:30</span>
            {isOwn && localSettings.readReceipts && (
              <CheckCheck className="h-3 w-3" />
            )}
          </div>
        </div>
      </div>
    );

    return (
      <Dialog open={showChatSettings} onOpenChange={setShowChatSettings}>
        <DialogContent className="max-w-[1600px] w-[95vw] h-[95vh] overflow-hidden flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="flex-shrink-0 px-8 pt-6 pb-5 border-b bg-gradient-to-r from-background to-muted/30">
            <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              Налаштування чату
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Персоналізуйте зовнішній вигляд та поведінку чату
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 px-8">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full h-auto md:h-12 bg-muted/30 p-1.5 rounded-xl flex-shrink-0 mt-6 mb-4 border gap-1">
              <TabsTrigger 
                value="appearance" 
                className="flex items-center justify-center gap-2 text-xs md:text-sm h-10 md:h-9 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <Palette className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="font-medium whitespace-nowrap">Вигляд</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="flex items-center justify-center gap-2 text-xs md:text-sm h-10 md:h-9 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="font-medium whitespace-nowrap">Повідомлення</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center justify-center gap-2 text-xs md:text-sm h-10 md:h-9 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="font-medium whitespace-nowrap">Приватність</span>
              </TabsTrigger>
              <TabsTrigger 
                value="emoji" 
                className="flex items-center justify-center gap-2 text-xs md:text-sm h-10 md:h-9 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <Smile className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="font-medium whitespace-nowrap">Емодзі</span>
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="flex items-center justify-center gap-2 text-xs md:text-sm h-10 md:h-9 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <Sliders className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="font-medium whitespace-nowrap">Розширені</span>
              </TabsTrigger>
            </TabsList>

            {/* Вигляд */}
            <TabsContent value="appearance" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto pb-6 space-y-6">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
                  <div className="space-y-6">
                    <div className="bg-card rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Image className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>Фон чату</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {BACKGROUND_PRESETS_WITH_DEFAULT.map(preset => (
                            <button
                              key={preset.id}
                              className={`relative h-16 rounded-lg border transition-all group ${
                                localSettings.chatBackground === preset.id 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-border hover:border-blue-300'
                              } ${
                                preset.id === 'default' 
                                  ? 'bg-gradient-to-br from-background to-muted' 
                                  : preset.color
                              }`}
                              onClick={() => updateLocalSettings(prev => ({ 
                                ...prev, 
                                chatBackground: preset.id
                              }))}
                            >
                              {preset.id === 'default' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded">
                                    Система
                                  </div>
                                </div>
                              )}
                              {localSettings.chatBackground === preset.id && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                              )}
                              {preset.id !== 'default' && (
                                <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-xs px-1 rounded text-center truncate">
                                  {preset.name}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Розмиття фону</Label>
                          <div className="flex gap-2 bg-muted/30 p-1.5 rounded-lg">
                            {(['none', 'light', 'medium'] as const).map(blur => (
                              <button
                                key={blur}
                                onClick={() => updateLocalSettings(prev => ({ ...prev, backgroundBlur: blur }))}
                                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all ${
                                  localSettings.backgroundBlur === blur 
                                    ? 'bg-primary text-primary-foreground shadow-sm' 
                                    : 'bg-background text-foreground hover:bg-muted'
                                }`}
                              >
                                {blur === 'none' && 'Немає'}
                                {blur === 'light' && 'Легке'}
                                {blur === 'medium' && 'Середнє'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span>Стиль повідомлень</span>
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { id: 'rounded', name: 'Закруглені', desc: 'Класичний стиль' },
                          { id: 'square', name: 'Квадратні', desc: 'Строгий стиль' },
                          { id: 'minimal', name: 'Мінімальні', desc: 'Сучасний стиль' },
                          { id: 'modern', name: 'Сучасні', desc: 'Інноваційний стиль' },
                        ] as const).map(style => (
                          <button
                            key={style.id}
                            className={`p-3 border rounded-lg text-left transition-all text-xs ${
                              localSettings.messageBubbles === style.id 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-border bg-background hover:border-blue-300'
                            }`}
                            onClick={() => updateLocalSettings(prev => ({ ...prev, messageBubbles: style.id }))}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`text-xs p-2 rounded flex-1 text-center ${
                                style.id === 'rounded' ? 'rounded-2xl rounded-bl-none bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                style.id === 'square' ? 'rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                style.id === 'minimal' ? 'border-l-2 border-blue-500 bg-transparent text-foreground text-left pl-3' :
                                'rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200'
                              }`}>
                                Привіт
                              </div>
                              {localSettings.messageBubbles === style.id && (
                                <Check className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <div className="font-medium text-center">{style.name}</div>
                            <div className="text-muted-foreground text-center">{style.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-card rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span>Попередній перегляд</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div 
                          className="chat-area-preview h-64 overflow-auto rounded-lg border relative p-4 transition-all duration-300 bg-background"
                        >
                          <div className="space-y-3">
                            <DemoMessage isOwn={false} />
                            <DemoMessage isOwn={true} />
                            <DemoMessage isOwn={false} />
                            <DemoMessage isOwn={true} />
                            <DemoMessage isOwn={false} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="text-xs">
                            <div className="font-medium">Фон</div>
                            <div className="text-blue-600 dark:text-blue-400">
                              {BACKGROUND_PRESETS_WITH_DEFAULT.find(p => p.id === localSettings.chatBackground)?.name || 'Системна тема'}
                            </div>
                          </div>
                          <div className="text-xs">
                            <div className="font-medium">Щільність</div>
                            <div className="text-blue-600 dark:text-blue-400 capitalize">
                              {localSettings.messageDensity === 'comfortable' && 'Велика'}
                              {localSettings.messageDensity === 'cozy' && 'Середня'}
                              {localSettings.messageDensity === 'compact' && 'Мала'}
                            </div>
                          </div>
                          <div className="text-xs">
                            <div className="font-medium">Розмиття</div>
                            <div className="text-blue-600 dark:text-blue-400">
                              {localSettings.backgroundBlur === 'none' && 'Вимкнено'}
                              {localSettings.backgroundBlur === 'light' && 'Легке'}
                              {localSettings.backgroundBlur === 'medium' && 'Середнє'}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Щільність повідомлень</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['comfortable', 'cozy', 'compact'] as const).map(density => (
                              <button
                                key={density}
                                onClick={() => updateLocalSettings(prev => ({ ...prev, messageDensity: density }))}
                                className={`p-3 border rounded-lg text-center transition-all text-sm ${
                                  localSettings.messageDensity === density 
                                    ? 'border-primary bg-primary/5 shadow-sm' 
                                    : 'border-border bg-background hover:border-primary/50'
                                }`}
                              >
                                <div className="font-medium">
                                  {density === 'comfortable' && 'Велика'}
                                  {density === 'cozy' && 'Середня'}
                                  {density === 'compact' && 'Мала'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {density === 'comfortable' && '1.0rem'}
                                  {density === 'cozy' && '0.5rem'}
                                  {density === 'compact' && '0.25rem'}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-orange-600" />
                        <span>Додаткові налаштування</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <div>
                              <Label className="text-xs font-medium">Тінь повідомлень</Label>
                              <p className="text-xs text-muted-foreground">Додати тінь до бульбашок</p>
                            </div>
                          </div>
                          <Switch
                            checked={localSettings.messageShadow}
                            onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                              ...prev, 
                              messageShadow: checked 
                            }))}
                            className="scale-75"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium">Прозорість бульбашок</Label>
                            <span className="text-xs text-blue-600">
                              {(localSettings.bubbleOpacity * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                            <span className="text-xs text-muted-foreground w-8">50%</span>
                            <input
                              type="range"
                              min="50"
                              max="100"
                              step="5"
                              value={localSettings.bubbleOpacity * 100}
                              onChange={(e) => updateLocalSettings(prev => ({ 
                                ...prev, 
                                bubbleOpacity: parseInt(e.target.value) / 100 
                              }))}
                              className="flex-1 h-1 bg-gradient-to-r from-muted to-blue-300 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground w-8">100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto py-4 space-y-4">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Відображення часу</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-1">
                          {(['always', 'hover', 'never'] as const).map(time => (
                            <button
                              key={time}
                              onClick={() => updateLocalSettings(prev => ({ ...prev, showMessageTime: time }))}
                              className={`p-3 border rounded text-center transition-all text-xs ${
                                localSettings.showMessageTime === time 
                                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                  : 'border-border bg-background hover:border-blue-300'
                              }`}
                            >
                              <div className="font-medium mb-1">
                                {time === 'always' && 'Завжди'}
                                {time === 'hover' && 'При наведенні'}
                                {time === 'never' && 'Ніколи'}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {time === 'always' && 'Постійно'}
                                {time === 'hover' && 'При наведенні'}
                                {time === 'never' && 'Приховано'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span>Відображення елементів</span>
                      </h3>
                      
                      <div className="space-y-2">
                        {[
                          {
                            id: 'showAvatars',
                            label: 'Показувати аватари',
                            description: 'Відображати фото користувачів',
                          },
                          {
                            id: 'typingIndicators',
                            label: 'Індикатор набору',
                            description: 'Показувати коли хтось друкує',
                          },
                          {
                            id: 'readReceipts',
                            label: 'Підтвердження прочитання',
                            description: 'Статус прочитання повідомлень',
                          }
                        ].map(setting => (
                          <div key={setting.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div>
                              <Label className="text-xs font-medium">{setting.label}</Label>
                              <p className="text-xs text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch
                              checked={localSettings[setting.id as keyof ChatSettings] as boolean}
                              onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                                ...prev, 
                                [setting.id]: checked 
                              }))}
                              className="scale-75"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Type className="h-4 w-4 text-purple-600" />
                        <span>Форматування тексту</span>
                      </h3>
                      
                      <div className="space-y-2">
                        {[
                          {
                            id: 'markdownSupport',
                            label: 'Підтримка Markdown',
                            description: '**жирний**, *курсив*, `код`',
                          },
                          {
                            id: 'linkPreview',
                            label: 'Попередній перегляд посилань',
                            description: 'Автоматичне відображення посилань',
                          },
                          {
                            id: 'codeHighlighting',
                            label: 'Підсвічування коду',
                            description: 'Кольорове підсвічування коду',
                          },
                          {
                            id: 'messageFormatting',
                            label: 'Форматування повідомлень',
                            description: 'Всі функції форматування',
                          }
                        ].map(setting => (
                          <div key={setting.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div>
                              <Label className="text-xs font-medium">{setting.label}</Label>
                              <p className="text-xs text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch
                              checked={localSettings[setting.id as keyof ChatSettings] as boolean}
                              onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                                ...prev, 
                                [setting.id]: checked 
                              }))}
                              className="scale-75"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto py-4 space-y-4">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Статус онлайну</span>
                      </h3>
                      
                      <div className="space-y-2">
                        {[
                          {
                            id: 'showOnlineStatus',
                            label: 'Показувати статус онлайну',
                            description: 'Відображати коли ви в мережі',
                          },
                          {
                            id: 'showLastSeen',
                            label: 'Останній раз в мережі',
                            description: 'Час останньої активності',
                          }
                        ].map(setting => (
                          <div key={setting.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                            <div>
                              <Label className="text-xs font-medium">{setting.label}</Label>
                              <p className="text-xs text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch
                              checked={localSettings[setting.id as keyof ChatSettings] as boolean}
                              onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                                ...prev, 
                                [setting.id]: checked 
                              }))}
                              className="scale-75"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Конфіденційність</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Хто може бачити ваш статус</Label>
                          <div className="space-y-2">
                            {([
                              { id: 'all', name: 'Всім', desc: 'Всім користувачам' },
                              { id: 'contacts', name: 'Контактам', desc: 'Тільки контактам' },
                              { id: 'none', name: 'Нікому', desc: 'Приховати статус' },
                            ] as const).map(mode => (
                              <button
                                key={mode.id}
                                onClick={() => updateLocalSettings(prev => ({ ...prev, privacyMode: mode.id }))}
                                className={`w-full p-3 border rounded text-left transition-all flex items-center gap-3 text-xs ${
                                  localSettings.privacyMode === mode.id 
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                    : 'border-border bg-background hover:border-blue-300'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{mode.name}</div>
                                  <div className="text-muted-foreground">{mode.desc}</div>
                                </div>
                                {localSettings.privacyMode === mode.id && (
                                  <Check className="w-4 h-4 text-blue-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-purple-600" />
                        <span>Автоматичне видалення</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Видаляти повідомлення через</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {([
                              { id: 'never', name: 'Ніколи', desc: 'Зберігати всі повідомлення' },
                              { id: '1h', name: '1 година', desc: 'Для тимчасових повідомлень' },
                              { id: '24h', name: '24 години', desc: 'Щоденне очищення' },
                              { id: '7d', name: '7 днів', desc: 'Щотижневе очищення' },
                              { id: '30d', name: '30 днів', desc: 'Щомісячне очищення' },
                            ] as const).map(option => (
                              <button
                                key={option.id}
                                onClick={() => updateLocalSettings(prev => ({ ...prev, autoDeleteMessages: option.id }))}
                                className={`p-3 border rounded text-left transition-all text-xs ${
                                  localSettings.autoDeleteMessages === option.id 
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                    : 'border-border bg-background hover:border-blue-300'
                                }`}
                              >
                                <div className="font-medium">{option.name}</div>
                                <div className="text-muted-foreground">{option.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div>
                            <Label className="text-xs font-medium">Видаляти медіа</Label>
                            <p className="text-xs text-muted-foreground">Зображення та файли</p>
                          </div>
                          <Switch
                            checked={localSettings.autoDeleteMedia}
                            onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                              ...prev, 
                              autoDeleteMedia: checked 
                            }))}
                            className="scale-75"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emoji" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto py-4 space-y-4">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Smile className="h-4 w-4 text-blue-600" />
                        <span>Стиль емодзі</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {EMOJI_STYLES.map(style => (
                          <button
                            key={style.id}
                            className={`p-3 border rounded text-left transition-all flex items-center gap-3 ${
                              localSettings.emojiStyle === style.id 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-border bg-background hover:border-blue-300'
                            }`}
                            onClick={() => updateLocalSettings(prev => ({ ...prev, emojiStyle: style.id }))}
                          >
                            <div className="text-2xl">{style.preview}</div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{style.name}</div>
                              <div className="text-xs text-muted-foreground">Стиль відображення емодзі</div>
                            </div>
                            {localSettings.emojiStyle === style.id && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-green-600" />
                        <span>Налаштування емодзі</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div>
                            <Label className="text-sm font-medium">Анімовані емодзі</Label>
                            <p className="text-xs text-muted-foreground">Анімації для емодзі</p>
                          </div>
                          <Switch
                            checked={localSettings.animatedEmoji}
                            onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                              ...prev, 
                              animatedEmoji: checked 
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Розмір емодзі</Label>
                          <div className="grid grid-cols-3 gap-1">
                            {([
                              { id: 'small', name: 'Малий', size: 'text-base' },
                              { id: 'medium', name: 'Середній', size: 'text-xl' },
                              { id: 'large', name: 'Великий', size: 'text-2xl' },
                            ] as const).map(size => (
                              <button
                                key={size.id}
                                onClick={() => updateLocalSettings(prev => ({ ...prev, emojiSize: size.id }))}
                                className={`p-2 border rounded text-center transition-all text-xs ${
                                  localSettings.emojiSize === size.id 
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                    : 'border-border bg-background hover:border-blue-300'
                                }`}
                              >
                                <div className={`mb-1 ${size.size}`}>😊</div>
                                <div className="font-medium">{size.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto py-4 space-y-4">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span>Мова та інтерфейс</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Мова інтерфейсу</Label>
                          <select
                            value={localSettings.language}
                            onChange={(e) => updateLocalSettings(prev => ({ 
                              ...prev, 
                              language: e.target.value as 'uk' | 'en' 
                            }))}
                            className="w-full p-2 border border-border rounded bg-background focus:border-blue-500 text-xs"
                          >
                            <option value="uk">Українська</option>
                            <option value="en">English</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Розмір тексту</Label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['small', 'medium', 'large'] as const).map(size => (
                              <button
                                key={size}
                                onClick={() => updateLocalSettings(prev => ({ ...prev, fontSize: size }))}
                                className={`p-2 border rounded text-center transition-all text-xs ${
                                  localSettings.fontSize === size 
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                    : 'border-border bg-background hover:border-blue-300'
                                }`}
                              >
                                <div className={`font-medium ${
                                  size === 'small' ? 'text-xs' :
                                  size === 'medium' ? 'text-sm' : 'text-base'
                                }`}>
                                  {size === 'small' && 'Малий'}
                                  {size === 'medium' && 'Середній'}
                                  {size === 'large' && 'Великий'}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Download className="h-4 w-4 text-green-600" />
                        <span>Завантаження даних</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div>
                            <Label className="text-sm font-medium">Авто-завантаження</Label>
                            <p className="text-xs text-muted-foreground">Файли автоматично</p>
                          </div>
                          <Switch
                            checked={localSettings.autoDownload}
                            onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                              ...prev, 
                              autoDownload: checked 
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Звуки та сповіщення</Label>
                          <div className="space-y-2">
                            {[
                              {
                                id: 'messageSound',
                                label: 'Звук повідомлень',
                                description: 'При нових повідомленнях',
                              },
                              {
                                id: 'notificationSound',
                                label: 'Звук сповіщень',
                                description: 'Системні сповіщення',
                              }
                            ].map(setting => (
                              <div key={setting.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <div>
                                  <Label className="text-xs font-medium">{setting.label}</Label>
                                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                                </div>
                                <Switch
                                  checked={localSettings[setting.id as keyof ChatSettings] as boolean}
                                  onCheckedChange={(checked) => updateLocalSettings(prev => ({ 
                                    ...prev, 
                                    [setting.id]: checked 
                                  }))}
                                  className="scale-75"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-orange-600" />
                        <span>Скидання налаштувань</span>
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-700 dark:text-amber-400">
                              Скидання налаштувань не можна скасувати.
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleResetSettings}
                          className="w-full p-3 bg-background border border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 dark:hover:border-amber-500 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Скинути до стандартних
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-3 px-8 py-6 border-t flex-shrink-0 bg-muted/20">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowChatSettings(false);
                applySettingsToMainChatArea(userSettings);
              }}
              className="flex-1 h-11 text-sm font-medium"
            >
              Скасувати
            </Button>
            <Button 
              onClick={handleSaveSettings}
              className="flex-1 h-11 text-sm font-medium bg-primary hover:bg-primary/90 shadow-sm"
            >
              Зберегти зміни
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen">
        <Header />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <div className="flex h-full">
              {/* Users sidebar */}
              <div 
                ref={sidebarRef}
                className="border-r bg-background flex flex-col relative"
                style={{ width: `${sidebarWidth}px` }}
              >
                {/* Resize handle */}
                <div
                  className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-20 flex items-center justify-center"
                  onMouseDown={startResizing}
                >
                  <div className="w-1 h-16 bg-gray-300 rounded-full hover:bg-blue-500 transition-colors" />
                </div>

                <div className="p-3 border-b flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Чати</h2>
                      <div className="flex items-center gap-1">
                        {isConnected ? (
                          <Wifi className="h-4 w-4 text-green-500" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Users className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Створити групу</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="group-name">Назва групи</Label>
                              <Input
                                id="group-name"
                                placeholder="Введіть назву групи"
                                value={newGroupData.name}
                                onChange={(e) => setNewGroupData(prev => ({...prev, name: e.target.value}))}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="group-description">Опис групи (необов'язково)</Label>
                              <Textarea
                                id="group-description"
                                placeholder="Опишіть групу"
                                value={newGroupData.description}
                                onChange={(e) => setNewGroupData(prev => ({...prev, description: e.target.value}))}
                              />
                            </div>

                            <div className="space-y-3">
                              <Label>Налаштування групи</Label>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="allow-invites" className="text-sm">
                                    Дозволити запрошення
                                  </Label>
                                  <Switch
                                    id="allow-invites"
                                    checked={newGroupData.settings.allowInvites}
                                    onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({
                                      ...prev,
                                      settings: { ...prev.settings, allowInvites: checked }
                                    }))}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="slow-mode" className="text-sm">
                                    Повільний режим
                                  </Label>
                                  <Switch
                                    id="slow-mode"
                                    checked={newGroupData.settings.slowMode}
                                    onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({
                                      ...prev,
                                      settings: { ...prev.settings, slowMode: checked }
                                    }))}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="admin-only" className="text-sm">
                                    Лише адміністратори
                                  </Label>
                                  <Switch
                                    id="admin-only"
                                    checked={newGroupData.settings.adminOnlyMessages}
                                    onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({
                                      ...prev,
                                      settings: { ...prev.settings, adminOnlyMessages: checked }
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Учасники</Label>
                              {availableUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                  <input
                                    type="checkbox"
                                    checked={newGroupData.members.includes(user.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewGroupData(prev => ({
                                          ...prev,
                                          members: [...prev.members, user.id]
                                        }));
                                      } else {
                                        setNewGroupData(prev => ({
                                          ...prev,
                                          members: prev.members.filter(id => id !== user.id)
                                        }));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm flex-1">{user.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {user.type === 'supervisor' ? 'Керівник' : 'Студент'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <Button 
                              onClick={createGroup} 
                              disabled={!newGroupData.name || newGroupData.members.length === 0}
                              className="w-full"
                            >
                              Створити групу
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowChatSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setShowCreateGroup(true)}>
                            <Users className="h-4 w-4 mr-2" />
                            Нова група
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="max-h-60 overflow-y-auto">
                            {availableUsers.map(user => (
                              <DropdownMenuItem key={user.id} onClick={() => createNewChat(user)}>
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                                </Avatar>
                                {user.name}
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Пошук чатів..."
                      className="pl-8 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="mt-3 flex gap-1">
                    <Button
                      variant={activeTab === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => setActiveTab('all')}
                    >
                      Всі
                    </Button>
                    <Button
                      variant={activeTab === 'groups' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => setActiveTab('groups')}
                    >
                      Групи
                    </Button>
                    <Button
                      variant={activeTab === 'archived' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => setActiveTab('archived')}
                    >
                      Архів
                    </Button>
                    <Button
                      variant={activeTab === 'blocked' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => setActiveTab('blocked')}
                    >
                      Заблок.
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-1">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 mb-1 group ${
                          selectedUser?.id === user.id
                            ? 'bg-primary/10 border border-primary/20 shadow-sm'
                            : 'hover:bg-muted/50'
                        } ${user.isBlocked ? 'opacity-60' : ''}`}
                        onClick={() => handleSelectChat(user)}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {user.avatarUrl ? (
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                            ) : null}
                            <AvatarFallback
                              className={`text-xs ${
                                user.type === 'supervisor'
                                  ? 'bg-green-100 text-green-600'
                                  : user.type === 'group'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0" style={{ maxWidth: `${sidebarWidth - 100}px` }}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">
                              {user.name}
                              {user.type === 'group' && (
                                <Users className="h-3 w-3 inline ml-1 text-muted-foreground" />
                              )}
                            </h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                              {user.lastSeen || '12:30'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-muted-foreground truncate" style={{ maxWidth: `${sidebarWidth - 140}px` }}>
                              {user.lastMessage}
                            </p>
                            <div className="flex items-center gap-1">
                              {user.unreadCount && user.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0 text-[10px]">
                                  {user.unreadCount}
                                </span>
                              )}
                              {user.isMuted && (
                                <BellOff className="h-3 w-3 text-muted-foreground" />
                              )}
                              {user.isBlocked && (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {user.type !== 'group' && (
                              <DropdownMenuItem onClick={() => toggleBlockChat(user.id)}>
                                {user.isBlocked ? (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Розблокувати
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Заблокувати
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem onClick={() => toggleMuteChat(user.id)}>
                              {user.isMuted ? (
                                <>
                                  <Bell className="h-4 w-4 mr-2" />
                                  Увімкнути сповіщення
                                </>
                              ) : (
                                <>
                                  <BellOff className="h-4 w-4 mr-2" />
                                  Вимкнути сповіщення
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            {user.isArchived ? (
                              <DropdownMenuItem onClick={() => unarchiveChat(user.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Розархівувати
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => archiveChat(user.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Архівувати
                              </DropdownMenuItem>
                            )}
                            
                            {user.type === 'group' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => leaveGroup(user.id)}
                                  className="text-red-600"
                                >
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Покинути групу
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteChat(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Видалити чат
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Основна область чату */}
              <div 
                ref={chatAreaRef}
                className={`flex-1 flex flex-col min-h-0 transition-all duration-300 chat-area ${
                  selectedUser ? '' : 'bg-background'
                }`}
              >
                {selectedUser ? (
                  <>
                    {/* Chat header */}
                    <div className="sticky top-0 z-10 flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              {selectedUser.avatarUrl ? (
                                <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                              ) : null}
                              <AvatarFallback
                                className={`${
                                  selectedUser.type === 'supervisor'
                                    ? 'bg-green-100 text-green-600'
                                    : selectedUser.type === 'group'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {selectedUser.avatar}
                              </AvatarFallback>
                            </Avatar>
                            {selectedUser.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="relative">
                            <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              {selectedUser.type === 'group' ? (
                                <div 
                                  className="relative"
                                  onMouseEnter={() => setShowMembersTooltip(true)}
                                  onMouseLeave={() => setShowMembersTooltip(false)}
                                >
                                  <span className="text-sm text-muted-foreground cursor-help underline decoration-dotted">
                                    {selectedUser.members?.length || 0} учасників
                                  </span>
                                  {showMembersTooltip && selectedUser.members && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-48 max-h-60 overflow-y-auto">
                                      <div className="text-sm font-semibold mb-2">Учасники групи:</div>
                                      <div className="space-y-2">
                                        {selectedUser.members.map((member) => (
                                          <div key={member.id} className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                              <AvatarFallback
                                                className={`text-xs ${
                                                  member.type === 'supervisor'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                }`}
                                              >
                                                {member.avatar}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                              <div className="text-sm font-medium">{member.name}</div>
                                              <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                <span className="text-xs text-muted-foreground">
                                                  {member.isOnline ? 'онлайн' : 'офлайн'}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {selectedUser.isOnline ? 'В мережі' : selectedUser.lastSeen || 'Не в мережі'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowGlobalSearch(true)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>

                          {allMedia.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setShowMediaGallery(true)}
                            >
                              <Image className="h-4 w-4" />
                            </Button>
                          )}

                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowDatePicker(true)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>

                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Video className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Info className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => toggleMuteChat(selectedUser.id)}>
                                {selectedUser.isMuted ? (
                                  <>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Увімкнути сповіщення
                                </>
                              ) : (
                                <>
                                    <BellOff className="h-4 w-4 mr-2" />
                                    Вимкнути сповіщення
                                  </>
                                )}
                              </DropdownMenuItem>
                              {selectedUser.type === 'group' && (
                                <DropdownMenuItem onClick={() => setShowGroupMembers(true)}>
                                  <Users className="h-4 w-4 mr-2" />
                                  Учасники групи
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => archiveChat(selectedUser.id)}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Архівувати чат
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Видалити чат
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Global Search Bar */}
                      {showGlobalSearch && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                          <div className="flex gap-2 mb-2">
                            <Input
                              placeholder="Пошук по повідомленнях..."
                              value={globalSearchTerm}
                              onChange={(e) => {
                                setGlobalSearchTerm(e.target.value);
                                if (e.target.value) {
                                  performGlobalSearch(e.target.value);
                                } else {
                                  setMessageSearchResults([]);
                                  setCurrentSearchIndex(-1);
                                }
                              }}
                              className="flex-1"
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Filter className="h-4 w-4 mr-1" />
                                  {searchFilter.type === 'all' ? 'Всі' : 
                                   searchFilter.type === 'text' ? 'Текст' :
                                   searchFilter.type === 'file' ? 'Файли' :
                                   searchFilter.type === 'image' ? 'Зображення' :
                                   searchFilter.type === 'video' ? 'Відео' :
                                   searchFilter.type === 'voice' ? 'Голосові' : 
                                   searchFilter.type === 'location' ? 'Локації' : 'Посилання'}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'all' })}>
                                  Всі
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'text' })}>
                                  Текст
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'file' })}>
                                  Файли
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'image' })}>
                                  Зображення
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'video' })}>
                                  Відео
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'voice' })}>
                                  Голосові
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'location' })}>
                                  Локації
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchFilter({ type: 'link' })}>
                                  Посилання
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setGlobalSearchTerm('');
                                setShowGlobalSearch(false);
                                setSearchFilter({ type: 'all' });
                                setMessageSearchResults([]);
                                setCurrentSearchIndex(-1);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {globalSearchTerm && messageSearchResults.length > 0 && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Знайдено {messageSearchResults.length} повідомлень</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateSearchResults('prev')}
                                  disabled={currentSearchIndex <= 0}
                                  className="h-6 px-2"
                                >
                                  ↑ Попереднє
                                </Button>
                                <span>{currentSearchIndex + 1} / {messageSearchResults.length}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigateSearchResults('next')}
                                  disabled={currentSearchIndex >= messageSearchResults.length - 1}
                                  className="h-6 px-2"
                                >
                                  Наступне ↓
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {globalSearchTerm && messageSearchResults.length === 0 && (
                            <div className="text-xs text-muted-foreground">
                              Повідомлень не знайдено
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Messages area */}
                    <div 
                      ref={dropZoneRef}
                      className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
                        isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {isDragOver && (
                        <div className="absolute inset-0 bg-blue-50/80 z-10 flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                            <p className="text-lg font-semibold text-blue-600">Перетягніть файли сюди</p>
                            <p className="text-sm text-blue-500">Максимальний розмір: 50MB</p>
                          </div>
                        </div>
                      )}

                      {/* ВИПРАВЛЕНИЙ SCROLL AREA */}
                      <ScrollArea 
                        className="flex-1 px-6 py-4" 
                        data-scroll-area="true"
                        style={{ height: '100%' }}
                      >
                        {/* Pinned messages */}
                        {messages.filter(msg => msg.isPinned).length > 0 && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Pin className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-800">Закріплені повідомлення</span>
                            </div>
                            {messages.filter(msg => msg.isPinned).map(message => (
                              <div key={message.id} className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded mb-1 last:mb-0">
                                <strong>{message.name}:</strong> {message.content}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1" style={{ gap: 'var(--message-gap, 1rem)' }}>
                          {renderMessages}
                        </div>

                        {/* Typing indicator */}
                        {isTyping && userSettings.typingIndicators && (
                          <div className="flex justify-start mt-2">
                            <div className="flex items-end max-w-xl gap-3">
                              {userSettings.showAvatars && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                    {selectedUser.avatar[0]}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 rounded-bl-none">
                                <div className="flex space-x-1">
                                  {userSettings.typingAnimation === 'dots' && (
                                    <>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </>
                                  )}
                                  {userSettings.typingAnimation === 'wave' && (
                                    <div className="flex space-x-1">
                                      <div className="w-1 h-3 bg-gray-400 rounded-full animate-wave"></div>
                                      <div className="w-1 h-4 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-1 h-3 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></div>
                                      <div className="w-1 h-2 bg-gray-400 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                  )}
                                  {userSettings.typingAnimation === 'pulse' && (
                                    <div className="w-8 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {typingUser} друкує...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messageEndRef} />
                      </ScrollArea>

                      {/* Reply/Edit preview above input */}
                      {(replyingTo || editingMessage) && (
                        <div className="border-t border-b bg-blue-50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {editingMessage ? (
                              <Edit className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Reply className="h-4 w-4 text-blue-600" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-blue-800">
                                {editingMessage ? 'Редагування повідомлення' : `Відповідь ${replyingTo?.name}`}
                              </div>
                              <div className="text-xs text-blue-600 truncate max-w-md">
                                {editingMessage ? editingMessage.content : replyingTo?.content}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={editingMessage ? cancelEditing : cancelReply}
                            className="h-6 w-6 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Input Area */}
                      <div className="border-t p-4 space-y-3 flex-shrink-0 bg-background">
                        {/* File preview */}
                        {attachment && (
                          <FilePreview 
                            file={attachment} 
                            onRemove={removeAttachment}
                            uploadProgress={Object.values(uploadProgress)[0]}
                          />
                        )}

                        {/* Recording indicator */}
                        {isRecording && (
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-sm font-medium text-red-800">
                                Запис... {formatTime(recordingTime)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={stopRecording}
                              className="ml-auto text-red-600 hover:text-red-800"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="flex items-end gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <Smile className="h-4 w-4" />
                            </Button>
                            
                            <label className="cursor-pointer flex items-center">
                              <Paperclip className="h-4 w-4" />
                              <Input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                onChange={handleFileInput}
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wav,.mp3"
                              />
                            </label>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={isRecording ? stopRecording : startRecording}
                              className={isRecording ? 'text-red-600 animate-pulse' : ''}
                            >
                              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                          </div>

                          <div className="flex-1 relative">
                            <Textarea
                              value={newMessage}
                              onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                              }}
                              onKeyDown={handleKeyPress}
                              onBlur={sendStopTyping}
                              placeholder={
                                editingMessage ? "Редагуйте повідомлення..." :
                                replyingTo ? `Відповідь ${replyingTo.name}...` : 
                                "Напишіть повідомлення..."
                              }
                              className="min-h-[60px] resize-none pr-12"
                            />
                          </div>

                          <Button 
                            onClick={editingMessage ? saveEditedMessage : handleSend} 
                            disabled={(!newMessage.trim() && !attachment)}
                            size="icon"
                          >
                            {editingMessage ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Екран вибору чату
                  <div className="flex-1 flex flex-col items-center justify-center bg-background">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="h-12 w-12 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold mb-4">Оберіть чат для спілкування</h2>
                      <p className="text-muted-foreground mb-6">
                        Виберіть розмову зі списку зліва, щоб почати спілкування з колегами, 
                        науковими керівниками або приєднатися до групових дискусій.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <h3 className="font-semibold mb-1">Групові чати</h3>
                          <p className="text-muted-foreground text-xs">
                            Спілкування з командою
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h3 className="font-semibold mb-1">Приватні повідомлення</h3>
                          <p className="text-muted-foreground text-xs">
                            Особисте спілкування
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dialog for group members */}
      <Dialog 
        open={showGroupMembers} 
        onOpenChange={(open) => {
          setShowGroupMembers(open);
        }}
      >
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `Учасники групи "${selectedUser.name}"` : 'Учасники групи'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.description}
                  </p>
                </div>
                
                <ScrollArea className="flex-1 border rounded-lg">
                  <div className="p-4 space-y-3">
                    {selectedUser.members?.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg border bg-background">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-xs ${
                              member.type === 'supervisor'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className="text-xs text-muted-foreground">
                              {member.isOnline ? 'В мережі' : 'Не в мережі'}
                            </span>
                          </div>
                        </div>
                        {member.type === 'supervisor' && (
                          <Badge variant="secondary" className="text-xs">
                            Керівник
                          </Badge>
                        )}
                        {member.id === currentUser.id && (
                          <Badge variant="outline" className="text-xs">
                            Ви
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Чат не вибрано</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Gallery */}
      <MediaGallery />

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Перейти до дати</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
            <Button 
              onClick={() => {
                if (selectedDate) {
                  const targetDate = selectedDate.toDateString();
                  const messageIndex = messages.findIndex(msg => {
                    const messageDate = new Date(msg.timestamp).toDateString();
                    return messageDate === targetDate;
                  });
                  
                  if (messageIndex !== -1) {
                    const messageElement = document.querySelector(`[data-message-id="${messages[messageIndex].id}"]`);
                    if (messageElement) {
                      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setShowDatePicker(false);
                    }
                  } else {
                    toast.info('Повідомлень за цю дату не знайдено');
                  }
                }
              }}
              disabled={!selectedDate}
            >
              Перейти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Chat Settings */}
      <EnhancedChatSettings
          showChatSettings={showChatSettings}
          setShowChatSettings={setShowChatSettings}
          chatSettings={userSettings}
          setChatSettings={setUserSettings}
        />

      {/* Діалог для закріплення повідомлень */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Закріпити повідомлення</DialogTitle>
            <DialogDescription>
              Оберіть, де буде закріплено повідомлення
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <button
                onClick={() => setPinForBoth(false)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  !pinForBoth 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !pinForBoth ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {!pinForBoth && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-semibold">Тільки у себе</div>
                    <div className="text-sm text-muted-foreground">
                      Повідомлення буде закріплено лише у вашому чаті
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setPinForBoth(true)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  pinForBoth 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    pinForBoth ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {pinForBoth && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-semibold">Для всіх</div>
                    <div className="text-sm text-muted-foreground">
                      Повідомлення буде закріплено для всіх учасників чату
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPinDialog(false)}
            >
              Скасувати
            </Button>
            <Button
              onClick={confirmPinMessage}
            >
              Закріпити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;