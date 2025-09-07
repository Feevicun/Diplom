import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Lightbulb,
  Trophy,
  Activity,
  Plus,
  Settings,
  Loader2,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';
import { format, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

interface TeacherComment {
  id: string;
  text: string;
  date: string;
  status: 'info' | 'warning' | 'error' | 'success';
}

interface ChapterData {
  id: number;
  key: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentNote: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
  };
  teacherComments: TeacherComment[];
}

type UserType = {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
};

// Тип для подій календаря
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'meeting' | 'deadline';
}

// Тип для активності з підтримкою календарних подій
interface RecentActivity {
  id: string;
  type: 'comment' | 'deadline' | 'approval' | 'task' | 'meeting';
  text: string;
  time: string;
  icon: any;
  eventDate?: Date;
}

// API функції (ті ж що і в ThesisTracker)
const apiRequest = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const response = await fetch(`/api${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<UserType | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Стани для відстеження проєкту (синхронізовані з ThesisTracker)
  const [projectType, setProjectType] = useState<string | null>(null); 
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  
  // Новий стан для подій календаря
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Локаль для форматування дат
  const currentLocale = i18n.language === 'ua' ? uk : enUS;

  // Функція для завантаження подій календаря
  const fetchCalendarEvents = async () => {
    if (!user?.email) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch(`/api/events?userEmail=${encodeURIComponent(user.email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const events: CalendarEvent[] = await res.json();
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  // Функція для генерації активності з календарних подій та системних подій
  const generateRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Системні активності (можуть бути з API в майбутньому)
    const systemActivities: RecentActivity[] = [
      { 
        id: 'system-1', 
        type: 'comment', 
        text: 'Новий коментар до розділу 2', 
        time: '2 год тому', 
        icon: MessageSquare 
      },
      { 
        id: 'system-2', 
        type: 'approval', 
        text: 'Розділ 1 затверджено', 
        time: '3 дні тому', 
        icon: CheckCircle 
      },
    ];
    
    // Додаємо календарні події
    const calendarActivities: RecentActivity[] = calendarEvents
      .map(event => {
        const eventDate = new Date(event.date);
        let timeText = '';
        let activityText = '';
        
        // Генеруємо текст часу
        if (isToday(eventDate)) {
          timeText = `сьогодні о ${format(eventDate, 'HH:mm')}`;
        } else if (isTomorrow(eventDate)) {
          timeText = 'завтра';
        } else if (isYesterday(eventDate)) {
          timeText = 'вчора';
        } else {
          timeText = formatDistanceToNow(eventDate, { 
            locale: currentLocale, 
            addSuffix: true 
          });
        }
        
        // Генеруємо текст активності
        switch (event.type) {
          case 'deadline':
            activityText = `Дедлайн: ${event.title}`;
            break;
          case 'meeting':
            activityText = `Зустріч: ${event.title}`;
            break;
          case 'task':
            activityText = `Завдання: ${event.title}`;
            break;
          default:
            activityText = event.title;
        }
        
        return {
          id: `calendar-${event.id}`,
          type: event.type === 'deadline' ? 'deadline' : event.type === 'meeting' ? 'meeting' : 'task',
          text: activityText,
          time: timeText,
          icon: event.type === 'deadline' ? AlertCircle : 
                event.type === 'meeting' ? Users : 
                Clock,
          eventDate
        } as RecentActivity;
      })
      // Сортуємо за датою (найближчі першими)
      .sort((a, b) => {
        if (!a.eventDate || !b.eventDate) return 0;
        return a.eventDate.getTime() - b.eventDate.getTime();
      });
    
    // Об'єднуємо та сортуємо всі активності
    activities.push(...calendarActivities, ...systemActivities);
    
    // Повертаємо тільки останні 3 активностей
    return activities.slice(0, 3);
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        console.log('Починаємо fetch користувача...');
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Знайшли користувача в localStorage:', parsedUser);
            
            // Переконуємось що є firstName
            const userWithFirstName = {
              ...parsedUser,
              firstName: parsedUser.firstName || parsedUser.name?.split(' ')[0] || '',
              name: parsedUser.name || ''
            };
            
            setUser(userWithFirstName);
            console.log('Встановили користувача з localStorage:', userWithFirstName);
            return; // Якщо є дані в localStorage, не робимо API запит
          } catch (error) {
            console.log('Помилка парсингу localStorage:', error);
          }
        }
        
        // Якщо немає в localStorage, робимо API запит
        const res = await fetch('/api/current-user', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        console.log('Отримали відповідь з API:', res.status, res.ok);

        if (!res.ok) {
          console.log('API Response not ok:', res.status, res.statusText);
          setUser(null);
          return;
        }

        const data = await res.json();
        console.log('Отримані дані з API:', data);

        if (data && data.user) {
          const userWithFullName = {
            ...data.user,
            name: data.user.firstName + (data.user.lastName ? ' ' + data.user.lastName : ''),
          };
          
          console.log('Встановлюємо користувача з API:', userWithFullName);
          setUser(userWithFullName);
          
          localStorage.setItem('currentUser', JSON.stringify(userWithFullName));
        } else {
          console.log('Дані користувача відсутні в API відповіді');
          setUser(null);
        }
      } catch (error) {
        console.error('Помилка при отриманні користувача:', error);
        setUser(null);
      }
    }

    fetchUser();
    loadProjectData();

    const firstVisitFlag = localStorage.getItem("firstVisitDone");
    if (!firstVisitFlag) {
      setIsFirstVisit(true);
      localStorage.setItem("firstVisitDone", "true");
    }
  }, []);

  // Завантажуємо події календаря після встановлення користувача
  useEffect(() => {
    if (user?.email) {
      fetchCalendarEvents();
    }
  }, [user]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Завантажуємо активний тип проекту користувача через API
      const response = await apiRequest('/user-project');
      
      if (response.projectType) {
        setProjectType(response.projectType);
        
        // Завантажуємо глави для цього типу проекту
        const chaptersResponse = await apiRequest(`/user-chapters?projectType=${response.projectType}`);
        
        // Завантажуємо коментарі для кожної глави
        const chaptersWithComments = await Promise.all(
          chaptersResponse.map(async (chapter: ChapterData) => {
            try {
              const comments = await apiRequest(`/teacher-comments?projectType=${response.projectType}&chapterKey=${chapter.key}`);
              return { ...chapter, teacherComments: comments };
            } catch (error) {
              console.warn(`Error loading comments for chapter ${chapter.key}:`, error);
              return { ...chapter, teacherComments: [] };
            }
          })
        );
        
        setChapters(chaptersWithComments);
      } else {
        setProjectType(null);
        setChapters([]);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      setProjectType(null);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  // Функція для отримання динамічних даних про розділи
  const getChaptersStats = () => {
    if (!projectType || chapters.length === 0) {
      return {
        completed: 0,
        total: 0,
        displayText: '0/0'
      };
    }

    const totalChapters = chapters.length;
    const completedChapters = chapters.filter(chapter => 
      chapter.progress > 0 || chapter.uploadedFile
    ).length;
    
    return {
      completed: completedChapters,
      total: totalChapters,
      displayText: `${completedChapters}/${totalChapters}`
    };
  };

  // Функція для отримання динамічних даних про поточний проєкт
  const getCurrentWorkData = () => {
    if (!projectType || chapters.length === 0) {
      return {
        title: t('index.title'),
        supervisor: t('index.supervisor'),
        progress: 0,
        deadline: t('index.deadline'),
        status: 'Не обрано',
        completedChapters: 0,
        totalChapters: 0,
        uploadedChapters: 0
      };
    }

    const totalChapters = chapters.length;
    const totalProgress = totalChapters > 0 
      ? Math.round(chapters.reduce((sum, ch) => sum + ch.progress, 0) / totalChapters) 
      : 0;
    
    const completedChapters = chapters.filter(ch => ch.status === 'completed').length;
    const uploadedChapters = chapters.filter(ch => ch.progress > 0 || ch.uploadedFile).length;
    
    // Визначаємо назву проєкту на основі типу
    const projectTitles: Record<string, string> = {
      diploma: 'Дипломний проєкт',
      coursework: 'Курсова робота', 
      practice: 'Звіт з практики'
    };

    let status = 'Не розпочато';
    if (completedChapters === totalChapters && totalChapters > 0) {
      status = 'Завершено';
    } else if (uploadedChapters > 0) {
      status = 'В процесі';
    }

    return {
      title: projectTitles[projectType],
      supervisor: t('index.supervisor'),
      progress: totalProgress,
      deadline: t('index.deadline'),
      status,
      completedChapters,
      totalChapters,
      uploadedChapters
    };
  };

  const currentWork = getCurrentWorkData();

  // Генеруємо активність з календарних подій та системних подій
  const recentActivities = generateRecentActivities();

  // Оновлюємо quickStats з динамічними даними з API
  const chaptersStats = getChaptersStats();
  const quickStats = [
    {
      label: t('index.stats.overallProgress'),
      value: `${currentWork.progress}%`,
      icon: Target,
      change: currentWork.uploadedChapters > 0 ? `+${currentWork.uploadedChapters} розділів` : projectType ? t('index.stats.progressChange1') : t('index.stats.progressChange'),
      trend: currentWork.uploadedChapters > 0 ? 'up' : 'neutral',
    },
    {
      label: t('index.stats.chaptersReady'),
      value: chaptersStats.displayText,
      icon: BookOpen,
      change: currentWork.uploadedChapters > 0 ? t('index.stats.chaptersChange') : projectType ? t('index.stats.noChaptersYet') : t('index.stats.chaptersChange'),
      trend: currentWork.uploadedChapters > 0 ? 'up' : 'neutral',
    },
    {
      label: t('index.stats.daysLeft'),
      value: '12',
      icon: Clock,
      change: t('index.stats.urgent'),
      trend: 'down',
    },
    {
      label: t('index.stats.aiSuggestions'),
      value: '3',
      icon: Lightbulb,
      change: t('index.stats.newTips'),
      trend: 'up',
    },
  ];

  // Функція для отримання мілстоунів проєкту на основі реальних даних з API
  const getProjectMilestones = () => {
    if (!projectType || chapters.length === 0) return [];
    
    return chapters.map((chapter) => ({
      name: chapter.key,
      status: chapter.status,
      progress: chapter.progress
    }));
  };

  const projectMilestones = getProjectMilestones();

  const recommendations = [
    {
      title: t('index.aiRecommendations.literatureReview.title'),
      description: t('index.aiRecommendations.literatureReview.description'),
      icon: BookOpen,
      priority: t('index.aiRecommendations.literatureReview.priority'),
    },
    {
      title: t('index.aiRecommendations.methodology.title'),
      description: t('index.aiRecommendations.methodology.description'),
      icon: Users,
      priority: t('index.aiRecommendations.methodology.priority'),
    },
    {
      title: t('index.aiRecommendations.conclusion.title'),
      description: t('index.aiRecommendations.conclusion.description'),
      icon: TrendingUp,
      priority: t('index.aiRecommendations.conclusion.priority'),
    },
  ];

  // Показуємо індикатор завантаження для блоків прогресу
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Завантаження даних проекту...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - показується тільки на великих екранах */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar + Overlay - показується на всіх екранах менше md */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar Panel */}
          <div className="relative w-64 bg-background border-r shadow-xl z-50">
            <Sidebar />
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Header завжди присутній */}
        <Header />
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            {/* Контент з відступом зліва тільки на мобільних для бургер кнопки */}
            <div className="p-8 lg:p-8 space-y-8 pb-20 max-w-7xl mx-auto">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-primary">
                        {projectType === 'diploma' ? 'Дипломний проєкт' : 
                         projectType === 'coursework' ? 'Курсова робота' : 
                         projectType === 'practice' ? 'Звіт з практики' :
                         t('welcome.heading')}
                      </span>
                    </div>
                      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
                        {t('index.welcomeTitle', { name: user?.firstName || "Користувач"})}
                      </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-6">
                      {isFirstVisit ? t('index.encouragementFirstTime') : t('index.encouragement')}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <Target className="w-4 h-4 mr-2" />
                        {currentWork.progress}% завершено
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <Clock className="w-4 h-4 mr-2" />
                        {currentWork.deadline}
                      </Badge>
                      <Badge 
                        variant={currentWork.status === 'Завершено' ? 'default' : currentWork.status === 'В процесі' ? 'secondary' : 'outline'} 
                        className="px-4 py-2"
                      >
                        {currentWork.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:block ml-8">
                    <div className="w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary inline-block" />}
                          {stat.trend === 'down' && <Activity className="w-4 h-4 text-muted-foreground inline-block" />}
                          {stat.trend === 'neutral' && <div className="w-4 h-4 inline-block" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">{stat.label}</p>
                        <p className="text-sm text-muted-foreground">{stat.change}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm font-medium text-primary">
                              {projectType === 'diploma' ? 'Дипломний проєкт' :
                               projectType === 'coursework' ? 'Курсова робота' :
                               projectType === 'practice' ? 'Звіт з практики' :
                               t('index.proj')}
                            </span>
                          </div>
                          <CardTitle className="text-xl md:text-2xl font-bold mb-2">{t('index.projectProgress')}</CardTitle>
                          <CardDescription className="text-base">
                            {projectType ? currentWork.title : t('index.projType')}
                          </CardDescription>
                        </div>
                        {projectType && (
                          <div className="flex items-center space-x-3 p-4 border rounded-xl bg-muted/50">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary text-primary-foreground font-bold">ІІ</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-foreground">{t('index.supervisor')}</p>
                              <p className="text-sm text-muted-foreground">{t('index.supervisorName')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {projectType && projectMilestones.length > 0 ? (
                        <>
                          <div className="max-h-85 overflow-y-auto space-y-6 pr-2">
                            {projectMilestones.map((milestone, index) => {
                              const milestoneLabel = t(`thesis.chapters.${milestone.name}`);
                              return (
                                <div key={index} className="flex items-center space-x-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    milestone.status === 'completed'
                                      ? 'bg-primary text-primary-foreground'
                                      : milestone.status === 'inProgress' || milestone.status === 'review'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {milestone.status === 'completed' ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : milestone.status === 'inProgress' || milestone.status === 'review' ? (
                                      <Clock className="w-5 h-5" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full bg-current" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-foreground">{milestoneLabel}</span>
                                      <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                                    </div>
                                    <Progress value={milestone.progress} className="h-2" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
                            <Button asChild className="flex-1">
                              <Link to={`/tracker?type=${projectType}`}>
                                <FileText className="mr-2 h-4 w-4" /> {t('index.detailedView')}
                              </Link>
                            </Button>
                            <Button variant="outline" asChild className="flex-1">
                              <Link to="/chat">
                                <MessageSquare className="mr-2 h-4 w-4" /> {t('index.chatWithSupervisor')}
                              </Link>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
                            <Plus className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {t('index.projstart')}
                          </h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            {t('index.projDesc')}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                            <Button asChild className="flex-1">
                              <Link to="/tracker">
                                <Settings className="mr-2 h-4 w-4" />
                                {t('index.createButton')}
                              </Link>
                            </Button>
                            <Button variant="outline" asChild className="flex-1">
                              <Link to="/ai-assistant">
                                <Lightbulb className="mr-2 h-4 w-4" />
                                {t('index.AIhelp')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <CardTitle className="text-lg">{t('index.recentActivity.title')}</CardTitle>
                      </div>
                      <CardDescription>
                        {recentActivities.length === 0 
                          ? 'Немає недавньої активності'
                          : `${recentActivities.length} останніх подій`
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Немає подій для відображення</p>
                            <Button variant="outline" size="sm" className="mt-3" asChild>
                              <Link to="/calendar">
                                <Plus className="w-3 h-3 mr-1" />
                                Додати подію
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          recentActivities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                              <div key={activity.id} className="flex space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  activity.type === 'deadline' 
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                    : activity.type === 'meeting'
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    : activity.type === 'task'
                                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : activity.type === 'approval'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-muted'
                                }`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {activity.text}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {activity.time}
                                  </p>
                                  {activity.eventDate && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Calendar className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {format(activity.eventDate, 'dd MMM yyyy, HH:mm', { locale: currentLocale })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      {recentActivities.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link to="/calendar">
                              <Calendar className="w-4 h-4 mr-2" />
                              Переглянути календар
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{t('index.quickActions')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/ai-assistant">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          {t('index.aiAssistant')}
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/calendar">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          {t('index.planner')}
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/analytics">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <BarChart3 className="h-4 w-4 text-primary" />
                          </div>
                          {t('index.analytics')}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{t('index.aiRecommendations.title')}</CardTitle>
                      <CardDescription>{t('index.aiRecommendations.description')}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="p-6 border rounded-xl hover:bg-muted/50 transition-colors">
                          <div className={`inline-flex px-2 py-1 rounded text-xs font-medium mb-4 ${item.priority === 'Високий'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : item.priority === 'Середній'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                            {item.priority}
                          </div>
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                          <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                            {t('index.aiRecommendations.view')} <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;