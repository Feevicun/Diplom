import { useState } from 'react';
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
  id: number;
  sender: 'student' | 'supervisor';
  name: string;
  contentKey?: string;
  content?: string;
  timestamp: string;
  attachment?: {
    name: string;
  };
};

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'supervisor',
      name: 'проф. Іваненко І.І.',
      contentKey: 'chat.example.supervisor1',
      timestamp: '10:10',
    },
    {
      id: 2,
      sender: 'student',
      name: 'Ви',
      contentKey: 'chat.example.student1',
      timestamp: '10:15',
    },
    {
      id: 3,
      sender: 'supervisor',
      name: 'проф. Іваненко І.І.',
      contentKey: 'chat.example.supervisor2',
      timestamp: '10:45',
    },
    {
      id: 4,
      sender: 'student',
      name: 'Ви',
      contentKey: 'chat.example.student2',
      timestamp: '11:05',
    },
  ]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'student',
      name: 'Ви',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
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
                        className={`flex items-end max-w-xl gap-3 ${message.sender === 'student' ? 'flex-row-reverse' : ''
                          }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={`text-xs ${message.sender === 'student'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {message.sender === 'student' ? 'ОП' : 'ІІ'}
                          </AvatarFallback>
                        </Avatar>

                        <div
                          className={`flex flex-col ${message.sender === 'student' ? 'items-end' : 'items-start'
                            }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-300 ${message.sender === 'student'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                              }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {message.contentKey ? t(message.contentKey) : message.content}
                            </p>

                            {message.attachment && (
                              <div
                                className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${message.sender === 'student'
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

                {/* Input Area */}
                <div className="border-t pt-4 space-y-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex items-center gap-1 text-sm text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        <Input type="file" className="hidden" />
                        {t('chat.attachFile')}
                      </label>
                    </div>
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
