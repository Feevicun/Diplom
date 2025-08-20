import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Users, Plus, Search, ChevronRight, MessageCircle, 
  Check, X, ArrowLeft, Paperclip, Smile, Video, Phone, 
  MoreVertical, Pin, Archive, Trash2, Edit, Reply, Forward,
  Image as ImageIcon, File, Download, ThumbsUp, Eye
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  faculty_id?: number;
  department_id?: number;
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
  const { t } = useTranslation();
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
  const [showGroupChatDialog, setShowGroupChatDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupChatName, setGroupChatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'unread') return chat.unreadCount > 0;
    if (activeTab === 'pinned') return chat.isPinned;
    if (activeTab === 'groups') return chat.type === 'group';
    return true;
  });

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
    
    // Оновлення останнього повідомлення в чаті
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
    setShowGroupChatDialog(false);
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

  const renderNewChatDialog = () => (
    <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="gap-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-md transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">{t('chat.newChat') || 'Новий чат'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {t('chat.newChat') || 'Новий чат'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('chat.searchUsers') || 'Пошук користувачів...'}
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-64 rounded-xl border">
            {filteredUsers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t('chat.noUsersFound') || 'Користувачів не знайдено'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleCreateDirectChat(user.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {user.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                      {user.status === 'away' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderNewGroupDialog = () => (
    <Dialog open={showGroupChatDialog} onOpenChange={setShowGroupChatDialog}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-2 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-full shadow-sm"
        >
          <Users className="w-4 h-4" />
          <span className="font-medium">{t('chat.newGroup') || 'Нова група'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            {t('chat.newGroup') || 'Створити групу'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('chat.groupName') || 'Назва групи'}
            </label>
            <Input
              placeholder={t('chat.groupNamePlaceholder') || 'Введіть назву групи...'}
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('chat.selectParticipants') || 'Оберіть учасників'}
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('chat.searchUsers') || 'Пошук користувачів...'}
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-48 rounded-xl border">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t('chat.noUsersFound') || 'Користувачів не знайдено'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, user.id]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.id));
                              }
                            }}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`user-${user.id}`}
                            className={`flex items-center justify-center w-5 h-5 rounded border cursor-pointer ${
                              selectedUsers.includes(user.id)
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedUsers.includes(user.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </label>
                        </div>
                        <label
                          htmlFor={`user-${user.id}`}
                          className="flex-1 flex items-center gap-3 cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {selectedUsers.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">
                  {t('chat.selectedParticipants') || 'Обрані учасники'} · {selectedUsers.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {users
                    .filter(u => selectedUsers.includes(u.id))
                    .map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-sm"
                      >
                        <span className="font-medium text-blue-700">{user.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleCreateGroupChat}
            disabled={!groupChatName.trim() || selectedUsers.length === 0}
            className="rounded-full bg-blue-500 hover:bg-blue-600"
          >
            {t('chat.createGroup') || 'Створити групу'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderAttachment = (attachment: Message['attachment']) => {
    if (!attachment) return null;

    if (attachment.type === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border">
          <div className="relative group">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button variant="secondary" size="sm" className="rounded-full">
                <Eye className="h-4 w-4 mr-1" /> Переглянути
              </Button>
            </div>
          </div>
          <div className="p-3 bg-white">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{attachment.size}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
        <File className="h-8 w-8 text-blue-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">{attachment.size}</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderReactions = (reactions: Message['reactions']) => {
    if (!reactions) return null;

    return (
      <div className="flex items-center gap-1 mt-1">
        {Object.entries(reactions).map(([reaction, count]) => (
          <div key={reaction} className="bg-blue-100 px-1.5 py-0.5 rounded-full flex items-center text-xs">
            <span>{reaction}</span>
            <span className="ml-1 text-blue-700 font-medium">{count}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Chat List Panel */}
          {showChatList && (
            <div className="w-full md:w-96 border-r bg-white flex flex-col shadow-sm">
              {/* Chat List Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{t('chat.title') || 'Повідомлення'}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatList(false)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {renderNewChatDialog()}
                  {renderNewGroupDialog()}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full bg-gray-100 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Усі</TabsTrigger>
                    <TabsTrigger value="unread" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Непрочитані
                    </TabsTrigger>
                    <TabsTrigger value="pinned" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Закріплені</TabsTrigger>
                    <TabsTrigger value="groups" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Групи</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Chat List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredChats.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        activeChat?.id === chat.id 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setActiveChat(chat);
                        setShowChatList(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={chat.type === 'group' ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white" : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"}>
                              {chat.type === 'group' ? (
                                <Users className="w-5 h-5" />
                              ) : (
                                getInitials(chat.name)
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {chat.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">
                              {chat.unreadCount}
                            </span>
                          )}
                          {chat.isPinned && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full shadow">
                              <Pin className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate text-gray-800">{chat.name}</p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {chat.lastMessage?.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {chat.lastMessage && (
                              <p className="text-sm text-gray-500 truncate flex-1">
                                {chat.type === 'group' && `${chat.lastMessage.senderName}: `}
                                {chat.lastMessage.content}
                              </p>
                            )}
                            {chat.type === 'group' && (
                              <Badge variant="outline" className="text-xs bg-gray-100">
                                {chat.participants.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Chat Content */}
          <div className="flex-1 flex flex-col bg-white">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-lg border">
                  <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg mb-4">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {t('chat.selectChat') || 'Оберіть чат'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('chat.selectChatDescription') || 'Виберіть існуючий чат або створіть новий для початку спілкування'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => setShowChatList(true)}
                      className="md:hidden rounded-full bg-blue-500 hover:bg-blue-600"
                    >
                      {t('chat.showChats') || 'Переглянути чати'}
                    </Button>
                    <Button
                      onClick={() => setShowNewChatDialog(true)}
                      variant="outline"
                      className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Новий чат
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChatList(true)}
                      className="md:hidden rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={activeChat.type === 'group' ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"}>
                        {activeChat.type === 'group' ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          getInitials(activeChat.name)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-800">{activeChat.name}</h3>
                      {activeChat.type === 'group' ? (
                        <p className="text-sm text-gray-500">
                          {activeChat.participants.length} {t('chat.participants') || 'учасників'}
                          {activeChat.description && ` · ${activeChat.description}`}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {users.find(u => u.id === activeChat.participants.find(p => p.id !== currentUser?.id)?.id)?.status === 'online' 
                            ? 'В мережі' 
                            : `Був(ла) ${formatLastSeen(users.find(u => u.id === activeChat.participants.find(p => p.id !== currentUser?.id)?.id)?.lastSeen || new Date().toISOString())}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Phone className="h-5 w-5 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Голосовий виклик</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Video className="h-5 w-5 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Відеовиклик</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 rounded-xl">
                        <div className="space-y-1">
                          <Button variant="ghost" className="w-full justify-start rounded-lg">
                            <Pin className="h-4 w-4 mr-2" /> Закріпити чат
                          </Button>
                          <Button variant="ghost" className="w-full justify-start rounded-lg">
                            <Archive className="h-4 w-4 mr-2" /> Архівувати
                          </Button>
                          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 rounded-lg">
                            <Trash2 className="h-4 w-4 mr-2" /> Видалити чат
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50 to-gray-100">
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
                          {message.senderId !== currentUser?.id && activeChat.type === 'group' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                {getInitials(message.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col">
                            {activeChat.type === 'group' && message.senderId !== currentUser?.id && (
                              <span className="text-xs text-gray-500 mb-1 ml-1">
                                {message.senderName}
                              </span>
                            )}
                            <div className="group relative">
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  message.senderId === currentUser?.id
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                    : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
                                }`}
                              >
                                {message.replyTo && (
                                  <div className="text-xs border-l-2 border-blue-300 pl-2 mb-2 text-gray-500 italic">
                                    У відповідь на: "{messages.find(m => m.id === message.replyTo)?.content}"
                                  </div>
                                )}
                                <p className="text-sm">{message.content}</p>
                                {message.attachment && renderAttachment(message.attachment)}
                                {message.reactions && renderReactions(message.reactions)}
                                <div className={`flex items-center mt-1 ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs opacity-80">
                                    {message.timestamp}
                                    {message.isEdited && <span className="italic"> (ред.)</span>}
                                  </span>
                                  {message.senderId === currentUser?.id && (
                                    <CheckCheck className="h-3 w-3 ml-1 text-white" />
                                  )}
                                </div>
                              </div>
                              
                              {/* Message actions */}
                              <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white rounded-full shadow-lg border">
                                {message.senderId === currentUser?.id ? (
                                  <>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => {
                                              setEditingMessage(message);
                                              setNewMessage(message.content);
                                            }}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Редагувати</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Видалити</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </>
                                ) : (
                                  <>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => setReplyingTo(message)}
                                          >
                                            <Reply className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Відповісти</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                            <Forward className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Переслати</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => handleReaction(message.id, '👍')}
                                      >
                                        <ThumbsUp className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Реакція</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Reply indicator */}
                {replyingTo && (
                  <div className="border-t bg-blue-50 p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-700">Відповідь {replyingTo.senderId === currentUser?.id ? 'собі' : replyingTo.senderName}</p>
                      <p className="text-xs text-blue-600 truncate">{replyingTo.content}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Edit indicator */}
                {editingMessage && (
                  <div className="border-t bg-yellow-50 p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-yellow-700">Редагування повідомлення</p>
                      <p className="text-xs text-yellow-600 truncate">{editingMessage.content}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full"
                      onClick={() => {
                        setEditingMessage(null);
                        setNewMessage('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-end gap-2">
                    <div className="flex items-center">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full text-gray-500"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Paperclip className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Прикріпити файл</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full text-gray-500"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <Smile className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Емоції</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('chat.placeholder') || 'Напишіть повідомлення...'}
                      className="min-h-[60px] resize-none flex-1 rounded-2xl bg-gray-100 border-none focus:bg-white focus:ring-2 focus:ring-blue-200"
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
                    <Button 
                      onClick={editingMessage ? handleEditMessage : handleSendMessage} 
                      disabled={!newMessage.trim() && !file}
                      size="icon"
                      className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    >
                      {editingMessage ? <Check className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                  {file && (
                    <div className="mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                      <Paperclip className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-700 truncate flex-1">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Допоміжний компонент для іконки двійної галочки
const CheckCheck = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7.5 12.5 9 14l4-4" />
    <path d="M12 14l4-4" />
    <path d="M16 7h.01" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default ChatPage;