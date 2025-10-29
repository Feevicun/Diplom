import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, Download, CheckCircle, Clock, FileText, AlertCircle, Users, Star, Edit, X, Send, ChevronDown, Loader2, GraduationCap, User, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  course: number;
  faculty: string;
  specialty: string;
  workType: 'coursework' | 'diploma';
  workTitle: string;
  startDate: string;
  progress: number;
  status: 'active' | 'completed' | 'behind';
  lastActivity: string;
  grade: number;
  unreadComments: number;
  projectType: 'diploma' | 'coursework' | 'practice';
}

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
  type: 'feedback' | 'response';
  status: 'info' | 'warning' | 'error' | 'success';
}

interface Chapter {
  id: number;
  key: string;
  title: string;
  description: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentGrade: number | null;
  studentNote: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
    currentVersion: number;
  };
  teacherComments: Comment[];
  fileHistory?: Array<{
    id: string;
    fileName: string;
    fileSize: string;
    uploadDate: string;
    uploadedBy: string;
    userId: string;
    version: number;
    downloadUrl?: string;
    changes?: string;
  }>;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (chapterId: number, commentText: string, status: Comment['status']) => void;
  chapterId: number;
}

interface QuickCommentButtonProps {
  chapterId: number;
  onQuickComment: (chapterId: number, commentText: string, status: Comment['status']) => void;
}

interface StudentSelectProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelect: (student: Student) => void;
  loading: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'review':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'inProgress':
      return <FileText className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    case 'review':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'inProgress':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'review':
      return 'На перевірці';
    case 'inProgress':
      return 'В роботі';
    default:
      return 'Очікує';
  }
};

const getCommentBadgeStyle = (status: Comment['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
  }
};

