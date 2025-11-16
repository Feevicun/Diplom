// AIAssistant.tsx
import { useState, useEffect } from 'react';
import {
  Zap,
  FileText,
  Lightbulb,
  Search,
  CheckCircle,
  Copy,
  RefreshCw,
  Sparkles,
  Crown,
  User,
  BookOpen,
  Target,
  Send,
  X,
  BarChart3,
  AlertTriangle,
  ThumbsUp,
  Edit3,
  GraduationCap,
  Star,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Calendar,
  Phone,
  Building,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { TeacherProfileModal } from '@/components/TeacherProfileModal';

// Імпорт типів
import type { 
  SuggestedTopic, 
  AIFeature, 
  StructureItem,
  TextAnalysisResult 
} from '../types/types';

// Тип для форми заявки
interface ApplicationFormData {
  topic: string;
  description: string;
  goals: string;
  requirements: string;
  teacherId?: string;
  deadline: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_program?: string;
  student_year?: string;
  student_group?: string;
  student_id?: string;
}

// Типи для пошуку викладачів
interface TeacherMatch {
  teacher: {
    id: string;
    name: string;
    title: string;
    department: string;
    faculty: string;
    bio: string;
    avatarUrl: string | null;
    email: string;
    officeHours: string;
    phone: string;
    website: string;
    skills: string[];
    rating: number;
    studentCount: number;
    projectsCompleted: number;
    isAvailable: boolean;
    expertise: string[];
  };
  relevanceScore: number;
  matchCount: number;
  searchResults: Array<{
    type: 'skill' | 'work' | 'direction' | 'future_topic';
    id: string;
    title: string;
    description: string;
    subtype?: string;
    year?: number;
  }>;
  matchBreakdown: {
    skills: number;
    works: number;
    directions: number;
    topics: number;
  };
  detailedRelevance: {
    skills: number;
    works: number;
    directions: number;
    topics: number;
  };
}

// Розширений тип для теми з рекомендованими викладачами
interface SuggestedTopicWithTeachers extends SuggestedTopic {
  teacherMatches?: TeacherMatch[];
  showTeachers?: boolean;
  error?: string;
}

// Додамо тип для PremiumSuggestion
interface PremiumSuggestion {
  id: string;
  type: string;
  title: string;
  description?: string;
  topic_description?: string;
  relevance: number;
  url?: string;
  work_type?: string;
  year?: number;
}

// Тип для інформації про студента
interface StudentInfo {
  name: string;
  email: string;
  phone?: string;
  program?: string;
  year?: string;
  group?: string;
  id?: string;
  bio?: string;
}

// Функція для отримання токену автентифікації
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token');
  }
  return null;
};

// Функція для перевірки автентифікації
const checkAuthentication = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return true;
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      return false;
    }
  } catch {
    return false;
  }
};

// Функція для отримання faculty_id з токена
const getFacultyIdFromToken = (): number | null => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const facultyId = payload.facultyId || 
                     payload.faculty_id || 
                     payload.faculty ||
                     payload.user?.faculty_id ||
                     payload.user?.facultyId;
    
    if (facultyId) {
      return parseInt(facultyId);
    }
    
    return null;
  } catch {
    return null;
  }
};

// Додайте цю функцію для отримання повних даних користувача
const getCurrentUserWithFaculty = async (): Promise<{ faculty_id: number } | null> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch('/api/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    
    const data = await response.json();
    const facultyId = data.user?.faculty_id || 
                     data.user?.facultyId || 
                     data.faculty_id ||
                     data.facultyId ||
                     data.user?.department?.faculty_id ||
                     data.department?.faculty_id;

    if (facultyId) {
      return { faculty_id: parseInt(facultyId) };
    }
    
    return null;
  } catch {
    return null;
  }
};

// Функція для отримання інформації про студента
const getStudentInfo = async (): Promise<StudentInfo | null> => {
  try {
    // Спершу пробуємо отримати з localStorage (найшвидший спосіб)
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        console.log('📋 Student data from localStorage:', userData);
        
        // Перевіряємо, чи є коректне ім'я
        if (userData.name && userData.name !== 'Студент' && userData.name.trim() !== '') {
          return {
            name: userData.name,
            email: userData.email || '',
            phone: userData.phone || '',
            program: userData.program || userData.specialization || '',
            year: userData.year || userData.course || '',
            group: userData.group || '',
            id: userData.id || userData.userId || '',
            bio: userData.bio || ''
          };
        }
      }
    } catch {
      console.log('LocalStorage data not available or invalid');
    }

    // Якщо в localStorage немає даних, робимо API запит
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    console.log('🔍 Fetching student info from API...');
    
    const response = await fetch('/api/current-user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Full student info from API:', data);
      
      // Покращена логіка отримання імені
      let studentName = '';
      
      // Пріоритети отримання імені
      if (data.user?.full_name) studentName = data.user.full_name;
      else if (data.user?.name) studentName = data.user.name;
      else if (data.user?.first_name && data.user?.last_name) {
        studentName = `${data.user.first_name} ${data.user.last_name}`.trim();
      }
      else if (data.full_name) studentName = data.full_name;
      else if (data.name) studentName = data.name;
      else if (data.email) {
        // Якщо імені немає, створюємо з email
        const emailPart = data.email.split('@')[0];
        studentName = emailPart.split('.').map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
      } else {
        studentName = 'Студент';
      }

      const studentInfo = {
        name: studentName,
        email: data.user?.email || data.email || '',
        phone: data.user?.phone || data.phone || '',
        program: data.user?.program?.name || data.program || data.user?.program_name || data.user?.specialization || '',
        year: data.user?.year || data.year || data.user?.course || '',
        group: data.user?.group || data.group || data.user?.student_group || data.student_group || '',
        id: data.user?.id || data.id || data.userId || '',
        bio: data.user?.bio || data.bio || ''
      };

      // ОНОВЛЮЄМО localStorage з новими даними
      try {
        localStorage.setItem('currentUser', JSON.stringify(studentInfo));
        console.log('✅ Updated localStorage with student data:', studentInfo);
      } catch {
        console.log('⚠️ Could not update localStorage');
      }

      return studentInfo;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching student info:', error);
    return null;
  }
};

// Додайте цю функцію для отримання оновлених даних студента
const getUpdatedStudentInfo = async (): Promise<StudentInfo | null> => {
  try {
    // Спершу пробуємо отримати з localStorage
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        console.log('📋 Updated student data from localStorage:', userData);
        
        if (userData.name && userData.name !== 'Студент' && userData.name.trim() !== '') {
          return {
            name: userData.name,
            email: userData.email || '',
            phone: userData.phone || '',
            program: userData.program || userData.specialization || '',
            year: userData.year || userData.course || '',
            group: userData.group || '',
            id: userData.id || userData.userId || '',
            bio: userData.bio || ''
          };
        }
      }
    } catch {
      console.log('LocalStorage data not available or invalid');
    }

    // Якщо в localStorage немає даних, робимо API запит
    return await getStudentInfo();
  } catch (error) {
    console.error('❌ Error fetching updated student info:', error);
    return null;
  }
};

// API клієнт для обробки запитів
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(endpoint, config);
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    throw new Error('Authentication required. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Функція для отримання дедлайну за замовчуванням (через 3 місяці)
const getDefaultDeadline = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().split('T')[0];
};

// Компонент для вибору довільного викладача
const ChooseRandomTeacher = ({ onSelect }: { onSelect: () => void }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="border border-dashed border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2 text-lg">
              {t('aiAssistant.teachers.notFound.title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('aiAssistant.teachers.notFound.description')}
            </p>
          </div>
          <Button onClick={onSelect} className="w-full max-w-xs">
            <GraduationCap className="w-4 h-4 mr-2" />
            {t('aiAssistant.teachers.chooseTeacher')}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            {t('aiAssistant.teachers.chooseTeacherHint')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Компактний компонент картки викладача з Tooltip
const CompactTeacherCard = ({ 
  match, 
  onSelect,
  onViewProfile
}: { 
  match: TeacherMatch;
  topic: SuggestedTopicWithTeachers;
  onSelect: () => void;
  onViewProfile: (teacherId: string) => void;
}) => {
  const { t } = useTranslation();
  const teacher = match.teacher;
  const [showDetails, setShowDetails] = useState(false);
  
  // Функція для отримання ініціалів
  const getInitials = (name: string): string => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Безпечне отримання email
  const getTeacherEmail = () => {
    if (teacher.email && teacher.email.includes('@') && teacher.email.includes('.')) {
      return teacher.email;
    }
    return 'email@lnu.edu.ua';
  };

  // Безпечне отримання посади
  const getTeacherTitle = () => {
    return teacher.title || t('aiAssistant.teachers.defaultTitle');
  };

  // Безпечне отримання кафедри
  const getTeacherDepartment = () => {
    return teacher.department || t('aiAssistant.teachers.defaultDepartment');
  };

  // Функція для відкриття модального вікна з профілем викладача
  const handleViewFullProfile = () => {
    if (!teacher.id) {
      toast.error(t('aiAssistant.teachers.profileError'));
      return;
    }
    
    // Очищаємо ID від зайвих символів
    const cleanTeacherId = teacher.id.toString().replace(/[^a-zA-Z0-9-_]/g, '');
    
    if (!cleanTeacherId) {
      toast.error('Некоректний ID викладача');
      return;
    }

    console.log('Відкриття профілю викладача з ID:', cleanTeacherId);
    onViewProfile(cleanTeacherId);
  };

  return (
    <Card className="border border-border hover:shadow-sm transition-all">
      <CardContent className="p-3">
        {/* Основна інформація */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Аватар з Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar 
                      className="w-10 h-10 border border-border cursor-pointer hover:shadow-md transition-all"
                      onClick={handleViewFullProfile}
                    >
                      <AvatarImage src={teacher.avatarUrl || ''} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm hover:bg-primary/20 transition-colors">
                        {getInitials(teacher.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Індикатор онлайн статусу */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      teacher.isAvailable !== false ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="max-w-xs p-3 bg-popover text-popover-foreground shadow-md border"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={teacher.avatarUrl || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{getTeacherTitle()}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{getTeacherEmail()}</span>
                      </div>
                      {teacher.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                      {teacher.department && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{getTeacherDepartment()}</span>
                        </div>
                      )}
                    </div>

                    {/* Статистика */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{(teacher.rating || 4.5).toFixed(1)}/5</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span>{teacher.studentCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{teacher.projectsCompleted || 0}</span>
                      </div>
                    </div>

                    {/* Кнопка перегляду профілю */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 text-xs"
                      onClick={handleViewFullProfile}
                    >
                      <User className="w-3 h-3 mr-1" />
                      {t('aiAssistant.teachers.viewFullProfile')}
                    </Button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={handleViewFullProfile}
                >
                  {teacher.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {match.relevanceScore}%
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-1 truncate">
                {getTeacherTitle()}
              </p>
              
              <p className="text-xs text-muted-foreground truncate">
                {getTeacherDepartment()}
              </p>

              {/* Email - завжди показуємо */}
              <p className="text-xs text-primary truncate mt-1">
                {getTeacherEmail()}
              </p>

              {/* Статус доступності */}
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  teacher.isAvailable !== false ? 'bg-green-500' : 'bg-muted-foreground'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {teacher.isAvailable !== false ? t('aiAssistant.teachers.available') : t('aiAssistant.teachers.busy')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Кнопка дії */}
          <Button 
            size="sm" 
            onClick={onSelect}
            className="ml-2 flex-shrink-0"
          >
            <Send className="w-3 h-3 mr-1" />
            {t('aiAssistant.teachers.select')}
          </Button>
        </div>

        {/* Детальна інформація (розгорнута) */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {/* Навички */}
            {teacher.skills && teacher.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1">{t('aiAssistant.teachers.skills')}:</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.skills.slice(0, 3).map((skill: string, skillIndex: number) => (
                    <Badge 
                      key={skillIndex} 
                      variant="secondary"
                      className="text-xs bg-muted text-muted-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {teacher.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{teacher.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Контакти */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-muted-foreground">{getTeacherEmail()}</span>
              </div>
              
              {teacher.officeHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{teacher.officeHours}</span>
                </div>
              )}
            </div>

            {/* Статистика */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{(teacher.rating || 4.5).toFixed(1)}/5</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{teacher.studentCount || 0}+ студентів</span>
              </div>
            </div>

            {/* Експертиза */}
            {teacher.expertise && teacher.expertise.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1">{t('aiAssistant.teachers.expertise')}:</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.expertise.slice(0, 4).map((exp: string, expIndex: number) => (
                    <Badge 
                      key={expIndex} 
                      variant="outline"
                      className="text-xs"
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Кнопка розгорнути/згорнути */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs text-muted-foreground"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              {t('aiAssistant.teachers.showLess')}
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              {t('aiAssistant.teachers.showMore')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const AIAssistant = () => {
  const { t } = useTranslation();

  const [ideaInput, setIdeaInput] = useState<string>('');
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopicWithTeachers[]>([]);
  const [premiumSuggestions, setPremiumSuggestions] = useState<PremiumSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState<boolean>(false);
  const [loadingTeachersForTopic, setLoadingTeachersForTopic] = useState<string | null>(null);
  const [userFacultyId, setUserFacultyId] = useState<number | null>(null);
  const [userFacultyName, setUserFacultyName] = useState<string>('');

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [generatedStructure, setGeneratedStructure] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Новий стан для аналізу тексту
  const [analysisText, setAnalysisText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Новий стан для форми заявки
  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
  const [applicationFormData, setApplicationFormData] = useState<ApplicationFormData>({
    topic: '',
    description: '',
    goals: '',
    requirements: '',
    deadline: getDefaultDeadline(),
    student_name: '',
    student_email: '',
    student_phone: '',
    student_program: '',
    student_year: '',
    student_group: '',
    student_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Стани для модального вікна профілю викладача
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState<boolean>(false);

  const aiFeatures: AIFeature[] = [
    {
      icon: FileText,
      title: t('aiAssistant.features.structure.title'),
      description: t('aiAssistant.features.structure.description'),
      status: 'active'
    },
    {
      icon: Lightbulb,
      title: t('aiAssistant.features.topics.title'),
      description: t('aiAssistant.features.topics.description'),
      status: 'active'
    },
    {
      icon: BarChart3,
      title: t('aiAssistant.features.analysis.title'),
      description: t('aiAssistant.features.analysis.description'),
      status: 'active'
    }
  ];

  // Функція для відкриття модального вікна викладача
  const openTeacherModal = (teacherId: string) => {
    console.log('Відкриття профілю викладача з ID:', teacherId);
    setSelectedTeacherId(teacherId);
    setTeacherModalOpen(true);
  };

  // Функція для отримання назви факультету
  const getFacultyName = async (facultyId: number): Promise<string> => {
    try {
      const data = await apiRequest(`/api/faculties/${facultyId}`);
      return data.faculty?.name || `${t('aiAssistant.faculty.faculty')} #${facultyId}`;
    } catch {
      return `${t('aiAssistant.faculty.faculty')} #${facultyId}`;
    }
  };

  // Перевірка автентифікації та отримання faculty_id при завантаженні компонента
  useEffect(() => {
    const initializeUserData = async () => {
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        return;
      }

      // Спершу пробуємо отримати faculty_id з токена
      const facultyIdFromToken = getFacultyIdFromToken();
      if (facultyIdFromToken) {
        setUserFacultyId(facultyIdFromToken);
        const facultyName = await getFacultyName(facultyIdFromToken);
        setUserFacultyName(facultyName);
        return;
      }

      // Якщо немає в токені, робимо запит за даними користувача
      const userData = await getCurrentUserWithFaculty();
      if (userData && userData.faculty_id) {
        setUserFacultyId(userData.faculty_id);
        const facultyName = await getFacultyName(userData.faculty_id);
        setUserFacultyName(facultyName);
      } else {
        setUserFacultyName(t('aiAssistant.faculty.notSet'));
      }
    };
    
    initializeUserData();
  }, [t]);

  // Синхронізація даних профілю при відкритті форми
  useEffect(() => {
    const loadStudentProfileForForm = async () => {
      if (showApplicationForm) {
        try {
          const studentInfo = await getUpdatedStudentInfo();
          if (studentInfo) {
            console.log('🔄 Loading updated student profile for form:', studentInfo);
            setApplicationFormData(prev => ({
              ...prev,
              student_name: studentInfo.name,
              student_email: studentInfo.email,
              student_phone: studentInfo.phone || '',
              student_program: studentInfo.program || '',
              student_year: studentInfo.year || '',
              student_group: studentInfo.group || '',
              student_id: studentInfo.id || ''
            }));
          }
        } catch (error) {
          console.error('Помилка завантаження профілю студента:', error);
        }
      }
    };

    loadStudentProfileForForm();
  }, [showApplicationForm]);

  // Слухач для оновлення профілю
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('🔄 Profile update event received');
      if (showApplicationForm) {
        // Перезавантажуємо дані студента при оновленні профілю
        getUpdatedStudentInfo().then(studentInfo => {
          if (studentInfo) {
            setApplicationFormData(prev => ({
              ...prev,
              student_name: studentInfo.name,
              student_email: studentInfo.email,
              student_phone: studentInfo.phone || '',
              student_program: studentInfo.program || '',
              student_year: studentInfo.year || '',
              student_group: studentInfo.group || ''
            }));
            toast.info('Дані профілю оновлено');
          }
        });
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [showApplicationForm]);

  // ВИПРАВЛЕНА функція для пошуку відповідних викладачів для конкретної теми
  const handleFindTeachersForTopic = async (topic: string, topicIndex: number): Promise<void> => {
    setLoadingTeachersForTopic(topic);
    
    try {
      const isAuthenticated = await checkAuthentication();
      
      if (!isAuthenticated) {
        throw new Error(t('aiAssistant.teachers.authenticationRequired'));
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен автентифікації не знайдено');
      }

      const facultyId = userFacultyId;

      const response = await fetch('/api/teachers/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: topic,
          facultyId: facultyId
        })
      });

      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.status}`);
      }

      const data = await response.json();

      // ОНОВЛЮЄМО СТАН З РЕЗУЛЬТАТАМИ ПОШУКУ
      setSuggestedTopics(prev => prev.map((t, index) => 
        index === topicIndex 
          ? { 
              ...t, 
              teacherMatches: data.teachers || [],
              showTeachers: true,
              error: undefined
            }
          : t
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('aiAssistant.teachers.unknownError');
      
      // ОНОВЛЮЄМО СТАН З ПОМИЛКОЮ
      setSuggestedTopics(prev => prev.map((t, index) => 
        index === topicIndex 
          ? { 
              ...t, 
              teacherMatches: [],
              showTeachers: true,
              error: errorMessage
            }
          : t
      ));
    } finally {
      setLoadingTeachersForTopic(null);
    }
  };

  // Покращена функція для перемикання відображення викладачів для теми
  const toggleTeachersForTopic = (topicIndex: number, topicTitle: string): void => {
    const topic = suggestedTopics[topicIndex];
    
    // Якщо вже завантажуємо викладачів для цієї теми, не робимо нічого
    if (loadingTeachersForTopic === topicTitle) return;
    
    if (!topic.teacherMatches && !topic.showTeachers && !topic.error) {
      handleFindTeachersForTopic(topicTitle, topicIndex);
    } else {
      // Просто перемикаємо відображення
      setSuggestedTopics(prev => prev.map((t, index) => 
        index === topicIndex 
          ? { ...t, showTeachers: !t.showTeachers }
          : t
      ));
    }
  };

  // Функція для аналізу тексту з використанням API
  const handleAnalyzeText = async (): Promise<void> => {
    if (!analysisText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const data = await apiRequest('/api/analyze-text', {
        method: 'POST',
        body: JSON.stringify({ text: analysisText })
      });

      setAnalysisResult(data);
    } catch {
      const fallbackResult = generateClientSideFallback(analysisText);
      setAnalysisResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Client-side fallback
  const generateClientSideFallback = (text: string): TextAnalysisResult => {
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    return {
      metrics: {
        wordCount: words,
        sentenceCount: sentences,
        paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        characterCount: text.length,
        averageSentenceLength: sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0,
        averageWordLength: words > 0 ? Math.round((text.replace(/\s/g, '').length / words) * 10) / 10 : 0,
        readabilityScore: Math.max(30, Math.min(80, words * 0.5)),
        coherenceScore: Math.max(30, Math.min(75, words * 0.4))
      },
      strengths: [t('aiAssistant.analysis.fallback.strength')],
      issues: [t('aiAssistant.analysis.fallback.issue')],
      suggestions: [t('aiAssistant.analysis.fallback.suggestion')],
      overallScore: 50
    };
  };

  const handleGenerateStructure = async (): Promise<void> => {
    if (!selectedTopic.trim()) return;

    setIsGenerating(true);

    try {
      const requestBody = { 
        idea: ideaInput || selectedTopic,
        topic: selectedTopic 
      };

      const data = await apiRequest('/api/generate-structure', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (data.structure && Array.isArray(data.structure)) {
        const formattedStructure = formatStructureForDisplay(data.structure);
        setGeneratedStructure(formattedStructure);
      } else {
        setGeneratedStructure(generateFallbackStructure(selectedTopic));
      }
    } catch {
      setGeneratedStructure(generateFallbackStructure(selectedTopic));
    } finally {
      setIsGenerating(false);
    }
  };

  // Функція для форматування структури у читабельний вигляд
  const formatStructureForDisplay = (structure: StructureItem[]): string => {
    return structure
      .map((item: StructureItem) => {
        return `${t('aiAssistant.structure.section')} ${item.id}: ${getSectionTitle(item.key)}\n${item.content}`;
      })
      .join('\n\n');
  };

  // Функція для отримання заголовків розділів
  const getSectionTitle = (key: string): string => {
    const titles: { [key: string]: string } = {
      intro: t('aiAssistant.structure.sections.intro'),
      theory: t('aiAssistant.structure.sections.theory'),
      analysis: t('aiAssistant.structure.sections.analysis'),
      design: t('aiAssistant.structure.sections.design'),
      development: t('aiAssistant.structure.sections.development'),
      testing: t('aiAssistant.structure.sections.testing'),
      implementation: t('aiAssistant.structure.sections.implementation'),
      results: t('aiAssistant.structure.sections.results'),
      sources: t('aiAssistant.structure.sections.sources'),
      appendix: t('aiAssistant.structure.sections.appendix')
    };
    
    return titles[key] || key;
  };

  // Fallback функція для генерації структури
  const generateFallbackStructure = (topic: string): string => {
    return `${t('aiAssistant.structure.fallback.title')} "${topic}"

1. ${t('aiAssistant.structure.sections.intro')}
   - ${t('aiAssistant.structure.fallback.intro.relevance')}
   - ${t('aiAssistant.structure.fallback.intro.goals')}
   - ${t('aiAssistant.structure.fallback.intro.object')}

2. ${t('aiAssistant.structure.fallback.theoretical')}
   - ${t('aiAssistant.structure.fallback.theoretical.literature')}
   - ${t('aiAssistant.structure.fallback.theoretical.concepts')}
   - ${t('aiAssistant.structure.fallback.theoretical.approaches')}

3. ${t('aiAssistant.structure.fallback.practical')}
   - ${t('aiAssistant.structure.fallback.practical.methodology')}
   - ${t('aiAssistant.structure.fallback.practical.experimental')}
   - ${t('aiAssistant.structure.fallback.practical.results')}

4. ${t('aiAssistant.structure.fallback.conclusions')}
   - ${t('aiAssistant.structure.fallback.conclusions.results')}
   - ${t('aiAssistant.structure.fallback.conclusions.recommendations')}
   - ${t('aiAssistant.structure.fallback.conclusions.perspectives')}

5. ${t('aiAssistant.structure.fallback.sources')}
6. ${t('aiAssistant.structure.sections.appendix')}`;
  };

  const handleGenerateSuggestions = async (): Promise<void> => {
    if (!ideaInput.trim()) return;
    setIsLoadingSuggestions(true);
    setIsLoadingPremium(true);

    try {
      const topicsData = await apiRequest('/api/generate-topics', {
        method: 'POST',
        body: JSON.stringify({ idea: ideaInput })
      });

      if (Array.isArray(topicsData.topics)) {
        const formatted: SuggestedTopicWithTeachers[] = topicsData.topics.map((item: any) => ({
          title: item.title || t('aiAssistant.suggestions.defaultTitle'),
          relevance: Math.floor(Math.random() * 21) + 80,
          category: item.category || 'AI',
          description: item.description || t('aiAssistant.suggestions.defaultDescription'),
          teacherMatches: undefined,
          showTeachers: false,
          error: undefined
        }));
        setSuggestedTopics(formatted);
      }

      try {
        const premiumData = await apiRequest(`/api/teacher/premium-suggestions?idea=${encodeURIComponent(ideaInput)}`);
        if (premiumData.suggestions) {
          setPremiumSuggestions(premiumData.suggestions);
        }
      } catch {
        // Premium suggestions not available
      }

    } catch {
      // Handle error silently
    } finally {
      setIsLoadingSuggestions(false);
      setIsLoadingPremium(false);
    }
  };

  const copyToClipboard = async (): Promise<void> => {
    if (generatedStructure) {
      try {
        await navigator.clipboard.writeText(generatedStructure);
        toast.success(t('aiAssistant.structure.copied'));
      } catch {
        toast.error(t('aiAssistant.structure.copyError'));
      }
    }
  };

  // ВИПРАВЛЕНА функція для обробки вибору теми
  const handleTopicSelect = async (topic: string, teacherId?: string) => {
    setSelectedTopic(topic);
    
    // Отримуємо актуальну інформацію про студента
    const studentInfo = await getUpdatedStudentInfo();
    console.log('🎯 Selected topic with updated student info:', studentInfo);
    
    // Заповнюємо форму даними - ВКЛЮЧАЮЧИ номер телефону, курс та групу
    setApplicationFormData(prev => ({
      ...prev,
      topic: topic,
      teacherId: teacherId,
      // ВИПРАВЛЕННЯ: Використовуємо всі дані з профілю включаючи телефон та групу
      student_name: studentInfo?.name || prev.student_name,
      student_email: studentInfo?.email || prev.student_email,
      student_phone: studentInfo?.phone || prev.student_phone,
      student_program: studentInfo?.program || prev.student_program,
      student_year: studentInfo?.year || prev.student_year,
      student_group: studentInfo?.group || prev.student_group,
      student_id: studentInfo?.id || prev.student_id,
      // Опис проекту залишаємо порожнім для заповнення студентом
      description: '',
      goals: '',
      requirements: ''
    }));
    
    if (!ideaInput.trim()) {
      setIdeaInput(topic);
    }
    
    setShowApplicationForm(true);
  };

  // Оновіть функцію handleCloseApplicationForm для збереження даних профілю
  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false);
    // Не скидаємо дані профілю, лише тему та опис роботи
    setApplicationFormData(prev => ({
      ...prev,
      topic: '',
      description: '',
      goals: '',
      requirements: '',
      deadline: getDefaultDeadline(),
      teacherId: undefined
    }));
  };

  // ВИПРАВЛЕНА функція для відправки заявки
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Перевірка обов'язкових полів
    if (!applicationFormData.topic.trim() || 
        !applicationFormData.description.trim() || 
        !applicationFormData.goals.trim() || 
        !applicationFormData.requirements.trim() ||
        !applicationFormData.student_name.trim() ||
        !applicationFormData.student_email.trim()) {
      toast.error(t('aiAssistant.application.validationError'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast.error(t('aiAssistant.application.authError'));
        setIsSubmitting(false);
        return;
      }

      // Готуємо дані для відправки
      const applicationData = {
        topic: applicationFormData.topic,
        description: applicationFormData.description,
        goals: applicationFormData.goals,
        requirements: applicationFormData.requirements,
        teacherId: applicationFormData.teacherId || null,
        deadline: applicationFormData.deadline,
        student_name: applicationFormData.student_name,
        student_email: applicationFormData.student_email,
        student_phone: applicationFormData.student_phone || '',
        student_program: applicationFormData.student_program || '',
        student_year: applicationFormData.student_year || '',
        student_group: applicationFormData.student_group || ''
      };

      const response = await fetch('/api/student/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        if (response.status === 400) {
          toast.error(responseData.message || t('aiAssistant.application.validationError'));
        } else if (response.status === 401) {
          toast.error(t('aiAssistant.application.authError'));
        } else if (response.status === 404) {
          toast.error(t('aiAssistant.application.teacherNotFound'));
        } else {
          toast.error(`Помилка сервера: ${response.status} - ${responseData.message || 'Невідома помилка'}`);
        }
        return;
      }

      // Показуємо повідомлення про успіх
      let successMessage = t('aiAssistant.application.submitSuccess');
      if (applicationFormData.teacherId) {
        successMessage += ` ${t('aiAssistant.application.teacherNotified')}`;
      }
      
      toast.success(successMessage, {
        duration: 5000,
      });
      
      // Закриваємо форму та скидаємо дані
      setShowApplicationForm(false);
      setApplicationFormData({
        topic: '',
        description: '',
        goals: '',
        requirements: '',
        deadline: getDefaultDeadline(),
        student_name: '',
        student_email: '',
        student_phone: '',
        student_program: '',
        student_year: '',
        student_group: '',
        student_id: ''
      });
      
      // Очищаємо вибрану тему
      setSelectedTopic('');
      
    } catch {
      toast.error(t('aiAssistant.application.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функція для оновлення даних форми
  const handleFormDataChange = (field: keyof ApplicationFormData, value: string) => {
    setApplicationFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Функція для обробки вибору довільного викладача
  const handleChooseRandomTeacher = (topicTitle: string) => {
    const chooseTeacherUrl = '/choose-teacher';
    
    // Тимчасово показуємо alert, поки сторінка не готова
    if (chooseTeacherUrl === '/choose-teacher') {
      toast.info(t('aiAssistant.teachers.chooseTeacherAlert', { 
        topic: topicTitle,
        faculty: userFacultyName || t('aiAssistant.faculty.notSet')
      }));
      
      // Альтернатива: заповнити форму з темою, але без викладача
      handleTopicSelect(topicTitle);
    } else {
      const urlWithParams = `${chooseTeacherUrl}?topic=${encodeURIComponent(topicTitle)}&faculty=${userFacultyId || ''}`;
      window.location.href = urlWithParams;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <BookOpen className="w-4 h-4" />;
      case 'direction':
        return <Target className="w-4 h-4" />;
      case 'future_topic':
        return <Lightbulb className="w-4 h-4" />;
      case 'skill':
        return <Star className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'work':
        return t('aiAssistant.premium.types.work');
      case 'direction':
        return t('aiAssistant.premium.types.direction');
      case 'future_topic':
        return t('aiAssistant.premium.types.future_topic');
      case 'skill':
        return t('aiAssistant.premium.types.skill');
      default:
        return type;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'direction':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'future_topic':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
      case 'skill':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  // ВИПРАВЛЕНА функція для відображення рекомендованих викладачів для теми
  const renderTeacherMatchesForTopic = (topic: SuggestedTopicWithTeachers, topicIndex: number) => {
    if (!topic.showTeachers) return null;

    return (
      <div className="mt-4 border-t border-border pt-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          {t('aiAssistant.teachers.recommended')}
          {topic.teacherMatches && topic.teacherMatches.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {topic.teacherMatches.length}
            </Badge>
          )}
        </h4>
        
        {/* Інформація про фільтрацію за факультетом */}
        <div className="mb-3 p-2 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('aiAssistant.faculty.filter')}: <strong className="text-foreground">{userFacultyName || t('aiAssistant.faculty.notSet')}</strong>
            </span>
          </div>
        </div>
        
        {loadingTeachersForTopic === topic.title ? (
          <div className="flex justify-center items-center py-4">
            <RefreshCw className="animate-spin w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">{t('aiAssistant.teachers.searching')}</span>
          </div>
        ) : topic.error ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {topic.error.includes('автентифікаці') || topic.error.includes('Authentication') 
                ? t('aiAssistant.teachers.authenticationRequired') 
                : t('aiAssistant.teachers.searchError')
              }
            </p>
            {topic.error.includes('автентифікаці') || topic.error.includes('Authentication') ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
                {t('aiAssistant.teachers.login')}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFindTeachersForTopic(topic.title, topicIndex)}
              >
                {t('aiAssistant.teachers.tryAgain')}
              </Button>
            )}
          </div>
        ) : topic.teacherMatches && topic.teacherMatches.length > 0 ? (
          <div className="grid gap-3">
            {topic.teacherMatches.map((match) => (
              <CompactTeacherCard 
                key={match.teacher.id} 
                match={match} 
                topic={topic}
                onSelect={() => handleTopicSelect(topic.title, match.teacher.id)}
                onViewProfile={openTeacherModal}
              />
            ))}
          </div>
        ) : (
          // ЛИШЕ ОДИН БЛОК ДЛЯ ВИПАДКУ "НЕ ЗНАЙДЕНО"
          <ChooseRandomTeacher 
            onSelect={() => handleChooseRandomTeacher(topic.title)}
          />
        )}
      </div>
    );
  };

  // Функція для відображення результатів аналізу
  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600 dark:text-green-400';
      if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    };

    const getScoreBadge = (score: number) => {
      if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getScoreLabel = (score: number) => {
      if (score >= 80) return t('aiAssistant.analysis.scores.excellent');
      if (score >= 60) return t('aiAssistant.analysis.scores.good');
      return t('aiAssistant.analysis.scores.needsImprovement');
    };

    return (
      <div className="space-y-6">
        {/* Загальна оцінка */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary w-5 h-5" />
              {t('aiAssistant.analysis.overallScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">
                <span className={getScoreColor(analysisResult.overallScore)}>
                  {analysisResult.overallScore}%
                </span>
              </div>
              <Badge className={`${getScoreBadge(analysisResult.overallScore)} text-lg px-3 py-1`}>
                {getScoreLabel(analysisResult.overallScore)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Метрики */}
        <Card>
          <CardHeader>
            <CardTitle>{t('aiAssistant.analysis.metrics.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-primary">{analysisResult.metrics.wordCount}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.words')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analysisResult.metrics.sentenceCount}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.sentences')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysisResult.metrics.paragraphCount}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.paragraphs')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysisResult.metrics.averageSentenceLength}</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.wordsPerSentence')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{analysisResult.metrics.readabilityScore}%</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.readability')}</div>
              </div>
              <div className="text-center p-4 border rounded-lg border-border">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analysisResult.metrics.coherenceScore}%</div>
                <div className="text-sm text-muted-foreground">{t('aiAssistant.analysis.metrics.coherence')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Рекомендації та покращення */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Сильні сторони */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <ThumbsUp className="w-5 h-5" />
                {t('aiAssistant.analysis.strengths')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Проблеми */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                {t('aiAssistant.analysis.issues')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Рекомендації щодо покращення */}
        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                {t('aiAssistant.analysis.suggestions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="bg-primary/10 text-primary rounded-full p-1">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="text-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Функція для відображення преміальних рекомендацій
  const renderPremiumSuggestions = () => {
    if (premiumSuggestions.length === 0 && !isLoadingPremium) return null;

    return (
      <Card className="border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Crown className="w-5 h-5" />
            {t('aiAssistant.premium.title')}
            <Badge variant="secondary" className="bg-yellow-500 text-white dark:bg-yellow-600">
              {t('aiAssistant.premium.badge')}
            </Badge>
          </CardTitle>
          <CardDescription className="text-yellow-600 dark:text-yellow-400">
            {t('aiAssistant.premium.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPremium ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-yellow-600 dark:text-yellow-400">{t('aiAssistant.premium.loading')}</span>
            </div>
          ) : premiumSuggestions.length > 0 ? (
            premiumSuggestions.map((suggestion) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className="border border-yellow-300 dark:border-yellow-600 rounded-lg p-4 bg-background hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSuggestionIcon(suggestion.type)}
                      <Badge 
                        variant="outline" 
                        className={`${getSuggestionColor(suggestion.type)} text-xs`}
                      >
                        {getSuggestionTypeLabel(suggestion.type)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description || suggestion.topic_description}
                    </p>
                    
                    {/* Додаткова інформація для робіт */}
                    {suggestion.work_type && suggestion.year && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {suggestion.work_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {suggestion.year}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{suggestion.relevance}%</div>
                    <p className="text-xs text-muted-foreground">{t('aiAssistant.premium.relevance')}</p>
                  </div>
                </div>
                
                {/* Кнопки дій */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    {t('aiAssistant.premium.fromTeacher')}
                  </div>
                  
                  <div className="flex gap-2">
                    {suggestion.url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(suggestion.url, '_blank')}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {t('aiAssistant.premium.view')}
                      </Button>
                    )}
                    <Button 
                      size="sm"
                      onClick={() => handleTopicSelect(suggestion.title)}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      {t('aiAssistant.suggestions.choose')}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p>{t('aiAssistant.premium.noResults')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Функція для відображення форми заявки
  const renderApplicationForm = () => {
    if (!showApplicationForm) return null;

    // Отримуємо дані профілю з localStorage або стану компонента
    const getStudentProfileData = (): StudentInfo & { group?: string } => {
      try {
        // Спершу пробуємо отримати з localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          return {
            name: userData.name || "Студент",
            email: userData.email || "",
            phone: userData.phone || "",
            program: userData.program || "",
            year: userData.year || "",
            group: userData.group || "",
            id: userData.id || "",
            bio: userData.bio || ""
          };
        }
      } catch (error) {
        console.error('Помилка отримання даних профілю:', error);
      }
      
      // Якщо немає даних в localStorage, використовуємо дані з форми
      return {
        name: applicationFormData.student_name || "Студент",
        email: applicationFormData.student_email || "",
        phone: applicationFormData.student_phone || "",
        program: applicationFormData.student_program || "",
        year: applicationFormData.student_year || "",
        group: applicationFormData.student_group || "",
        id: applicationFormData.student_id || "",
        bio: ""
      };
    };

    const studentProfile = getStudentProfileData();

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                {t('aiAssistant.application.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseApplicationForm}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>
              {t('aiAssistant.application.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.topic')} *
                </label>
                <Input
                  value={applicationFormData.topic}
                  onChange={(e) => handleFormDataChange('topic', e.target.value)}
                  placeholder={t('aiAssistant.application.topicPlaceholder')}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.description')} *
                </label>
                <Textarea
                  value={applicationFormData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  placeholder={t('aiAssistant.application.descriptionPlaceholder')}
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Опишіть деталі вашого проекту, технології, які плануєте використовувати, та очікувані результати
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.goals')} *
                </label>
                <Textarea
                  value={applicationFormData.goals}
                  onChange={(e) => handleFormDataChange('goals', e.target.value)}
                  placeholder={t('aiAssistant.application.goalsPlaceholder')}
                  rows={2}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.requirements')} *
                </label>
                <Textarea
                  value={applicationFormData.requirements}
                  onChange={(e) => handleFormDataChange('requirements', e.target.value)}
                  placeholder={t('aiAssistant.application.requirementsPlaceholder')}
                  rows={2}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">
                  {t('aiAssistant.application.deadline')} *
                </label>
                <Input
                  type="date"
                  value={applicationFormData.deadline}
                  onChange={(e) => handleFormDataChange('deadline', e.target.value)}
                  required
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Інформація про студента (автоматично заповнюється з профілю) */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">Інформація про студента</h4>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      const studentInfo = await getUpdatedStudentInfo();
                      console.log('🔄 Manual refresh student info:', studentInfo);
                      if (studentInfo) {
                        setApplicationFormData(prev => ({
                          ...prev,
                          student_name: studentInfo.name,
                          student_email: studentInfo.email,
                          student_phone: studentInfo.phone || '',
                          student_program: studentInfo.program || '',
                          student_year: studentInfo.year || '',
                          student_group: studentInfo.group || ''
                        }));
                        toast.success('Дані профілю оновлено');
                      } else {
                        toast.error('Не вдалося отримати дані профілю');
                      }
                    }}
                  >
                    Оновити з профілю
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">ПІБ:</span>
                    <p className="font-medium">{studentProfile.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{studentProfile.email || 'Не вказано'}</p>
                  </div>
                  {studentProfile.phone && (
                    <div>
                      <span className="text-muted-foreground">Телефон:</span>
                      <p className="font-medium">{studentProfile.phone}</p>
                    </div>
                  )}
                  {studentProfile.program && (
                    <div>
                      <span className="text-muted-foreground">Програма:</span>
                      <p className="font-medium">{studentProfile.program}</p>
                    </div>
                  )}
                  {studentProfile.year && (
                    <div>
                      <span className="text-muted-foreground">Курс:</span>
                      <p className="font-medium">{studentProfile.year}</p>
                    </div>
                  )}
                  {studentProfile.group && (
                    <div>
                      <span className="text-muted-foreground">Група:</span>
                      <p className="font-medium">{studentProfile.group}</p>
                    </div>
                  )}
                  {studentProfile.id && (
                    <div>
                      <span className="text-muted-foreground">ID студента:</span>
                      <p className="font-medium text-xs">{studentProfile.id}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ця інформація автоматично заповнюється з вашого профілю. 
                  Для редагування перейдіть у розділ "Профіль".
                </p>
              </div>

              {applicationFormData.teacherId && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Вибраний викладач:</strong> Заявка буде надіслана обраному викладачу
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseApplicationForm}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {t('aiAssistant.application.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? t('aiAssistant.application.submitting') : t('aiAssistant.application.submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="text-primary w-7 h-7" />
                {t('aiAssistant.title')}
              </h1>
              <p className="text-muted-foreground">{t('aiAssistant.description')}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Card key={i} className="hover:shadow transition border-border">
                    <CardHeader className="flex items-start justify-between pb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <Badge variant={feature.status === 'active' ? 'default' : 'outline'}>
                        {feature.status === 'active' ? t('aiAssistant.status.active') : t('aiAssistant.status.comingSoon')}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="topics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="topics" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {t('aiAssistant.tabs.topics')}
                </TabsTrigger>
                <TabsTrigger value="structure" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('aiAssistant.tabs.structure')}
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('aiAssistant.tabs.analysis')}
                </TabsTrigger>
              </TabsList>

              {/* Topics Tab */}
              <TabsContent value="topics" className="space-y-6">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      {t('aiAssistant.suggestions.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('aiAssistant.suggestions.inputdesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder={t('aiAssistant.suggestions.inputPlaceholder')}
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleGenerateSuggestions}
                        disabled={isLoadingSuggestions || !ideaInput.trim()}
                        className="flex items-center gap-2"
                      >
                        {isLoadingSuggestions ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {t('aiAssistant.suggestions.generate')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Topics */}
                {suggestedTopics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        {t('aiAssistant.suggestions.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('aiAssistant.suggestions.description')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {suggestedTopics.map((topic, index) => (
                        <Card key={index} className="border-border">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg text-foreground">
                                    {topic.title}
                                  </h3>
                                  <Badge variant="secondary">
                                    {topic.relevance}%
                                  </Badge>
                                  <Badge variant="outline">
                                    {topic.category}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mb-4">
                                  {topic.description}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleTopicSelect(topic.title)}
                                className="ml-4"
                              >
                                <Target className="w-4 h-4 mr-2" />
                                {t('aiAssistant.suggestions.choose')}
                              </Button>
                            </div>

                            {/* Кнопка для перегляду викладачів */}
                            <div className="flex justify-between items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTeachersForTopic(index, topic.title)}
                                disabled={loadingTeachersForTopic === topic.title}
                              >
                                {loadingTeachersForTopic === topic.title ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin mr-2" />
                                    {t('aiAssistant.teachers.searching')}
                                  </>
                                ) : (
                                  <>
                                    <GraduationCap className="w-3 h-3 mr-2" />
                                    {topic.showTeachers 
                                      ? t('aiAssistant.teachers.hide') 
                                      : t('aiAssistant.teachers.find')
                                    }
                                  </>
                                )}
                              </Button>

                              {/* Статус викладачів */}
                              {topic.teacherMatches && (
                                <div className="text-sm text-muted-foreground">
                                  {t('aiAssistant.teachers.found')}: {topic.teacherMatches.length}
                                </div>
                              )}
                            </div>

                            {/* Відображення рекомендованих викладачів */}
                            {renderTeacherMatchesForTopic(topic, index)}
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Premium Suggestions */}
                {renderPremiumSuggestions()}

                {/* Loading State */}
                {isLoadingSuggestions && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('aiAssistant.suggestions.loading')}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Structure Tab */}
              <TabsContent value="structure" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {t('aiAssistant.structure.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('aiAssistant.structure.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder={t('aiAssistant.structure.placeholder')}
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleGenerateStructure}
                        disabled={isGenerating || !selectedTopic.trim()}
                        className="flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        {t('aiAssistant.structure.generate')}
                      </Button>
                    </div>

                    {generatedStructure && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">{t('aiAssistant.structure.generated')}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            {t('aiAssistant.structure.copy')}
                          </Button>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/50 border-border">
                          <pre className="whitespace-pre-wrap text-sm text-foreground">
                            {generatedStructure}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {t('aiAssistant.analysis.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('aiAssistant.analysis.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder={t('aiAssistant.analysis.placeholder')}
                        value={analysisText}
                        onChange={(e) => setAnalysisText(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <Button 
                        onClick={handleAnalyzeText}
                        disabled={isAnalyzing || !analysisText.trim()}
                        className="w-full flex items-center gap-2"
                      >
                        {isAnalyzing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        {t('aiAssistant.analysis.analyze')}
                      </Button>
                    </div>

                    {analysisResult && renderAnalysisResults()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Application Form Modal */}
      {renderApplicationForm()}

      {/* Teacher Profile Modal */}
      <TeacherProfileModal
        teacherId={selectedTeacherId || ''}
        open={teacherModalOpen}
        onOpenChange={setTeacherModalOpen}
      />
    </div>
  );
};

export default AIAssistant;