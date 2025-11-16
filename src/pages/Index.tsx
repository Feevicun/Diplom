import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { IconType } from 'react-icons';
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
  Bookmark,
  GraduationCap,
  FileCheck,
  Library,
  Mic,
  Video,
  Download,
  Shield,
  Eye,
  PenTool,
  Search,
  Award,
  Brain,
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
  type: 'deadline' | 'meeting' | 'task';
  text: string;
  time: string;
  icon: IconType;
  eventDate?: Date;
}

// Тип для AI рекомендацій
interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  icon: IconType;
  priority: 'high' | 'medium' | 'low';
  category: 'writing' | 'research' | 'planning' | 'review' | 'defense' | 'resources';
  emoji: string;
  action?: string;
  relatedTo?: string;
}

// API функції
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
}

// API функції
const apiRequest = async (url: string, options: ApiOptions = {}) => {
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

// Компонент для іконки оновлення
const RefreshCw = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9c2.5 0 4.8 1 6.5 2.5L13 12" />
    <path d="M21 12v6h-6" />
  </svg>
);

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<UserType | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Стани для відстеження проєкту
  const [projectType, setProjectType] = useState<string | null>(null); 
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Локаль для форматування дат
  const currentLocale = i18n.language === 'ua' ? uk : enUS;

  // Динамічні кольори для теми системи
  const getThemeColors = () => {
    return {
      primary: {
        light: 'bg-primary/10 text-primary border-primary/20',
        medium: 'bg-primary/20 text-primary-foreground border-primary/30',
        dark: 'bg-primary text-primary-foreground border-primary'
      },
      secondary: {
        light: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
        medium: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
        dark: 'bg-secondary text-secondary-foreground border-secondary'
      },
      accent: {
        light: 'bg-accent/10 text-accent-foreground border-accent/20',
        medium: 'bg-accent/20 text-accent-foreground border-accent/30',
        dark: 'bg-accent text-accent-foreground border-accent'
      }
    };
  };

  // Спеціалізовані AI рекомендації для навчального проєкту
  const aiRecommendations: AIRecommendation[] = [
    // Написання
    {
      id: 'writing-1',
      title: i18n.language === 'ua' ? 'Покращте структуру вступу' : 'Improve Introduction Structure',
      description: i18n.language === 'ua' 
        ? 'Перевірте, чи чітко визначені мета, завдання та актуальність дослідження у вступі.'
        : 'Check if the purpose, objectives and relevance of the research are clearly defined in the introduction.',
      icon: FileText,
      priority: 'high',
      category: 'writing',
      emoji: '📝',
      relatedTo: 'introduction'
    },
    {
      id: 'writing-2',
      title: i18n.language === 'ua' ? 'Уніфікуйте термінологію' : 'Unify Terminology',
      description: i18n.language === 'ua'
        ? 'Переконайтесь, що ключові терміни використовуються послідовно по всій роботі.'
        : 'Make sure key terms are used consistently throughout the work.',
      icon: BookOpen,
      priority: 'medium',
      category: 'writing',
      emoji: '🔤'
    },
    {
      id: 'writing-3',
      title: i18n.language === 'ua' ? 'Перевірте форматування' : 'Check Formatting',
      description: i18n.language === 'ua'
        ? 'Перевірте відступи, міжрядкові інтервали та розмір шрифту згідно з вимогами.'
        : 'Check indents, line spacing and font size according to requirements.',
      icon: Settings,
      priority: 'medium',
      category: 'writing',
      emoji: '📐'
    },

    // Дослідження
    {
      id: 'research-1',
      title: i18n.language === 'ua' ? 'Оновіть літературу' : 'Update Literature',
      description: i18n.language === 'ua'
        ? 'Додайте 2-3 актуальні джерела за останні 3 роки для посилення теоретичної бази.'
        : 'Add 2-3 recent sources from the last 3 years to strengthen the theoretical basis.',
      icon: Library,
      priority: 'high',
      category: 'research',
      emoji: '📚',
      action: i18n.language === 'ua' ? 'Знайти джерела' : 'Find sources'
    },
    {
      id: 'research-2',
      title: i18n.language === 'ua' ? 'Аналіз цитувань' : 'Citation Analysis',
      description: i18n.language === 'ua'
        ? 'Перевірте, чи всі цитування відповідають вимогам стандарту та мають повні бібліографічні описи.'
        : 'Check if all citations meet standard requirements and have complete bibliographic descriptions.',
      icon: Search,
      priority: 'high',
      category: 'research',
      emoji: '🔍'
    },
    {
      id: 'research-3',
      title: i18n.language === 'ua' ? 'Методологічна узгодженість' : 'Methodological Consistency',
      description: i18n.language === 'ua'
        ? 'Переконайтесь, що методи дослідження узгоджені з метою роботи та правильно описані.'
        : 'Make sure research methods are consistent with the purpose of the work and properly described.',
      icon: Target,
      priority: 'medium',
      category: 'research',
      emoji: '🎯'
    },

    // Планування
    {
      id: 'planning-1',
      title: i18n.language === 'ua' ? 'Розклад на тиждень' : 'Weekly Schedule',
      description: i18n.language === 'ua'
        ? 'Створіть детальний план роботи на наступний тиждень з конкретними завданнями для кожного розділу.'
        : 'Create a detailed work plan for the next week with specific tasks for each chapter.',
      icon: Calendar,
      priority: 'medium',
      category: 'planning',
      emoji: '📅',
      action: i18n.language === 'ua' ? 'Створити план' : 'Create plan'
    },
    {
      id: 'planning-2',
      title: i18n.language === 'ua' ? 'Пріоритет завдань' : 'Task Prioritization',
      description: i18n.language === 'ua'
        ? 'Визначте 3 найважливіші завдання на сьогодні, що найбільше вплинуть на прогрес роботи.'
        : 'Identify 3 most important tasks for today that will most impact work progress.',
      icon: Award,
      priority: 'high',
      category: 'planning',
      emoji: '⭐'
    },
    {
      id: 'planning-3',
      title: i18n.language === 'ua' ? 'Консультація з керівником' : 'Supervisor Consultation',
      description: i18n.language === 'ua'
        ? 'Заплануйте зустріч з керівником для обговорення поточного прогресу та наступних кроків.'
        : 'Schedule a meeting with your supervisor to discuss current progress and next steps.',
      icon: Users,
      priority: 'medium',
      category: 'planning',
      emoji: '👥'
    },

    // Рецензування
    {
      id: 'review-1',
      title: i18n.language === 'ua' ? 'Перевірка на плагіат' : 'Plagiarism Check',
      description: i18n.language === 'ua'
        ? 'Проведіть самоперевірку роботи на унікальність перед поданням керівнику.'
        : 'Perform self-check of work for uniqueness before submitting to supervisor.',
      icon: Shield,
      priority: 'high',
      category: 'review',
      emoji: '🛡️',
      action: i18n.language === 'ua' ? 'Перевірити' : 'Check'
    },
    {
      id: 'review-2',
      title: i18n.language === 'ua' ? 'Вичитка тексту' : 'Proofreading',
      description: i18n.language === 'ua'
        ? 'Уважно перечитайте роботу на предмет граматичних та пунктуаційних помилок.'
        : 'Carefully reread the work for grammatical and punctuation errors.',
      icon: Eye,
      priority: 'medium',
      category: 'review',
      emoji: '✏️'
    },
    {
      id: 'review-3',
      title: i18n.language === 'ua' ? 'Перевірка послідовності' : 'Sequence Check',
      description: i18n.language === 'ua'
        ? 'Переконайтесь, що всі розділи логічно пов\'язані та ілюстрації відповідають тексту.'
        : 'Make sure all chapters are logically connected and illustrations match the text.',
      icon: CheckCircle,
      priority: 'medium',
      category: 'review',
      emoji: '🔗'
    },

    // Підготовка до захисту
    {
      id: 'defense-1',
      title: i18n.language === 'ua' ? 'Створення презентації' : 'Presentation Creation',
      description: i18n.language === 'ua'
        ? 'Розпочніть підготовку слайдів для захисту, виділивши ключові моменти роботи.'
        : 'Start preparing defense slides by highlighting key points of the work.',
      icon: Video,
      priority: 'low',
      category: 'defense',
      emoji: '📊'
    },
    {
      id: 'defense-2',
      title: i18n.language === 'ua' ? 'Текст виступу' : 'Speech Text',
      description: i18n.language === 'ua'
        ? 'Підготуйте тезисний план виступу на 7-10 хвилин, акцентуючи на найважливіших результатах.'
        : 'Prepare a thesis plan for a 7-10 minute speech, focusing on the most important results.',
      icon: Mic,
      priority: 'low',
      category: 'defense',
      emoji: '🎤'
    },
    {
      id: 'defense-3',
      title: i18n.language === 'ua' ? 'Передзахист' : 'Pre-defense',
      description: i18n.language === 'ua'
        ? 'Заплануйте пробний виступ перед друзями або родиною для відпрацювання навичок.'
        : 'Schedule a trial performance before friends or family to practice skills.',
      icon: GraduationCap,
      priority: 'low',
      category: 'defense',
      emoji: '🎓'
    },

    // Ресурси
    {
      id: 'resources-1',
      title: i18n.language === 'ua' ? 'Архівування роботи' : 'Work Archiving',
      description: i18n.language === 'ua'
        ? 'Зробіть резервні копії роботи в хмарних сховищах та на зовнішніх носіях.'
        : 'Make backup copies of work in cloud storage and on external media.',
      icon: Download,
      priority: 'high',
      category: 'resources',
      emoji: '💾',
      action: i18n.language === 'ua' ? 'Зберегти' : 'Save'
    },
    {
      id: 'resources-2',
      title: i18n.language === 'ua' ? 'Додаткові матеріали' : 'Additional Materials',
      description: i18n.language === 'ua'
        ? 'Підготуйте додатки, таблиці та графіки, що підтверджують результати дослідження.'
        : 'Prepare appendices, tables and graphs that confirm research results.',
      icon: FileCheck,
      priority: 'medium',
      category: 'resources',
      emoji: '📎'
    },
    {
      id: 'resources-3',
      title: i18n.language === 'ua' ? 'Список літератури' : 'Bibliography',
      description: i18n.language === 'ua'
        ? 'Перевірте повноту та правильність оформлення списку використаних джерел.'
        : 'Check the completeness and correctness of the bibliography.',
      icon: Bookmark,
      priority: 'medium',
      category: 'resources',
      emoji: '📖'
    }
  ];

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

  // Функція для генерації активності ВИКЛЮЧНО з календарних подій
  const generateRecentActivities = (): RecentActivity[] => {
    const calendarActivities: RecentActivity[] = calendarEvents
      .map(event => {
        const eventDate = new Date(event.date);
        let timeText = '';
        let activityText = '';
        
        if (isToday(eventDate)) {
          timeText = i18n.language === 'ua' 
            ? `сьогодні о ${format(eventDate, 'HH:mm')}`
            : `today at ${format(eventDate, 'HH:mm')}`;
        } else if (isTomorrow(eventDate)) {
          timeText = i18n.language === 'ua' ? 'завтра' : 'tomorrow';
        } else if (isYesterday(eventDate)) {
          timeText = i18n.language === 'ua' ? 'вчора' : 'yesterday';
        } else {
          timeText = formatDistanceToNow(eventDate, { 
            locale: currentLocale, 
            addSuffix: true 
          });
        }
        
        switch (event.type) {
          case 'deadline':
            activityText = i18n.language === 'ua' 
              ? `Дедлайн: ${event.title}`
              : `Deadline: ${event.title}`;
            break;
          case 'meeting':
            activityText = i18n.language === 'ua'
              ? `Зустріч: ${event.title}`
              : `Meeting: ${event.title}`;
            break;
          case 'task':
            activityText = i18n.language === 'ua'
              ? `Завдання: ${event.title}`
              : `Task: ${event.title}`;
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
      .sort((a, b) => {
        if (!a.eventDate || !b.eventDate) return 0;
        return a.eventDate.getTime() - b.eventDate.getTime();
      });
    
    return calendarActivities.slice(0, 3);
  };

  // Автоматична зміна рекомендацій кожні 10-15 хвилин
  useEffect(() => {
    const getRandomInterval = () => Math.floor(Math.random() * (900000 - 600000 + 1)) + 600000; // 10-15 хвилин
    
    const interval = setInterval(() => {
      setCurrentRecommendationIndex((prev) => 
        prev === aiRecommendations.length - 1 ? 0 : prev + 1
      );
      setAnimationKey(prev => prev + 1);
      setLastUpdateTime(new Date());
    }, getRandomInterval());

    return () => clearInterval(interval);
  }, [aiRecommendations.length]);

  // Функція для ручної зміни рекомендації
  const nextRecommendation = () => {
    setCurrentRecommendationIndex((prev) => 
      prev === aiRecommendations.length - 1 ? 0 : prev + 1
    );
    setAnimationKey(prev => prev + 1);
    setLastUpdateTime(new Date());
  };

  // Функція для отримання поточних рекомендацій (3 штуки)
  const getCurrentRecommendations = () => {
    const recommendations = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentRecommendationIndex + i) % aiRecommendations.length;
      recommendations.push(aiRecommendations[index]);
    }
    return recommendations;
  };

  // Функція для отримання кольорів теми для пріоритету
  const getPriorityTheme = (priority: 'high' | 'medium' | 'low') => {
    const theme = getThemeColors();
    switch (priority) {
      case 'high':
        return {
          bg: theme.primary.light,
          border: 'border-l-4 border-l-primary',
          icon: theme.primary.medium,
          badge: theme.primary.medium
        };
      case 'medium':
        return {
          bg: theme.secondary.light,
          border: 'border-l-4 border-l-secondary',
          icon: theme.secondary.medium,
          badge: theme.secondary.medium
        };
      case 'low':
        return {
          bg: theme.accent.light,
          border: 'border-l-4 border-l-accent',
          icon: theme.accent.medium,
          badge: theme.accent.medium
        };
      default:
        return {
          bg: 'bg-muted/50',
          border: 'border-l-4 border-l-muted',
          icon: 'bg-muted text-muted-foreground',
          badge: 'bg-muted text-muted-foreground'
        };
    }
  };

  // Функція для отримання іконки категорії
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'writing':
        return PenTool;
      case 'research':
        return Search;
      case 'planning':
        return Calendar;
      case 'review':
        return Eye;
      case 'defense':
        return GraduationCap;
      case 'resources':
        return FileCheck;
      default:
        return Lightbulb;
    }
  };

  // Функція для отримання назви категорії
  const getCategoryName = (category: string) => {
    const categories = {
      writing: i18n.language === 'ua' ? 'Написання' : 'Writing',
      research: i18n.language === 'ua' ? 'Дослідження' : 'Research',
      planning: i18n.language === 'ua' ? 'Планування' : 'Planning',
      review: i18n.language === 'ua' ? 'Рецензування' : 'Review',
      defense: i18n.language === 'ua' ? 'Захист' : 'Defense',
      resources: i18n.language === 'ua' ? 'Ресурси' : 'Resources'
    };
    return categories[category as keyof typeof categories] || category;
  };

  // Функція для форматування часу оновлення
  const getUpdateTimeText = () => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 60000);
    
    if (i18n.language === 'ua') {
      if (diffInMinutes < 1) return 'щойно оновлено';
      if (diffInMinutes === 1) return 'оновлено 1 хвилину тому';
      if (diffInMinutes < 5) return `оновлено ${diffInMinutes} хвилини тому`;
      return `оновлено ${diffInMinutes} хвилин тому`;
    } else {
      if (diffInMinutes < 1) return 'just updated';
      if (diffInMinutes === 1) return 'updated 1 minute ago';
      return `updated ${diffInMinutes} minutes ago`;
    }
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
            
            const userWithFirstName = {
              ...parsedUser,
              firstName: parsedUser.firstName || parsedUser.name?.split(' ')[0] || '',
              name: parsedUser.name || ''
            };
            
            setUser(userWithFirstName);
            console.log('Встановили користувача з localStorage:', userWithFirstName);
            return;
          } catch (error) {
            console.log('Помилка парсингу localStorage:', error);
          }
        }
        
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
      
      const response = await apiRequest('/user-project');
      
      if (response.projectType) {
        setProjectType(response.projectType);
        
        const chaptersResponse = await apiRequest(`/user-chapters?projectType=${response.projectType}`);
        
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
        status: i18n.language === 'ua' ? 'Не обрано' : 'Not selected',
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
    
    const projectTitles: Record<string, string> = {
      diploma: i18n.language === 'ua' ? 'Дипломний проєкт' : 'Diploma project',
      coursework: i18n.language === 'ua' ? 'Курсова робота' : 'Coursework', 
      practice: i18n.language === 'ua' ? 'Звіт з практики' : 'Practice report'
    };

    let status = i18n.language === 'ua' ? 'Не розпочато' : 'Not started';
    if (completedChapters === totalChapters && totalChapters > 0) {
      status = i18n.language === 'ua' ? 'Завершено' : 'Completed';
    } else if (uploadedChapters > 0) {
      status = i18n.language === 'ua' ? 'В процесі' : 'In progress';
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

  // Генеруємо активність ВИКЛЮЧНО з календарних подій
  const recentActivities = generateRecentActivities();

  // Оновлюємо quickStats з динамічними даними з API
  const chaptersStats = getChaptersStats();
  const quickStats = [
    {
      label: t('index.stats.overallProgress'),
      value: `${currentWork.progress}%`,
      icon: Target,
      change: currentWork.uploadedChapters > 0 
        ? (i18n.language === 'ua' ? `+${currentWork.uploadedChapters} розділів` : `+${currentWork.uploadedChapters} chapters`) 
        : projectType 
          ? t('index.stats.progressChange1') 
          : t('index.stats.progressChange'),
      trend: currentWork.uploadedChapters > 0 ? 'up' : 'neutral',
    },
    {
      label: t('index.stats.chaptersReady'),
      value: chaptersStats.displayText,
      icon: BookOpen,
      change: currentWork.uploadedChapters > 0 
        ? t('index.stats.chaptersChange') 
        : projectType 
          ? t('index.stats.noChaptersYet') 
          : t('index.stats.chaptersChange'),
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
      value: aiRecommendations.length.toString(),
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
              <p className="text-muted-foreground">
                {i18n.language === 'ua' ? 'Завантаження даних проекту...' : 'Loading project data...'}
              </p>
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
                        {projectType === 'diploma' 
                          ? (i18n.language === 'ua' ? 'Дипломний проєкт' : 'Diploma project')
                          : projectType === 'coursework' 
                            ? (i18n.language === 'ua' ? 'Курсова робота' : 'Coursework')
                            : projectType === 'practice' 
                              ? (i18n.language === 'ua' ? 'Звіт з практики' : 'Practice report')
                              : t('welcome.heading')}
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
                        {currentWork.progress}% {i18n.language === 'ua' ? 'завершено' : 'completed'}
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <Clock className="w-4 h-4 mr-2" />
                        {currentWork.deadline}
                      </Badge>
                      <Badge 
                        variant={currentWork.status === (i18n.language === 'ua' ? 'Завершено' : 'Completed') 
                          ? 'default' 
                          : currentWork.status === (i18n.language === 'ua' ? 'В процесі' : 'In progress') 
                            ? 'secondary' 
                            : 'outline'} 
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
                              {projectType === 'diploma' 
                                ? (i18n.language === 'ua' ? 'Дипломний проєкт' : 'Diploma project')
                                : projectType === 'coursework' 
                                  ? (i18n.language === 'ua' ? 'Курсова робота' : 'Coursework')
                                  : projectType === 'practice' 
                                    ? (i18n.language === 'ua' ? 'Звіт з практики' : 'Practice report')
                                    : t('index.proj')}
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
                        <CardTitle className="text-lg">
                          {i18n.language === 'ua' ? 'Остання активність' : 'Recent Activity'}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {recentActivities.length === 0 
                          ? (i18n.language === 'ua' ? 'Немає недавньої активності' : 'No recent activity')
                          : i18n.language === 'ua' 
                            ? `${recentActivities.length} останніх подій`
                            : `${recentActivities.length} recent events`
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              {i18n.language === 'ua' ? 'Немає подій для відображення' : 'No events to display'}
                            </p>
                            <Button variant="outline" size="sm" className="mt-3" asChild>
                              <Link to="/calendar">
                                <Plus className="w-3 h-3 mr-1" />
                                {i18n.language === 'ua' ? 'Додати подію' : 'Add event'}
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
                              {i18n.language === 'ua' ? 'Переглянути календар' : 'View calendar'}
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

              {/* Оновлений блок AI рекомендацій з динамічними кольорами теми */}
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {i18n.language === 'ua' ? 'Рекомендації для проєкту' : 'Project Recommendations'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {getUpdateTimeText()}
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {i18n.language === 'ua' ? 'Автооновлення' : 'Auto-update'}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={nextRecommendation}
                      className="border-primary/20 text-primary hover:bg-primary/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {i18n.language === 'ua' ? 'Оновити' : 'Refresh'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div 
                    key={animationKey}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {getCurrentRecommendations().map((recommendation, index) => {
                      const Icon = recommendation.icon;
                      const CategoryIcon = getCategoryIcon(recommendation.category);
                      const priorityText = i18n.language === 'ua' 
                        ? recommendation.priority === 'high' ? 'Високий' 
                          : recommendation.priority === 'medium' ? 'Середній' 
                          : 'Низький'
                        : recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1);

                      const theme = getPriorityTheme(recommendation.priority);

                      return (
                        <div
                          key={recommendation.id}
                          className={`p-5 border rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${theme.bg} ${theme.border} ${
                            index === 0 
                              ? 'animate-fade-in-up delay-75' 
                              : index === 1 
                                ? 'animate-fade-in-up delay-150' 
                                : 'animate-fade-in-up delay-225'
                          }`}
                        >
                          {/* Заголовок з іконкою та категорією */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.icon}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">
                                  {recommendation.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${theme.badge}`}
                                  >
                                    {priorityText}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CategoryIcon className="h-3 w-3" />
                                    {getCategoryName(recommendation.category)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-lg">
                              {recommendation.emoji}
                            </div>
                          </div>

                          {/* Опис */}
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                            {recommendation.description}
                          </p>

                          {/* Футер з додатковою інформацією */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/30">
                            <div className="flex-1">
                              {recommendation.action && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  {recommendation.action}
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                            {recommendation.relatedTo && (
                              <Badge variant="outline" className="text-xs">
                                {recommendation.relatedTo}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Інформація про систему */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((dot) => (
                            <div
                              key={dot}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                dot === (currentRecommendationIndex % 3) + 1
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span>
                          {currentRecommendationIndex + 1}/{aiRecommendations.length}
                        </span>
                      </div>
                    </div>
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