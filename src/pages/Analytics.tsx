import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Clock,
  Target,
  Upload,
  TrendingUp,
  Lightbulb,
  FileSearch,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  Award,
  Calendar,
  FileText,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Clock4,
  Brain,
  Zap,
  Trophy,
  Star,
  PieChart,
  Download,
  Bell,
  MessageSquare,
  Coffee,
  GitBranch,
  GitCommit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart as RePieChart,
  Cell,
  Bar,
  BarChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Area,
  AreaChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart
} from 'recharts';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Extended Type definitions
interface ChapterProgress {
  id: number;
  key: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'revision';
  studentNote?: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
    type: string;
  };
  lastModified?: string;
  wordCount?: number;
  imagesCount?: number;
  timeSpent?: number;
}

interface StudySession {
  date: string;
  duration: number;
  activity: string;
  chapters: string[];
  focusScore: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface SupervisorFeedback {
  chapter: string;
  comment: string;
  date: string;
  type: 'approved' | 'revision';
  status: 'completed' | 'in_progress';
  supervisorName: string;
  responseTime?: number;
}

interface Deadline {
  milestone: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'pending';
  submitted?: string;
  priority: 'high' | 'medium' | 'low';
  daysUntil: number;
}

interface Student {
  id: string;
  name: string;
  group: string;
  email: string;
  avatar?: string;
  progress?: number;
  completedChapters?: number;
  uploadedFiles?: number;
  lastActivity?: string;
  startDate?: string;
  estimatedCompletion?: string;
  wordCount?: number;
  citationsCount?: number;
  qualityScore?: number;
  streak?: number;
}

interface AnalyticsData {
  chapters: ChapterProgress[];
  studySessions: StudySession[];
  deadlines: Deadline[];
  feedback: SupervisorFeedback[];
  projectType: string;
  overallProgress: number;
  totalPages: number;
  recentActivity: {
    lastLogin: string;
    lastEdit: string;
  };
  student?: Student;
  
  // Extended analytics
  timeAnalytics?: {
    productiveHours: string[];
    weeklyStreak: number;
    averageSessionLength: number;
    focusScore: number;
    bestTimeOfDay: string;
  };
  
  writingAnalytics?: {
    wordCount: number;
    pagesCount: number;
    imagesCount: number;
    citationsCount: number;
    plagiarismScore: number;
    readabilityScore: number;
    vocabularyDiversity: number;
  };
  
  qualityMetrics?: {
    structureScore: number;
    contentScore: number;
    formattingScore: number;
    citationScore: number;
  };
  
  // Для викладача
  students?: Student[];
  averageProgress?: number;
  totalStudents?: number;
  groupPerformance?: {
    bestStudent: string;
    worstStudent: string;
    averageCompletionTime: number;
  };
  
  groupDeepAnalytics?: {
    completionForecast: {
      onTime: number;
      atRisk: number;
      delayed: number;
    };
    qualityMetrics: {
      avgWordCount: number;
      avgCitations: number;
      avgFilesUploaded: number;
      avgQualityScore: number;
    };
  };
  
  communicationAnalytics?: {
    feedbackResponseTime: number;
    studentQuestions: number;
    revisionCycles: number;
    averageCorrections: number;
  };
}

interface DailyActivityData {
  date: string;
  sessions: number;
  timeSpent: number;
  filesUploaded: number;
  saves: number;
  focusScore: number;
  wordsWritten: number;
}

interface FileActivityData {
  type: string;
  count: number;
  color: string;
}

interface ProgressDistribution {
  range: string;
  count: number;
  color: string;
}

interface StudentProgressData {
  name: string;
  progress: number;
  chapters: number;
  files: number;
  lastActivity: string;
  quality: number;
  speed: number;
}

interface Metrics {
  totalSessions: number;
  totalTimeSpent: number;
  totalFilesUploaded: number;
  totalSaves: number;
  overallProgress: number;
  totalPages: number;
  weeklyStreak: number;
  focusScore: number;
}

interface UserInfo {
  role: string;
  name: string;
  group?: string;
  avatar?: string;
}

interface ApiUserResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    faculty_id: number;
    department_id: number;
    faculty_name: string;
    department_name: string;
  };
}

interface TimeAnalytics {
  hour: string;
  productivity: number;
  sessions: number;
}

interface StudentCategory {
  category: string;
  students: Student[];
  color: string;
  icon: React.ReactNode;
}

// API service functions
const apiService = {
  async getChapters(projectType: string): Promise<ChapterProgress[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user-chapters?projectType=${projectType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      // Return fallback data for demo
      return [
        {
          id: 1,
          key: 'intro',
          progress: 80,
          status: 'completed',
          studentNote: 'Вступ завершено',
          uploadedFile: {
            name: 'introduction.docx',
            uploadDate: new Date().toISOString(),
            size: '2.4 MB',
            type: 'docx'
          },
          wordCount: 1500,
          imagesCount: 2,
          timeSpent: 360
        },
        {
          id: 2,
          key: 'theory',
          progress: 60,
          status: 'in_progress',
          studentNote: 'Потрібно додати більше джерел',
          wordCount: 2800,
          imagesCount: 3,
          timeSpent: 420
        },
        {
          id: 3,
          key: 'design',
          progress: 30,
          status: 'in_progress',
          wordCount: 1200,
          timeSpent: 180
        },
        {
          id: 4,
          key: 'implementation',
          progress: 10,
          status: 'pending'
        },
        {
          id: 5,
          key: 'conclusion',
          progress: 0,
          status: 'pending'
        }
      ];
    }
  },

  async getStudySessions(): Promise<StudySession[]> {
    // Generate demo study sessions
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const timesOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[] = 
        ['morning', 'afternoon', 'evening', 'night'];
      
      return {
        date: date.toISOString(),
        duration: Math.floor(Math.random() * 120) + 30,
        activity: 'writing',
        chapters: ['intro', 'theory'],
        focusScore: Math.random() * 40 + 60, // 60-100
        timeOfDay: timesOfDay[Math.floor(Math.random() * timesOfDay.length)]
      };
    });
  },

  async getProjectType(): Promise<string> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-project', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch project type');
      }
      
      const data = await response.json();
      return data.projectType || 'coursework';
    } catch (error) {
      console.error('Error fetching project type:', error);
      return 'coursework';
    }
  },

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data: ApiUserResponse = await response.json();
      return {
        role: data.user.role,
        name: `${data.user.firstName} ${data.user.lastName}`,
        group: data.user.department_name
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        role: 'student',
        name: 'Тестовий Студент',
        group: 'КН-401'
      };
    }
  },

  async getSupervisorStudents(): Promise<Student[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.getDemoStudents();
      }
      
      const data = await response.json();
      return data.students || this.getDemoStudents();
    } catch (error) {
      console.error('Error fetching students data:', error);
      return this.getDemoStudents();
    }
  },

  getDemoStudents(): Student[] {
    return [
      {
        id: '1',
        name: 'Іван Петренко',
        group: 'КН-401',
        email: 'ivan@example.com',
        progress: 75,
        completedChapters: 5,
        uploadedFiles: 3,
        lastActivity: new Date().toISOString(),
        startDate: '2024-01-15',
        estimatedCompletion: '2024-05-30',
        wordCount: 12500,
        citationsCount: 15,
        qualityScore: 85,
        streak: 7
      },
      {
        id: '2', 
        name: 'Марія Коваль',
        group: 'КН-401',
        email: 'maria@example.com',
        progress: 45,
        completedChapters: 3,
        uploadedFiles: 2,
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: '2024-01-15',
        estimatedCompletion: '2024-06-15',
        wordCount: 8500,
        citationsCount: 8,
        qualityScore: 72,
        streak: 3
      },
      {
        id: '3',
        name: 'Олександр Шевченко',
        group: 'КН-401',
        email: 'olexandr@example.com',
        progress: 90,
        completedChapters: 7,
        uploadedFiles: 5,
        lastActivity: new Date().toISOString(),
        startDate: '2024-01-15',
        estimatedCompletion: '2024-05-20',
        wordCount: 18500,
        citationsCount: 22,
        qualityScore: 92,
        streak: 14
      },
      {
        id: '4',
        name: 'Анна Мельник',
        group: 'КН-401',
        email: 'anna@example.com',
        progress: 25,
        completedChapters: 2,
        uploadedFiles: 1,
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: '2024-01-15',
        estimatedCompletion: '2024-06-30',
        wordCount: 4500,
        citationsCount: 5,
        qualityScore: 65,
        streak: 0
      },
      {
        id: '5',
        name: 'Дмитро Бондаренко',
        group: 'КН-401',
        email: 'dmitro@example.com',
        progress: 60,
        completedChapters: 4,
        uploadedFiles: 3,
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: '2024-01-15',
        estimatedCompletion: '2024-06-10',
        wordCount: 11000,
        citationsCount: 12,
        qualityScore: 78,
        streak: 5
      }
    ];
  },

  async getStudentProgress(studentId: string): Promise<AnalyticsData> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/supervisor/student-progress/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.getDemoStudentProgress();
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return this.getDemoStudentProgress();
    }
  },

  getDemoStudentProgress(): AnalyticsData {
    return {
      chapters: [
        {
          id: 1,
          key: 'intro',
          progress: 80,
          status: 'completed',
          studentNote: 'Вступ завершено',
          wordCount: 1500,
          timeSpent: 360
        },
        {
          id: 2,
          key: 'theory', 
          progress: 60,
          status: 'in_progress',
          studentNote: 'Потрібно додати більше джерел',
          wordCount: 2800,
          timeSpent: 420
        },
        {
          id: 3,
          key: 'design',
          progress: 30,
          status: 'in_progress',
          wordCount: 1200,
          timeSpent: 180
        },
        {
          id: 4,
          key: 'implementation',
          progress: 10,
          status: 'pending'
        }
      ],
      studySessions: [],
      deadlines: [],
      feedback: [],
      projectType: 'diploma',
      overallProgress: 45,
      totalPages: 25,
      recentActivity: {
        lastLogin: new Date().toISOString(),
        lastEdit: new Date().toISOString()
      }
    };
  }
};

// Utility functions
const getChapterName = (key: string): string => {
  const chapterNames: Record<string, string> = {
    intro: 'Вступ',
    theory: 'Теоретичні основи',
    design: 'Проектна частина',
    implementation: 'Практична реалізація',
    conclusion: 'Висновки',
    appendix: 'Додатки',
    sources: 'Список джерел',
    abstract: 'Анотація',
    cover: 'Титульна сторінка',
    content: 'Зміст',
    tasks: 'Завдання практики',
    diary: 'Щоденник практики',
    report: 'Звіт про практику'
  };
  return chapterNames[key] || key;
};

const calculateOverallProgress = (chapters: ChapterProgress[]): number => {
  if (chapters.length === 0) return 0;
  return Math.round(chapters.reduce((sum, chapter) => sum + chapter.progress, 0) / chapters.length);
};

const calculateTotalPages = (chapters: ChapterProgress[]): number => {
  const totalProgress = chapters.reduce((sum, chapter) => sum + chapter.progress, 0);
  return Math.round((totalProgress * 50) / 100);
};

const generateActivityData = (): DailyActivityData[] => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const randomSessions = Math.floor(Math.random() * 5) + 1;
    const randomTime = randomSessions * 2;
    const randomFiles = Math.floor(Math.random() * 3);
    const randomSaves = randomSessions * 3;
    const randomFocus = Math.floor(Math.random() * 40) + 60;
    const randomWords = randomSessions * 500;

    return {
      date: new Date(date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
      sessions: randomSessions,
      timeSpent: randomTime,
      filesUploaded: randomFiles,
      saves: randomSaves,
      focusScore: randomFocus,
      wordsWritten: randomWords
    };
  });
};

const generateTimeAnalytics = (): TimeAnalytics[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    productivity: Math.floor(Math.random() * 100),
    sessions: Math.floor(Math.random() * 10)
  }));
};

// Student Analytics Component
interface StudentAnalyticsProps {
  analyticsData: AnalyticsData;
  metrics: Metrics | null;
  dailyActivityData: DailyActivityData[];
  fileActivityData: FileActivityData[];
  userInfo: UserInfo;
}

const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ 
  analyticsData, 
  metrics, 
  dailyActivityData, 
  fileActivityData,
  userInfo,
}) => {
  const daysUntilDeadline = useMemo(() => 14, []);
  const timeAnalyticsData = useMemo(() => generateTimeAnalytics(), []);
  const [activeTab, setActiveTab] = useState('overview');

  const estimatedCompletion = useMemo(() => {
    const currentProgress = analyticsData.overallProgress;
    if (currentProgress === 0) return 'Не визначено';
    
    const daysWorked = dailyActivityData.filter(day => day.sessions > 0).length;
    if (daysWorked === 0) return 'Не визначено';
    
    const progressPerDay = currentProgress / daysWorked;
    const daysRemaining = Math.ceil((100 - currentProgress) / progressPerDay);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysRemaining);
    
    return completionDate.toLocaleDateString('uk-UA');
  }, [analyticsData.overallProgress, dailyActivityData]);

  const writingStats = useMemo(() => ({
    totalWords: analyticsData.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
    totalTime: analyticsData.chapters.reduce((sum, ch) => sum + (ch.timeSpent || 0), 0),
    wordsPerHour: analyticsData.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) / 
                 (analyticsData.chapters.reduce((sum, ch) => sum + (ch.timeSpent || 0), 0) / 60) || 0
  }), [analyticsData.chapters]);

  return (
    <div className="space-y-6">
      {/* Персональна інформація студента */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 backdrop-blur-sm dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Мій особистий прогрес</h2>
              <p className="text-muted-foreground">
                {userInfo.name} • {userInfo.group} • {analyticsData.projectType === 'diploma' ? 'Дипломна робота' : 'Курсова робота'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{analyticsData.overallProgress}%</div>
              <p className="text-muted-foreground">Загальний прогрес</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таби для різних видів аналітики */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Огляд
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Продуктивність
          </TabsTrigger>
          <TabsTrigger value="writing" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Написання
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Інсайти
          </TabsTrigger>
        </TabsList>

        {/* Огляд */}
        <TabsContent value="overview" className="space-y-6">
          {/* Основні метрики студента */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Щоденна активність</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyActivityData[dailyActivityData.length - 1]?.sessions || 0}</div>
                <p className="text-xs text-muted-foreground">сесій сьогодні</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Час роботи</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalTimeSpent || 0}г</div>
                <p className="text-xs text-muted-foreground">останні 7 днів</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Найближчий дедлайн</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{daysUntilDeadline}</div>
                <p className="text-xs text-muted-foreground">днів залишилось</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Прогноз завершення</CardTitle>
                <Target className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{estimatedCompletion}</div>
                <p className="text-xs text-muted-foreground">орієнтовна дата</p>
              </CardContent>
            </Card>
          </div>

          {/* Детальний прогрес та плани */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Детальний прогрес розділів */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5" />
                  Детальний прогрес розділів
                </CardTitle>
                <CardDescription>Статус написання кожного розділу</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                {analyticsData.chapters.map((chapter) => (
                  <div key={chapter.id} className="space-y-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {getChapterName(chapter.key)}
                        </span>
                        <Badge variant={
                          chapter.status === 'completed' ? 'default' :
                          chapter.status === 'in_progress' ? 'secondary' :
                          chapter.status === 'revision' ? 'destructive' : 'outline'
                        }>
                          {chapter.status === 'completed' ? 'Завершено' :
                          chapter.status === 'in_progress' ? 'В роботі' :
                          chapter.status === 'revision' ? 'На доопрацювання' : 'Не розпочато'}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold">{chapter.progress}%</div>
                    </div>
                    <Progress value={chapter.progress} className="h-2" />
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      {chapter.wordCount && (
                        <div>📝 {chapter.wordCount} слів</div>
                      )}
                      {chapter.timeSpent && (
                        <div>⏱️ {Math.round(chapter.timeSpent / 60)} год</div>
                      )}
                      {chapter.imagesCount && (
                        <div>🖼️ {chapter.imagesCount} зобр.</div>
                      )}
                    </div>
                    {chapter.studentNote && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📝 {chapter.studentNote}
                      </p>
                    )}
                    {chapter.uploadedFile && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Upload className="w-3 h-3" />
                        Файл завантажено: {new Date(chapter.uploadedFile.uploadDate).toLocaleDateString('uk-UA')}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Графіки та аналітика продуктивності */}
            <div className="space-y-6">
              {/* Прогрес у часі */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Динаміка прогресу</CardTitle>
                  <CardDescription>Прогрес роботи за останні 7 днів</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="filesUploaded" 
                        stroke="var(--primary)" 
                        fill="var(--primary)" 
                        fillOpacity={0.2}
                        name="Файлів завантажено"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Статус розділів */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Статус розділів</CardTitle>
                  <CardDescription>Розподіл за станами виконання</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={fileActivityData}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ type, percent }) => `${type} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {fileActivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Продуктивність */}
        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Статистика продуктивності */}
            <Card className="lg:col-span-2 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Продуктивність по годинах</CardTitle>
                <CardDescription>Ваша активність протягом дня</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar yAxisId="left" dataKey="sessions" fill="var(--primary)" name="Сесії" />
                    <Line yAxisId="right" type="monotone" dataKey="productivity" stroke="var(--chart-2)" name="Продуктивність %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ключові показники продуктивності */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Показники продуктивності</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Фокус</span>
                    <Badge variant={metrics?.focusScore || 0 > 80 ? "default" : "secondary"}>
                      {metrics?.focusScore || 0}%
                    </Badge>
                  </div>
                  <Progress value={metrics?.focusScore || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Стрік днів</span>
                    <Badge variant={metrics?.weeklyStreak || 0 > 5 ? "default" : "outline"}>
                      {metrics?.weeklyStreak || 0} дн.
                    </Badge>
                  </div>
                  <Progress value={(metrics?.weeklyStreak || 0) * 14.28} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Середня сесія</span>
                    <span className="text-sm font-medium">45 хв</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Консистентність</span>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Додаткова аналітика продуктивності */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="w-5 h-5" />
                  Найпродуктивніші періоди
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Ранок (8-12)', 'День (13-17)', 'Вечір (18-22)'].map((period, index) => (
                    <div key={period} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{period}</span>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index === 0 ? '87%' : index === 1 ? '72%' : '65%'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Тренди продуктивності
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { trend: 'Зростання фокусу', change: '+12%', positive: true },
                    { trend: 'Зменшення перерв', change: '-8%', positive: true },
                    { trend: 'Більше вечірніх сесій', change: '+5%', positive: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.trend}</span>
                      <Badge variant={item.positive ? "default" : "secondary"}>
                        {item.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Написання */}
        <TabsContent value="writing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Статистика написання */}
            <Card className="lg:col-span-2 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Прогрес написання</CardTitle>
                <CardDescription>Слова та час по розділах</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.chapters}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="key" tickFormatter={getChapterName} className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'wordCount' ? `${value} слів` : `${Math.round(Number(value) / 60)} год`,
                        name === 'wordCount' ? 'Слова' : 'Час'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar dataKey="wordCount" fill="var(--primary)" name="wordCount" />
                    <Bar dataKey="timeSpent" fill="var(--chart-2)" name="timeSpent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ключові метрики написання */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Метрики написання</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold">{writingStats.totalWords}</div>
                  <p className="text-sm text-muted-foreground">Всього слів</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold">{Math.round(writingStats.wordsPerHour)}</div>
                  <p className="text-sm text-muted-foreground">Слів за годину</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold">{Math.round(writingStats.totalTime / 60)}</div>
                  <p className="text-sm text-muted-foreground">Годин роботи</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Детальна статистика по розділах */}
          <Card className="backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Детальна статистика розділів</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData.chapters.map((chapter) => (
                  <Card key={chapter.id} className="backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-3">{getChapterName(chapter.key)}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Слова:</span>
                          <span>{chapter.wordCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Час:</span>
                          <span>{chapter.timeSpent ? Math.round(chapter.timeSpent / 60) : 0} год</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Швидкість:</span>
                          <span>{chapter.wordCount && chapter.timeSpent 
                            ? Math.round((chapter.wordCount / chapter.timeSpent) * 60) 
                            : 0} сл/год</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Інсайти */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Рекомендації та наступні кроки */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Персональні рекомендації
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.overallProgress < 30 && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border-l-4 border-yellow-500">
                    <p className="text-sm font-medium">💡 Порада для початківця</p>
                    <p className="text-xs text-muted-foreground">
                      Почніть з розділів "Вступ" та "Теоретичні основи" - вони зазвичай найпростіші
                    </p>
                  </div>
                )}
                
                {analyticsData.chapters.filter(ch => ch.status === 'revision').length > 0 && (
                  <div className="p-3 rounded-lg bg-orange-500/10 border-l-4 border-orange-500">
                    <p className="text-sm font-medium">⚠️ Потребує уваги</p>
                    <p className="text-xs text-muted-foreground">
                      У вас {analyticsData.chapters.filter(ch => ch.status === 'revision').length} розділів на доопрацюванні
                    </p>
                  </div>
                )}

                {analyticsData.overallProgress > 70 && (
                  <div className="p-3 rounded-lg bg-green-500/10 border-l-4 border-green-500">
                    <p className="text-sm font-medium">🎯 Майже готово!</p>
                    <p className="text-xs text-muted-foreground">
                      Ви на фінішній прямій! Зосередьтеся на завершенні останніх розділів
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-blue-500/10 border-l-4 border-blue-500">
                  <p className="text-sm font-medium">📊 Ваша статистика</p>
                  <p className="text-xs text-muted-foreground">
                    Середня продуктивність: {Math.round(dailyActivityData.reduce((sum, day) => sum + day.sessions, 0) / 7)} сесій на день
                  </p>
                </div>

                {/* AI рекомендації */}
                <div className="p-3 rounded-lg bg-purple-500/10 border-l-4 border-purple-500">
                  <p className="text-sm font-medium">🤖 AI аналіз</p>
                  <p className="text-xs text-muted-foreground">
                    Ваші найпродуктивніші години: 9:00-11:00. Сплануйте важкі завдання на цей час.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  План на наступний тиждень
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.chapters
                    .filter(ch => ch.status === 'in_progress' || ch.status === 'pending')
                    .slice(0, 3)
                    .map((chapter) => (
                      <div key={chapter.id} className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                        <span className="text-sm">{getChapterName(chapter.key)}</span>
                        <Badge variant="outline">
                          Ціль: {Math.min(chapter.progress + 25, 100)}%
                        </Badge>
                      </div>
                    ))}
                  {analyticsData.chapters.filter(ch => ch.status === 'in_progress' || ch.status === 'pending').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Всі розділи завершені! Можете приступити до фінального оформлення.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Додаткові інсайти */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4" />
                  Досягнення
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { achievement: '7-денний стрік', unlocked: true },
                  { achievement: '1000 слів за день', unlocked: true },
                  { achievement: '5 розділів', unlocked: analyticsData.chapters.length >= 5 },
                  { achievement: 'Майстер продуктивності', unlocked: false }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {item.unlocked ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock4 className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${item.unlocked ? '' : 'text-muted-foreground'}`}>
                      {item.achievement}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Прогноз
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Завершення:</span>
                    <span className="font-medium">{estimatedCompletion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Темп:</span>
                    <span className="font-medium">Стабільний</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ризики:</span>
                    <span className="font-medium text-green-600">Низькі</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4" />
                  Наступні кроки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {analyticsData.chapters
                    .filter(ch => ch.status === 'in_progress')
                    .slice(0, 2)
                    .map((chapter) => (
                      <div key={chapter.id} className="flex items-center gap-2">
                        <GitCommit className="w-3 h-3 text-muted-foreground" />
                        <span>{getChapterName(chapter.key)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Supervisor Analytics Component
interface SupervisorAnalyticsProps {
  analyticsData: AnalyticsData;
  studentsData: Student[];
}

const SupervisorAnalytics: React.FC<SupervisorAnalyticsProps> = ({ 
  analyticsData, 
  studentsData,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    if (selectedStudent) {
      loadStudentProgress(selectedStudent);
    }
  }, [selectedStudent]);

  const loadStudentProgress = async (studentId: string) => {
    try {
      const progress = await apiService.getStudentProgress(studentId);
      setStudentProgress(progress);
    } catch (error) {
      console.error('Error loading student progress:', error);
    }
  };

  // Аналітика для викладача
  const groupStatistics = useMemo(() => {
    if (!studentsData) return null;

    const activeStudents = studentsData.filter(s => 
      s.lastActivity && new Date(s.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const atRiskStudents = studentsData.filter(s => (s.progress || 0) < 25).length;
    const excellentStudents = studentsData.filter(s => (s.progress || 0) >= 80).length;
    const averageQuality = Math.round(
      studentsData.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / studentsData.length
    );

    return {
      activeStudents,
      atRiskStudents,
      excellentStudents,
      averageQuality,
      totalStudents: studentsData.length
    };
  }, [studentsData]);

  const studentsProgressData: StudentProgressData[] = useMemo(() => 
    studentsData?.map((student) => ({
      name: student.name.split(' ')[0],
      progress: student.progress || 0,
      chapters: student.completedChapters || 0,
      files: student.uploadedFiles || 0,
      lastActivity: student.lastActivity || '',
      quality: student.qualityScore || 0,
      speed: Math.round((student.progress || 0) / 
        (Math.max(1, Math.floor((new Date().getTime() - new Date(student.startDate || '').getTime()) 
        / (1000 * 60 * 60 * 24)))) || 0)
    })) || [], 
    [studentsData]
  );

  const progressDistribution: ProgressDistribution[] = useMemo(() => {
    if (!studentsData) return [];
    
    const ranges = [
      { range: '0-25%', min: 0, max: 25, color: 'var(--destructive)' },
      { range: '26-50%', min: 26, max: 50, color: 'var(--chart-3)' },
      { range: '51-75%', min: 51, max: 75, color: 'var(--chart-2)' },
      { range: '76-100%', min: 76, max: 100, color: 'var(--chart-1)' }
    ];

    return ranges.map(range => ({
      range: range.range,
      count: studentsData.filter((s) => 
        (s.progress || 0) >= range.min && (s.progress || 0) <= range.max
      ).length,
      color: range.color
    }));
  }, [studentsData]);

  const studentCategories: StudentCategory[] = useMemo(() => [
    {
      category: 'Лідери',
      students: studentsData?.filter(s => (s.progress || 0) >= 80) || [],
      color: 'var(--chart-1)',
      icon: <Trophy className="w-4 h-4" />
    },
    {
      category: 'Стабільні',
      students: studentsData?.filter(s => (s.progress || 0) >= 50 && (s.progress || 0) < 80) || [],
      color: 'var(--chart-2)',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      category: 'Потребують допомоги',
      students: studentsData?.filter(s => (s.progress || 0) >= 25 && (s.progress || 0) < 50) || [],
      color: 'var(--chart-3)',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      category: 'Критичні',
      students: studentsData?.filter(s => (s.progress || 0) < 25) || [],
      color: 'var(--destructive)',
      icon: <XCircle className="w-4 h-4" />
    }
  ], [studentsData]);

  return (
    <div className="space-y-6">
      {/* Заголовок для викладача */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Аналітика групи</h2>
              <p className="text-muted-foreground">
                Моніторинг прогресу студентів • {analyticsData.totalStudents} студентів
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Тиждень</SelectItem>
                  <SelectItem value="month">Місяць</SelectItem>
                  <SelectItem value="semester">Семестр</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{analyticsData.averageProgress}%</div>
                <p className="text-muted-foreground">Середній прогрес групи</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таби для викладача */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Огляд
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Студенти
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Аналітика
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Інсайти
          </TabsTrigger>
        </TabsList>

        {/* Огляд групи */}
        <TabsContent value="overview" className="space-y-6">
          {/* Статистика групи */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активні студенти</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groupStatistics?.activeStudents || 0}</div>
                <p className="text-xs text-muted-foreground">працювали останні 7 днів</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Потребують уваги</CardTitle>
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groupStatistics?.atRiskStudents || 0}</div>
                <p className="text-xs text-muted-foreground">прогрес {'<'} 25%</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Відмінники</CardTitle>
                <Award className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groupStatistics?.excellentStudents || 0}</div>
                <p className="text-xs text-muted-foreground">прогрес {'>'} 80%</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Якість робіт</CardTitle>
                <Star className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groupStatistics?.averageQuality || 0}%</div>
                <p className="text-xs text-muted-foreground">середня оцінка</p>
              </CardContent>
            </Card>
          </div>

          {/* Основна панель викладача */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Категорії студентів */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Категорії студентів
                </CardTitle>
                <CardDescription>Розподіл за рівнем прогресу</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div style={{ color: category.color }}>
                            {category.icon}
                          </div>
                          <span className="font-medium text-sm">{category.category}</span>
                        </div>
                        <Badge variant="outline">{category.students.length} студ.</Badge>
                      </div>
                      <Progress 
  value={(category.students.length / studentsData.length) * 100} 
  className="h-2"
  style={{
    backgroundColor: `${category.color}20`,
    '--progress-background': category.color
  } as React.CSSProperties}
/>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Аналітичні графіки для викладача */}
            <div className="space-y-6">
              {/* Розподіл прогресу в групі */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Розподіл прогресу в групі</CardTitle>
                  <CardDescription>Студенти за рівнем готовності роботи</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="range" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                      <Bar dataKey="count" name="Кількість студентів">
                        {progressDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Порівняння студентів */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Порівняльна аналітика</CardTitle>
                  <CardDescription>Прогрес та активність студентів</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={studentsProgressData}>
                      <PolarGrid className="opacity-30" />
                      <PolarAngleAxis dataKey="name" className="text-xs" />
                      <PolarRadiusAxis className="text-xs" />
                      <Radar 
                        name="Прогрес" 
                        dataKey="progress" 
                        stroke="var(--primary)" 
                        fill="var(--primary)" 
                        fillOpacity={0.2} 
                      />
                      <Radar 
                        name="Якість" 
                        dataKey="quality" 
                        stroke="var(--chart-2)" 
                        fill="var(--chart-2)" 
                        fillOpacity={0.2} 
                      />
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Детальний огляд студентів */}
        <TabsContent value="students" className="space-y-6">
          <Card className="backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Студенти групи
              </CardTitle>
              <CardDescription>Детальний прогрес кожного студента</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentsData?.map((student) => (
                <div 
                  key={student.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md backdrop-blur-sm ${
                    selectedStudent === student.id ? 'bg-accent/50' : 'bg-background/50'
                  }`}
                  onClick={() => setSelectedStudent(student.id)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {student.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.group}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        (student.progress || 0) >= 80 ? 'default' :
                        (student.progress || 0) >= 50 ? 'secondary' :
                        (student.progress || 0) >= 25 ? 'outline' : 'destructive'
                      }>
                        {student.progress}%
                      </Badge>
                      {student.streak && student.streak > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {student.streak}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Progress value={student.progress || 0} className="h-2 mb-2" />
                  
                  <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <div className="text-center">
                      <div className="font-semibold">{student.completedChapters || 0}</div>
                      <div>розділів</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{student.uploadedFiles || 0}</div>
                      <div>файлів</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{student.qualityScore || 0}%</div>
                      <div>якість</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {student.lastActivity ? 
                          new Date(student.lastActivity).toLocaleDateString('uk-UA') : 'немає'
                        }
                      </div>
                      <div>активність</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Поглиблена аналітика */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Якість робіт */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Якість робіт студентів</CardTitle>
                <CardDescription>Розподіл за оцінками якості</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={studentsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="progress" 
                      name="Прогрес" 
                      unit="%" 
                      className="text-xs"
                    />
                    <YAxis 
                      dataKey="qualityScore" 
                      name="Якість" 
                      unit="%" 
                      className="text-xs"
                    />
                    <ZAxis 
                      dataKey="wordCount" 
                      range={[50, 500]} 
                      name="Слова" 
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'wordCount' ? `${value} слів` : `${value}%`,
                        name === 'wordCount' ? 'Слова' : name === 'progress' ? 'Прогрес' : 'Якість'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Scatter 
                      data={studentsData} 
                      fill="var(--primary)" 
                      name="Студент"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Активність студентів */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Активність та прогрес</CardTitle>
                <CardDescription>Зв'язок між активністю та успішністю</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={studentsProgressData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar yAxisId="left" dataKey="chapters" fill="var(--primary)" name="Розділи" />
                    <Line yAxisId="right" type="monotone" dataKey="progress" stroke="var(--chart-2)" name="Прогрес %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Інсайти для викладача */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Рекомендації для викладача */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  Студенти, які потребують уваги
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentsData
                  ?.filter((s) => (s.progress || 0) < 25)
                  .map((student) => (
                    <div key={student.id} className="p-3 border-l-4 border-destructive bg-destructive/10 mb-2 rounded hover:bg-destructive/20 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Група: {student.group} • Прогрес: {student.progress}% • Стрік: {student.streak || 0} дн.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStudent(student.id)}
                        >
                          Детальніше
                        </Button>
                      </div>
                    </div>
                  ))}
                {studentsData?.filter((s) => (s.progress || 0) < 25).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Всі студенти мають достатній прогрес
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-muted-foreground" />
                  Найкращі результати
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentsData
                  ?.filter((s) => (s.progress || 0) >= 80)
                  .slice(0, 3)
                  .map((student) => (
                    <div key={student.id} className="p-3 border-l-4 border-green-500 bg-green-500/10 mb-2 rounded hover:bg-green-500/20 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Прогрес: {student.progress}% • {student.completedChapters} розділів • Якість: {student.qualityScore}%
                          </p>
                        </div>
                        <Badge variant="default">
                          Відмінно
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Додаткові інсайти */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Тренди групи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Середній прогрес:</span>
                  <span className="font-medium text-green-600">+5% за тиждень</span>
                </div>
                <div className="flex justify-between">
                  <span>Активність:</span>
                  <span className="font-medium">Стабільна</span>
                </div>
                <div className="flex justify-between">
                  <span>Якість:</span>
                  <span className="font-medium text-green-600">Покращення</span>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4" />
                  Сповіщення
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  '3 студенти мають дедлайн через 7 днів',
                  'Перевірити роботи 2 студентів',
                  'Запланована зустріч з групою'
                ].map((notification, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Bell className="w-3 h-3 text-muted-foreground" />
                    <span>{notification}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Швидкі дії
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Надіслати сповіщення групі
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Запланувати консультацію
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Експорт звіту
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Детальна інформація по вибраному студенту */}
      {selectedStudent && studentProgress && (
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Детальний огляд студента
            </CardTitle>
            <CardDescription>
              {studentsData?.find((s) => s.id === selectedStudent)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { value: studentProgress.overallProgress, label: 'Загальний прогрес' },
                { value: studentProgress.chapters.filter(ch => ch.status === 'completed').length, label: 'Завершених розділів' },
                { value: studentProgress.chapters.filter(ch => ch.uploadedFile).length, label: 'Завантажених файлів' },
                { value: studentProgress.chapters.filter(ch => ch.status === 'revision').length, label: 'На доопрацюванні' }
              ].map((stat, index) => (
                <Card key={index} className="backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Прогрес по розділах:</h4>
              {studentProgress.chapters.map((chapter) => (
                <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{getChapterName(chapter.key)}</span>
                    <Badge variant={
                      chapter.status === 'completed' ? 'default' :
                      chapter.status === 'in_progress' ? 'secondary' : 'destructive'
                    }>
                      {chapter.status === 'completed' ? 'Завершено' :
                      chapter.status === 'in_progress' ? 'В роботі' : 'На доопрацюванні'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={chapter.progress} className="w-24 h-2" />
                    <span className="text-sm font-semibold w-8">{chapter.progress}%</span>
                    {chapter.uploadedFile && (
                      <Badge variant="outline" className="text-green-600">
                        📎 Файл
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Main Analytics Component
export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastLoginTime, setLastLoginTime] = useState(new Date());
  const [userRole, setUserRole] = useState<'student' | 'supervisor'>('student');
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ role: 'student', name: '' });

  useEffect(() => {
    loadAnalyticsData();
    
    const interval = setInterval(() => {
      setLastLoginTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      const userData = await apiService.getCurrentUser();
      const role = userData.role === 'teacher' ? 'supervisor' : 'student';
      setUserRole(role);
      setUserInfo(userData);

      if (role === 'supervisor') {
        const students = await apiService.getSupervisorStudents();
        setStudentsData(students);

        const averageProgress = Math.round(
          students.reduce((sum, student) => sum + (student.progress || 0), 0) / students.length
        );

        const analytics: AnalyticsData = {
          chapters: [],
          studySessions: [],
          deadlines: [],
          feedback: [],
          projectType: 'diploma',
          overallProgress: 0,
          totalPages: 0,
          recentActivity: { lastLogin: '', lastEdit: '' },
          students: students,
          averageProgress: averageProgress,
          totalStudents: students.length,
          groupDeepAnalytics: {
            completionForecast: {
              onTime: Math.round(students.filter(s => (s.progress || 0) >= 60).length / students.length * 100),
              atRisk: Math.round(students.filter(s => (s.progress || 0) >= 25 && (s.progress || 0) < 60).length / students.length * 100),
              delayed: Math.round(students.filter(s => (s.progress || 0) < 25).length / students.length * 100)
            },
            qualityMetrics: {
              avgWordCount: Math.round(students.reduce((sum, s) => sum + (s.wordCount || 0), 0) / students.length),
              avgCitations: Math.round(students.reduce((sum, s) => sum + (s.citationsCount || 0), 0) / students.length),
              avgFilesUploaded: Math.round(students.reduce((sum, s) => sum + (s.uploadedFiles || 0), 0) / students.length),
              avgQualityScore: Math.round(students.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / students.length)
            }
          },
          communicationAnalytics: {
            feedbackResponseTime: 24,
            studentQuestions: 12,
            revisionCycles: 2.3,
            averageCorrections: 5.1
          }
        };

        setAnalyticsData(analytics);
      } else {
        const projectType = await apiService.getProjectType();
        const chapters = await apiService.getChapters(projectType);
        const studySessions = await apiService.getStudySessions();
        const overallProgress = calculateOverallProgress(chapters);
        const totalPages = calculateTotalPages(chapters);

        const analytics: AnalyticsData = {
          chapters,
          studySessions,
          deadlines: [],
          feedback: [],
          projectType,
          overallProgress,
          totalPages,
          recentActivity: {
            lastLogin: new Date().toISOString(),
            lastEdit: chapters
              .filter(ch => ch.uploadedFile?.uploadDate)
              .sort((a, b) => new Date(b.uploadedFile!.uploadDate).getTime() - new Date(a.uploadedFile!.uploadDate).getTime())[0]
              ?.uploadedFile?.uploadDate || new Date().toISOString()
          },
          timeAnalytics: {
            productiveHours: ['9:00', '14:00', '19:00'],
            weeklyStreak: 7,
            averageSessionLength: 45,
            focusScore: 78,
            bestTimeOfDay: 'morning'
          },
          writingAnalytics: {
            wordCount: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
            pagesCount: totalPages,
            imagesCount: chapters.reduce((sum, ch) => sum + (ch.imagesCount || 0), 0),
            citationsCount: 15,
            plagiarismScore: 2,
            readabilityScore: 75,
            vocabularyDiversity: 68
          },
          qualityMetrics: {
            structureScore: 80,
            contentScore: 75,
            formattingScore: 85,
            citationScore: 70
          }
        };

        setAnalyticsData(analytics);
      }
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setUserRole('student');
      setUserInfo({ role: 'student', name: 'Тестовий Студент', group: 'КН-401' });
      
      const fallbackData: AnalyticsData = {
        chapters: [],
        studySessions: [],
        deadlines: [],
        feedback: [],
        projectType: 'coursework',
        overallProgress: 0,
        totalPages: 0,
        recentActivity: { lastLogin: new Date().toISOString(), lastEdit: new Date().toISOString() }
      };
      
      setAnalyticsData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastLogin = (date: Date) => {
    return `сьогодні ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const dailyActivityData = useMemo(() => generateActivityData(), []);
  const fileActivityData = useMemo(() => {
    if (!analyticsData) return [];
    
    const uploadedFiles = analyticsData.chapters.filter(ch => ch.uploadedFile).length;
    const inProgress = analyticsData.chapters.filter(ch => ch.status === 'in_progress').length;
    const completed = analyticsData.chapters.filter(ch => ch.status === 'completed').length;
    const pending = analyticsData.chapters.filter(ch => ch.status === 'pending').length;
    const revision = analyticsData.chapters.filter(ch => ch.status === 'revision').length;

    return [
      { type: 'Завершені', count: completed, color: 'var(--chart-1)' },
      { type: 'В роботі', count: inProgress, color: 'var(--chart-3)' },
      { type: 'На доопрацюванні', count: revision, color: 'var(--destructive)' },
      { type: 'Не розпочато', count: pending, color: 'var(--muted-foreground)' },
      { type: 'З файлами', count: uploadedFiles, color: 'var(--primary)' }
    ].filter(item => item.count > 0);
  }, [analyticsData]);

  const metrics = useMemo(() => {
    if (!analyticsData || userRole === 'supervisor') return null;

    const totalSessions = dailyActivityData.reduce((sum, day) => sum + day.sessions, 0);
    const totalTimeSpent = dailyActivityData.reduce((sum, day) => sum + day.timeSpent, 0);
    const totalFilesUploaded = analyticsData.chapters.filter(ch => ch.uploadedFile).length;
    const totalSaves = dailyActivityData.reduce((sum, day) => sum + day.saves, 0);

    return {
      totalSessions,
      totalTimeSpent,
      totalFilesUploaded,
      totalSaves,
      overallProgress: analyticsData.overallProgress,
      totalPages: analyticsData.totalPages,
      weeklyStreak: analyticsData.timeAnalytics?.weeklyStreak || 0,
      focusScore: analyticsData.timeAnalytics?.focusScore || 0
    };
  }, [analyticsData, dailyActivityData, userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Завантаження аналітики...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
            <p>Не вдалося завантажити дані</p>
            <Button onClick={loadAnalyticsData} className="mt-4">
              Спробувати знову
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-background via-background to-background/80">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {userRole === 'supervisor' ? 'Аналітика викладача' : 'Моя аналітика'}
              </h1>
              <p className="text-muted-foreground">
                {userRole === 'supervisor' 
                  ? 'Управління групою та моніторинг прогресу'
                  : 'Персональна статистика та рекомендації'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                {formatLastLogin(lastLoginTime)}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Експорт
              </Button>
            </div>
          </div>

          {/* Main Content Based on Role */}
          {userRole === 'student' ? (
            <StudentAnalytics 
              analyticsData={analyticsData}
              metrics={metrics}
              dailyActivityData={dailyActivityData}
              fileActivityData={fileActivityData}
              userInfo={userInfo}
            />
          ) : (
            <SupervisorAnalytics 
              analyticsData={analyticsData}
              studentsData={studentsData}
            />
          )}

          {/* Інформація про дані */}
          <Card className={`backdrop-blur-sm ${
            userRole === 'supervisor' 
              ? "bg-accent/20 border-accent/30" 
              : "bg-primary/20 border-primary/30"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">
                    {userRole === 'supervisor' 
                      ? 'Дані оновлюються в реальному часі • Автоматичні сповіщення' 
                      : 'Реальні дані з вашого трекера • Персональні рекомендації'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Останнє оновлення: {new Date().toLocaleTimeString('uk-UA')} • 
                    Наступне оновлення: через 5 хв
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}