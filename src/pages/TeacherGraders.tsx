import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, Download, CheckCircle, Clock, FileText, AlertCircle, Users, Star, Edit, X, Send, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

interface Student {
  id: number;
  name: string;
  progress: number;
  lastActivity: string;
  status: string;
  grade: number;
  unreadComments: number;
}

interface Comment {
  id: number;
  text: string;
  author: string;
  date: string;
  type: string;
}

interface Chapter {
  id: number;
  key: string;
  progress: number;
  status: string;
  studentGrade: number | null;
  comments: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (chapterId: number, commentText: string) => void;
  chapterId: number;
}

interface QuickCommentButtonProps {
  chapterId: number;
  onQuickComment: (chapterId: number, commentText: string) => void;
}

interface StudentSelectProps {
  students: Student[];
  selectedStudent: Student;
  onSelect: (student: Student) => void;
}

const students: Student[] = [
  { 
    id: 1, 
    name: 'Андрій Коваленко', 
    progress: 65, 
    lastActivity: '2 дні тому',
    status: 'inProgress',
    grade: 85,
    unreadComments: 3
  },
  { 
    id: 2, 
    name: 'Марія Петренко', 
    progress: 42, 
    lastActivity: '1 день тому',
    status: 'needsAttention',
    grade: 72,
    unreadComments: 0
  },
  { 
    id: 3, 
    name: 'Олексій Іваненко', 
    progress: 90, 
    lastActivity: '5 годин тому',
    status: 'excellent',
    grade: 94,
    unreadComments: 1
  }
];

const chapters: Chapter[] = [
  { 
    id: 1, 
    key: 'intro', 
    progress: 100, 
    status: 'completed', 
    studentGrade: 90, 
    comments: [
      { id: 1, text: 'Добре розкрита тема, але потрібно більше прикладів', author: 'Викладач', date: '2024-01-15', type: 'feedback' },
      { id: 2, text: 'Виправив помилки, додав приклади', author: 'Студент', date: '2024-01-16', type: 'response' }
    ] 
  },
  { 
    id: 2, 
    key: 'theory', 
    progress: 85, 
    status: 'review', 
    studentGrade: 85, 
    comments: [
      { id: 1, text: 'Перевірте цитування джерел', author: 'Викладач', date: '2024-01-14', type: 'feedback' }
    ] 
  },
  { 
    id: 3, 
    key: 'design', 
    progress: 50, 
    status: 'inProgress', 
    studentGrade: null, 
    comments: [] 
  },
  { 
    id: 4, 
    key: 'implementation', 
    progress: 30, 
    status: 'inProgress', 
    studentGrade: null, 
    comments: [] 
  },
  { 
    id: 5, 
    key: 'conclusion', 
    progress: 20, 
    status: 'inProgress', 
    studentGrade: null, 
    comments: [] 
  }
];

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

// Improved Comment Section
const CommentSection = ({ comments, onAddComment, chapterId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(chapterId, newComment);
      setNewComment('');
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
                  <span className="font-medium text-foreground">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-foreground">{comment.text}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Ще немає коментарів</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                onClick={() => setNewComment('')}
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickComment.trim()) {
      onQuickComment(chapterId, quickComment);
      setQuickComment('');
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
const StudentSelect = ({ students, selectedStudent, onSelect }: StudentSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-64 justify-between border-border text-foreground hover:bg-accent"
      >
        <span className="truncate">{selectedStudent.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-20">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => {
                onSelect(student);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-accent first:rounded-t-lg last:rounded-b-lg border-b border-border last:border-b-0"
            >
              <div className="font-medium text-foreground">{student.name}</div>
              <div className="text-sm text-muted-foreground">Прогрес: {student.progress}%</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherGrades = () => {
  const { t } = useTranslation();
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [chaptersData, setChaptersData] = useState<Chapter[]>(chapters);

  const handleAddComment = (chapterId: number, commentText: string) => {
    setChaptersData(prevChapters =>
      prevChapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              comments: [
                ...chapter.comments,
                {
                  id: Math.max(0, ...chapter.comments.map(c => c.id)) + 1,
                  text: commentText,
                  author: 'Викладач',
                  date: new Date().toISOString().split('T')[0],
                  type: 'feedback'
                }
              ]
            }
          : chapter
      )
    );
  };

  const handleQuickComment = (chapterId: number, commentText: string) => {
    handleAddComment(chapterId, commentText);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Виправлена секція Sidebar */}
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Панель викладача</h1>
                <p className="text-muted-foreground mt-1">Керування прогресом та оцінками студентів</p>
              </div>
              <StudentSelect
                students={students}
                selectedStudent={selectedStudent}
                onSelect={setSelectedStudent}
              />
            </div>

            {/* Student Overview Card */}
            <Card className="bg-card border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">
                  Робота студента: {selectedStudent.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Тема: "Розробка системи управління навчальним процесом"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Початок:</span> 01.09.2024
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Дедлайн:</span> 15.01.2025
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Поточна оцінка:</span> 
                      <span className="font-bold text-primary ml-2">{selectedStudent.grade}/100</span>
                    </p>
                  </div>
                  <div className="text-center md:text-right space-y-2">
                    <div className="text-3xl font-bold text-primary">{selectedStudent.progress}%</div>
                    <p className="text-sm text-muted-foreground">Загальний прогрес</p>
                    <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{selectedStudent.unreadComments} непрочитаних коментарів</span>
                    </div>
                  </div>
                </div>
                <Progress value={selectedStudent.progress} className="h-2 bg-muted" />
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Написати коментар
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
                {chaptersData.map((chapter) => (
                  <div key={chapter.id} className="border-b border-border pb-6 last:border-none last:pb-0">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(chapter.status)}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              {t(`thesis.chapters.${chapter.key}`)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(chapter.status)}`}>
                              {getStatusText(chapter.status)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t(`thesis.chapterDescriptions.${chapter.key}`)}
                          </p>
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
                        <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-accent">
                          <FileText className="w-4 h-4 mr-1" />
                          Переглянути роботу
                        </Button>
                        <QuickCommentButton
                          chapterId={chapter.id}
                          onQuickComment={handleQuickComment}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        {chapter.status === 'review' && (
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Star className="w-4 h-4 mr-1" />
                            Оцінити розділ
                          </Button>
                        )}
                        {chapter.status === 'completed' && (
                          <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-white">
                            <Edit className="w-4 h-4 mr-1" />
                            Змінити оцінку
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Comment Section */}
                    <CommentSection
                      comments={chapter.comments}
                      onAddComment={handleAddComment}
                      chapterId={chapter.id}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* All Students List */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Всі студенти групи</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Загальний огляд прогресу та оцінок всіх студентів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg transition-colors ${
                        student.id === selectedStudent.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Остання активність: {student.lastActivity}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary">{student.progress}%</div>
                          <div className="text-xs text-muted-foreground">Прогрес</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary">{student.grade}</div>
                          <div className="text-xs text-muted-foreground">Оцінка</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-border text-foreground">
                            <MessageSquare className="w-4 h-4" />
                            {student.unreadComments > 0 && (
                              <span className="ml-1 bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 text-xs">
                                {student.unreadComments}
                              </span>
                            )}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Переглянути
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherGrades;