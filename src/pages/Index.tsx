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
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';

// Додаємо шаблони розділів (можна винести у окремий файл)
const chapterTemplates: Record<string, any[]> = {
  diploma: [
    { id: 1, key: 'intro' },
    { id: 2, key: 'theory' },
    { id: 3, key: 'design' },
    { id: 4, key: 'implementation' },
    { id: 5, key: 'conclusion' },
    { id: 6, key: 'appendix' },
    { id: 7, key: 'sources' },
    { id: 8, key: 'abstract' },
    { id: 9, key: 'cover' },
    { id: 10, key: 'content' }
  ],
  coursework: [
    { id: 1, key: 'intro' },
    { id: 2, key: 'theory' },
    { id: 3, key: 'design' },
    { id: 4, key: 'implementation' },
    { id: 5, key: 'conclusion' },
    { id: 6, key: 'appendix' },
    { id: 7, key: 'sources' },
    { id: 8, key: 'abstract' },
    { id: 9, key: 'cover' },
    { id: 10, key: 'content' }
  ],
  practice: [
    { id: 1, key: 'intro' },
    { id: 2, key: 'tasks' },
    { id: 3, key: 'diary' },
    { id: 4, key: 'conclusion' },
    { id: 5, key: 'report' }
  ]
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Додаємо стани для відстеження проєкту
  const [projectType, setProjectType] = useState<string>('diploma'); // за замовчуванням
  const [uploadedChapters, setUploadedChapters] = useState<number>(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const firstVisitFlag = localStorage.getItem("firstVisitDone");
    if (!firstVisitFlag) {
      setIsFirstVisit(true);
      localStorage.setItem("firstVisitDone", "true");
    }

    // Читаємо тип проєкту з localStorage (якщо є)
    const savedProjectType = localStorage.getItem('thesisTrackerProjectType');
    if (savedProjectType && chapterTemplates[savedProjectType]) {
      setProjectType(savedProjectType);
    }

    // Читаємо завантажені розділи з localStorage
    const savedChapters = localStorage.getItem('thesisTrackerChapters');
    if (savedChapters) {
      try {
        const chapters = JSON.parse(savedChapters);
        // Підраховуємо кількість розділів з progress > 0 (завантажених)
        const uploaded = chapters.filter((chapter: any) => chapter.progress > 0).length;
        setUploadedChapters(uploaded);
      } catch (error) {
        console.error('Помилка при читанні збережених розділів:', error);
      }
    }
  }, []);

  // Функція для отримання динамічних даних про розділи
  const getChaptersStats = () => {
    const totalChapters = chapterTemplates[projectType]?.length || 0;
    return {
      completed: uploadedChapters,
      total: totalChapters,
      displayText: `${uploadedChapters}/${totalChapters}`
    };
  };

  // Функція для отримання динамічних даних про поточний проєкт
  const getCurrentWorkData = () => {
    const totalChapters = chapterTemplates[projectType]?.length || 0;
    const overallProgress = totalChapters > 0 ? Math.round((uploadedChapters / totalChapters) * 100) : 0;
    
    // Визначаємо назву проєкту на основі типу
    const projectTitles: Record<string, string> = {
      diploma: 'Дипломний проєкт',
      coursework: 'Курсова робота', 
      practice: 'Звіт з практики'
    };

    return {
      title: projectTitles[projectType] || t('index.title'),
      supervisor: t('index.supervisor'),
      progress: overallProgress,
      deadline: t('index.deadline'),
      status: uploadedChapters === 0 ? 'Не розпочато' : uploadedChapters === totalChapters ? 'Завершено' : 'В процесі',
    };
  };

  const currentWork = getCurrentWorkData();

  const recentActivities = [
    { id: 1, type: 'comment', text: 'Новий коментар до розділу 2', time: '2 год тому', icon: MessageSquare },
    { id: 2, type: 'deadline', text: 'Нагадування: дедлайн завтра', time: '1 день тому', icon: AlertCircle },
    { id: 3, type: 'approval', text: 'Розділ 1 затверджено', time: '3 дні тому', icon: CheckCircle },
  ];

  // Оновлюємо quickStats з динамічними даними
  const chaptersStats = getChaptersStats();
  const quickStats = [
    {
      label: t('index.stats.overallProgress'),
      value: `${currentWork.progress}%`,
      icon: Target,
      change: currentWork.progress > 0 ? `+${uploadedChapters} розділів` : 'Розпочніть завантаження',
      trend: currentWork.progress > 0 ? 'up' : 'neutral',
    },
    {
      label: t('index.stats.chaptersReady'),
      value: chaptersStats.displayText, // Динамічне значення
      icon: BookOpen,
      change: uploadedChapters > 0 ? t('index.stats.chaptersChange') : 'Почніть завантажувати розділи',
      trend: uploadedChapters > 0 ? 'up' : 'neutral',
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

  // Оновлюємо projectMilestones з урахуванням типу проєкту
  const getProjectMilestones = () => {
    const template = chapterTemplates[projectType] || chapterTemplates.diploma;
    
    // Читаємо збережені дані про розділи
    const savedChapters = localStorage.getItem('thesisTrackerChapters');
    let chaptersData = [];
    
    if (savedChapters) {
      try {
        chaptersData = JSON.parse(savedChapters);
      } catch (error) {
        console.error('Помилка при читанні збережених розділів:', error);
      }
    }

    // Створюємо список мілстоунів на основі шаблону
    return template.map((templateChapter) => {
      const savedChapter = chaptersData.find((ch: any) => ch.id === templateChapter.id);
      
      let status = 'pending';
      let progress = 0;
      
      if (savedChapter) {
        progress = savedChapter.progress;
        if (savedChapter.status === 'completed') status = 'completed';
        else if (savedChapter.status === 'inProgress' || savedChapter.status === 'review') status = 'in-progress';
      }
      
      return {
        name: templateChapter.key,
        status,
        progress
      };
    });
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
                      <span className="text-sm font-medium text-primary">{t('index.projectType')}</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
                      {t('index.welcomeTitle', { name: user?.firstName || "Користувач" })}
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
                              {projectType === 'diploma' ? 'Дипломний проєкт' : projectType === 'coursework' ? 'Курсова робота' : 'Звіт з практики'}
                            </span>
                          </div>
                          <CardTitle className="text-xl md:text-2xl font-bold mb-2">{t('index.projectProgress')}</CardTitle>
                          <CardDescription className="text-base">{currentWork.title}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-xl bg-muted/50">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">ІІ</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-foreground">{t('index.supervisor')}</p>
                            <p className="text-sm text-muted-foreground">{t('index.supervisorName')}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-85 overflow-y-auto space-y-6 pr-2">
                        {projectMilestones.map((milestone, index) => {
                          const milestoneLabel = t(`thesis.chapters.${milestone.name}`);
                          return (
                            <div key={index} className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${milestone.status === 'completed'
                                ? 'bg-primary text-primary-foreground'
                                : milestone.status === 'in-progress'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                                }`}>
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : milestone.status === 'in-progress' ? (
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
                          <Link to="/tracker">
                            <FileText className="mr-2 h-4 w-4" /> {t('index.detailedView')}
                          </Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                          <Link to="/chat">
                            <MessageSquare className="mr-2 h-4 w-4" /> {t('index.chatWithSupervisor')}
                          </Link>
                        </Button>
                      </div>
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div key={activity.id} className="flex space-x-3">
                              <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {t(`index.recentActivity.activities.${activity.type}`)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t(`index.recentActivity.times.${activity.type}`)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                      <Button variant="outline" className="w-full justify-start">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        {t('index.planner')}
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