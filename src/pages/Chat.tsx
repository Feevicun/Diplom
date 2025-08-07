import { useState, useEffect } from 'react';
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
  attachment?: {
    name: string;
  };
  id: number;
}




const ChatPage = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [userName, setUserName] = useState('Ви');
  const [userEmail, setUserEmail] = useState('');

// Load messages from API
useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    setUserName(`${user.firstName} ${user.lastName}`);
    setUserEmail(user.email);
  }
}, []);

useEffect(() => {
  if (!userEmail) return; // Чекаємо, доки userEmail не встановиться
  fetchMessages();
  const interval = setInterval(fetchMessages, 5000);
  return () => clearInterval(interval);
}, [userEmail]);


// ⬇️ fetchMessages — тепер передаємо email користувача
const fetchMessages = async () => {
  if (!userEmail) return; // не робити запит без email
  try {
    const res = await fetch(`http://localhost:4000/api/messages?userEmail=${userEmail}`);
    if (!res.ok) {
      console.error('Failed to fetch messages:', res.statusText);
      return;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error('Response is not an array:', data);
      return;
    }
    setMessages(data);
  } catch (err) {
    console.error('Failed to fetch messages:', err);
  }
};


// ⬇️ Надсилання повідомлення — додали studentEmail
const handleSend = async () => {
  if (!newMessage.trim()) return;

  const newMsg: Message = {
  id: Date.now(),
  sender: 'student',
  name: userName,
  content: newMessage,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  studentEmail: userEmail,
  attachment: file ? { name: file.name } : undefined,
};


  try {
    const response = await fetch('http://localhost:4000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    });

    if (!response.ok) throw new Error('Failed to send');

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');
    setFile(null);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto py-6 px-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('index.chatWithSupervisor')}</CardTitle>
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
                              ? userName
                                  .split(' ')
                                  .map((n) => n[0]?.toUpperCase())
                                  .join('')
                              : 'ІІ'}
                            </AvatarFallback>

                        </Avatar>
                        <div
                          className={`flex flex-col ${
                            message.sender === 'student' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-300 ${
                              message.sender === 'student'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {message.content}
                            </p>
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
                          <span className="text-xs text-muted-foreground mt-2">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>

                {/* Input */}
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
                      <Input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
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
