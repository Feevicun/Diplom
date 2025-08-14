import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Send, Paperclip } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';

type Message = {
  sender: 'student' | 'supervisor';
  name: string;
  content: string;
  timestamp: string;
  studentEmail?: string;
  attachment?: { name: string };
  id: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  faculty_id?: number;
  department_id?: number;
};

const ChatPage = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [userName, setUserName] = useState('Ви');
  const [userEmail, setUserEmail] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Завантаження поточного користувача
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`${user.firstName} ${user.lastName}`);
      setUserEmail(user.email);
    }
  }, []);

  // Завантаження списку користувачів
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  // Підключення WebSocket після вибору співрозмовника
  useEffect(() => {
    if (!userEmail || !selectedUser) return;

    const ws = new WebSocket(
      `ws://localhost:4000?userEmail=${encodeURIComponent(userEmail)}&contactEmail=${encodeURIComponent(selectedUser.email)}`
    );
    wsRef.current = ws;

    ws.onopen = () => console.log('✅ WebSocket connected');
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (Array.isArray(msg)) {
          setMessages(msg);
        } else {
          setMessages((prev) => [...prev, msg]);
        }
      } catch (error) {
        console.error('Error parsing WS message', error);
      }
    };
    ws.onclose = () => console.log('❌ WebSocket closed');
    ws.onerror = (err) => console.error('WebSocket error:', err);

    return () => ws.close();
  }, [userEmail, selectedUser]);

  // Надсилання повідомлення
  const handleSend = () => {
    if (!newMessage.trim() || !wsRef.current) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: 'student',
      name: userName,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      studentEmail: userEmail,
      attachment: file ? { name: file.name } : undefined,
    };

    wsRef.current.send(JSON.stringify(newMsg));
    setNewMessage('');
    setFile(null);
  };

  // Якщо співрозмовник ще не обраний — показуємо список користувачів
  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">{t('chat.selectUser') || 'Оберіть користувача для чату'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((u) => (
                <Card key={u.id} className="cursor-pointer hover:shadow-lg" onClick={() => setSelectedUser(u)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{u.name.split(' ').map((n) => n[0]?.toUpperCase()).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Якщо обраний співрозмовник — показуємо чат
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto py-6 px-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('index.chatWithSupervisor') || 'Чат з'} {selectedUser.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100vh-200px)]">
                <ScrollArea className="flex-1 min-h-0 px-6 py-4 space-y-6 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-end max-w-xl gap-3 ${
                          message.sender === 'student' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-xs ${
                              message.sender === 'student'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {message.sender === 'student'
                              ? userName.split(' ').map((n) => n[0]?.toUpperCase()).join('')
                              : selectedUser.name.split(' ').map((n) => n[0]?.toUpperCase()).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${message.sender === 'student' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-300 ${
                              message.sender === 'student'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                            {message.attachment && (
                              <div
                                className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
                                  message.sender === 'student'
                                    ? 'bg-blue-700/50 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                <span>{message.attachment.name}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-2">{message.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <div className="border-t pt-4 space-y-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <label className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground">
                      <Paperclip className="h-4 w-4" />
                      <Input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      {t('chat.attachFile')}
                    </label>
                    <Button onClick={handleSend} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4 mr-2" /> {t('chat.send')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
