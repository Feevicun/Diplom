// StudentProfileModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Trophy, 
  Target, 
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  MapPin,
  GraduationCap,
  Award,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentData?: {
    id: string; 
    name: string;
    email: string;
    phone: string;
    program: string;
    year: string;
    description: string;
    studentAvatar?: string;
  };
}

interface Project {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  type?: string;
  organization?: string;
  certificateUrl?: string;
  createdAt: string;
}

interface Goal {
  id: string;
  goal: string;
  deadline: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  createdAt: string;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  course: number;
  faculty: string;
  department?: string;
  bio?: string;
  group?: string;
  linkedin_url?: string;
  github_url?: string;
}

// Функція для отримання токену
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token');
  }
  return null;
};

// Функція для безпечного парсингу JSON
const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
};

// Функція для безпечного запиту до API
const safeFetch = async (url: string, options: any = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const text = await response.text();
    
    if (!text.trim()) {
      return null;
    }

    const data = safeJsonParse(text);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};

const StudentProfileModal = ({ isOpen, onClose, studentId, studentData }: StudentProfileModalProps) => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentData();
    } else {
      // Reset state when modal closes
      setStudentProfile(null);
      setProjects([]);
      setAchievements([]);
      setGoals([]);
      setIsLoading(true);
      setActiveTab('overview');
    }
  }, [isOpen, studentId]);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      
      // Спочатку намагаємося отримати повний профіль студента з API
      const fullProfile = await fetchStudentProfile();
      
      if (fullProfile) {
        // Якщо отримали профіль з API, використовуємо його
        setStudentProfile(fullProfile);
      } else if (studentData) {
        // Якщо API не повернув даних, використовуємо дані з заявки
        const profileData: StudentProfile = {
          id: studentId,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone,
          course: parseInt(studentData.year) || 3,
          faculty: getFacultyFromProgram(studentData.program),
          bio: await fetchStudentBio(), // Отримуємо bio окремо
          group: studentData.year,
          avatar_url: studentData.studentAvatar
        };
        setStudentProfile(profileData);
      }

      // Завантажуємо додаткові дані
      await Promise.all([
        fetchStudentProjects(),
        fetchStudentAchievements(),
        fetchStudentGoals()
      ]);

    } catch (error) {
      console.error('Error fetching student data:', error);
      // Використовуємо тільки дані з заявки при помилці
      if (studentData) {
        setStudentProfile({
          id: studentId,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone,
          course: parseInt(studentData.year) || 3,
          faculty: getFacultyFromProgram(studentData.program),
          bio: studentData.description,
          group: studentData.year,
          avatar_url: studentData.studentAvatar
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Нова функція для отримання профілю студента з API
  const fetchStudentProfile = async (): Promise<StudentProfile | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token for student profile API');
        return null;
      }

      // Використовуємо API для отримання профілю студента
      const data = await safeFetch(`/api/students/${studentId}/profile`);
      
      if (data) {
        return {
          id: studentId,
          name: data.name || data.user?.name || studentData?.name || "",
          email: data.email || data.user?.email || studentData?.email || "",
          phone: data.phone || data.user?.phone || studentData?.phone || "",
          course: data.course || data.user?.course || parseInt(studentData?.year || "3"),
          faculty: data.faculty || data.user?.faculty || getFacultyFromProgram(studentData?.program),
          department: data.department || data.user?.department,
          bio: data.bio || data.user?.bio || studentData?.description || "",
          group: data.group || data.user?.group || studentData?.year,
          avatar_url: data.avatar_url || data.user?.avatar_url || studentData?.studentAvatar,
          linkedin_url: data.linkedin_url || data.user?.linkedin_url,
          github_url: data.github_url || data.user?.github_url
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }
  };

  // Функція для отримання bio з профілю студента
  const fetchStudentBio = async (): Promise<string> => {
    try {
      const token = getAuthToken();
      if (!token) return studentData?.description || "";

      // Отримуємо профіль поточного користувача і шукаємо студента за ID
      const currentUser = await safeFetch('/api/current-user');
      if (currentUser && currentUser.id === studentId) {
        return currentUser.bio || currentUser.user?.bio || studentData?.description || "";
      }
      
      // Якщо це не поточний користувач, намагаємося отримати профіль студента
      const studentProfile = await safeFetch(`/api/students/${studentId}`);
      if (studentProfile) {
        return studentProfile.bio || studentProfile.user?.bio || studentData?.description || "";
      }
      
      return studentData?.description || "";
    } catch {
      return studentData?.description || "";
    }
  };

  const fetchStudentProjects = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token for projects API');
        setProjects([]);
        return;
      }

      const data = await safeFetch('/api/student/projects');
      if (data && Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchStudentAchievements = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token for achievements API');
        setAchievements([]);
        return;
      }

      const data = await safeFetch('/api/student/achievements');
      if (data && Array.isArray(data)) {
        setAchievements(data);
      } else {
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    }
  };

  const fetchStudentGoals = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token for goals API');
        setGoals([]);
        return;
      }

      const data = await safeFetch('/api/student/goals');
      if (data && Array.isArray(data)) {
        setGoals(data);
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    }
  };

  const getFacultyFromProgram = (program: string = ""): string => {
    if (program.includes('комп\'ютер') || program.includes('програм') || program.includes('інформацій')) {
      return "Факультет інформаційних технологій";
    } else if (program.includes('кібербезпека')) {
      return "Факультет кібербезпеки";
    } else if (program.includes('математик')) {
      return "Факультет математики та інформатики";
    } else if (program.includes('штучний інтелект')) {
      return "Факультет штучного інтелекту";
    } else {
      return "Факультет інформаційних технологій";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'accepted':
      case 'finished':
      case 'завершено':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
      case 'active':
      case 'в процесі':
      case 'активно':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
      case 'очікує':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'rejected':
      case 'відхилено':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
      case 'завершено':
        return <CheckCircle className="h-3 w-3" />;
      case 'in progress':
      case 'active':
      case 'в процесі':
      case 'активно':
        return <Clock className="h-3 w-3" />;
      case 'cancelled':
      case 'rejected':
      case 'відхилено':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const tabs = [
    { id: 'overview', label: 'Огляд', icon: User },
    { id: 'projects', label: 'Проєкти', icon: BookOpen },
    { id: 'achievements', label: 'Досягнення', icon: Trophy },
    { id: 'goals', label: 'Цілі', icon: Target },
  ];

  if (!studentProfile && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Профіль студента
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12 flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : studentProfile ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Навігація по вкладках */}
            <div className="border-b shrink-0">
              <ScrollArea className="w-full">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* Вкладка Огляд */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Основна інформація */}
                    <Card className="shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-md mx-auto sm:mx-0">
                            <AvatarImage src={studentProfile.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                              {getInitials(studentProfile.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 w-full">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground text-center sm:text-left">{studentProfile.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm truncate">{studentProfile.email}</span>
                              </div>
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm">{studentProfile.phone || 'Не вказано'}</span>
                              </div>
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                                <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm">{studentProfile.course} курс</span>
                              </div>
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-sm">{studentProfile.group || 'Група не вказана'}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                {studentProfile.faculty}
                              </Badge>
                              {studentProfile.department && (
                                <Badge variant="outline" className="text-sm px-3 py-1">
                                  {studentProfile.department}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Соціальні мережі */}
                            {(studentProfile.linkedin_url || studentProfile.github_url) && (
                              <div className="flex flex-wrap gap-3 mt-4">
                                {studentProfile.linkedin_url && (
                                  <Button variant="outline" size="sm" asChild className="gap-2">
                                    <a href={studentProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                      <Linkedin className="h-4 w-4" />
                                      LinkedIn
                                    </a>
                                  </Button>
                                )}
                                {studentProfile.github_url && (
                                  <Button variant="outline" size="sm" asChild className="gap-2">
                                    <a href={studentProfile.github_url} target="_blank" rel="noopener noreferrer">
                                      <Github className="h-4 w-4" />
                                      GitHub
                                    </a>
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {studentProfile.bio && (
                          <div className="mt-6">
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <Award className="h-5 w-5 text-primary" />
                              Про себе
                            </h3>
                            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border">
                              {studentProfile.bio}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Статистика - показуємо тільки ненульові значення */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {projects.length > 0 && (
                        <Card className="text-center hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mx-auto mb-3" />
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{projects.length}</div>
                            <div className="text-sm text-muted-foreground font-medium">Проєктів</div>
                            {projects.filter(p => p.status.toLowerCase().includes('завершено') || p.status.toLowerCase().includes('completed')).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {projects.filter(p => p.status.toLowerCase().includes('завершено') || p.status.toLowerCase().includes('completed')).length} завершено
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                      
                      {achievements.length > 0 && (
                        <Card className="text-center hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 mx-auto mb-3" />
                            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{achievements.length}</div>
                            <div className="text-sm text-muted-foreground font-medium">Досягнень</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Останнє: {formatDate(achievements[0].date)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {goals.length > 0 && (
                        <Card className="text-center hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <Target className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 mx-auto mb-3" />
                            <div className="text-2xl sm:text-3xl font-bold text-green-600">{goals.length}</div>
                            <div className="text-sm text-muted-foreground font-medium">Активних цілей</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}% прогрес
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Якщо немає жодних даних, показуємо повідомлення */}
                      {projects.length === 0 && achievements.length === 0 && goals.length === 0 && (
                        <div className="col-span-3 text-center py-8">
                          <div className="bg-muted/30 rounded-lg p-6 border border-dashed">
                            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <h3 className="text-lg font-medium mb-2 text-foreground">Ще немає активності</h3>
                            <p className="text-muted-foreground text-sm">
                              Студент ще не додав проєктів, досягнень або цілей
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Вкладка Проєкти */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 border">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{project.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant="outline" className="px-2 py-1 text-xs">
                                    {project.type}
                                  </Badge>
                                  <Badge className={`px-2 py-1 border text-xs ${getStatusColor(project.status)} flex items-center gap-1`}>
                                    {getStatusIcon(project.status)}
                                    {project.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 self-end sm:self-auto">
                                {project.githubUrl && (
                                  <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
                                      <Github className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                {project.projectUrl && (
                                  <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" title="Live Demo">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground mb-4 leading-relaxed text-sm sm:text-base">
                              {project.description}
                            </p>
                            
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-medium mb-2 text-foreground">Технології:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.technologies.map((tech, index) => (
                                    <Badge key={index} variant="secondary" className="px-2 py-1 text-xs">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                              {project.startDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  Початок: {formatDate(project.startDate)}
                                </div>
                              )}
                              {project.endDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  Завершення: {formatDate(project.endDate)}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8 sm:py-12">
                          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg sm:text-xl font-medium mb-2 text-foreground">Проєктів поки немає</h3>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            Студент ще не додав жодного проєкту до свого профілю
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Вкладка Досягнення */}
                {activeTab === 'achievements' && (
                  <div className="space-y-4">
                    {achievements.length > 0 ? (
                      achievements.map((achievement) => (
                        <Card key={achievement.id} className="hover:shadow-lg transition-shadow duration-300 border">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{achievement.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {achievement.type && (
                                    <Badge variant="outline" className="px-2 py-1 text-xs">
                                      {achievement.type}
                                    </Badge>
                                  )}
                                  {achievement.organization && (
                                    <Badge variant="secondary" className="px-2 py-1 text-xs">
                                      {achievement.organization}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  {formatDate(achievement.date)}
                                </div>
                                {achievement.certificateUrl && (
                                  <Button variant="outline" size="sm" asChild className="gap-1">
                                    <a href={achievement.certificateUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                      Сертифікат
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                              {achievement.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8 sm:py-12">
                          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg sm:text-xl font-medium mb-2 text-foreground">Досягнень поки немає</h3>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            Студент ще не додав жодного досягнення до свого профілю
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Вкладка Цілі */}
                {activeTab === 'goals' && (
                  <div className="space-y-4">
                    {goals.length > 0 ? (
                      goals.map((goal) => (
                        <Card key={goal.id} className="hover:shadow-lg transition-shadow duration-300 border">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{goal.goal}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge className={`px-2 py-1 border text-xs ${getStatusColor(goal.status)} flex items-center gap-1`}>
                                    {getStatusIcon(goal.status)}
                                    {goal.status}
                                  </Badge>
                                  <Badge className={`px-2 py-1 border text-xs ${getPriorityColor(goal.priority)}`}>
                                    {goal.priority} пріоритет
                                  </Badge>
                                  <Badge variant="outline" className="px-2 py-1 text-xs">
                                    Прогрес: {goal.progress}%
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  {formatDate(goal.deadline)}
                                </div>
                              </div>
                            </div>
                            
                            {goal.description && (
                              <p className="text-muted-foreground mb-4 leading-relaxed text-sm sm:text-base">
                                {goal.description}
                              </p>
                            )}
                            
                            {/* Прогрес бар */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Прогрес виконання</span>
                                <span className="font-medium text-foreground">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8 sm:py-12">
                          <Target className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg sm:text-xl font-medium mb-2 text-foreground">Цілей поки немає</h3>
                          <p className="text-muted-foreground text-sm sm:text-base">
                            Студент ще не додав жодної цілі до свого профілю
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-12 flex-1 flex items-center justify-center">
            <div>
              <User className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-medium mb-2 text-foreground">Профіль не знайдено</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Не вдалося завантажити інформацію про студента
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileModal;