import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare,  
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  X,
  Phone,
  RefreshCw  
} from 'lucide-react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import StudentProfileModal from "../components/StudentProfileModal";

// Типи для заявок
type ApplicationStatus = "pending" | "accepted" | "rejected";
type ApplicationType = "course" | "diploma";

interface Application {
  id: number;
  studentName: string;
  studentAvatar: string;
  program: string;
  year: string;
  topic: string;
  type: ApplicationType;
  status: ApplicationStatus;
  date: string;
  email: string;
  phone: string;
  description: string;
  expanded: boolean;
  teacherId: string;
  studentId?: string;
}

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
  teacherId?: string;
}

// Інтерфейс для інформації про студента з профілю
interface StudentProfileInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  program?: string;
  year?: string;
  bio?: string;
  avatar?: string;
  description?: string; // для зворотної сумісності
  studentAvatar?: string; // для зворотної сумісності
}

// Інтерфейс для даних проекту
interface ProjectData {
  id: string;
  projectType: 'coursework' | 'diploma';
  workTitle: string;
  supervisor: string;
  startDate: string;
  deadline: string;
  studentId?: string;
  teacherId: string;
  status: 'active' | 'completed' | 'behind';
  createdAt: string;
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

// Функція для отримання ID поточного користувача
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    const currentUser = localStorage.getItem('currentUser') || 
                       sessionStorage.getItem('currentUser');
    
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        if (userData.id) {
          return userData.id.toString();
        }
      } catch {
        // Ігноруємо помилку парсингу
      }
    }
    
    return localStorage.getItem('userId') || 
           sessionStorage.getItem('userId') ||
           localStorage.getItem('user_id') ||
           sessionStorage.getItem('user_id');
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
    
    // Якщо відповідь порожня, повертаємо null
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

// Функція для отримання інформації про студента за ID
const getStudentProfileInfo = async (studentId?: string): Promise<StudentProfileInfo | null> => {
  if (!studentId) return null;
  
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found for student profile');
      return null;
    }

    // Спершу пробуємо отримати з API студента
    const response = await fetch(`/api/students/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Student profile data from API:', data);
      
      return {
        id: data.id || studentId,
        name: data.name || data.full_name || 'Студент',
        email: data.email || '',
        phone: data.phone || '',
        program: data.program || data.specialization || '',
        year: data.year || data.course || '',
        bio: data.bio || '',
        avatar: data.avatar || data.avatarUrl || ''
      };
    } else {
      console.log('⚠️ Student API not available, trying current-user');
      
      // Якщо не вдалося, пробуємо отримати з current-user
      const currentUserResponse = await fetch('/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (currentUserResponse.ok) {
        const userData = await currentUserResponse.json();
        console.log('📋 Current user data for student profile:', userData);
        
        return {
          id: userData.user?.id || userData.id || studentId,
          name: userData.user?.name || userData.name || userData.user?.full_name || userData.full_name || 'Студент',
          email: userData.user?.email || userData.email || '',
          phone: userData.user?.phone || userData.phone || '',
          program: userData.user?.program?.name || userData.program || userData.user?.program_name || userData.user?.specialization || '',
          year: userData.user?.year || userData.year || userData.user?.course || '',
          bio: userData.user?.bio || userData.bio || '',
          avatar: userData.user?.avatar || userData.avatar || userData.user?.avatarUrl || userData.avatarUrl || ''
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching student profile info:', error);
    return null;
  }
};

// Функція для отримання інформації про викладача
const getTeacherProfileInfo = async (teacherId?: string): Promise<StudentProfileInfo | null> => {
  if (!teacherId) return null;
  
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found for teacher profile');
      return null;
    }

    // Спершу пробуємо отримати з API викладача
    const response = await fetch(`/api/teachers/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Teacher profile data from API:', data);
      
      return {
        id: data.id || teacherId,
        name: data.name || data.full_name || 'Викладач',
        email: data.email || '',
        phone: data.phone || '',
        program: data.department || data.faculty || '',
        year: '',
        bio: data.bio || '',
        avatar: data.avatar || data.avatarUrl || ''
      };
    } else {
      // Якщо не вдалося, пробуємо отримати з current-user
      const currentUserResponse = await fetch('/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (currentUserResponse.ok) {
        const userData = await currentUserResponse.json();
        console.log('📋 Current user data for teacher profile:', userData);
        
        return {
          id: userData.user?.id || userData.id || teacherId,
          name: userData.user?.name || userData.name || userData.user?.full_name || userData.full_name || 'Викладач',
          email: userData.user?.email || userData.email || '',
          phone: userData.user?.phone || userData.phone || '',
          program: userData.user?.department || userData.department || userData.user?.faculty || userData.faculty || '',
          year: '',
          bio: userData.user?.bio || userData.bio || '',
          avatar: userData.user?.avatar || userData.avatar || userData.user?.avatarUrl || userData.avatarUrl || ''
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching teacher profile info:', error);
    return null;
  }
};

// Функція для розрахунку дедлайну
const calculateDeadline = (type: ApplicationType): string => {
  const now = new Date();
  const deadline = new Date();
  
  if (type === 'course') {
    // Для курсової - 3 місяці
    deadline.setMonth(now.getMonth() + 3);
  } else {
    // Для дипломної - 6 місяців
    deadline.setMonth(now.getMonth() + 6);
  }
  
  return deadline.toISOString().split('T')[0];
};

const TeacherApplications = () => {
  const { t } = useTranslation();
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState<number | null>(null);
  
  // Стани для модального вікна профілю студента
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileInfo | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loadingStudentProfile, setLoadingStudentProfile] = useState<string | null>(null);

  // Завантаження заявок з API
  useEffect(() => {
    const teacherId = getCurrentUserId();
    setCurrentTeacherId(teacherId);
    
    if (teacherId) {
      fetchApplications(teacherId);
    } else {
      setIsLoading(false);
      toast.error('Не вдалося ідентифікувати викладача');
    }
  }, []);

  const fetchApplications = async (teacherId: string) => {
    try {
      setIsLoading(true);
      
      const data = await safeFetch(`/api/teacher/applications?teacher_id=${teacherId}`);
      
      let apiApplications: any[] = [];

      if (data) {
        apiApplications = Array.isArray(data) ? data : (data.applications || []);
      }

      // Конвертація даних з API у формат компонента
      const formattedApplications: Application[] = apiApplications.map((app: any) => ({
        id: app.id,
        studentName: app.student_name || app.studentName || 'Студент',
        studentAvatar: app.student_avatar || '',
        program: app.student_program || app.program || 'Не вказано',
        year: app.student_year || app.year || 'Не вказано',
        topic: app.topic || 'Без назви',
        type: (app.type || 'course') as ApplicationType,
        status: (app.status || 'pending') as ApplicationStatus,
        date: new Date(app.created_at || app.application_date || app.date || new Date()).toLocaleDateString('uk-UA'),
        email: app.student_email || app.email || 'Не вказано',
        phone: app.student_phone || app.phone || '',
        description: app.description || 'Опис відсутній',
        expanded: false,
        teacherId: app.teacher_id || teacherId,
        studentId: app.student_id || app.studentId
      }));

      setApplications(formattedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Помилка завантаження заявок');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функція для відкриття профілю студента
  const openStudentProfile = async (application: Application) => {
    setLoadingStudentProfile(application.studentId || application.id.toString());
    
    try {
      // Отримуємо повну інформацію про студента з профілю
      const studentProfileInfo = await getStudentProfileInfo(application.studentId);
      
      if (studentProfileInfo) {
        setSelectedStudent({
          id: studentProfileInfo.id,
          name: studentProfileInfo.name || application.studentName,
          email: studentProfileInfo.email || application.email,
          phone: studentProfileInfo.phone || application.phone,
          program: studentProfileInfo.program || application.program,
          year: studentProfileInfo.year || application.year,
          bio: studentProfileInfo.bio || 'Біографія не вказана',
          avatar: studentProfileInfo.avatar || application.studentAvatar
        });
      } else {
        // Fallback: використовуємо дані з заявки
        setSelectedStudent({
          id: application.studentId || `student-${application.id}`,
          name: application.studentName,
          email: application.email,
          phone: application.phone,
          program: application.program,
          year: application.year,
          bio: 'Біографія не доступна',
          avatar: application.studentAvatar
        });
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      // Fallback у разі помилки
      setSelectedStudent({
        id: application.studentId || `student-${application.id}`,
        name: application.studentName,
        email: application.email,
        phone: application.phone,
        program: application.program,
        year: application.year,
        bio: 'Не вдалося завантажити біографію',
        avatar: application.studentAvatar
      });
    } finally {
      setLoadingStudentProfile(null);
      setIsProfileModalOpen(true);
    }
  };

  // Функція для закриття профілю
  const closeStudentProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedStudent(null);
  };

  // Функція для створення проекту для студента
  const createStudentProject = async (application: Application): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const teacherId = getCurrentUserId();
      
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }

      // Отримуємо інформацію про викладача для імені керівника
      const teacherInfo = await getTeacherProfileInfo(teacherId);
      const supervisorName = teacherInfo?.name || 'Викладач';

      // Створюємо проект для студента
      const projectData: ProjectData = {
        id: `project-${application.id}-${Date.now()}`,
        projectType: application.type === 'course' ? 'coursework' : 'diploma',
        workTitle: application.topic,
        supervisor: supervisorName,
        startDate: new Date().toISOString().split('T')[0],
        deadline: calculateDeadline(application.type),
        studentId: application.studentId,
        teacherId: teacherId,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Зберігаємо проект через API
      if (token) {
        const projectResponse = await safeFetch('/api/user-project', {
          method: 'POST',
          body: JSON.stringify(projectData)
        });

        if (projectResponse && projectResponse.id) {
          console.log('✅ Project created via API:', projectResponse.id);
        } else {
          console.warn('⚠️ API project creation failed, using localStorage fallback');
        }
      }

      // Завжди зберігаємо в localStorage як fallback
      const existingProjects = JSON.parse(localStorage.getItem('studentProjects') || '[]');
      
      // Перевіряємо, чи проект вже існує для цього студента
      const existingProjectIndex = existingProjects.findIndex((project: ProjectData) => 
        project.studentId === application.studentId && project.status === 'active'
      );

      let updatedProjects;
      if (existingProjectIndex !== -1) {
        // Оновлюємо існуючий проект
        existingProjects[existingProjectIndex] = projectData;
        updatedProjects = existingProjects;
      } else {
        // Додаємо новий проект
        updatedProjects = [...existingProjects, projectData];
      }
      
      localStorage.setItem('studentProjects', JSON.stringify(updatedProjects));
      
      console.log('✅ Project created/updated in localStorage:', projectData);
      return true;
    } catch (error) {
      console.error('❌ Error creating student project:', error);
      
      // Fallback: створюємо проект тільки в localStorage
      try {
        const teacherId = getCurrentUserId();
        const existingProjects = JSON.parse(localStorage.getItem('studentProjects') || '[]');
        
        const projectData: ProjectData = {
          id: `project-${application.id}-${Date.now()}`,
          projectType: application.type === 'course' ? 'coursework' : 'diploma',
          workTitle: application.topic,
          supervisor: 'Викладач',
          startDate: new Date().toISOString().split('T')[0],
          deadline: calculateDeadline(application.type),
          studentId: application.studentId,
          teacherId: teacherId || '',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        // Перевіряємо, чи проект вже існує
        const existingProjectIndex = existingProjects.findIndex((project: ProjectData) => 
          project.studentId === application.studentId && project.status === 'active'
        );

        let updatedProjects;
        if (existingProjectIndex !== -1) {
          existingProjects[existingProjectIndex] = projectData;
          updatedProjects = existingProjects;
        } else {
          updatedProjects = [...existingProjects, projectData];
        }
        
        localStorage.setItem('studentProjects', JSON.stringify(updatedProjects));
        
        console.log('✅ Project created in localStorage fallback:', projectData);
        return true;
      } catch (localError) {
        console.error('❌ Error creating project in localStorage:', localError);
        return false;
      }
    }
  };

  // Функція для створення студента при прийнятті заявки
  const createStudentFromApplication = async (application: Application): Promise<boolean> => {
    try {
      const token = getAuthToken();
      const teacherId = getCurrentUserId();
      
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }

      // Отримуємо повну інформацію про студента для створення запису
      const studentProfileInfo = await getStudentProfileInfo(application.studentId);

      // Створюємо студента на основі заявки та профілю
      const studentData = {
        teacher_id: teacherId,
        student_name: studentProfileInfo?.name || application.studentName,
        student_email: studentProfileInfo?.email || application.email,
        student_phone: studentProfileInfo?.phone || application.phone,
        student_avatar: studentProfileInfo?.avatar || application.studentAvatar,
        course: parseInt(studentProfileInfo?.year || application.year) || 3,
        faculty: getFacultyFromProgram(studentProfileInfo?.program || application.program),
        specialty: studentProfileInfo?.program || application.program,
        work_type: application.type === 'course' ? 'coursework' : 'diploma',
        work_title: application.topic,
        start_date: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'active',
        application_id: application.id,
        grade: 0,
        unread_comments: 0,
        last_activity: new Date().toISOString(),
        student_bio: studentProfileInfo?.bio || '' // Додаємо біографію
      };

      let newStudentId: string;

      // Спроба зберегти через API
      if (token) {
        const response = await safeFetch('/api/teacher/students', {
          method: 'POST',
          body: JSON.stringify(studentData)
        });

        if (response && response.id) {
          newStudentId = response.id;
          console.log('✅ Student created via API:', newStudentId);
        } else {
          throw new Error('API request failed');
        }
      } else {
        newStudentId = `student-${application.id}-${Date.now()}`;
      }

      // Завжди зберігаємо в localStorage як fallback
      const existingStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
      const newStudent: Student = {
        id: newStudentId,
        name: studentProfileInfo?.name || application.studentName,
        email: studentProfileInfo?.email || application.email,
        phone: studentProfileInfo?.phone || application.phone,
        avatar: studentProfileInfo?.avatar || application.studentAvatar,
        course: parseInt(studentProfileInfo?.year || application.year) || 3,
        faculty: getFacultyFromProgram(studentProfileInfo?.program || application.program),
        specialty: studentProfileInfo?.program || application.program,
        workType: application.type === 'course' ? 'coursework' : 'diploma',
        workTitle: application.topic,
        startDate: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'active',
        lastActivity: new Date().toISOString(),
        grade: 0,
        unreadComments: 0,
        projectType: application.type === 'course' ? 'coursework' : 'diploma',
        teacherId: teacherId
      };
      
      // Перевіряємо, чи студент вже існує
      const existingStudentIndex = existingStudents.findIndex((student: Student) => 
        student.id === newStudentId || student.email === newStudent.email
      );

      let updatedStudents;
      if (existingStudentIndex !== -1) {
        existingStudents[existingStudentIndex] = newStudent;
        updatedStudents = existingStudents;
      } else {
        updatedStudents = [...existingStudents, newStudent];
      }
      
      localStorage.setItem('teacherStudents', JSON.stringify(updatedStudents));
      
      // Створюємо проект для студента
      const projectCreated = await createStudentProject(application);
      
      if (projectCreated) {
        console.log('✅ Student project created successfully');
      } else {
        console.warn('⚠️ Student project creation had issues, but student was created');
      }
      
      // Сповіщаємо про оновлення студентів
      window.dispatchEvent(new CustomEvent('studentsUpdated'));
      window.dispatchEvent(new CustomEvent('studentUpdated', { 
        detail: { studentId: newStudentId } 
      }));
      
      // Сповіщаємо про оновлення проектів
      window.dispatchEvent(new CustomEvent('projectsUpdated'));
      
      console.log('✅ Student created and events dispatched:', newStudentId);
      return true;
    } catch (error) {
      console.error('❌ Error creating student:', error);
      
      // Fallback: створюємо студента тільки в localStorage
      try {
        const teacherId = getCurrentUserId();
        const existingStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
        const newStudent: Student = {
          id: `student-${application.id}-${Date.now()}`,
          name: application.studentName,
          email: application.email,
          phone: application.phone,
          avatar: application.studentAvatar,
          course: parseInt(application.year) || 3,
          faculty: getFacultyFromProgram(application.program),
          specialty: application.program,
          workType: application.type === 'course' ? 'coursework' : 'diploma',
          workTitle: application.topic,
          startDate: new Date().toISOString().split('T')[0],
          progress: 0,
          status: 'active',
          lastActivity: new Date().toISOString(),
          grade: 0,
          unreadComments: 0,
          projectType: application.type === 'course' ? 'coursework' : 'diploma',
          teacherId: teacherId || undefined
        };
        
        // Перевіряємо, чи студент вже існує
        const existingStudentIndex = existingStudents.findIndex((student: Student) => 
          student.email === newStudent.email
        );

        let updatedStudents;
        if (existingStudentIndex !== -1) {
          existingStudents[existingStudentIndex] = newStudent;
          updatedStudents = existingStudents;
        } else {
          updatedStudents = [...existingStudents, newStudent];
        }
        
        localStorage.setItem('teacherStudents', JSON.stringify(updatedStudents));
        
        // Створюємо проект для студента
        await createStudentProject(application);
        
        // Сповіщаємо про оновлення студентів
        window.dispatchEvent(new CustomEvent('studentsUpdated'));
        window.dispatchEvent(new CustomEvent('studentUpdated', { 
          detail: { studentId: newStudent.id } 
        }));
        
        // Сповіщаємо про оновлення проектів
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        
        console.log('✅ Student created in localStorage and events dispatched:', newStudent.id);
        return true;
      } catch (localError) {
        console.error('❌ Error creating student in localStorage:', localError);
        return false;
      }
    }
  };

  // Допоміжна функція для отримання факультету з програми
  const getFacultyFromProgram = (program: string): string => {
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

  const toggleApplication = (id: number) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  // Функція для прийняття студента
  const acceptStudent = async (application: Application) => {
    setIsProcessing(application.id);
    try {
      const token = getAuthToken();
      
      // Оновлюємо статус заявки через API
      if (token) {
        await safeFetch(`/api/teacher/applications/${application.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
        });
      }

      // Створюємо студента на основі заявки
      const studentCreated = await createStudentFromApplication(application);
      
      if (studentCreated) {
        // Оновлюємо статус локально
        updateApplicationStatus(application.id, "accepted");
        
        // Додаткове сповіщення для синхронізації
        window.dispatchEvent(new CustomEvent('studentsUpdated'));
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        
        toast.success(`Студент ${application.studentName} успішно прийнятий! 🎉`, {
          description: `Студент тепер з'явиться у вашому списку на головній панелі. У Thesis Tracker створено проект: "${application.topic}"`
        });
        
        // Оновлюємо список заявок
        if (currentTeacherId) {
          setTimeout(() => {
            fetchApplications(currentTeacherId);
          }, 1000);
        }
      } else {
        throw new Error('Failed to create student record');
      }
    } catch (error) {
      console.error('❌ Error accepting student:', error);
      toast.error('Сталася помилка при прийнятті студента');
    } finally {
      setIsProcessing(null);
    }
  };

  // Функція для відхилення заявки
  const rejectStudent = async (application: Application, comment?: string) => {
    setIsProcessing(application.id);
    try {
      const token = getAuthToken();
      
      if (token) {
        await safeFetch(`/api/teacher/applications/${application.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'rejected',
            rejection_reason: comment || 'Заявка відхилена викладачем',
            rejected_at: new Date().toISOString()
          })
        });
      }

      // Оновлюємо статус локально
      updateApplicationStatus(application.id, "rejected");
      toast.success(`Заявку студента ${application.studentName} відхилено`);
      
      // Закриваємо діалог та очищаємо коментар
      setShowRejectionDialog(null);
      setRejectionComment("");
      
      // Оновлюємо список заявок
      if (currentTeacherId) {
        setTimeout(() => {
          fetchApplications(currentTeacherId);
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      toast.error('Сталася помилка при відхиленні заявки');
    } finally {
      setIsProcessing(null);
    }
  };

  // Функція для відкриття діалогу відхилення
  const openRejectionDialog = (applicationId: number) => {
    setShowRejectionDialog(applicationId);
    setRejectionComment("");
  };

  // Функція для закриття діалогу відхилення
  const closeRejectionDialog = () => {
    setShowRejectionDialog(null);
    setRejectionComment("");
  };

  const updateApplicationStatus = (id: number, status: ApplicationStatus) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status } : app
    ));
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = typeFilter === "all" || app.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    accepted: applications.filter(app => app.status === "accepted").length,
    rejected: applications.filter(app => app.status === "rejected").length
  };

  const refreshApplications = () => {
    if (currentTeacherId) {
      fetchApplications(currentTeacherId);
      toast.info('Оновлення списку заявок...');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const config = {
      pending: { variant: 'secondary' as const, text: 'На розгляді', icon: Clock },
      accepted: { variant: 'default' as const, text: 'Прийнято', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, text: 'Відхилено', icon: AlertCircle }
    };
    
    const { variant, text, icon: Icon } = config[status];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {text}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{t('studentapplications', { defaultValue: "Заявки студентів" })}</h1>
                <p className="text-muted-foreground mt-1">
                  Керуйте заявками студентів на керівництво курсовими та дипломними роботами
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('header.searchPlaceholder', { defaultValue: "Пошук заявок..." })}
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('teacherApplications.status', { defaultValue: "Статус" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('teacherApplications.allStatuses', { defaultValue: "Всі статуси" })}</SelectItem>
                    <SelectItem value="pending">{t('teacherApplications.pending', { defaultValue: "Очікують" })}</SelectItem>
                    <SelectItem value="accepted">{t('teacherApplications.accepted', { defaultValue: "Прийняті" })}</SelectItem>
                    <SelectItem value="rejected">{t('teacherApplications.rejected', { defaultValue: "Відхилені" })}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('teacherApplications.workType', { defaultValue: "Тип роботи" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('teacherApplications.allTypes', { defaultValue: "Всі типи" })}</SelectItem>
                    <SelectItem value="course">{t('thesis.projectTypes.coursework', { defaultValue: "Курсова" })}</SelectItem>
                    <SelectItem value="diploma">{t('thesis.projectTypes.diploma', { defaultValue: "Дипломна" })}</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={refreshApplications}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.totalApplications', { defaultValue: "Всього заявок" })}
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.pending', { defaultValue: "Очікують" })}
                      </p>
                      <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.accepted', { defaultValue: "Прийняті" })}
                      </p>
                      <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.rejected', { defaultValue: "Відхилені" })}
                      </p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Список заявок */}
            <div className="space-y-4">
              {isLoading ? (
                <Card className="bg-card text-center py-8 border">
                  <CardContent>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Завантаження заявок...</p>
                  </CardContent>
                </Card>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <Card key={application.id} className="bg-card overflow-hidden border hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div 
                        className={`p-4 cursor-pointer transition-colors ${
                          expandedApplication === application.id ? "bg-muted/50 border-b" : "hover:bg-muted/30"
                        }`}
                        onClick={() => toggleApplication(application.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Клікабельний аватар для перегляду профілю */}
                            <div 
                              className="relative cursor-pointer hover:scale-105 transition-transform group"
                              onClick={(e) => {
                                e.stopPropagation();
                                openStudentProfile(application);
                              }}
                              title="Переглянути профіль студента"
                            >
                              <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                <AvatarImage src={application.studentAvatar} />
                                <AvatarFallback className="bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  {loadingStudentProfile === (application.studentId || application.id.toString()) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  ) : (
                                    getInitials(application.studentName)
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {/* Клікабельне ім'я студента */}
                                <h3 
                                  className="font-semibold text-lg truncate hover:text-primary transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openStudentProfile(application);
                                  }}
                                  title="Переглянути профіль студента"
                                >
                                  {application.studentName}
                                </h3>
                                {getStatusBadge(application.status)}
                                <Badge variant="outline" className="whitespace-nowrap">
                                  {application.type === "course" 
                                    ? t('thesis.projectTypes.coursework', { defaultValue: "Курсова" }) 
                                    : t('thesis.projectTypes.diploma', { defaultValue: "Дипломна" })
                                  }
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {application.program} • {application.year}
                              </p>
                              <p className="text-sm font-medium line-clamp-2">{application.topic}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{application.date}</span>
                            {expandedApplication === application.id ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedApplication === application.id && (
                        <div className="px-4 pb-4 space-y-4 mt-2 animate-in fade-in duration-200">
                          <div className="pt-2">
                            <h4 className="font-medium mb-2 text-lg">
                              {t('teacherApplications.applicationDetails', { defaultValue: "Деталі заявки" })}
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {application.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <em>Це опис проекту від студента. Для перегляду біографії студента натисніть на аватар або ім'я.</em>
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                              <Mail className="h-4 w-4 text-primary" />
                              <span className="text-sm">{application.email}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                              <Phone className="h-4 w-4 text-primary" />
                              <span className="text-sm">{application.phone || 'Не вказано'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                            {application.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={() => acceptStudent(application)}
                                  disabled={isProcessing === application.id}
                                >
                                  {isProcessing === application.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  {t('teacherApplications.acceptApplication', { defaultValue: "Прийняти заявку" })}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => openRejectionDialog(application.id)}
                                  disabled={isProcessing === application.id}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  {t('teacherApplications.rejectApplication', { defaultValue: "Відхилити заявку" })}
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                              onClick={() => openStudentProfile(application)}
                              disabled={loadingStudentProfile === (application.studentId || application.id.toString())}
                            >
                              {loadingStudentProfile === (application.studentId || application.id.toString()) ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                                  Завантаження...
                                </>
                              ) : (
                                'Переглянути профіль'
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                              asChild
                            >
                              <a href={`mailto:${application.email}?subject=Відповідь на заявку щодо керівництва&body=Шановний(а) ${application.studentName},%0D%0A%0D%0A`}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t('teacherApplications.writeToStudent', { defaultValue: "Написати студенту" })}
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-card text-center py-12 border">
                  <CardContent>
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">
                      {t('teacherApplications.noApplicationsFound', { defaultValue: "Заявок не знайдено" })}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                        ? "Спробуйте змінити параметри пошуку або фільтрації"
                        : "Наразі немає заявок від студентів. Нові заявки з'являться тут автоматично."
                      }
                    </p>
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setTypeFilter('all');
                        }}
                      >
                        Скинути фільтри
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Діалог відхилення заявки */}
      {showRejectionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Відхилити заявку</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeRejectionDialog}
                  disabled={isProcessing === showRejectionDialog}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Чи бажаєте додати коментар щодо причини відхилення? (необов'язково)
                </p>
                
                <Textarea
                  placeholder="Введіть коментар до відхилення..."
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  rows={4}
                  disabled={isProcessing === showRejectionDialog}
                />
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={closeRejectionDialog}
                    disabled={isProcessing === showRejectionDialog}
                  >
                    Скасувати
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const application = applications.find(app => app.id === showRejectionDialog);
                      if (application) {
                        rejectStudent(application, rejectionComment);
                      }
                    }}
                    disabled={isProcessing === showRejectionDialog}
                  >
                    {isProcessing === showRejectionDialog ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Обробка...
                      </>
                    ) : (
                      'Відхилити заявку'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Модальне вікно профілю студента */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeStudentProfile}
        studentId={selectedStudent?.id || ''}
        studentData={
          selectedStudent ? {
            id: selectedStudent.id,
            name: selectedStudent.name,
            email: selectedStudent.email,
            phone: selectedStudent.phone || '',
            program: selectedStudent.program || '',
            year: selectedStudent.year || '',
            description: selectedStudent.bio || 'Біографія не вказана', 
            studentAvatar: selectedStudent.avatar || selectedStudent.studentAvatar || ''
          } : undefined
        }
      />
    </div>
  );
};

export default TeacherApplications;