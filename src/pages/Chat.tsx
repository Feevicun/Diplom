import { useState, useEffect, useRef } from 'react';
import { 
  Send, Users, Plus, Search, MessageCircle, 
  Check, X, ArrowLeft, Paperclip, Phone, 
  Video, MoreVertical, Pin, Trash2, Edit, Reply,
  Image as ImageIcon, File, Download, ThumbsUp, Smile
} from 'lucide-react';

// Import components
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

type Message = {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  content: string;
  timestamp: string;
  attachment?: { 
    name: string; 
    url?: string; 
    type: 'image' | 'file' | 'audio';
    size?: string;
  };
  chatId: number;
  isEdited?: boolean;
  reactions?: { [key: string]: number };
  replyTo?: number;
  readBy?: number[];
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: 'online' | 'offline' | 'away';
  avatar?: string;
  lastSeen?: string;
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
  description?: string;
  admins?: number[];
};

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: "Олексій Петренко",
      type: 'direct',
      participants: [],
      unreadCount: 3,
      lastMessage: {
        id: 1,
        senderId: 2,
        senderName: "Олексій Петренко",
        senderEmail: "alex@example.com",
        content: "Привіт! Як справи з проектом?",
        timestamp: "14:32",
        chatId: 1,
        readBy: [1, 2]
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T14:32:00Z",
      isPinned: true
    },
    {
      id: 2,
      name: "Команда розробки",
      type: 'group',
      participants: [],
      unreadCount: 0,
      lastMessage: {
        id: 2,
        senderId: 3,
        senderName: "Марія Коваленко",
        senderEmail: "maria@example.com",
        content: "Завтра о 10:00 зустріч",
        timestamp: "12:45",
        chatId: 2,
        readBy: [1, 3, 4]
      },
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T12:45:00Z",
      description: "Чат для обговорення проектів",
      admins: [1, 3]
    },
    {
      id: 3,
      name: "Анна Сидорова",
      type: 'direct',
      participants: [],
      unreadCount: 0,
      lastMessage: {
        id: 3,
        senderId: 4,
        senderName: "Анна Сидорова",
        senderEmail: "anna@example.com",
        content: "Дякую за допомогу! 👍",
        timestamp: "11:20",
        chatId: 3,
        readBy: [1, 4]
      },
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T11:20:00Z"
    },
    {
      id: 4,
      name: "Навчальний чат",
      type: 'group',
      participants: [],
      unreadCount: 12,
      lastMessage: {
        id: 4,
        senderId: 5,
        senderName: "Іван Іваненко",
        senderEmail: "ivan@example.com",
        content: "Хто буде на лекції?",
        timestamp: "10:15",
        chatId: 4,
        readBy: [5, 6, 7]
      },
      createdAt: "2024-01-14T08:00:00Z",
      updatedAt: "2024-01-15T10:15:00Z",
      description: "Загальний чат для навчання",
      admins: [1],
      isPinned: true
    }
  ]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: 2,
      senderName: "Олексій Петренко",
      senderEmail: "alex@example.com",
      content: "Привіт! Як справи з проектом?",
      timestamp: "14:30",
      chatId: 1,
      readBy: [1, 2]
    },
    {
      id: 2,
      senderId: 1,
      senderName: "Ви",
      senderEmail: "you@example.com",
      content: "Привіт! Все йде добре. Сьогодні закінчив основний функціонал.",
      timestamp: "14:31",
      chatId: 1,
      readBy: [1, 2]
    },
    {
      id: 3,
      senderId: 2,
      senderName: "Олексій Петренко",
      senderEmail: "alex@example.com",
      content: "Чудово! Можеш показати результат завтра?",
      timestamp: "14:32",
      chatId: 1,
      readBy: [1, 2]
    },
    {
      id: 4,
      senderId: 1,
      senderName: "Ви",
      senderEmail: "you@example.com",
      content: "Так, звісно. Ось скріншоти інтерфейсу:",
      timestamp: "14:33",
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
      timestamp: "14:35",
      chatId: 1,
      readBy: [1, 2],
      reactions: { "👍": 1 }
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [users] = useState<User[]>([
    { id: 2, name: "Олексій Петренко", email: "alex@example.com", role: "Викладач", status: "online", lastSeen: "2024-01-15T14:35:00Z" },
    { id: 3, name: "Марія Коваленко", email: "maria@example.com", role: "Студент", status: "away", lastSeen: "2024-01-15T13:20:00Z" },
    { id: 4, name: "Анна Сидорова", email: "anna@example.com", role: "Адмін", status: "offline", lastSeen: "2024-01-15T11:20:00Z" },
    { id: 5, name: "Іван Іваненко", email: "ivan@example.com", role: "Студент", status: "online", lastSeen: "2024-01-15T14:20:00Z" },
    { id: 6, name: "Катерина Мельник", email: "kate@example.com", role: "Викладач", status: "online", lastSeen: "2024-01-15T14:10:00Z" }
  ]);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupChatName, setGroupChatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentUser({
      id: 1,
      name: "Ваше Ім'я",
      email: "you@example.com",
      role: "Користувач",
      status: "online"
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, replyingTo]);

  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        type: file.type.startsWith('image/') ? 'image' : 'file',
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
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id 
        ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString() }
        : chat
    ));
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

  const renderAvatar = (name: string, isOnline?: boolean, size = 'default') => {
    const sizeClasses = {
      small: 'w-6 h-6 text-xs',
      default: 'w-8 h-8 text-xs',
      large: 'w-10 h-10 text-sm'
    };
    
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

  const renderAttachment = (attachment: Message['attachment']) => {
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
          {/* Chat Sidebar */}
          {showChatList && (
            <div className="w-full md:w-64 bg-card border-r border-border flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-bold text-card-foreground">Повідомлення</h1>
                  <button
                    onClick={() => setShowChatList(false)}
                    className="md:hidden p-1 hover:bg-muted rounded-md transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
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
                  >
                    <Users className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {chats.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeChat?.id === chat.id 
                          ? 'bg-accent border border-accent-foreground/20' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        setActiveChat(chat);
                        setShowChatList(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          {chat.type === 'group' ? (
                            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-accent-foreground font-semibold">
                              <Users className="w-4 h-4" />
                            </div>
                          ) : (
                            renderAvatar(chat.name, true, 'default')
                          )}
                          {chat.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </div>
                          )}
                          {chat.isPinned && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 p-0.5 rounded-full">
                              <Pin className="h-2 w-2 text-white" />
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
                    className="md:hidden px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors text-sm"
                  >
                    Переглянути чати
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
                        onClick={() => setShowChatList(true)}
                        className="md:hidden p-1 hover:bg-muted rounded-md transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
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
                      <button className="p-2 hover:bg-muted rounded-md transition-colors">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors">
                        <Video className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
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
                              {message.attachment && renderAttachment(message.attachment)}
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
                                    <button className="p-1 hover:bg-muted rounded-md transition-colors">
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
                      >
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-md transition-colors">
                        <Smile className="w-4 h-4 text-muted-foreground" />
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
    </div>
  );
};

export default ChatPage;