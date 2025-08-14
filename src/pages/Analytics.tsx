// import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Clock,
  BookOpen,
  Target,
  Calendar,
  Award,
  CheckCircle,
  Coffee,
  FileText,
  Upload,
  MessageSquare,
  Save,
  RefreshCw,
  ThumbsUp,
  Clock3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart as RePieChart,
  Cell,
  Bar,
  Area,
  AreaChart
} from 'recharts';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Type definitions
interface ChapterProgress {
  id: number;
  chapter: string;
  progress: number;
  pages: number;
  status: 'approved' | 'revision' | 'draft' | 'not_started';
  lastEdit: string | null;
  uploadedFile: boolean;
  sentForReview: boolean;
}

interface DailyActivity {
  date: string;
  sessions: number;
  timeSpent: number;
  filesUploaded: number;
  saves: number;
}

interface SupervisorFeedback {
  chapter: string;
  comment: string;
  date: string;
  type: 'approved' | 'revision';
  status: 'completed' | 'in_progress';
}

interface Deadline {
  milestone: string;
  deadline: string;
  status: 'completed' | 'in_progress' | 'pending';
  submitted?: string;
}

interface WorkIntensity {
  hour: string;
  intensity: number;
}

interface FileActivity {
  type: string;
  count: number;
  color: string;
}

// Дані для курсової/дипломної роботи
const dailyActivityData: DailyActivity[] = [
  { date: '01.02', sessions: 3, timeSpent: 4.2, filesUploaded: 2, saves: 15 },
  { date: '02.02', sessions: 2, timeSpent: 3.1, filesUploaded: 1, saves: 12 },
  { date: '03.02', sessions: 4, timeSpent: 5.8, filesUploaded: 0, saves: 22 },
  { date: '04.02', sessions: 1, timeSpent: 2.3, filesUploaded: 3, saves: 8 },
  { date: '05.02', sessions: 5, timeSpent: 8.3, filesUploaded: 1, saves: 28 },
  { date: '06.02', sessions: 3, timeSpent: 4.7, filesUploaded: 2, saves: 18 },
  { date: '07.02', sessions: 2, timeSpent: 3.5, filesUploaded: 1, saves: 14 }
];

// 🔗 Функція для отримання даних з ThesisTracker
const getThesisTrackerData = (): ChapterProgress[] => {
  try {
    const savedChapters = localStorage.getItem('thesisTrackerChapters');
    if (savedChapters) {
      const parsedChapters = JSON.parse(savedChapters);
      return parsedChapters.map((ch: any) => ({
        id: ch.id,
        chapter: getChapterName(ch.key),
        progress: ch.progress || 0,
        pages: Math.round((ch.progress || 0) / 4), // Приблизний розрахунок сторінок
        status: mapThesisTrackerStatus(ch.status),
        lastEdit: ch.uploadedFile ? ch.uploadedFile.uploadDate : null,
        uploadedFile: !!ch.uploadedFile,
        sentForReview: ch.status === 'inProgress' || ch.status === 'completed'
      }));
    }
  } catch (error) {
    console.error('Помилка при читанні даних ThesisTracker:', error);
  }
  
  // Дефолтні дані якщо немає збережених
  return [
    { 
      id: 1,
      chapter: 'Вступ', 
      progress: 95, 
      pages: 8, 
      status: 'approved', 
      lastEdit: '05.02',
      uploadedFile: true,
      sentForReview: true
    },
    { 
      id: 2,
      chapter: 'Розділ 1. Теоретичні основи', 
      progress: 80, 
      pages: 25, 
      status: 'revision', 
      lastEdit: '06.02',
      uploadedFile: true,
      sentForReview: false
    },
    { 
      id: 3,
      chapter: 'Розділ 2. Практична частина', 
      progress: 60, 
      pages: 18, 
      status: 'draft', 
      lastEdit: '07.02',
      uploadedFile: true,
      sentForReview: false
    },
    { 
      id: 4,
      chapter: 'Розділ 3. Експериментальна частина', 
      progress: 30, 
      pages: 12, 
      status: 'not_started', 
      lastEdit: null,
      uploadedFile: false,
      sentForReview: false
    },
    { 
      id: 5,
      chapter: 'Висновки', 
      progress: 0, 
      pages: 0, 
      status: 'not_started', 
      lastEdit: null,
      uploadedFile: false,
      sentForReview: false
    }
  ];
};