// Початковий екран
const WelcomeScreen = ({ 
  students, 
  onSelectStudent, 
  loading 
}: { 
  students: Student[];
  onSelectStudent: (student: Student) => void;
  loading: boolean;
}) => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Панель оцінювання</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Оберіть студента для перегляду та оцінювання його роботи. Тут ви можете залишати коментарі, виставляти оцінки та відстежувати прогрес.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження студентів...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Немає студентів</h2>
          <p className="text-muted-foreground mb-6">
            У вас ще немає студентів для оцінювання. Почніть з прийняття заявок.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="/teacher/applications">
              <Users className="w-4 h-4 mr-2" />
              Перейти до заявок
            </a>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {students.slice(0, 6).map((student) => (
              <Card 
                key={student.id} 
                className="bg-card border border-border hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50"
                onClick={() => onSelectStudent(student)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{student.name}</CardTitle>
                      <CardDescription className="text-sm truncate">
                        {student.course} курс • {student.specialty}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Прогрес:</span>
                    <span className="font-semibold text-foreground">{student.progress}%</span>
                  </div>
                  <Progress value={student.progress} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Оцінка:</span>
                    <span className="font-bold text-primary">{student.grade}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Тип роботи:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.workType === 'coursework' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {student.workType === 'coursework' ? 'Курсова' : 'Дипломна'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 border-border text-foreground hover:bg-accent"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Переглянути роботу
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {students.length > 6 && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Показано 6 з {students.length} студентів
              </p>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Users className="w-4 h-4 mr-2" />
                Переглянути всіх студентів
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Improved Comment Section
const CommentSection = ({ comments, onAddComment, chapterId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentStatus, setCommentStatus] = useState<Comment['status']>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(chapterId, newComment, commentStatus);
      setNewComment('');
      setCommentStatus('info');
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm text-foreground">Коментарі ({comments.length})</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Згорнути' : 'Розгорнути'}
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg text-sm border ${
                  comment.type === 'feedback' 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                    : 'bg-muted border-border'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{comment.author}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCommentBadgeStyle(comment.status)}`}>
                      {comment.status === 'success' && '✓ Схвалено'}
                      {comment.status === 'warning' && '⚠ Попередження'}
                      {comment.status === 'error' && '✗ Потребує виправлень'}
                      {comment.status === 'info' && 'ℹ Інформація'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-foreground mt-2">{comment.text}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Ще немає коментарів</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 mb-2">
              <label className="text-sm text-foreground">Тип коментаря:</label>
              <select 
                value={commentStatus}
                onChange={(e) => setCommentStatus(e.target.value as Comment['status'])}
                className="text-sm border border-input rounded px-2 py-1 bg-background text-foreground"
              >
                <option value="info">Інформація</option>
                <option value="success">Схвалення</option>
                <option value="warning">Попередження</option>
                <option value="error">Потребує виправлень</option>
              </select>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишіть ваш коментар або відгук..."
              className="w-full p-3 border border-input rounded-lg text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary bg-background text-foreground"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewComment('');
                  setCommentStatus('info');
                }}
                className="text-muted-foreground"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-1" />
                Надіслати
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

// Improved Quick Comment Button
const QuickCommentButton = ({ chapterId, onQuickComment }: QuickCommentButtonProps) => {
  const [isQuickCommentOpen, setIsQuickCommentOpen] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [commentStatus, setCommentStatus] = useState<Comment['status']>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickComment.trim()) {
      onQuickComment(chapterId, quickComment, commentStatus);
      setQuickComment('');
      setCommentStatus('info');
      setIsQuickCommentOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsQuickCommentOpen(!isQuickCommentOpen)}
        className="border-border text-foreground hover:bg-accent"
      >
        <Edit className="w-4 h-4 mr-1" />
        Коментувати
      </Button>

      {isQuickCommentOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-foreground">Швидкий коментар</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsQuickCommentOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 mb-2">
              <label className="text-sm text-foreground">Тип:</label>
              <select 
                value={commentStatus}
                onChange={(e) => setCommentStatus(e.target.value as Comment['status'])}
                className="text-sm border border-input rounded px-2 py-1 bg-background text-foreground flex-1"
              >
                <option value="info">Інформація</option>
                <option value="success">Схвалення</option>
                <option value="warning">Попередження</option>
                <option value="error">Потребує виправлень</option>
              </select>
            </div>
            <textarea
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              placeholder="Напишіть коментар..."
              className="w-full p-2 border border-input rounded text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary bg-background text-foreground"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQuickCommentOpen(false)}
                className="text-muted-foreground"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!quickComment.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Надіслати
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Custom Select Component for better styling
const StudentSelect = ({ students, selectedStudent, onSelect, loading }: StudentSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="outline" className="w-64 justify-between border-border text-foreground" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        Завантаження...
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-64 justify-between border-border text-foreground hover:bg-accent"
      >
        <span className="truncate">{selectedStudent?.name || 'Оберіть студента'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => {
                onSelect(student);
                setIsOpen(false);
                // Оновлюємо URL при виборі студента
                window.history.pushState({}, '', `/teacher/grades?studentId=${student.id}`);
              }}
              className="w-full px-4 py-2 text-left hover:bg-accent first:rounded-t-lg last:rounded-b-lg border-b border-border last:border-b-0"
            >
              <div className="font-medium text-foreground">{student.name}</div>
              <div className="text-sm text-muted-foreground">
                {student.workType === 'coursework' ? 'Курсова' : 'Дипломна'} • {student.progress}%
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherGrades = () => {
  const [searchParams] = useSearchParams();
  const studentIdFromUrl = searchParams.get('studentId');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [chaptersData, setChaptersData] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // Завантаження списку студентів
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        // Завантажуємо студентів з localStorage або API
        const savedStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
        setStudents(savedStudents);

        if (savedStudents.length > 0) {
          // Якщо є studentId в URL, знаходимо відповідного студента
          if (studentIdFromUrl) {
            const studentFromUrl = savedStudents.find((s: Student) => s.id === studentIdFromUrl);
            if (studentFromUrl) {
              setSelectedStudent(studentFromUrl);
            }
          }
        }
      } catch (error) {
        console.error('Помилка завантаження студентів:', error);
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [studentIdFromUrl]);

  // Завантаження даних обраного студента
  useEffect(() => {
    const loadStudentData = async () => {
      if (!selectedStudent) return;
      
      try {
        setLoading(true);
        
 // Симулюємо завантаження даних з ThesisTracker
const mockChapters: Chapter[] = [
  { 
    id: 1, 
    key: 'intro', 
    title: 'Вступ',
    description: 'Вступна частина роботи',
    progress: 100, 
    status: 'completed', 
    studentGrade: 90, 
    studentNote: 'Додав основні тези та мету дослідження',
    teacherComments: [
      { 
        id: '1', 
        text: 'Добре розкрита тема, але потрібно більше прикладів', 
        author: 'Викладач', 
        date: '2024-01-15', 
        type: 'feedback',
        status: 'info'
      },
      { 
        id: '2', 
        text: 'Виправив помилки, додав приклади', 
        author: 'Студент', 
        date: '2024-01-16', 
        type: 'response',
        status: 'success'
      }
    ],
    fileHistory: [
      {
        id: '1',
        fileName: 'вступ.docx',
        fileSize: '245 KB',
        uploadDate: new Date().toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Перша версія вступу'
      }
    ]
  },
  { 
    id: 2, 
    key: 'theory', 
    title: 'Теоретична частина',
    description: 'Теоретичне підґрунтя дослідження',
    progress: 85, 
    status: 'review', 
    studentGrade: 85, 
    studentNote: 'Проаналізував основні теоретичні концепції',
    teacherComments: [
      { 
        id: '1', 
        text: 'Перевірте цитування джерел', 
        author: 'Викладач', 
        date: '2024-01-14', 
        type: 'feedback',
        status: 'warning'
      },
      { 
        id: '2', 
        text: 'Додав більше джерел та виправив цитування', 
        author: 'Студент', 
        date: '2024-01-17', 
        type: 'response',
        status: 'info'
      }
    ],
    uploadedFile: {
      name: 'теоретична_частина.docx',
      uploadDate: '2024-01-14',
      size: '512 KB',
      currentVersion: 2
    },
    fileHistory: [
      {
        id: '2',
        fileName: 'теоретична_частина_v2.docx',
        fileSize: '512 KB',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 2,
        changes: 'Додано більше джерел, виправлено цитування'
      },
      {
        id: '1',
        fileName: 'теоретична_частина_v1.docx',
        fileSize: '487 KB',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Перша версія теоретичної частини'
      }
    ]
  },
  { 
    id: 3, 
    key: 'design', 
    title: 'Проектування',
    description: 'Архітектура та дизайн системи',
    progress: 50, 
    status: 'inProgress', 
    studentGrade: null, 
    studentNote: 'Розробляю архітектуру системи, вивчаю технології',
    teacherComments: [
      { 
        id: '1', 
        text: 'Рекомендую розглянути використання React для фронтенду', 
        author: 'Викладач', 
        date: '2024-01-10', 
        type: 'feedback',
        status: 'info'
      }
    ],
    uploadedFile: {
      name: 'проектування_архітектури.docx',
      uploadDate: '2024-01-10',
      size: '321 KB',
      currentVersion: 1
    },
    fileHistory: [
      {
        id: '1',
        fileName: 'проектування_архітектури.docx',
        fileSize: '321 KB',
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Початковий проект архітектури'
      }
    ]
  },
  { 
    id: 4, 
    key: 'implementation', 
    title: 'Реалізація',
    description: 'Практична реалізація проекту',
    progress: 30, 
    status: 'inProgress', 
    studentGrade: null, 
    studentNote: 'Почав реалізацію основного функціоналу',
    teacherComments: [
      { 
        id: '1', 
        text: 'Зверніть увагу на обробку помилок у коді', 
        author: 'Викладач', 
        date: '2024-01-08', 
        type: 'feedback',
        status: 'warning'
      }
    ],
    uploadedFile: {
      name: 'код_реалізації.zip',
      uploadDate: '2024-01-08',
      size: '1.2 MB',
      currentVersion: 1
    },
    fileHistory: [
      {
        id: '1',
        fileName: 'код_реалізації.zip',
        fileSize: '1.2 MB',
        uploadDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Початкова версія коду'
      }
    ]
  },
  { 
    id: 5, 
    key: 'testing', 
    title: 'Тестування',
    description: 'Тестування та валідація системи',
    progress: 15, 
    status: 'inProgress', 
    studentGrade: null, 
    studentNote: 'Готую тестові сценарії',
    teacherComments: [
      { 
        id: '1', 
        text: 'Розробіть план тестування перед початком', 
        author: 'Викладач', 
        date: '2024-01-05', 
        type: 'feedback',
        status: 'info'
      }
    ],
    uploadedFile: {
      name: 'план_тестування.docx',
      uploadDate: '2024-01-05',
      size: '156 KB',
      currentVersion: 1
    },
    fileHistory: [
      {
        id: '1',
        fileName: 'план_тестування.docx',
        fileSize: '156 KB',
        uploadDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Початковий план тестування'
      }
    ]
  },
  { 
    id: 6, 
    key: 'conclusion', 
    title: 'Висновки',
    description: 'Висновки та результати дослідження',
    progress: 10, 
    status: 'pending', 
    studentGrade: null, 
    studentNote: 'Ще не розпочав роботу над висновками',
    teacherComments: [],
    fileHistory: []
  },
  { 
    id: 7, 
    key: 'literature', 
    title: 'Список літератури',
    description: 'Перелік використаних джерел',
    progress: 95, 
    status: 'review', 
    studentGrade: null, 
    studentNote: 'Скомпілював основні джерела',
    teacherComments: [
      { 
        id: '1', 
        text: 'Додайте ще 2-3 сучасні джерела за останні 3 роки', 
        author: 'Викладач', 
        date: '2024-01-12', 
        type: 'feedback',
        status: 'warning'
      }
    ],
    uploadedFile: {
      name: 'список_літератури.docx',
      uploadDate: '2024-01-12',
      size: '89 KB',
      currentVersion: 1
    },
    fileHistory: [
      {
        id: '1',
        fileName: 'список_літератури.docx',
        fileSize: '89 KB',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Початковий список літератури'
      }
    ]
  },
  { 
    id: 8, 
    key: 'appendix', 
    title: 'Додатки',
    description: 'Додаткові матеріали та додатки',
    progress: 25, 
    status: 'inProgress', 
    studentGrade: null, 
    studentNote: 'Готую діаграми та схеми',
    teacherComments: [
      { 
        id: '1', 
        text: 'Додайте UML діаграми для кращої візуалізації', 
        author: 'Викладач', 
        date: '2024-01-09', 
        type: 'feedback',
        status: 'info'
      }
    ],
    uploadedFile: {
      name: 'діаграми.pdf',
      uploadDate: '2024-01-09',
      size: '745 KB',
      currentVersion: 1
    },
    fileHistory: [
      {
        id: '1',
        fileName: 'діаграми.pdf',
        fileSize: '745 KB',
        uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedBy: selectedStudent.name,
        userId: selectedStudent.id,
        version: 1,
        changes: 'Початкові діаграми системи'
      }
    ]
  }
];

setChaptersData(mockChapters);
        
      } catch (error) {
        console.error('Помилка завантаження даних студента:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [selectedStudent]);

  const handleAddComment = async (chapterId: number, commentText: string, status: Comment['status']) => {
    if (!selectedStudent) return;

    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        text: commentText,
        author: 'Викладач',
        date: new Date().toLocaleDateString('uk-UA'),
        type: 'feedback',
        status
      };

      setChaptersData(prevChapters =>
        prevChapters.map(chapter =>
          chapter.id === chapterId
            ? {
                ...chapter,
                teacherComments: [...chapter.teacherComments, newComment],
                status: status === 'error' ? 'review' : chapter.status
              }
            : chapter
        )
      );

      setStudents(prev =>
        prev.map(student =>
          student.id === selectedStudent.id
            ? { ...student, unreadComments: student.unreadComments + 1 }
            : student
        )
      );

    } catch (error) {
      console.error('Помилка додавання коментаря:', error);
    }
  };

  const handleQuickComment = (chapterId: number, commentText: string, status: Comment['status']) => {
    handleAddComment(chapterId, commentText, status);
  };

  const handleGradeUpdate = async (chapterId: number, grade: number) => {
    if (!selectedStudent) return;

    try {
      setChaptersData(prevChapters =>
        prevChapters.map(chapter =>
          chapter.id === chapterId
            ? { ...chapter, studentGrade: grade, status: 'completed' }
            : chapter
        )
      );

      const gradedChapters = chaptersData.filter(ch => ch.studentGrade !== null);
      const newAverageGrade = gradedChapters.length > 0 
        ? Math.round(gradedChapters.reduce((sum, ch) => sum + (ch.studentGrade || 0), 0) / gradedChapters.length)
        : selectedStudent.grade;

      setStudents(prev =>
        prev.map(student =>
          student.id === selectedStudent.id
            ? { ...student, grade: newAverageGrade }
            : student
        )
      );

    } catch (error) {
      console.error('Помилка оновлення оцінки:', error);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    window.history.pushState({}, '', `/teacher/grades?studentId=${student.id}`);
  };

  const totalProgress = chaptersData.length > 0 
    ? Math.round(chaptersData.reduce((sum, ch) => sum + ch.progress, 0) / chaptersData.length)
    : 0;

  // Якщо не обрано студента, показуємо початковий екран
  if (!selectedStudent) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen">
          <div className="sticky top-0 z-10 bg-background border-b border-border">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto">
            <WelcomeScreen 
              students={students} 
              onSelectStudent={handleSelectStudent}
              loading={studentsLoading}
            />
          </main>
        </div>
      </div>
    );
  }

  // Решта коду залишається незмінною (відображення обраного студента)
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
            {/* Header with Student Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Панель оцінювання</h1>
                <p className="text-muted-foreground mt-1">Керування прогресом та оцінками студентів</p>
              </div>
              <StudentSelect
                students={students}
                selectedStudent={selectedStudent}
                onSelect={setSelectedStudent}
                loading={studentsLoading}
              />
            </div>

            {/* Student Overview Card */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">
                  Робота студента: {selectedStudent.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Тема: "{selectedStudent.workTitle}" • {selectedStudent.faculty}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Спеціальність:</span> {selectedStudent.specialty}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Курс:</span> {selectedStudent.course}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Тип роботи:</span> {selectedStudent.workType === 'coursework' ? 'Курсова' : 'Дипломна'}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Поточна оцінка:</span> 
                      <span className="font-bold text-primary ml-2">{selectedStudent.grade}/100</span>
                    </p>
                  </div>
                  <div className="text-center md:text-right space-y-2">
                    <div className="text-3xl font-bold text-primary">{totalProgress}%</div>
                    <p className="text-sm text-muted-foreground">Загальний прогрес</p>
                    <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{selectedStudent.unreadComments} непрочитаних коментарів</span>
                    </div>
                  </div>
                </div>
                <Progress value={totalProgress} className="h-2 bg-muted" />
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Написати загальний коментар
                    {selectedStudent.unreadComments > 0 && (
                      <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs">
                        {selectedStudent.unreadComments}
                      </span>
                    )}
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Заплановані зустрічі
                  </Button>
                  <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                    <Download className="w-4 h-4 mr-2" />
                    Експорт оцінок
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chapters Progress */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Прогрес по розділах</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Переглядайте роботи студентів, залишайте коментарі та виставляйте оцінки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Завантаження даних студента...</p>
                  </div>
                ) : (
                  chaptersData.map((chapter) => (
                    <div key={chapter.id} className="border-b border-border pb-6 last:border-none last:pb-0">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(chapter.status)}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-medium text-foreground">
                                {chapter.title}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(chapter.status)}`}>
                                {getStatusText(chapter.status)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {chapter.description}
                            </p>
                            {chapter.studentNote && (
                              <p className="text-sm text-blue-600 mt-1">
                                <strong>Нотатка студента:</strong> {chapter.studentNote}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Прогрес: </span>
                            <span className="font-medium text-foreground">{chapter.progress}%</span>
                          </div>
                          {chapter.studentGrade && (
                            <div>
                              <span className="text-muted-foreground">Оцінка: </span>
                              <span className="font-bold text-primary">{chapter.studentGrade}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Progress value={chapter.progress} className="h-2 mt-2 bg-muted" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                        <div className="flex flex-wrap gap-2">
                          {chapter.uploadedFile && (
                            <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent">
                              <FileText className="w-4 h-4 mr-1" />
                              Переглянути роботу
                            </Button>
                          )}
                          <QuickCommentButton
                            chapterId={chapter.id}
                            onQuickComment={handleQuickComment}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          {chapter.status === 'review' && (
                            <Button 
                              size="sm" 
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => {
                                const grade = prompt('Введіть оцінку (0-100):');
                                if (grade && !isNaN(parseInt(grade))) {
                                  handleGradeUpdate(chapter.id, parseInt(grade));
                                }
                              }}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Оцінити розділ
                            </Button>
                          )}
                          {chapter.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-white"
                              onClick={() => {
                                const grade = prompt('Введіть нову оцінку (0-100):', chapter.studentGrade?.toString() || '0');
                                if (grade && !isNaN(parseInt(grade))) {
                                  handleGradeUpdate(chapter.id, parseInt(grade));
                                }
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Змінити оцінку
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Comment Section */}
                      <CommentSection
                        comments={chapter.teacherComments}
                        onAddComment={handleAddComment}
                        chapterId={chapter.id}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherGrades;