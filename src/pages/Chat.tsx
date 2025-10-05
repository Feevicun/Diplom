import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  UserPlus,
  Pin,
  MessageCircle,
  Reply,
  X,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Copy
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Типи
type Message = {
  id: string;
  sender: string;
  name: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'file';
  isPinned?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    name: string;
    content: string;
  };
  attachment?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  };
  voiceMessage?: {
    url: string;
    duration: number;
  };
};

type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  type: 'student' | 'supervisor' | 'group';
  isOnline: boolean;
  lastSeen?: string;
  unreadCount?: number;
  lastMessage?: string;
  isMuted?: boolean;
  isArchived?: boolean;
  members?: ChatUser[];
  createdAt?: string;
  privacySettings?: {
    isPublic: boolean;
    allowInvites: boolean;
    showMembers: boolean;
    password?: string;
    requirePassword?: boolean;
    encrypted?: boolean;
  };
  securityLevel?: 'low' | 'medium' | 'high';
};

type CreateGroupData = {
  name: string;
  members: string[];
  description?: string;
  isPublic: boolean;
  allowInvites: boolean;
  showMembers: boolean;
  password?: string;
  requirePassword: boolean;
  securityLevel: 'low' | 'medium' | 'high';
};

type PasswordDialogType = 'join' | 'set' | 'change' | 'remove';