// Мапінг статусів з ThesisTracker
const mapThesisTrackerStatus = (status: string): 'approved' | 'revision' | 'draft' | 'not_started' => {
  switch (status) {
    case 'completed': return 'approved';
    case 'inProgress': return 'revision';
    case 'review': return 'draft';
    case 'pending': return 'not_started';
    default: return 'not_started';
  }
};

// Отримання назв розділів
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
  return chapterNames[key] || `Розділ ${key}`;
};

const supervisorFeedback: SupervisorFeedback[] = [
  {
    chapter: 'Вступ',
    comment: 'Добре структурований розділ, але варто додати більше актуальних джерел',
    date: '04.02',
    type: 'approved',
    status: 'completed'
  },
  {
    chapter: 'Розділ 1',
    comment: 'Необхідно переглянути методологію дослідження та додати порівняльний аналіз',
    date: '06.02',
    type: 'revision',
    status: 'in_progress'
  }
];

const deadlineData: Deadline[] = [
  {
    milestone: 'Подача теми роботи',
    deadline: '15.01',
    status: 'completed',
    submitted: '12.01'
  },
  {
    milestone: 'Перший розділ',
    deadline: '15.02',
    status: 'in_progress'
  },
  {
    milestone: 'Повний текст роботи',
    deadline: '15.04',
    status: 'pending'
  },
  {
    milestone: 'Захист роботи',
    deadline: '25.05',
    status: 'pending'
  }
];

const workIntensityData: WorkIntensity[] = [
  { hour: '9:00', intensity: 12 },
  { hour: '10:00', intensity: 18 },
  { hour: '11:00', intensity: 25 },
  { hour: '12:00', intensity: 15 },
  { hour: '13:00', intensity: 8 },
  { hour: '14:00', intensity: 22 },
  { hour: '15:00', intensity: 35 },
  { hour: '16:00', intensity: 42 },
  { hour: '17:00', intensity: 38 },
  { hour: '18:00', intensity: 28 },
  { hour: '19:00', intensity: 20 },
  { hour: '20:00', intensity: 15 }
];

const projectTitles: Record<string, string> = {
  diploma: 'Аналітика Дипломного Проєкту',
  coursework: 'Аналітика Курсової Роботи',
  practice: 'Аналітика Практики',
};

const projectButtons: Record<string, string> = {
  diploma: 'Дипломна робота',
  coursework: 'Курсова робота',
  practice: 'Практика',
};

export default function Analytics() {
  const [projectType, setProjectType] = useState<'diploma' | 'coursework' | 'practice'>('coursework');
  const [lastLoginTime, setLastLoginTime] = useState(new Date());

  // ⏰ Оновлення часу щохвилини
  useEffect(() => {
    const interval = setInterval(() => {
      setLastLoginTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 🧠 Зчитування типу проєкту з localStorage і оновлення даних
  useEffect(() => {
    const savedType = localStorage.getItem('thesisTrackerProjectType');
    if (savedType === 'diploma' || savedType === 'coursework' || savedType === 'practice') {
      setProjectType(savedType);
    }
    
    // Оновлюємо дані при зміні localStorage
    const handleStorageChange = () => {
      setLastLoginTime(new Date()); // Оновлюємо час для перерендеру компонента
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 📊 Динамічні дані з ThesisTracker
  const chaptersProgressData = useMemo(() => getThesisTrackerData(), [lastLoginTime]);

  // 📊 Динамічні дані файлової активності на основі розділів
  const fileActivityData: FileActivity[] = useMemo(() => {
    const uploadedFiles = chaptersProgressData.filter((ch: ChapterProgress) => ch.uploadedFile).length;
    const drafts = chaptersProgressData.filter((ch: ChapterProgress) => ch.uploadedFile && !ch.sentForReview).length;
    const sentForReview = chaptersProgressData.filter((ch: ChapterProgress) => ch.uploadedFile && ch.sentForReview).length;
    const notStarted = chaptersProgressData.filter((ch: ChapterProgress) => !ch.uploadedFile).length;

    return [
      {
        type: 'Завантажені файли',
        count: uploadedFiles,
        color: '#10b981'
      },
      {
        type: 'Чернетки',
        count: drafts,
        color: '#f59e0b'
      },
      {
        type: 'На перевірці',
        count: sentForReview,
        color: '#6366f1'
      },
      {
        type: 'Не розпочано',
        count: notStarted,
        color: '#6b7280'
      }
    ].filter(item => item.count > 0); // Показуємо тільки непорожні категорії
  }, [chaptersProgressData]);

  // 📅 Форматування дати
  function formatLastLogin(date: Date) {
    const now = new Date();

    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `сьогодні ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth()+1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  const totalSessions = dailyActivityData.reduce((sum, day) => sum + day.sessions, 0);
  const totalTimeSpent = dailyActivityData.reduce((sum, day) => sum + day.timeSpent, 0);
  const totalFilesUploaded = chaptersProgressData.filter((ch: ChapterProgress) => ch.uploadedFile).length;
  const totalSaves = dailyActivityData.reduce((sum, day) => sum + day.saves, 0);
  const averageSessionTime = totalTimeSpent / totalSessions;
  
  const totalPages = chaptersProgressData.reduce((sum: number, ch: ChapterProgress) => sum + ch.pages, 0);
  const overallProgress = chaptersProgressData.reduce((sum: number, ch: ChapterProgress) => sum + ch.progress, 0) / chaptersProgressData.length;

  // Функції для обробки файлів (заглушки для демонстрації)
  const handleFileUpload = (chapterId: number, file: File) => {
    console.log(`Uploading file for chapter ${chapterId}:`, file.name);
    // Тут буде логіка завантаження файлу
  };

  const handleSendForReview = (chapterId: number) => {
    console.log(`Sending chapter ${chapterId} for review`);
    // Тут буде логіка відправки на перевірку
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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold"> {projectTitles[projectType]}</h1>
              <p className="text-muted-foreground">Відстеження прогресу написання роботи</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4" />
                {projectButtons[projectType]}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                Останній вхід: {formatLastLogin(lastLoginTime)}
              </Button>
            </div>
          </div>

          {/* Основні метрики активності */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Сесії роботи</CardTitle>
                <Activity className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">за 7 днів</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Час роботи</CardTitle>
                <Clock className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTimeSpent.toFixed(1)}г</div>
                <p className="text-xs text-green-600">Середньо {averageSessionTime.toFixed(1)}г/сесія</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Файли</CardTitle>
                <Upload className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFilesUploaded}</div>
                <p className="text-xs text-purple-600">завантажено</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Збереження</CardTitle>
                <Save className="h-5 w-5 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSaves}</div>
                <p className="text-xs text-indigo-600">автозбережень</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Прогрес</CardTitle>
                <Target className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                <p className="text-xs text-yellow-600">{totalPages} сторінок</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Відгуки</CardTitle>
                <MessageSquare className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supervisorFeedback.length}</div>
                <p className="text-xs text-orange-600">від наукового керівника</p>
              </CardContent>
            </Card>
          </div>

          {/* Прогрес розділів */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Прогрес розділів
                </CardTitle>
                <CardDescription>Статус написання кожного розділу роботи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chaptersProgressData.map((chapter: ChapterProgress, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{chapter.chapter}</span>
                        <Badge variant={
                          chapter.status === 'approved' ? 'default' :
                          chapter.status === 'revision' ? 'secondary' :
                          'outline'
                        }>
                          {chapter.status === 'approved' ? 'Затверджено' :
                           chapter.status === 'revision' ? 'На доопрацювання' :
                           chapter.status === 'draft' ? 'Чернетка' : 'Не розпочато'}
                        </Badge>
                        {chapter.uploadedFile && !chapter.sentForReview && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Чернетка
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chapter.pages} стор. • {chapter.lastEdit || 'Не редаговано'}
                      </div>
                    </div>
                    <Progress value={chapter.progress} className="h-2" />
                    
                    {/* Дії з файлами */}
                    <div className="flex gap-2 flex-wrap">
                      {!chapter.uploadedFile && (
                        <div className="relative">
                          <input
                            type="file"
                            id={`file-upload-${chapter.id}`}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(chapter.id, file);
                              }
                            }}
                          />
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                          >
                            <label htmlFor={`file-upload-${chapter.id}`} className="flex items-center cursor-pointer">
                              <FileText className="w-4 h-4 mr-1" />
                              Завантажити файл
                            </label>
                          </Button>
                        </div>
                      )}

                      {chapter.uploadedFile && !chapter.sentForReview && (
                        <Button
                          size="sm"
                          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]"
                          onClick={() => handleSendForReview(chapter.id)}
                        >
                          Надіслати на перевірку
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Дедлайни та етапи
                </CardTitle>
                <CardDescription>Графік здачі роботи та поточний статус</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deadlineData.map((milestone, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                    milestone.status === 'completed' ? 'bg-green-50 border-green-500' :
                    milestone.status === 'in_progress' ? 'bg-blue-50 border-blue-500' :
                    'bg-gray-50 border-gray-300'
                  }`}>
                    <div>
                      <p className="font-medium text-sm">{milestone.milestone}</p>
                      <p className="text-xs text-muted-foreground">
                        Дедлайн: {milestone.deadline}
                        {milestone.submitted && ` • Здано: ${milestone.submitted}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : milestone.status === 'in_progress' ? (
                        <Clock3 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Відгуки керівника */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Відгуки наукового керівника
              </CardTitle>
              <CardDescription>Коментарі та рекомендації до розділів роботи</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supervisorFeedback.map((feedback, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  feedback.type === 'approved' ? 'bg-green-50 border-green-500' :
                  'bg-orange-50 border-orange-500'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {feedback.type === 'approved' ? (
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-orange-600" />
                      )}
                      <span className="font-medium text-sm">{feedback.chapter}</span>
                      <Badge variant={feedback.status === 'completed' ? 'default' : 'secondary'}>
                        {feedback.status === 'completed' ? 'Виконано' :
                         feedback.status === 'in_progress' ? 'В роботі' : 'Очікує'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{feedback.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Графіки активності */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Щоденна активність</CardTitle>
                <CardDescription>Сесії роботи та час, проведений в системі</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="timeSpent" stroke="#6366f1" strokeWidth={2} name="Час (години)" />
                    <Bar yAxisId="right" dataKey="sessions" fill="#10b981" name="Сесії" opacity={0.6} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Файлова активність</CardTitle>
                <CardDescription>Розподіл статусу файлів та документів</CardDescription>
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
                      outerRadius={100}
                      label={({ count, type }) => `${type}: ${count}`}
                    >
                      {fileActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                {fileActivityData.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Немає даних про файли
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Інтенсивність роботи */}
          <Card>
            <CardHeader>
              <CardTitle>Інтенсивність роботи по годинах</CardTitle>
              <CardDescription>Розподіл активності протягом робочого дня</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={workIntensityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="intensity" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Інтенсивність редагування" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Корисні інсайти */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Статистика продуктивності
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Найпродуктивніший день</span>
                  <Badge variant="outline">05.02 (8.3г)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Найактивніша година</span>
                  <Badge variant="secondary">16:00-17:00</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Середня сесія</span>
                  <Badge variant="outline">{averageSessionTime.toFixed(1)} години</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Чернеток</span>
                  <Badge variant="outline" className="text-orange-600">
                    {chaptersProgressData.filter((ch: ChapterProgress) => ch.uploadedFile && !ch.sentForReview).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Поточні завдання
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500">
                  <p className="text-sm font-medium">Терміново</p>
                  <p className="text-xs text-muted-foreground">Доопрацювати Розділ 1 до 15.02</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <p className="text-sm font-medium">В роботі</p>
                  <p className="text-xs text-muted-foreground">Написання Розділу 2 (60% готово)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="w-5 h-5" />
                  Рекомендації
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
                  <p className="text-sm font-medium">Добре</p>
                  <p className="text-xs text-muted-foreground">Стабільна робота щодня підвищує продуктивність</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                  <p className="text-sm font-medium">Порада</p>
                  <p className="text-xs text-muted-foreground">Найкраща продуктивність о 16:00 - плануйте складні завдання на цей час</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}