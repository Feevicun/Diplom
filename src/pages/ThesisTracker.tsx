import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, Download, CheckCircle, Clock, FileText, AlertCircle, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const chapterTemplates: Record<string, {
  id: number;
  key: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
}[]> = {
  diploma: [
    { id: 1, key: 'intro', progress: 0, status: 'pending' },
    { id: 2, key: 'theory', progress: 0, status: 'pending' },
    { id: 3, key: 'design', progress: 0, status: 'pending' },
    { id: 4, key: 'implementation', progress: 0, status: 'pending' },
    { id: 5, key: 'conclusion', progress: 0, status: 'pending' },
    { id: 6, key: 'appendix', progress: 0, status: 'pending' },
    { id: 7, key: 'sources', progress: 0, status: 'pending' },
    { id: 8, key: 'abstract', progress: 0, status: 'pending' },
    { id: 9, key: 'cover', progress: 0, status: 'pending' },
    { id: 10, key: 'content', progress: 0, status: 'pending' }
  ],
  coursework: [
    { id: 1, key: 'intro', progress: 0, status: 'pending' },
    { id: 2, key: 'theory', progress: 0, status: 'pending' },
    { id: 3, key: 'design', progress: 0, status: 'pending' },
    { id: 4, key: 'implementation', progress: 0, status: 'pending' },
    { id: 5, key: 'conclusion', progress: 0, status: 'pending' },
    { id: 6, key: 'appendix', progress: 0, status: 'pending' },
    { id: 7, key: 'sources', progress: 0, status: 'pending' },
    { id: 8, key: 'abstract', progress: 0, status: 'pending' },
    { id: 9, key: 'cover', progress: 0, status: 'pending' },
    { id: 10, key: 'content', progress: 0, status: 'pending' }
  ],
  practice: [
    { id: 1, key: 'intro', progress: 0, status: 'pending' },
    { id: 2, key: 'tasks', progress: 0, status: 'pending' },
    { id: 3, key: 'diary', progress: 0, status: 'pending' },
    { id: 4, key: 'conclusion', progress: 0, status: 'pending' },
    { id: 5, key: 'report', progress: 0, status: 'pending' }
  ]
};

const projectTitles: Record<string, string> = {
  diploma: 'Дипломний проєкт',
  coursework: 'Курсова робота',
  practice: 'Навчальна практика',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-[var(--primary)]" />;
    case 'review':
      return <Clock className="w-4 h-4 text-[var(--secondary)]" />;
    case 'inProgress':
      return <FileText className="w-4 h-4 text-[var(--accent)]" />;
    default:
      return <AlertCircle className="w-4 h-4 text-[var(--muted-foreground)]" />;
  }
};