// Кастомний Switch компонент
const Switch = ({ 
  checked, 
  onCheckedChange,
  id 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

// Кастомна toast функція
const toast = {
  success: (message: string) => {
    console.log(`✅ ${message}`);
  },
  error: (message: string) => {
    console.log(`❌ ${message}`);
  }
};

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'archived'>('all');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [newGroupData, setNewGroupData] = useState<CreateGroupData>({
    name: '',
    members: [],
    description: '',
    isPublic: true,
    allowInvites: true,
    showMembers: true,
    requirePassword: false,
    securityLevel: 'medium'
  });
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    type: PasswordDialogType;
    chatId?: string;
  }>({
    isOpen: false,
    type: 'join'
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Current user info
  const currentUser = {
    id: 'student-1',
    name: 'Ви',
    email: 'you@university.edu',
    type: 'student' as const,
  };

  // Mock users data with enhanced privacy settings
  const mockUsers: ChatUser[] = [
    {
      id: 'supervisor-1',
      name: 'проф. Іваненко І.І.',
      avatar: 'ІІ',
      email: 'ivanenko@university.edu',
      type: 'supervisor',
      isOnline: true,
      unreadCount: 2,
      lastMessage: 'Переглянув ваші правки, добре!',
      securityLevel: 'high'
    },
    {
      id: 'supervisor-2',
      name: 'доц. Петренко П.П.',
      avatar: 'ПП',
      email: 'petrenko@university.edu',
      type: 'supervisor',
      isOnline: false,
      lastMessage: 'Надішліть оновлений план',
      securityLevel: 'medium'
    },
    {
      id: 'student-2',
      name: 'Марія Коваль',
      avatar: 'МК',
      email: 'koval@university.edu',
      type: 'student',
      isOnline: true,
      lastMessage: 'Ти вже здав лабу?',
      securityLevel: 'medium'
    },
    {
      id: 'student-3',
      name: 'Олексій Шевченко',
      avatar: 'ОШ',
      email: 'shevchenko@university.edu',
      type: 'student',
      isOnline: true,
      lastMessage: 'Коли зустрічаємось?',
      securityLevel: 'medium'
    },
    {
      id: 'group-1',
      name: 'Дипломна група',
      avatar: 'ГР',
      type: 'group',
      isOnline: true,
      unreadCount: 5,
      lastMessage: 'Олексій: Зустріч о 14:00',
      members: [
        {
          id: 'student-1',
          name: 'Ви',
          avatar: 'В',
          type: 'student',
          isOnline: true,
          securityLevel: 'medium'
        },
        {
          id: 'student-2',
          name: 'Марія Коваль',
          avatar: 'МК',
          type: 'student',
          isOnline: true,
          securityLevel: 'medium'
        },
        {
          id: 'student-3',
          name: 'Олексій Шевченко',
          avatar: 'ОШ',
          type: 'student',
          isOnline: true,
          securityLevel: 'medium'
        },
        {
          id: 'supervisor-1',
          name: 'проф. Іваненко І.І.',
          avatar: 'ІІ',
          type: 'supervisor',
          isOnline: true,
          securityLevel: 'high'
        }
      ],
      createdAt: '2024-01-15',
      privacySettings: {
        isPublic: false,
        allowInvites: true,
        showMembers: true,
        password: '123456',
        requirePassword: true,
        encrypted: true
      },
      securityLevel: 'high'
    },
    {
      id: 'group-2',
      name: 'Науковий семінар',
      avatar: 'НС',
      type: 'group',
      isOnline: true,
      lastMessage: 'проф. Іваненко: Тема наступного семінару',
      members: [
        {
          id: 'supervisor-1',
          name: 'проф. Іваненко І.І.',
          avatar: 'ІІ',
          type: 'supervisor',
          isOnline: true,
          securityLevel: 'high'
        },
        {
          id: 'student-1',
          name: 'Ви',
          avatar: 'В',
          type: 'student',
          isOnline: true,
          securityLevel: 'medium'
        }
      ],
      createdAt: '2024-02-01',
      privacySettings: {
        isPublic: true,
        allowInvites: false,
        showMembers: true,
        encrypted: true
      },
      securityLevel: 'medium'
    },
    {
      id: 'group-3',
      name: 'Секретна лабораторія',
      avatar: 'СЛ',
      type: 'group',
      isOnline: true,
      lastMessage: 'Обговорення конфіденційних результатів',
      members: [
        {
          id: 'student-1',
          name: 'Ви',
          avatar: 'В',
          type: 'student',
          isOnline: true,
          securityLevel: 'medium'
        }
      ],
      privacySettings: {
        isPublic: false,
        allowInvites: false,
        showMembers: false,
        password: 'secret123',
        requirePassword: true,
        encrypted: true
      },
      securityLevel: 'high'
    },
    {
      id: 'archived-1',
      name: 'Стара робоча група',
      avatar: 'СР',
      type: 'group',
      isOnline: false,
      isArchived: true,
      lastMessage: 'Марія: Файли збережено в архів',
      members: [],
      createdAt: '2023-12-01',
      securityLevel: 'low'
    }
  ];

  const availableUsers: ChatUser[] = [
    {
      id: 'new-1',
      name: 'Др. Сидоренко С.С.',
      avatar: 'СС',
      email: 'sydorenko@university.edu',
      type: 'supervisor',
      isOnline: true,
      securityLevel: 'high'
    },
    {
      id: 'new-2',
      name: 'Анна Мельник',
      avatar: 'АМ',
      email: 'melnyk@university.edu',
      type: 'student',
      isOnline: false,
      securityLevel: 'medium'
    },
    {
      id: 'new-3',
      name: 'Богдан Лисенко',
      avatar: 'БЛ',
      email: 'lysenko@university.edu',
      type: 'student',
      isOnline: true,
      securityLevel: 'medium'
    }
  ];

  useEffect(() => {
    setUsers(mockUsers.filter(user => !user.isArchived));
    setAllUsers([...mockUsers, ...availableUsers]);
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, replyingTo]);

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

  const connectWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
        
        if (ws.current && selectedUser) {
          ws.current.send(JSON.stringify({
            type: 'user_join',
            user: currentUser,
            chatId: selectedUser.id
          }));
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            if (data.message.sender !== currentUser.id) {
              handleNewMessage(data.message);
            }
            break;
          case 'user_typing':
            handleUserTyping(data);
            break;
          case 'user_stop_typing':
            handleUserStopTyping();
            break;
          case 'user_join':
            handleUserJoin(data.user);
            break;
          case 'user_leave':
            handleUserLeave(data.userId);
            break;
          case 'users_list':
            setUsers(data.users);
            break;
          case 'message_history':
            setMessages(data.messages);
            break;
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      loadMockData();
    }
  };

  const loadMockData = () => {
    if (selectedUser) {
      setMessages([
        {
          id: '1',
          sender: selectedUser.id === 'supervisor-1' ? 'supervisor-1' : 'student-1',
          name: selectedUser.id === 'supervisor-1' ? 'проф. Іваненко І.І.' : 'Ви',
          content: 'Доброго дня! Як просувається ваша дипломна робота?',
          timestamp: '10:10',
          type: 'text'
        },
        {
          id: '2',
          sender: 'student-1',
          name: 'Ви',
          content: 'Доброго дня! Працюю над теоретичною частиною, вже майже завершив.',
          timestamp: '10:15',
          type: 'text'
        },
        {
          id: '3',
          sender: selectedUser.id === 'supervisor-1' ? 'supervisor-1' : 'student-2',
          name: selectedUser.id === 'supervisor-1' ? 'проф. Іваненко І.І.' : 'Марія Коваль',
          content: 'Чудово! Надішліть мені чернетку, коли буде готово.',
          timestamp: '10:20',
          type: 'text',
          isPinned: true
        },
      ]);
    }
  };

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return 'strong';
    }
    return 'medium';
  };

  // Generate secure password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordData(prev => ({ ...prev, password, confirmPassword: password }));
    toast.success('Згенеровано безпечний пароль');
  };

  // Enhanced password management - FIXED VERSION
  const handlePasswordAction = () => {
    const { type, chatId } = passwordDialog;

    let chatToJoin, chatToChange, chatToRemove;

    switch (type) {
      case 'join':
        chatToJoin = users.find(c => c.id === chatId);
        if (chatToJoin?.privacySettings?.password === passwordData.password) {
          setSelectedUser(chatToJoin);
          loadMockData();
          toast.success('Успішний вхід до групи');
          closePasswordDialog();
        } else {
          toast.error('Невірний пароль');
        }
        break;

      case 'set':
        if (passwordData.password !== passwordData.confirmPassword) {
          toast.error('Паролі не співпадають');
          return;
        }
        if (passwordData.password.length < 6) {
          toast.error('Пароль повинен містити щонайменше 6 символів');
          return;
        }
        setGroupPassword(chatId!, passwordData.password);
        toast.success('Пароль успішно встановлено');
        closePasswordDialog();
        break;

      case 'change':
        chatToChange = users.find(c => c.id === chatId);
        if (chatToChange?.privacySettings?.password !== passwordData.currentPassword) {
          toast.error('Поточний пароль невірний');
          return;
        }
        if (passwordData.password !== passwordData.confirmPassword) {
          toast.error('Нові паролі не співпадають');
          return;
        }
        setGroupPassword(chatId!, passwordData.password);
        toast.success('Пароль успішно змінено');
        closePasswordDialog();
        break;

      case 'remove':
        chatToRemove = users.find(c => c.id === chatId);
        if (chatToRemove?.privacySettings?.password !== passwordData.currentPassword) {
          toast.error('Поточний пароль невірний');
          return;
        }
        removeGroupPassword(chatId!);
        toast.success('Пароль успішно видалено');
        closePasswordDialog();
        break;
    }
  };

  const setGroupPassword = (chatId: string, password: string) => {
    console.log('Setting password for chat:', chatId);
    
    setUsers(prev => prev.map(chat => 
      chat.id === chatId 
        ? {
            ...chat,
            privacySettings: {
              ...(chat.privacySettings || {
                isPublic: false,
                allowInvites: true,
                showMembers: true
              }),
              password,
              requirePassword: true,
              encrypted: true
            },
            securityLevel: 'high'
          }
        : chat
    ));
    
    // FIX: Update selectedUser only if it's the current chat
    if (selectedUser?.id === chatId) {
      console.log('Updating selectedUser');
      setSelectedUser(prev => prev ? {
        ...prev,
        privacySettings: {
          ...(prev.privacySettings || {
            isPublic: false,
            allowInvites: true,
            showMembers: true
          }),
          password,
          requirePassword: true,
          encrypted: true
        },
        securityLevel: 'high'
      } : null);
    }
  };

  const removeGroupPassword = (chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId
        ? {
            ...chat,
            privacySettings: chat.privacySettings ? {
              ...chat.privacySettings,
              password: undefined,
              requirePassword: false,
              isPublic: true
            } : undefined,
            securityLevel: 'medium'
          }
        : chat
    ));
    
    // FIX: Update selectedUser only if it's the current chat
    if (selectedUser?.id === chatId) {
      setSelectedUser(prev => prev ? {
        ...prev,
        privacySettings: prev.privacySettings ? {
          ...prev.privacySettings,
          password: undefined,
          requirePassword: false,
          isPublic: true
        } : undefined,
        securityLevel: 'medium'
      } : null);
    }
  };

  const openPasswordDialog = (type: PasswordDialogType, chatId?: string) => {
    setPasswordDialog({
      isOpen: true,
      type,
      chatId
    });
    setPasswordData({
      password: '',
      confirmPassword: '',
      currentPassword: ''
    });
  };

  const closePasswordDialog = () => {
    setPasswordDialog({ isOpen: false, type: 'join' });
    setPasswordData({ password: '', confirmPassword: '', currentPassword: '' });
  };

  // Enhanced group creation with security
  const createGroup = () => {
    if (!newGroupData.name || newGroupData.members.length === 0) return;

    const securityLevel = newGroupData.requirePassword && newGroupData.password ? 'high' : 
                        newGroupData.isPublic ? 'medium' : 'low';

    const newGroup: ChatUser = {
      id: `group-${Date.now()}`,
      name: newGroupData.name,
      avatar: newGroupData.name.substring(0, 2).toUpperCase(),
      type: 'group',
      isOnline: true,
      unreadCount: 0,
      lastMessage: 'Групу створено',
      members: allUsers.filter(user => newGroupData.members.includes(user.id)),
      createdAt: new Date().toISOString(),
      privacySettings: {
        isPublic: newGroupData.isPublic,
        allowInvites: newGroupData.allowInvites,
        showMembers: newGroupData.showMembers,
        password: newGroupData.requirePassword ? newGroupData.password : undefined,
        requirePassword: newGroupData.requirePassword,
        encrypted: newGroupData.requirePassword
      },
      securityLevel
    };

    setUsers(prev => [newGroup, ...prev]);
    setSelectedUser(newGroup);
    setNewGroupData({ 
      name: '', 
      members: [], 
      description: '',
      isPublic: true,
      allowInvites: true,
      showMembers: true,
      requirePassword: false,
      securityLevel: 'medium'
    });
    setShowCreateGroup(false);
    loadMockData();
    toast.success(`Група "${newGroupData.name}" успішно створена`);
  };

  // Enhanced privacy toggle with password protection
  const toggleGroupPrivacy = (chatId: string) => {
    const chat = users.find(c => c.id === chatId);
    if (!chat?.privacySettings) return;

    if (!chat.privacySettings.isPublic && !chat.privacySettings.password) {
      openPasswordDialog('set', chatId);
      return;
    }

    if (chat.privacySettings.isPublic && chat.privacySettings.password) {
      openPasswordDialog('remove', chatId);
      return;
    }

    // Simple toggle for groups without password
    setUsers(prev => prev.map(chat => 
      chat.id === chatId && chat.privacySettings 
        ? { 
            ...chat, 
            privacySettings: { 
              ...chat.privacySettings, 
              isPublic: !chat.privacySettings.isPublic 
            },
            securityLevel: !chat.privacySettings.isPublic ? 'medium' : 'low'
          } 
        : chat
    ));
  };

  // Copy group invite link
  const copyGroupLink = (chatId: string) => {
    const chat = users.find(c => c.id === chatId);
    if (!chat) return;

    const link = `${window.location.origin}/chat/join/${chatId}`;
    navigator.clipboard.writeText(link);
    toast.success('Посилання скопійовано в буфер обміну');
  };

  // Security badge component
  const SecurityBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
    const config = {
      low: { icon: Shield, color: 'text-gray-500 bg-gray-100', label: 'Низька' },
      medium: { icon: ShieldCheck, color: 'text-blue-500 bg-blue-100', label: 'Середня' },
      high: { icon: ShieldAlert, color: 'text-green-500 bg-green-100', label: 'Висока' }
    };

    const { icon: Icon, color, label } = config[level];

    return (
      <Badge variant="secondary" className={`gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  // Chat management functions
  const createNewChat = (user: ChatUser) => {
    const newChat: ChatUser = {
      ...user,
      unreadCount: 0,
      lastMessage: 'Чат створено',
      isOnline: user.isOnline
    };
    setUsers(prev => [newChat, ...prev]);
    setSelectedUser(newChat);
    setShowCreateGroup(false);
    loadMockData();
  };

  const toggleMuteChat = (chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
    ));
    if (selectedUser?.id === chatId) {
      setSelectedUser(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    }
  };

  const archiveChat = (chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: true } : chat
    ));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.success('Чат архівовано');
  };

  const unarchiveChat = (chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: false } : chat
    ));
    toast.success('Чат розархівовано');
  };

  const deleteChat = (chatId: string) => {
    setUsers(prev => prev.filter(chat => chat.id !== chatId));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.success('Чат видалено');
  };

  const leaveGroup = (chatId: string) => {
    setUsers(prev => prev.filter(chat => chat.id !== chatId));
    if (selectedUser?.id === chatId) {
      setSelectedUser(null);
    }
    toast.success('Ви покинули групу');
  };

  const pinMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
    toast.success('Повідомлення закріплено');
  };

  const replyToMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleInvites = (chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId && chat.privacySettings 
        ? { 
            ...chat, 
            privacySettings: { 
              ...chat.privacySettings, 
              allowInvites: !chat.privacySettings.allowInvites 
            } 
          } 
        : chat
    ));
    if (selectedUser?.id === chatId && selectedUser.privacySettings) {
      setSelectedUser(prev => prev ? { 
        ...prev, 
        privacySettings: { 
          ...prev.privacySettings!, 
          allowInvites: !prev.privacySettings!.allowInvites 
        } 
      } : null);
    }
  };

  const toggleMembersVisibility = (chatId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId && chat.privacySettings 
        ? { 
            ...chat, 
            privacySettings: { 
              ...chat.privacySettings, 
              showMembers: !chat.privacySettings.showMembers 
            } 
          } 
        : chat
    ));
    if (selectedUser?.id === chatId && selectedUser.privacySettings) {
      setSelectedUser(prev => prev ? { 
        ...prev, 
        privacySettings: { 
          ...prev.privacySettings!, 
          showMembers: !prev.privacySettings!.showMembers 
        } 
      } : null);
    }
  };

  const addMemberByEmail = (chatId: string, email: string) => {
    const newMember = availableUsers.find(user => user.email === email);
    if (!newMember) {
      toast.error('Користувача з такою поштою не знайдено');
      return;
    }

    setUsers(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            members: [...(chat.members || []), newMember] 
          } 
        : chat
    ));
    
    if (selectedUser?.id === chatId) {
      setSelectedUser(prev => prev ? { 
        ...prev, 
        members: [...(prev.members || []), newMember] 
      } : null);
    }
    
    setNewMemberEmail('');
    toast.success('Користувача додано до групи');
  };

  const removeMember = (chatId: string, memberId: string) => {
    setUsers(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            members: chat.members?.filter(m => m.id !== memberId) || [] 
          } 
        : chat
    ));
    
    if (selectedUser?.id === chatId) {
      setSelectedUser(prev => prev ? { 
        ...prev, 
        members: prev.members?.filter(m => m.id !== memberId) || [] 
      } : null);
    }
    toast.success('Користувача видалено з групи');
  };

  // Filter chats based on active tab
  const filteredChats = users.filter(chat => {
    if (activeTab === 'groups') return chat.type === 'group' && !chat.isArchived;
    if (activeTab === 'archived') return chat.isArchived;
    return !chat.isArchived;
  });

  const filteredUsers = filteredChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserTyping = (data: { userId: string; userName: string }) => {
    setIsTyping(true);
    setTypingUser(data.userName);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingUser('');
    }, 3000);
  };

  const handleUserStopTyping = () => {
    setIsTyping(false);
    setTypingUser('');
  };

  const handleUserJoin = (user: ChatUser) => {
    setUsers(prev => {
      const existingUser = prev.find(u => u.id === user.id);
      if (existingUser) {
        return prev.map(u => u.id === user.id ? { ...u, isOnline: true } : u);
      }
      return [...prev, user];
    });
  };

  const handleUserLeave = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isOnline: false } : user
    ));
  };

  const handleSend = () => {
    if (!newMessage.trim() && !attachment) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser.id,
      name: currentUser.name,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
      type: attachment ? 'file' : 'text'
    };

    // Add reply if exists
    if (replyingTo) {
      message.replyTo = {
        id: replyingTo.id,
        sender: replyingTo.sender,
        name: replyingTo.name,
        content: replyingTo.content
      };
    }

    if (attachment) {
      message.attachment = {
        name: attachment.name,
        url: URL.createObjectURL(attachment),
        type: attachment.type,
        size: attachment.size
      };
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        message,
        chatId: selectedUser?.id
      }));
    } else {
      handleNewMessage(message);
    }

    setNewMessage('');
    setAttachment(null);
    setReplyingTo(null);
    sendStopTyping();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const voiceMessage: Message = {
          id: Date.now().toString(),
          sender: currentUser.id,
          name: currentUser.name,
          content: 'Голосове повідомлення',
          timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
          type: 'voice',
          voiceMessage: {
            url: audioUrl,
            duration: recordingTime
          }
        };

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'message',
            message: voiceMessage,
            chatId: selectedUser?.id
          }));
        } else {
          handleNewMessage(voiceMessage);
        }

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
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleTyping = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'user_typing',
        userId: currentUser.id,
        userName: currentUser.name,
        chatId: selectedUser?.id
      }));
    }
  };

  const sendStopTyping = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'user_stop_typing',
        userId: currentUser.id,
        chatId: selectedUser?.id
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Додайте цю функцію для безпечного закриття діалогів
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      closePasswordDialog();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>

        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <div className="flex h-full">
              {/* Users sidebar */}
              <div 
                ref={sidebarRef}
                className="border-r bg-muted/20 flex flex-col relative"
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
                    <h2 className="text-lg font-semibold">Чати</h2>
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
                            <Input
                              placeholder="Назва групи"
                              value={newGroupData.name}
                              onChange={(e) => setNewGroupData(prev => ({...prev, name: e.target.value}))}
                            />
                            <Textarea
                              placeholder="Опис групи (необов'язково)"
                              value={newGroupData.description}
                              onChange={(e) => setNewGroupData(prev => ({...prev, description: e.target.value}))}
                            />
                            
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="public-group">Публічна група</Label>
                                <Switch
                                  id="public-group"
                                  checked={newGroupData.isPublic}
                                  onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({...prev, isPublic: checked}))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="require-password">Захистити паролем</Label>
                                <Switch
                                  id="require-password"
                                  checked={newGroupData.requirePassword}
                                  onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({...prev, requirePassword: checked}))}
                                />
                              </div>

                              {newGroupData.requirePassword && (
                                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Пароль групи</Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={generateSecurePassword}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Згенерувати
                                    </Button>
                                  </div>
                                  <Input
                                    id="password"
                                    type="password"
                                    placeholder="Введіть пароль"
                                    value={newGroupData.password || ''}
                                    onChange={(e) => setNewGroupData(prev => ({...prev, password: e.target.value}))}
                                  />
                                  {newGroupData.password && (
                                    <div className="text-xs text-muted-foreground">
                                      Надійність: {checkPasswordStrength(newGroupData.password)}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="allow-invites">Дозволити запрошення</Label>
                                <Switch
                                  id="allow-invites"
                                  checked={newGroupData.allowInvites}
                                  onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({...prev, allowInvites: checked}))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor="show-members">Показувати учасників</Label>
                                <Switch
                                  id="show-members"
                                  checked={newGroupData.showMembers}
                                  onCheckedChange={(checked: boolean) => setNewGroupData(prev => ({...prev, showMembers: checked}))}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Учасники:</h4>
                              {availableUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-2">
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
                                  />
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{user.name}</span>
                                </div>
                              ))}
                            </div>
                            <Button onClick={createGroup} disabled={!newGroupData.name || newGroupData.members.length === 0}>
                              Створити групу
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

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
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-1">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-1 group ${
                          selectedUser?.id === user.id
                            ? 'bg-blue-100 border border-blue-200'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => {
                          if (user.type === 'group' && user.privacySettings?.requirePassword) {
                            openPasswordDialog('join', user.id);
                          } else {
                            setSelectedUser(user);
                            loadMockData();
                          }
                        }}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
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
                        
                        <div className="flex-1 min-w-0" style={{ maxWidth: `${sidebarWidth - 100}px` }}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">
                              {user.name}
                              {user.type === 'group' && (
                                <Users className="h-3 w-3 inline ml-1 text-muted-foreground" />
                              )}
                            </h3>
                            <div className="flex items-center gap-1">
                              {user.securityLevel && <SecurityBadge level={user.securityLevel} />}
                              <span className="text-xs text-muted-foreground flex-shrink-0 ml-1">
                                {user.lastSeen || '12:30'}
                              </span>
                            </div>
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
                              {user.privacySettings?.requirePassword && (
                                <Lock className="h-3 w-3 text-orange-500" />
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
                                <DropdownMenuItem onClick={() => setShowGroupMembers(true)}>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Додати учасника
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowSecuritySettings(true)}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Налаштування безпеки
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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

              {/* Основна область */}
              <div className="flex-1 flex flex-col min-h-0">
                {selectedUser ? (
                  <>
                    {/* Chat header */}
                    <div className="flex-shrink-0 border-b bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
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
                          <div>
                            <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-sm text-muted-foreground">
                                {selectedUser.type === 'group' 
                                  ? `${selectedUser.members?.length || 0} учасників`
                                  : selectedUser.isOnline ? 'В мережі' : 'Не в мережі'
                                }
                              </span>
                              {selectedUser.securityLevel && (
                                <SecurityBadge level={selectedUser.securityLevel} />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
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
                                <>
                                  <DropdownMenuItem onClick={() => setShowGroupMembers(true)}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Учасники групи
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setShowSecuritySettings(true)}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Налаштування безпеки
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => toggleGroupPrivacy(selectedUser.id)}>
                                    {selectedUser.privacySettings?.isPublic ? (
                                      <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Зробити приватним
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Зробити публічним
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleInvites(selectedUser.id)}>
                                    {selectedUser.privacySettings?.allowInvites ? (
                                      <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Заблокувати запрошення
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Дозволити запрошення
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleMembersVisibility(selectedUser.id)}>
                                    {selectedUser.privacySettings?.showMembers ? (
                                      <>
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Приховати учасників
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Показувати учасників
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </>
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
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <ScrollArea 
                        ref={scrollAreaRef}
                        className="flex-1 px-6 py-4 space-y-4"
                      >
                        {/* Pinned messages */}
                        {messages.filter(msg => msg.isPinned).length > 0 && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Pin className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-800">Закріплені повідомлення</span>
                            </div>
                            {messages.filter(msg => msg.isPinned).map(message => (
                              <div key={message.id} className="text-xs text-yellow-700 bg-yellow-100 p-1 rounded mb-0.5">
                                <strong>{message.name}:</strong> {message.content}
                              </div>
                            ))}
                          </div>
                        )}

                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`flex items-end max-w-xl gap-3 ${
                                message.sender === currentUser.id ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback
                                  className={`text-xs ${
                                    message.sender === currentUser.id
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {message.sender === currentUser.id ? 'В' : selectedUser.avatar[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div
                                className={`flex flex-col ${
                                  message.sender === currentUser.id ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {message.sender !== currentUser.id && (
                                    <span className="text-xs font-medium text-gray-600">{message.name}</span>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => pinMessage(message.id)}>
                                        <Pin className="h-4 w-4 mr-2" />
                                        {message.isPinned ? 'Відкріпити' : 'Закріпити'}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => replyToMessage(message)}>
                                        <Reply className="h-4 w-4 mr-2" />
                                        Відповісти
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Копіювати текст
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Видалити
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div
                                  className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-300 ${
                                    message.sender === currentUser.id
                                      ? 'bg-blue-600 text-white rounded-br-none'
                                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                                  }`}
                                >
                                  {/* Reply preview */}
                                  {message.replyTo && (
                                    <div className={`mb-2 p-2 rounded-lg border-l-4 ${
                                      message.sender === currentUser.id
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

                                  {message.type === 'voice' ? (
                                    <div className="flex items-center gap-3">
                                      <button className="p-2 bg-white/20 rounded-full">
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                      </button>
                                      <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-white/30 rounded-full">
                                          <div 
                                            className="h-2 bg-white rounded-full" 
                                            style={{ width: '70%' }}
                                          />
                                        </div>
                                        <span className="text-sm">
                                          {formatTime(message.voiceMessage?.duration || 0)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm leading-relaxed whitespace-pre-line">
                                      {message.content}
                                    </p>
                                  )}

                                  {message.attachment && (
                                    <div
                                      className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                                        message.sender === currentUser.id
                                          ? 'bg-blue-700/50 text-white'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      <FileText className="w-4 h-4" />
                                      <div className="flex-1">
                                        <div className="font-medium">{message.attachment.name}</div>
                                        <div className="text-xs opacity-75">
                                          {message.attachment.size && (message.attachment.size / 1024).toFixed(1)} KB
                                        </div>
                                      </div>
                                      <a 
                                        href={message.attachment.url} 
                                        download={message.attachment.name}
                                        className="ml-2 text-xs underline hover:no-underline"
                                      >
                                        Завантажити
                                      </a>
                                    </div>
                                  )}
                                </div>

                                <span className="text-xs text-muted-foreground mt-1">
                                  {message.timestamp}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="flex items-end max-w-xl gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                  {selectedUser.avatar[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 rounded-bl-none">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {typingUser} друкує...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </ScrollArea>

                      {/* Reply preview above input */}
                      {replyingTo && (
                        <div className="border-t border-b bg-blue-50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Reply className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="text-sm font-medium text-blue-800">
                                Відповідь {replyingTo.name}
                              </div>
                              <div className="text-xs text-blue-600 truncate max-w-md">
                                {replyingTo.content}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelReply}
                            className="h-6 w-6 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Input Area */}
                      <div className="border-t p-4 space-y-3 flex-shrink-0 bg-background">
                        {/* Attachment preview */}
                        {attachment && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800 flex-1">{attachment.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeAttachment}
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </Button>
                          </div>
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
                                type="file" 
                                className="hidden" 
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                              />
                            </label>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={isRecording ? stopRecording : startRecording}
                              className={isRecording ? 'text-red-600' : ''}
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
                              placeholder={replyingTo ? `Відповідь ${replyingTo.name}...` : "Напишіть повідомлення..."}
                              className="min-h-[60px] resize-none pr-12"
                            />
                          </div>

                          <Button 
                            onClick={handleSend} 
                            disabled={(!newMessage.trim() && !attachment) || !isConnected}
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Екран вибору чату
                  <div className="flex-1 flex flex-col items-center justify-center bg-muted/20">
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
      <Dialog open={showGroupMembers} onOpenChange={setShowGroupMembers}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Учасники групи "{selectedUser?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Додавання учасника по email */}
            {selectedUser?.privacySettings?.allowInvites && (
              <div className="flex gap-2">
                <Input
                  placeholder="Email учасника"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  type="email"
                />
                <Button 
                  onClick={() => addMemberByEmail(selectedUser.id, newMemberEmail)}
                  disabled={!newMemberEmail}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedUser?.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg border">
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
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Керівник
                    </span>
                  )}
                  {member.id !== currentUser.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(selectedUser.id, member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Password Dialog - FIXED */}
      <Dialog open={passwordDialog.isOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {passwordDialog.type === 'join' && 'Вхід до групи'}
              {passwordDialog.type === 'set' && 'Встановити пароль'}
              {passwordDialog.type === 'change' && 'Змінити пароль'}
              {passwordDialog.type === 'remove' && 'Видалити пароль'}
            </DialogTitle>
            <DialogDescription>
              {passwordDialog.type === 'join' && 'Ця група захищена паролем. Введіть пароль для входу.'}
              {passwordDialog.type === 'set' && 'Встановіть пароль для захисту вашої групи.'}
              {passwordDialog.type === 'change' && 'Змініть пароль для вашої групи.'}
              {passwordDialog.type === 'remove' && 'Для видалення пароля введіть поточний пароль.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {(passwordDialog.type === 'change' || passwordDialog.type === 'remove') && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Поточний пароль</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Введіть поточний пароль"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
            )}

            {(passwordDialog.type === 'set' || passwordDialog.type === 'change') && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-password">
                      {passwordDialog.type === 'set' ? 'Пароль' : 'Новий пароль'}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSecurePassword}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Згенерувати
                    </Button>
                  </div>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={`Введіть ${passwordDialog.type === 'set' ? 'пароль' : 'новий пароль'}`}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  {passwordData.password && (
                    <div className="text-xs text-muted-foreground">
                      Надійність: {checkPasswordStrength(passwordData.password)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Підтвердіть пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Підтвердіть пароль"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  {passwordData.confirmPassword && passwordData.password !== passwordData.confirmPassword && (
                    <div className="text-xs text-red-500">Паролі не співпадають</div>
                  )}
                </div>
              </>
            )}

            {passwordDialog.type === 'join' && (
              <div className="space-y-2">
                <Label htmlFor="join-password">Пароль групи</Label>
                <Input
                  id="join-password"
                  type="password"
                  placeholder="Введіть пароль для входу"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && passwordData.password) {
                      handlePasswordAction();
                    }
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closePasswordDialog}>
              Скасувати
            </Button>
            <Button 
              onClick={handlePasswordAction}
              disabled={
                !passwordData.password ||
                (passwordDialog.type === 'set' && passwordData.password !== passwordData.confirmPassword) ||
                (passwordDialog.type === 'change' && (!passwordData.currentPassword || passwordData.password !== passwordData.confirmPassword)) ||
                (passwordDialog.type === 'remove' && !passwordData.currentPassword)
              }
            >
              {passwordDialog.type === 'join' && 'Увійти'}
              {passwordDialog.type === 'set' && 'Встановити'}
              {passwordDialog.type === 'change' && 'Змінити'}
              {passwordDialog.type === 'remove' && 'Видалити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Settings Dialog */}
      <Dialog open={showSecuritySettings} onOpenChange={setShowSecuritySettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Налаштування безпеки</DialogTitle>
            <DialogDescription>
              Керуйте налаштуваннями безпеки та приватності вашої групи
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser?.type === 'group' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Рівень безпеки</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.securityLevel === 'high' && 'Високий рівень захисту з паролем'}
                    {selectedUser.securityLevel === 'medium' && 'Середній рівень захисту'}
                    {selectedUser.securityLevel === 'low' && 'Базовий рівень захисту'}
                  </p>
                </div>
                <SecurityBadge level={selectedUser.securityLevel || 'medium'} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Захист паролем</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.privacySettings?.requirePassword 
                        ? 'Група захищена паролем' 
                        : 'Група не захищена паролем'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedUser.privacySettings?.requirePassword) {
                        openPasswordDialog('change', selectedUser.id);
                      } else {
                        openPasswordDialog('set', selectedUser.id);
                      }
                      setShowSecuritySettings(false);
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {selectedUser.privacySettings?.requirePassword ? 'Змінити пароль' : 'Встановити пароль'}
                  </Button>
                </div>

                {selectedUser.privacySettings?.requirePassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      openPasswordDialog('remove', selectedUser.id);
                      setShowSecuritySettings(false);
                    }}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Видалити пароль
                  </Button>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Публічна група</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.privacySettings?.isPublic 
                        ? 'Група видима для всіх' 
                        : 'Група приватна'}
                    </p>
                  </div>
                  <Switch
                    checked={selectedUser.privacySettings?.isPublic || false}
                    onCheckedChange={() => toggleGroupPrivacy(selectedUser.id)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyGroupLink(selectedUser.id)}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Копіювати посилання запрошення
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;