import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Calendar, 
  Download, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  Briefcase,
  Eye,
  EyeOff,
  StickyNote,
  MessageCircle,
  Trash2,
  Save
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

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

const chapterTemplates: Record<string, ChapterData[]> = {
  diploma: [
    { 
      id: 1, 
      key: 'intro', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: [
        { id: '1', text: 'Переконайтеся, що актуальність теми чітко обґрунтована', date: '2024-01-15', status: 'info' },
        { id: '2', text: 'Додайте більше сучасних джерел (2020-2024)', date: '2024-01-16', status: 'warning' }
      ]
    },
    { 
      id: 2, 
      key: 'theory', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: [
        { id: '3', text: 'Гарна структура теоретичної частини!', date: '2024-01-10', status: 'success' }
      ]
    },
    { 
      id: 3, 
      key: 'design', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 4, 
      key: 'implementation', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 5, 
      key: 'conclusion', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 6, 
      key: 'appendix', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 7, 
      key: 'sources', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 8, 
      key: 'abstract', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 9, 
      key: 'cover', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 10, 
      key: 'content', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    }
  ],
  coursework: [
    { 
      id: 1, 
      key: 'intro', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 2, 
      key: 'theory', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 3, 
      key: 'design', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 4, 
      key: 'implementation', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 5, 
      key: 'conclusion', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 6, 
      key: 'appendix', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 7, 
      key: 'sources', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 8, 
      key: 'abstract', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 9, 
      key: 'cover', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 10, 
      key: 'content', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    }
  ],
  practice: [
    { 
      id: 1, 
      key: 'intro', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 2, 
      key: 'tasks', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 3, 
      key: 'diary', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 4, 
      key: 'conclusion', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    },
    { 
      id: 5, 
      key: 'report', 
      progress: 0, 
      status: 'pending', 
      studentNote: '', 
      teacherComments: []
    }
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

const getCommentBadgeStyle = (status: TeacherComment['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

// Компонент початкового екрану
const WelcomeScreen = ({ onSelectProject }: { onSelectProject: (type: 'diploma' | 'coursework' | 'practice') => void }) => {
  const { t } = useTranslation();

  const projectOptions = [
    {
      type: 'diploma' as const,
      icon: GraduationCap,
      title: t('welcome.diploma.title'),
      description: t('welcome.diploma.description'),
      color: 'bg-[var(--muted)]'
    },
    {
      type: 'coursework' as const,
      icon: BookOpen,
      title: t('welcome.coursework.title'),
      description: t('welcome.coursework.description'),
      color: 'bg-[var(--muted)]'
    },
    {
      type: 'practice' as const,
      icon: Briefcase,
      title: t('welcome.practice.title'),
      description: t('welcome.practice.description'),
      color: 'bg-[var(--muted)]'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          {t('welcome.heading')}
        </h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          {t('welcome.subheading')}
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
                  {t('welcome.startButton')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Card className="w-full max-w-5xl bg-[var(--muted)]/50 border-dashed border-2 border-[var(--border)]">
          <CardContent className="py-10">
            <div className="text-center mb-8">
              <FileText className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                {t('welcome.help.title')}
              </h3>
              <p className="text-[var(--muted-foreground)] text-base">
                {t('welcome.help.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left px-4 md:px-12">
              <div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">{t('welcome.howItWorks.title')}</h4>
                <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                  <li>• {t('welcome.howItWorks.step1')}</li>
                  <li>• {t('welcome.howItWorks.step2')}</li>
                  <li>• {t('welcome.howItWorks.step3')}</li>
                  <li>• {t('welcome.howItWorks.step4')}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-[var(--foreground)] mb-2">{t('welcome.tips.title')}</h4>
                <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
                  <li>• {t('welcome.tips.tip1')}</li>
                  <li>• {t('welcome.tips.tip2')}</li>
                  <li>• {t('welcome.tips.tip3')}</li>
                  <li>• {t('welcome.tips.tip4')}</li>
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

  // Ключі для localStorage
  const STORAGE_PROJECT_TYPE = 'thesisTrackerProjectType';
  const STORAGE_CHAPTERS = 'thesisTrackerChapters';

  // Стан для показу нотаток та коментарів
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [editingNotes, setEditingNotes] = useState<Record<number, boolean>>({});

  // Зчитуємо з localStorage при початковому рендері
  const [projectType, setProjectType] = useState<'diploma' | 'coursework' | 'practice' | null>(() => {
    if (urlType === 'coursework' || urlType === 'practice' || urlType === 'diploma') {
      return urlType;
    }
    const savedType = localStorage.getItem(STORAGE_PROJECT_TYPE);
    if (savedType === 'coursework' || savedType === 'practice' || savedType === 'diploma') {
      return savedType;
    }
    return null;
  });

  const [chapters, setChapters] = useState<ChapterData[]>(() => {
  if (urlType === 'coursework' || urlType === 'practice' || urlType === 'diploma') {
    return [...chapterTemplates[urlType]];
  }

  const savedChapters = localStorage.getItem(STORAGE_CHAPTERS);
  if (savedChapters) {
    try {
      const parsedChapters: ChapterData[] = JSON.parse(savedChapters);
      // Додаємо teacherComments якщо їх немає
      return parsedChapters.map((ch: ChapterData) => ({
        ...ch,
        teacherComments: ch.teacherComments || []
      }));
    } catch {
      return [];
    }
  }
  return [];
});


  // Синхронізуємо локальний стан з URL при зміні urlType
  useEffect(() => {
    if (urlType === 'coursework' || urlType === 'practice' || urlType === 'diploma') {
      setProjectType(urlType);
      setChapters([...chapterTemplates[urlType]]);
    }
  }, [urlType]);

  // Зберігаємо projectType в localStorage при зміні
  useEffect(() => {
    if (projectType) {
      localStorage.setItem(STORAGE_PROJECT_TYPE, projectType);
    }
  }, [projectType]);

  // Зберігаємо chapters в localStorage при зміні
  useEffect(() => {
    if (chapters.length > 0) {
      localStorage.setItem(STORAGE_CHAPTERS, JSON.stringify(chapters));
    }
  }, [chapters]);

  const handleSelectProject = (type: 'diploma' | 'coursework' | 'practice') => {
    setProjectType(type);
    setChapters([...chapterTemplates[type]]);
    window.history.pushState({}, '', `/tracker?type=${type}`);
  };

  const totalProgress = chapters.length > 0 ? Math.round(
    chapters.reduce((sum, ch) => sum + ch.progress, 0) / chapters.length
  ) : 0;

  const handleFileUpload = (chapterId: number, file: File) => {
    const fileSizeKB = Math.round(file.size / 1024);
    const fileSizeStr = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;
    
    setChapters(prev =>
      prev.map(ch =>
        ch.id === chapterId
          ? { 
              ...ch, 
              progress: 70, 
              status: 'review',
              uploadedFile: {
                name: file.name,
                uploadDate: new Date().toLocaleDateString('uk-UA'),
                size: fileSizeStr
              }
            }
          : ch
      )
    );
  };

  const handleDeleteFile = (chapterId: number) => {
    setChapters(prev =>
      prev.map(ch =>
        ch.id === chapterId
          ? { 
              ...ch, 
              progress: 0, 
              status: 'pending',
              uploadedFile: undefined
            }
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

  const handleUpdateNote = (chapterId: number, newNote: string) => {
    setChapters(prev =>
      prev.map(ch =>
        ch.id === chapterId
          ? { ...ch, studentNote: newNote }
          : ch
      )
    );
  };

  const toggleNoteExpansion = (chapterId: number) => {
    setExpandedNotes(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleCommentExpansion = (chapterId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleNoteEditing = (chapterId: number) => {
    setEditingNotes(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
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

              <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
                <CardHeader>
                  <CardTitle>{t('index.projectProgress')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border border-[var(--border)] rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(chapter.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-[var(--foreground)]">
                                {t(`thesis.chapters.${chapter.key}`)}
                              </p>
                              {(chapter.teacherComments?.length || 0) > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  {chapter.teacherComments?.length || 0}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {t(`thesis.chapterDescriptions.${chapter.key}`)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-[var(--muted-foreground)] ml-4">{chapter.progress}%</span>
                      </div>

                      <Progress value={chapter.progress} className="h-2 bg-[var(--muted)]" />

                      {/* Завантажений файл */}
                      {chapter.uploadedFile && (
                        <div className="bg-[var(--muted)] p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
                              <div>
                                <p className="text-sm font-medium">{chapter.uploadedFile.name}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  {chapter.uploadedFile.size} • {chapter.uploadedFile.uploadDate}
                                </p>
                              </div>
                            </div>
                            {chapter.status === 'review' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteFile(chapter.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

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

                        {chapter.status === 'review' && (
                          <Button
                            size="sm"
                            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]"
                            onClick={() => handleSendForReview(chapter.id)}
                          >
                            Надіслати на перевірку
                          </Button>
                        )}

                        {/* Кнопки для нотаток та коментарів */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleNoteExpansion(chapter.id)}
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          <StickyNote className="w-4 h-4 mr-1" />
                          Нотатки
                          {expandedNotes[chapter.id] ? <EyeOff className="w-3 h-3 ml-1" /> : <Eye className="w-3 h-3 ml-1" />}
                        </Button>

                        {(chapter.teacherComments?.length || 0) > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleCommentExpansion(chapter.id)}
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Коментарі ({chapter.teacherComments?.length || 0})
                            {expandedComments[chapter.id] ? <EyeOff className="w-3 h-3 ml-1" /> : <Eye className="w-3 h-3 ml-1" />}
                          </Button>
                        )}
                      </div>

                      {/* Розділ нотаток студента */}
                      {expandedNotes[chapter.id] && (
                        <div className="bg-[var(--muted)]/30 p-4 rounded-lg border border-[var(--border)]">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">Мої нотатки</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleNoteEditing(chapter.id)}
                              className="text-xs"
                            >
                              {editingNotes[chapter.id] ? 'Скасувати' : 'Редагувати'}
                            </Button>
                          </div>
                          
                          {editingNotes[chapter.id] ? (
                            <div className="space-y-2">
                              <Textarea
                                value={chapter.studentNote}
                                onChange={(e) => handleUpdateNote(chapter.id, e.target.value)}
                                placeholder="Додайте свої нотатки до цього розділу..."
                                className="min-h-[100px] bg-[var(--background)] border-[var(--border)]"
                              />
                              <Button
                                size="sm"
                                onClick={() => toggleNoteEditing(chapter.id)}
                                className="bg-[var(--primary)] text-[var(--primary-foreground)]"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Зберегти
                              </Button>
                            </div>
                          ) : (
                            <div className="text-sm text-[var(--muted-foreground)]">
                              {chapter.studentNote ? (
                                <div className="whitespace-pre-wrap bg-[var(--background)] p-3 rounded border border-[var(--border)]">
                                  {chapter.studentNote}
                                </div>
                              ) : (
                                <p className="italic text-center py-4">
                                  Нотаток поки немає. Натисніть "Редагувати" щоб додати.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Розділ коментарів викладача */}
                      {expandedComments[chapter.id] && (chapter.teacherComments?.length || 0) > 0 && (
                        <div className="bg-blue-50/30 border border-blue-200/50 p-4 rounded-lg">
                          <h4 className="font-medium text-sm mb-3 text-blue-900">Коментарі викладача</h4>
                          <div className="space-y-3">
                            {(chapter.teacherComments || []).map((comment) => (
                              <div key={comment.id} className="bg-[var(--background)] p-3 rounded border border-[var(--border)]">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge className={`text-xs ${getCommentBadgeStyle(comment.status)}`}>
                                    {comment.status === 'success' && '✓ Схвалено'}
                                    {comment.status === 'warning' && '⚠ Попередження'}
                                    {comment.status === 'error' && '✗ Потребує доопрацювання'}
                                    {comment.status === 'info' && 'ℹ Інформація'}
                                  </Badge>
                                  <span className="text-xs text-[var(--muted-foreground)]">
                                    {comment.date}
                                  </span>
                                </div>
                                <p className="text-sm text-[var(--foreground)]">
                                  {comment.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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