// Компонент початкового екрану
const WelcomeScreen = ({ onSelectProject }: { onSelectProject: (type: 'diploma' | 'coursework' | 'practice') => void }) => {
  const { t } = useTranslation();

  const projectOptions = [
    {
      type: 'diploma' as const,
      icon: GraduationCap,
      title: 'Дипломна робота',
      description: 'Створіть та відстежуйте прогрес дипломної роботи',
      color: 'bg-[var(--muted)]'
    },
    {
      type: 'coursework' as const,
      icon: BookOpen,
      title: 'Курсова робота',
      description: 'Організуйте роботу над курсовим проєктом',
      color: 'bg-[var(--muted)]'
    },
    {
      type: 'practice' as const,
      icon: Briefcase,
      title: 'Навчальна практика',
      description: 'Ведіть звіт про проходження практики',
      color: 'bg-[var(--muted)]'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Оберіть тип роботи
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Виберіть тип навчальної роботи, над якою ви хочете працювати
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {projectOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card 
              key={option.type}
              className="bg-[var(--card)] text-[var(--card-foreground)] hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-[var(--primary)]"
              onClick={() => onSelectProject(option.type)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]`}>
                  <IconComponent className="w-8 h-8 text-[var(--foreground)]" />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-[var(--muted-foreground)] mb-4">
                  {option.description}
                </CardDescription>
                <Button 
                  className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]"
                  onClick={() => onSelectProject(option.type)}
                >
                  Розпочати
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Card className="bg-[var(--muted)]/50 border-dashed border-2 border-[var(--border)]">
          <CardContent className="py-6">
            <div className="text-center mb-4">
              <FileText className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Не знаєте, з чого почати?
              </h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                Наш помічник допоможе вам організувати роботу та відстежувати прогрес
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">📋 Як працює система:</h4>
                <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                  <li>• Оберіть тип роботи (дипломна, курсова, практика)</li>
                  <li>• Завантажуйте файли для кожного розділу</li>
                  <li>• Відстежуйте прогрес виконання</li>
                  <li>• Спілкуйтеся з науковим керівником</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">💡 Корисні поради:</h4>
                <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                  <li>• Починайте з вступу та огляду літератури</li>
                  <li>• Регулярно зберігайте проміжні результати</li>
                  <li>• Дотримуйтесь встановлених дедлайнів</li>
                  <li>• Узгоджуйте зміни з керівником</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ThesisTracker = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getQueryParam = (param: string) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(param);
  };

  const urlType = getQueryParam('type');
  const [projectType, setProjectType] = useState<'diploma' | 'coursework' | 'practice' | null>(() => {
    if (urlType === 'coursework' || urlType === 'practice' || urlType === 'diploma') {
      return urlType;
    }
    return null;
  });

  const [chapters, setChapters] = useState<typeof chapterTemplates[keyof typeof chapterTemplates]>([]);

  useEffect(() => {
    if (urlType === 'coursework' || urlType === 'practice' || urlType === 'diploma') {
      setProjectType(urlType);
      setChapters([...chapterTemplates[urlType]]);
    }
  }, [urlType]);

  const handleSelectProject = (type: 'diploma' | 'coursework' | 'practice') => {
    setProjectType(type);
    setChapters([...chapterTemplates[type]]);
    // Оновлюємо URL
    window.history.pushState({}, '', `/tracker?type=${type}`);
  };

  const totalProgress = chapters.length > 0 ? Math.round(
    chapters.reduce((sum, ch) => sum + ch.progress, 0) / chapters.length
  ) : 0;

  const handleFileUpload = (chapterId: number) => {
    setChapters(prev =>
      prev.map(ch =>
        ch.id === chapterId
          ? { ...ch, progress: 70, status: 'review' }
          : ch
      )
    );
  };

  const handleSendForReview = (chapterId: number) => {
    setChapters(prev =>
      prev.map(ch =>
        ch.id === chapterId
          ? { ...ch, status: 'inProgress' }
          : ch
      )
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex text-[var(--foreground)]">
      <div className="hidden md:block sticky top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          {!projectType ? (
            <WelcomeScreen onSelectProject={handleSelectProject} />
          ) : (
            <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 pb-20">
              {/* Info Card */}
              <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">
                    {t(`thesis.projectTypes.${projectType}`) || projectTitles[projectType]}
                  </CardTitle>
                  <CardDescription className="text-sm text-[var(--muted-foreground)] mt-1">
                    {t('thesis.supervisor')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm"><span className="font-medium">{t('thesis.startDate')}:</span> 01.09.2024</p>
                      <p className="text-sm"><span className="font-medium">{t('thesis.deadline')}:</span> 15.01.2025</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[var(--primary)]">{totalProgress}%</div>
                      <p className="text-sm text-[var(--muted-foreground)]">{t('thesis.progress')}</p>
                    </div>
                  </div>
                  <Progress value={totalProgress} className="h-2 bg-[var(--muted)]" />
                  <div className="flex gap-3 flex-wrap">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t('index.chatWithSupervisor')}
                    </Button>
                    <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('index.planner')}
                    </Button>
                    <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]">
                      <Download className="w-4 h-4 mr-2" />
                      {t('thesis.export')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chapter Cards */}
              <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
                <CardHeader>
                  <CardTitle>{t('index.projectProgress')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border-b border-[var(--border)] pb-4 last:border-none last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(chapter.status)}
                          <div>
                            <p className="font-medium text-[var(--foreground)]">
                              {t(`thesis.chapters.${chapter.key}`)}
                            </p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {t(`thesis.chapterDescriptions.${chapter.key}`)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-[var(--muted-foreground)]">{chapter.progress}%</span>
                      </div>
                      <Progress value={chapter.progress} className="h-2 mt-2 bg-[var(--muted)]" />
                      <div className="flex gap-2 mt-3">
                        <div className="relative">
                          <input
                            type="file"
                            id={`file-upload-${chapter.id}`}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                console.log('Завантажено файл:', file.name);
                                handleFileUpload(chapter.id);
                              }
                            }}
                          />
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]"
                          >
                            <label htmlFor={`file-upload-${chapter.id}`} className="flex items-center cursor-pointer">
                              <FileText className="w-4 h-4 mr-1" />
                              {t('thesis.actions.file')}
                            </label>
                          </Button>
                        </div>

                        {chapter.status === 'review' && (
                          <Button
                            size="sm"
                            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]"
                            onClick={() => handleSendForReview(chapter.id)}
                          >
                            {t('thesis.actions.sendForReview')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ThesisTracker;