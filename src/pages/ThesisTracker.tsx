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
  Save,
  Loader2
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

// API функції
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

// Компонент початкового екрану
const WelcomeScreen = ({ onSelectProject, loading }: { 
  onSelectProject: (type: 'diploma' | 'coursework' | 'practice') => void;
  loading: boolean;
}) => {
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
              onClick={() => !loading && onSelectProject(option.type)}
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
                  onClick={() => !loading && onSelectProject(option.type)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('welcome.startButton')
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Решта коду для екрану допомоги залишається той же */}
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

  // Стан компоненту
  const [projectType, setProjectType] = useState<'diploma' | 'coursework' | 'practice' | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [editingNotes, setEditingNotes] = useState<Record<number, boolean>>({});

  // Завантаження даних при ініціалізації
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Якщо є URL параметр, встановлюємо тип проекту
        if (urlType && ['diploma', 'coursework', 'practice'].includes(urlType)) {
          await apiRequest('/user-project', {
            method: 'POST',
            body: JSON.stringify({ projectType: urlType })
          });
          await loadProjectData(urlType as any);
          return;
        }

        // Інакше завантажуємо активний тип проекту користувача
        const response = await apiRequest('/user-project');
        if (response.projectType) {
          await loadProjectData(response.projectType);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [urlType]);

  const loadProjectData = async (type: 'diploma' | 'coursework' | 'practice') => {
    try {
      setProjectType(type);
      
      // Завантажуємо глави для цього типу проекту
      const chaptersResponse = await apiRequest(`/user-chapters?projectType=${type}`);
      
      // Завантажуємо коментарі для кожної глави
      const chaptersWithComments = await Promise.all(
        chaptersResponse.map(async (chapter: ChapterData) => {
          try {
            const comments = await apiRequest(`/teacher-comments?projectType=${type}&chapterKey=${chapter.key}`);
            return { ...chapter, teacherComments: comments };
          } catch (error) {
            console.warn(`Error loading comments for chapter ${chapter.key}:`, error);
            return { ...chapter, teacherComments: [] };
          }
        })
      );
      
      setChapters(chaptersWithComments);
      
      // Оновлюємо URL без перезавантаження
      window.history.replaceState({}, '', `/tracker?type=${type}`);
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };

  const handleSelectProject = async (type: 'diploma' | 'coursework' | 'practice') => {
    try {
      setLoading(true);
      
      await apiRequest('/user-project', {
        method: 'POST',
        body: JSON.stringify({ projectType: type })
      });

      await loadProjectData(type);
    } catch (error) {
      console.error('Error selecting project:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChapter = async (chapterKey: string, updates: any) => {
    try {
      await apiRequest(`/user-chapters/${chapterKey}`, {
        method: 'PUT',
        body: JSON.stringify({
          projectType,
          ...updates
        })
      });

      // Оновлюємо локальний стан
      setChapters(prev =>
        prev.map(ch =>
          ch.key === chapterKey
            ? { ...ch, ...updates }
            : ch
        )
      );

      // Якщо статус змінився на inProgress, можливо потрібно оновити коментарі
      if (updates.status === 'inProgress') {
        try {
          const comments = await apiRequest(`/teacher-comments?projectType=${projectType}&chapterKey=${chapterKey}`);
          setChapters(prev =>
            prev.map(ch =>
              ch.key === chapterKey
                ? { ...ch, teacherComments: comments }
                : ch
            )
          );
        } catch (error) {
          console.warn('Error updating comments:', error);
        }
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const handleFileUpload = async (chapterId: number, file: File) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    const fileSizeKB = Math.round(file.size / 1024);
    const fileSizeStr = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;
    
    const uploadedFile = {
      name: file.name,
      size: fileSizeStr
    };

    await updateChapter(chapter.key, {
      progress: 70,
      status: 'review',
      uploadedFile
    });
  };

  const handleDeleteFile = async (chapterId: number) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    try {
      await apiRequest(`/user-chapters/${chapter.key}/file?projectType=${projectType}`, {
        method: 'DELETE'
      });

      // Оновлюємо локальний стан
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
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleSendForReview = async (chapterId: number) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    await updateChapter(chapter.key, { status: 'inProgress' });
  };

  const handleUpdateNote = async (chapterId: number, newNote: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    await updateChapter(chapter.key, { studentNote: newNote });
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

  const totalProgress = chapters.length > 0 ? Math.round(
    chapters.reduce((sum, ch) => sum + ch.progress, 0) / chapters.length
  ) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Завантаження...</p>
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
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          {!projectType ? (
            <WelcomeScreen onSelectProject={handleSelectProject} loading={loading} />
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
                                onChange={(e) => {
                                  const newNote = e.target.value;
                                  setChapters(prev =>
                                    prev.map(ch =>
                                      ch.id === chapter.id
                                        ? { ...ch, studentNote: newNote }
                                        : ch
                                    )
                                  );
                                }}
                                placeholder="Додайте свої нотатки до цього розділу..."
                                className="min-h-[100px] bg-[var(--background)] border-[var(--border)]"
                              />
                              <Button
                                size="sm"
                                onClick={async () => {
                                  await handleUpdateNote(chapter.id, chapter.studentNote);
                                  toggleNoteEditing(chapter.id);
                                }}
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