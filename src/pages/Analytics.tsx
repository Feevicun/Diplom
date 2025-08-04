import { useTranslation } from 'react-i18next';
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

// Дані для курсової/дипломної роботи
const dailyActivityData = [
  { date: '01.02', sessions: 3, timeSpent: 4.5, filesUploaded: 2, saves: 12 },
  { date: '02.02', sessions: 2, timeSpent: 3.2, filesUploaded: 1, saves: 8 },
  { date: '03.02', sessions: 4, timeSpent: 6.8, filesUploaded: 3, saves: 18 },
  { date: '04.02', sessions: 1, timeSpent: 2.1, filesUploaded: 0, saves: 5 },
  { date: '05.02', sessions: 5, timeSpent: 8.3, filesUploaded: 4, saves: 25 },
  { date: '06.02', sessions: 3, timeSpent: 5.2, filesUploaded: 2, saves: 15 },
  { date: '07.02', sessions: 2, timeSpent: 3.7, filesUploaded: 1, saves: 9 },
];

const chaptersProgress = [
  { chapter: 'Вступ', progress: 100, pages: 3, lastEdit: '2024-02-07', status: 'approved' },
  { chapter: 'Розділ 1', progress: 85, pages: 12, lastEdit: '2024-02-06', status: 'revision' },
  { chapter: 'Розділ 2', progress: 60, pages: 8, lastEdit: '2024-02-05', status: 'draft' },
  { chapter: 'Розділ 3', progress: 30, pages: 4, lastEdit: '2024-02-03', status: 'draft' },
  { chapter: 'Висновки', progress: 10, pages: 1, lastEdit: '2024-02-01', status: 'draft' },
  { chapter: 'Додатки', progress: 0, pages: 0, lastEdit: null, status: 'not_started' },
];

const supervisorFeedback = [
  { date: '2024-02-06', chapter: 'Розділ 1', type: 'revision', comment: 'Потрібно доопрацювати аналіз літератури та додати 3-4 джерела', status: 'pending' },
  { date: '2024-02-04', chapter: 'Вступ', type: 'approved', comment: 'Вступ написано якісно, актуальність розкрита повністю', status: 'completed' },
  { date: '2024-02-01', chapter: 'Розділ 2', type: 'revision', comment: 'Методологія потребує більш детального опису. Додайте схему дослідження', status: 'in_progress' },
  { date: '2024-01-28', chapter: 'План роботи', type: 'approved', comment: 'План затверджено. Можна приступати до написання', status: 'completed' },
];

const fileActivityData = [
  { type: 'Завантаження файлів', count: 23, color: '#6366f1' },
  { type: 'Збереження документу', count: 156, color: '#10b981' },
  { type: 'Експорт в PDF', count: 8, color: '#f59e0b' },
  { type: 'Резервні копії', count: 12, color: '#8b5cf6' },
];

const deadlineData = [
  { milestone: 'План роботи', deadline: '2024-01-30', submitted: '2024-01-28', status: 'completed', delay: 0 },
  { milestone: 'Вступ + Розділ 1', deadline: '2024-02-15', submitted: null, status: 'in_progress', delay: 0 },
  { milestone: 'Розділ 2-3', deadline: '2024-03-15', submitted: null, status: 'upcoming', delay: 0 },
  { milestone: 'Повна робота', deadline: '2024-04-01', submitted: null, status: 'upcoming', delay: 0 },
  { milestone: 'Захист', deadline: '2024-04-20', submitted: null, status: 'upcoming', delay: 0 },
];

const workIntensityData = [
  { hour: '09:00', intensity: 20, focus: 60 },
  { hour: '10:00', intensity: 35, focus: 75 },
  { hour: '11:00', intensity: 45, focus: 85 },
  { hour: '12:00', intensity: 30, focus: 70 },
  { hour: '14:00', intensity: 40, focus: 80 },
  { hour: '15:00', intensity: 55, focus: 90 },
  { hour: '16:00', intensity: 60, focus: 95 },
  { hour: '17:00', intensity: 45, focus: 85 },
  { hour: '18:00', intensity: 25, focus: 65 },
  { hour: '19:00', intensity: 35, focus: 75 },
];


export default function Analytics() {
  const { t } = useTranslation();

  const totalSessions = dailyActivityData.reduce((sum, day) => sum + day.sessions, 0);
  const totalTimeSpent = dailyActivityData.reduce((sum, day) => sum + day.timeSpent, 0);
  const totalFilesUploaded = dailyActivityData.reduce((sum, day) => sum + day.filesUploaded, 0);
  const totalSaves = dailyActivityData.reduce((sum, day) => sum + day.saves, 0);
  const averageSessionTime = totalTimeSpent / totalSessions;
  
  const completedChapters = chaptersProgress.filter(ch => ch.status === 'approved').length;
  const totalPages = chaptersProgress.reduce((sum, ch) => sum + ch.pages, 0);
  const overallProgress = chaptersProgress.reduce((sum, ch) => sum + ch.progress, 0) / chaptersProgress.length;

  return (
       <div className="min-h-screen bg-[var(--background)] flex text-[var(--foreground)]">
      <div className="hidden md:block sticky top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Аналітика Курсової Роботи</h1>
              <p className="text-muted-foreground">Відстеження прогресу написання наукової роботи</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4" />
                Дипломна робота
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                Останній вхід: сьогодні 16:30
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
                {chaptersProgress.map((chapter, index) => (
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
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chapter.pages} стор. • {chapter.lastEdit || 'Не редаговано'}
                      </div>
                    </div>
                    <Progress value={chapter.progress} className="h-2" />
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
                <CardDescription>Розподіл операцій з файлами та документами</CardDescription>
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
                      label={({type, count}) => `${count}`}
                    >
                      {fileActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
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