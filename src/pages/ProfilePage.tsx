import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen, Trophy, Target, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useTranslation } from 'react-i18next';
import { StudentProfileCard } from '../components/StudentProfileCard';

interface StudentInfo {
  name: string;
  group: string;
  course: string;
  faculty: string;
  department: string;
  email: string;
  bio: string;
  phone?: string;
}

interface Project {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
  createdAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt?: string;
}

interface Goal {
  id: string;
  goal: string;
  deadline: string;
  description: string;
  createdAt?: string;
}

// Функція для отримання інформації про студента
const getStudentInfo = async (): Promise<StudentInfo | null> => {
  try {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token') || 
                  sessionStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No token found for student info');
      return null;
    }

    console.log('🔍 Fetching student info from API...');
    
    let studentData = null;
    let responseData = null;
    
    // Спершу пробуємо /api/student/profile
    try {
      const profileResponse = await fetch('/api/student/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('📋 Student profile data:', profileData);
        responseData = profileData;
        
        studentData = {
          name: profileData.name || "",
          group: profileData.group || "",
          course: profileData.course || "",
          faculty: profileData.faculty || profileData.faculty_name || "",
          department: profileData.department || profileData.department_name || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          phone: profileData.phone || ""
        };
      }
    } catch {
      console.log('⚠️ Profile API not available, trying current-user...');
    }

    // Якщо не вдалося отримати з /api/student/profile, пробуємо /api/current-user
    if (!studentData) {
      const response = await fetch('/api/current-user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Full student info from API:', data);
        responseData = data;
        
        studentData = {
          name: data.user?.name || data.name || data.user?.full_name || data.full_name || "",
          group: data.user?.group || data.group || data.user?.student_group || data.student_group || "",
          course: data.user?.course || data.course || "",
          faculty: data.user?.faculty || data.faculty || data.user?.faculty_name || data.faculty_name || "",
          department: data.user?.department || data.department || data.user?.department_name || data.department_name || "",
          email: data.user?.email || data.email || "",
          bio: data.user?.bio || data.bio || "",
          phone: data.user?.phone || data.phone || ""
        };
      }
    }
    
    if (studentData) {
      console.log('✅ Processed student info:', studentData);
      
      // Оновлюємо localStorage з новими даними - ТЕПЕР ВКЛЮЧАЄМО ТЕЛЕФОН
      try {
        const currentUser = {
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone || '', // Тепер телефон зберігається
          program: studentData.faculty,
          year: studentData.course,
          group: studentData.group || '', // Додаємо групу
          id: responseData?.user?.id || responseData?.id || '',
          bio: studentData.bio
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        console.log('✅ Updated localStorage with new user data including phone:', currentUser);
        
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }
      
      return studentData;
    } else {
      console.error('❌ Failed to fetch student profile from both endpoints');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching student info:', error);
    return null;
  }
};

// Функція для валідації та форматування дати
const validateAndFormatDate = (dateString: string): string | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString().split('T')[0]; // Повертаємо YYYY-MM-DD
};

// Main component
export default function StudentProfile() {
  const { t } = useTranslation();
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: "",
    group: "",
    course: "",
    faculty: "",
    department: "",
    email: "",
    bio: "",
    phone: "",
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<StudentInfo>(studentInfo);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Стани для додавання нових елементів
  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    title: "",
    type: "",
    status: "",
    description: "",
  });

  const [newAchievement, setNewAchievement] = useState<Omit<Achievement, "id">>({
    title: "",
    date: "",
    description: "",
  });

  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    goal: "",
    deadline: "",
    description: "",
  });

  // Стани для редагування існуючих елементів
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  // Синхронізація даних при завантаженні
  useEffect(() => {
    const syncUserData = () => {
      if (studentInfo.name && studentInfo.name !== "Студент") {
        try {
          const userData = {
            name: studentInfo.name,
            email: studentInfo.email,
            phone: studentInfo.phone || '',
            program: studentInfo.faculty,
            year: studentInfo.course,
            group: studentInfo.group || '', // Додаємо групу
            id: '',
            bio: studentInfo.bio
          };
          
          localStorage.setItem('currentUser', JSON.stringify(userData));
          console.log('✅ Synced user data on profile load:', userData);
          
          window.dispatchEvent(new CustomEvent('profileUpdated'));
        } catch (e) {
          console.error('Error syncing user data:', e);
        }
      }
    };

    if (studentInfo.name) {
      syncUserData();
    }
  }, [studentInfo]);

  // Отримання даних студента з API
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Отримуємо основну інформацію про студента
        const studentInfoData = await getStudentInfo();
        
        if (studentInfoData) {
          console.log('✅ Setting student info:', studentInfoData);
          setStudentInfo(studentInfoData);
          setEditedInfo(studentInfoData);
        } else {
          console.log('⚠️ No student info found, using empty data');
          const fallbackData = {
            name: "Іваненко Іван Іванович",
            group: "КН-41",
            course: "4",
            faculty: "Факультет інформаційних технологій",
            department: "Кафедра програмного забезпечення",
            email: "student@lnu.edu.ua",
            bio: "Студент 4 курсу, спеціалізуюсь на веб-розробці та штучному інтелекті.",
            phone: "+380123456789"
          };
          setStudentInfo(fallbackData);
          setEditedInfo(fallbackData);
        }

        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          console.error('No token found for additional data');
          setLoading(false);
          return;
        }

        // Отримуємо проєкти студента
        try {
          const projectsResponse = await fetch('/api/student/projects', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData);
          } else {
            console.log('⚠️ Projects API not available, using mock data');
            setProjects([]);
          }
        } catch (projectError) {
          console.error('Error fetching projects:', projectError);
        }

        // Отримуємо досягнення студента
        try {
          const achievementsResponse = await fetch('/api/student/achievements', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (achievementsResponse.ok) {
            const achievementsData = await achievementsResponse.json();
            setAchievements(achievementsData);
          } else {
            console.log('⚠️ Achievements API not available, using mock data');
            setAchievements([]);
          }
        } catch (achievementError) {
          console.error('Error fetching achievements:', achievementError);
        }

        // Отримуємо цілі студента
        try {
          const goalsResponse = await fetch('/api/student/goals', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (goalsResponse.ok) {
            const goalsData = await goalsResponse.json();
            setGoals(goalsData);
          } else {
            console.log('⚠️ Goals API not available, using mock data');
            setGoals([]);
          }
        } catch (goalError) {
          console.error('Error fetching goals:', goalError);
        }

      } catch (error) {
        console.error('Помилка завантаження даних студента:', error);
        toast.error(t('profile.alerts.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [t]);

  const handleSaveInfo = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      // Перевіряємо обов'язкові поля
      if (!editedInfo.group || !editedInfo.course) {
        toast.error(t('profile.alerts.fillRequiredFields'));
        return;
      }

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: studentInfo.name, // Завжди відправляємо name
          email: studentInfo.email, // Завжди відправляємо email
          group: editedInfo.group,
          course: editedInfo.course,
          bio: editedInfo.bio,
          phone: editedInfo.phone, // Тепер телефон також зберігається
        }),
      });

      if (response.ok) {
        const updatedInfo = {
          ...studentInfo,
          group: editedInfo.group,
          course: editedInfo.course,
          bio: editedInfo.bio,
          phone: editedInfo.phone, // Тепер телефон також оновлюється
        };
        
        setStudentInfo(updatedInfo);
        setIsEditingInfo(false);
        
        // Оновлюємо localStorage - ТЕПЕР ВКЛЮЧАЄМО ТЕЛЕФОН
        try {
          const currentUser = {
            name: updatedInfo.name,
            email: updatedInfo.email,
            phone: updatedInfo.phone || '', // Тепер телефон зберігається
            program: updatedInfo.faculty,
            year: updatedInfo.course,
            group: updatedInfo.group || '', // Додаємо групу
            id: '',
            bio: updatedInfo.bio
          };
          
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          console.log('✅ Updated localStorage after profile save with phone:', currentUser);
          
          window.dispatchEvent(new CustomEvent('profileUpdated'));
          
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        toast.success(t('profile.alerts.infoUpdated'));
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      toast.error(t('profile.alerts.updateError'));
    }
  };

  // Функції для проєктів, досягнень та цілей
  const handleAddProject = async () => {
    if (newProject.title && newProject.type && newProject.status) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          toast.error(t('profile.alerts.loginRequired'));
          return;
        }

        const response = await fetch('/api/student/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProject),
        });

        if (response.ok) {
          const savedProject = await response.json();
          setProjects([...projects, savedProject.project]);
          setNewProject({ title: "", type: "", status: "", description: "" });
          setProjectDialogOpen(false);
          toast.success(t('profile.alerts.projectAdded'));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add project');
        }
      } catch (error) {
        console.error('Помилка додавання проєкту:', error);
        toast.error(t('profile.alerts.projectAddError'));
      }
    } else {
      toast.error(t('profile.alerts.fillRequiredFields'));
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      const response = await fetch(`/api/student/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingProject.title,
          type: editingProject.type,
          status: editingProject.status,
          description: editingProject.description,
        }),
      });

      if (response.ok) {
        setProjects(projects.map(project => 
          project.id === editingProject.id ? editingProject : project
        ));
        setEditingProject(null);
        toast.success(t('profile.alerts.projectUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Помилка оновлення проєкту:', error);
      toast.error(t('profile.alerts.projectUpdateError'));
    }
  };

  const handleAddAchievement = async () => {
    if (newAchievement.title && newAchievement.date) {
      // Валідуємо та форматуємо дату
      const formattedDate = validateAndFormatDate(newAchievement.date);
      if (!formattedDate) {
        toast.error(t('profile.alerts.invalidDate'));
        return;
      }

      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          toast.error(t('profile.alerts.loginRequired'));
          return;
        }

        const response = await fetch('/api/student/achievements', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newAchievement,
            date: formattedDate
          }),
        });

        if (response.ok) {
          const savedAchievement = await response.json();
          setAchievements([...achievements, savedAchievement.achievement]);
          setNewAchievement({ title: "", date: "", description: "" });
          setAchievementDialogOpen(false);
          toast.success(t('profile.alerts.achievementAdded'));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add achievement');
        }
      } catch (error) {
        console.error('Помилка додавання досягнення:', error);
        toast.error(t('profile.alerts.achievementAddError'));
      }
    } else {
      toast.error(t('profile.alerts.fillRequiredFields'));
    }
  };

  const handleEditAchievement = async () => {
    if (!editingAchievement) return;

    // Валідуємо та форматуємо дату
    const formattedDate = validateAndFormatDate(editingAchievement.date);
    if (!formattedDate) {
      toast.error(t('profile.alerts.invalidDate'));
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      const response = await fetch(`/api/student/achievements/${editingAchievement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingAchievement.title,
          date: formattedDate,
          description: editingAchievement.description,
        }),
      });

      if (response.ok) {
        setAchievements(achievements.map(achievement => 
          achievement.id === editingAchievement.id ? {...editingAchievement, date: formattedDate} : achievement
        ));
        setEditingAchievement(null);
        toast.success(t('profile.alerts.achievementUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update achievement');
      }
    } catch (error) {
      console.error('Помилка оновлення досягнення:', error);
      toast.error(t('profile.alerts.achievementUpdateError'));
    }
  };

  const handleAddGoal = async () => {
    if (newGoal.goal && newGoal.deadline) {
      // Валідуємо та форматуємо дату
      const formattedDeadline = validateAndFormatDate(newGoal.deadline);
      if (!formattedDeadline) {
        toast.error(t('profile.alerts.invalidDate'));
        return;
      }

      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          toast.error(t('profile.alerts.loginRequired'));
          return;
        }

        const response = await fetch('/api/student/goals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newGoal,
            deadline: formattedDeadline
          }),
        });

        if (response.ok) {
          const savedGoal = await response.json();
          setGoals([...goals, savedGoal.goal]);
          setNewGoal({ goal: "", deadline: "", description: "" });
          setGoalDialogOpen(false);
          toast.success(t('profile.alerts.goalAdded'));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add goal');
        }
      } catch (error) {
        console.error('Помилка додавання цілі:', error);
        toast.error(t('profile.alerts.goalAddError'));
      }
    } else {
      toast.error(t('profile.alerts.fillRequiredFields'));
    }
  };

  const handleEditGoal = async () => {
    if (!editingGoal) return;

    // Валідуємо та форматуємо дату
    const formattedDeadline = validateAndFormatDate(editingGoal.deadline);
    if (!formattedDeadline) {
      toast.error(t('profile.alerts.invalidDate'));
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      const response = await fetch(`/api/student/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: editingGoal.goal,
          deadline: formattedDeadline,
          description: editingGoal.description,
        }),
      });

      if (response.ok) {
        setGoals(goals.map(goal => 
          goal.id === editingGoal.id ? {...editingGoal, deadline: formattedDeadline} : goal
        ));
        setEditingGoal(null);
        toast.success(t('profile.alerts.goalUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update goal');
      }
    } catch (error) {
      console.error('Помилка оновлення цілі:', error);
      toast.error(t('profile.alerts.goalUpdateError'));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error(t('profile.alerts.loginRequired'));
        return;
      }

      let endpoint = '';
      switch (itemToDelete.type) {
        case "project":
          endpoint = `/api/student/projects/${itemToDelete.id}`;
          break;
        case "achievement":
          endpoint = `/api/student/achievements/${itemToDelete.id}`;
          break;
        case "goal":
          endpoint = `/api/student/goals/${itemToDelete.id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        switch (itemToDelete.type) {
          case "project":
            setProjects(projects.filter((p) => p.id !== itemToDelete.id));
            toast.success(t('profile.alerts.projectDeleted'));
            break;
          case "achievement":
            setAchievements(achievements.filter((a) => a.id !== itemToDelete.id));
            toast.success(t('profile.alerts.achievementDeleted'));
            break;
          case "goal":
            setGoals(goals.filter((g) => g.id !== itemToDelete.id));
            toast.success(t('profile.alerts.goalDeleted'));
            break;
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
      toast.error(t('profile.alerts.deleteError'));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const startEditingProject = (project: Project) => {
    setEditingProject(project);
  };

  const startEditingAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
  };

  const startEditingGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  // Відображення завантаження
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('profile.loading')}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Компонент кнопки додавання для секцій
  const AddButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Plus className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar + Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
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
        <Header />
        
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="min-h-screen bg-background">
              <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                <div className="mb-10">
                  <h1 className="text-4xl font-bold mb-3 text-foreground">
                    {t('profile.title')}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t('profile.subtitle')}
                  </p>
                </div>

                {/* Personal Information */}
                <StudentProfileCard
                  title={t('profile.sections.personalInfo')}
                  onEdit={() => setIsEditingInfo(true)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('profile.fields.name')}
                      </p>
                      <p className="text-lg font-semibold">{studentInfo.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('profile.fields.group')}
                      </p>
                      <p className="text-lg font-semibold">{studentInfo.group || t('profile.fields.notSpecified')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('profile.fields.course')}
                      </p>
                      <p className="text-lg font-semibold">{studentInfo.course || t('profile.fields.notSpecified')}</p>
                    </div>
                    {/* ЗАМІСТЬ ФАКУЛЬТЕТУ ПОКАЗУЄМО ТЕЛЕФОН */}
                    {studentInfo.phone && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('profile.fields.phone')}
                        </p>
                        <p className="text-lg font-semibold">{studentInfo.phone}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('profile.fields.email')}
                      </p>
                      <p className="text-lg font-semibold text-primary">{studentInfo.email}</p>
                    </div>
                    {/* Факультет і кафедру можна приховати або показати в іншому місці */}
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('profile.fields.bio')}
                      </p>
                      <p className="text-base leading-relaxed">
                        {studentInfo.bio || t('profile.fields.bioPlaceholder')}
                      </p>
                    </div>
                  </div>
                </StudentProfileCard>

                {/* Projects */}
                <StudentProfileCard 
                  title={t('profile.sections.projects')}
                  onEdit={projects.length > 0 ? () => setProjectDialogOpen(true) : undefined}
                >
                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('profile.empty.projects.title')}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('profile.empty.projects.description')}
                        </p>
                        <AddButton onClick={() => setProjectDialogOpen(true)}>
                          {t('profile.actions.addProject')}
                        </AddButton>
                      </div>
                    ) : (
                      <>
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{project.title}</h4>
                                <p className="text-sm font-medium text-primary/70 mb-2">
                                  {project.type} • {project.status}
                                </p>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingProject(project)}
                                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog("project", project.id)}
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </StudentProfileCard>

                {/* Achievements */}
                <StudentProfileCard 
                  title={t('profile.sections.achievements')}
                  onEdit={achievements.length > 0 ? () => setAchievementDialogOpen(true) : undefined}
                >
                  <div className="space-y-4">
                    {achievements.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('profile.empty.achievements.title')}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('profile.empty.achievements.description')}
                        </p>
                        <AddButton onClick={() => setAchievementDialogOpen(true)}>
                          {t('profile.actions.addAchievement')}
                        </AddButton>
                      </div>
                    ) : (
                      <>
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Trophy className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{achievement.title}</h4>
                                <p className="text-sm font-medium text-primary/70 mb-2">
                                  {achievement.date}
                                </p>
                                {achievement.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {achievement.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingAchievement(achievement)}
                                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog("achievement", achievement.id)}
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </StudentProfileCard>

                {/* Goals */}
                <StudentProfileCard 
                  title={t('profile.sections.goals')}
                  onEdit={goals.length > 0 ? () => setGoalDialogOpen(true) : undefined}
                >
                  <div className="space-y-4">
                    {goals.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('profile.empty.goals.title')}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('profile.empty.goals.description')}
                        </p>
                        <AddButton onClick={() => setGoalDialogOpen(true)}>
                          {t('profile.actions.addGoal')}
                        </AddButton>
                      </div>
                    ) : (
                      <>
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{goal.goal}</h4>
                                <p className="text-sm font-medium text-primary/70 mb-2">
                                  {t('profile.fields.deadline')}: {goal.deadline}
                                </p>
                                {goal.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {goal.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingGoal(goal)}
                                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog("goal", goal.id)}
                                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </StudentProfileCard>

                {/* Edit Info Dialog */}
                <Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.editInfo.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Заблоковані поля */}
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">{t('profile.fields.name')}</Label>
                          <Input
                            id="edit-name"
                            value={studentInfo.name}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-faculty">{t('profile.fields.faculty')}</Label>
                          <Input
                            id="edit-faculty"
                            value={studentInfo.faculty}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-email">{t('profile.fields.email')}</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={studentInfo.email}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                        </div>

                        {/* Поле телефону - ТЕПЕР РЕДАГОВАНЕ */}
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">{t('profile.fields.phone')}</Label>
                          <Input
                            id="edit-phone"
                            placeholder={t('profile.placeholders.phone')}
                            value={editedInfo.phone || ""}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, phone: e.target.value })
                            }
                          />
                        </div>

                        {/* Поля, які можна редагувати */}
                        <div className="space-y-2">
                          <Label htmlFor="edit-group">{t('profile.fields.group')} *</Label>
                          <Input
                            id="edit-group"
                            placeholder={t('profile.placeholders.group')}
                            value={editedInfo.group}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, group: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-course">{t('profile.fields.course')} *</Label>
                          <Input
                            id="edit-course"
                            placeholder={t('profile.placeholders.course')}
                            value={editedInfo.course}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, course: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-bio">{t('profile.fields.bio')}</Label>
                        <Textarea
                          id="edit-bio"
                          placeholder={t('profile.placeholders.bio')}
                          value={editedInfo.bio}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, bio: e.target.value })
                          }
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            {t('profile.actions.cancel')}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleSaveInfo} className="flex-1">
                          {t('profile.actions.saveChanges')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Діалоги додавання */}
                <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.addProject.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-title">{t('profile.fields.title')} *</Label>
                        <Input
                          id="project-title"
                          value={newProject.title}
                          onChange={(e) =>
                            setNewProject({ ...newProject, title: e.target.value })
                          }
                          placeholder={t('profile.placeholders.projectTitle')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-type">{t('profile.fields.projectType')} *</Label>
                        <Input
                          id="project-type"
                          placeholder={t('profile.placeholders.projectType')}
                          value={newProject.type}
                          onChange={(e) =>
                            setNewProject({ ...newProject, type: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-status">{t('profile.fields.status')} *</Label>
                        <Input
                          id="project-status"
                          placeholder={t('profile.placeholders.projectStatus')}
                          value={newProject.status}
                          onChange={(e) =>
                            setNewProject({ ...newProject, status: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-desc">{t('profile.fields.description')}</Label>
                        <Textarea
                          id="project-desc"
                          placeholder={t('profile.placeholders.projectDescription')}
                          value={newProject.description}
                          onChange={(e) =>
                            setNewProject({ ...newProject, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            {t('profile.actions.cancel')}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleAddProject} className="flex-1">
                          {t('profile.actions.save')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={achievementDialogOpen} onOpenChange={setAchievementDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.addAchievement.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="achievement-title">{t('profile.fields.title')} *</Label>
                        <Input
                          id="achievement-title"
                          value={newAchievement.title}
                          onChange={(e) =>
                            setNewAchievement({ ...newAchievement, title: e.target.value })
                          }
                          placeholder={t('profile.placeholders.achievementTitle')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="achievement-date">{t('profile.fields.date')} *</Label>
                        <Input
                          id="achievement-date"
                          type="date"
                          placeholder={t('profile.placeholders.achievementDate')}
                          value={newAchievement.date}
                          onChange={(e) =>
                            setNewAchievement({ ...newAchievement, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="achievement-desc">{t('profile.fields.description')}</Label>
                        <Textarea
                          id="achievement-desc"
                          placeholder={t('profile.placeholders.achievementDescription')}
                          value={newAchievement.description}
                          onChange={(e) =>
                            setNewAchievement({
                              ...newAchievement,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            {t('profile.actions.cancel')}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleAddAchievement} className="flex-1">
                          {t('profile.actions.save')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.addGoal.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="goal-name">{t('profile.fields.goal')} *</Label>
                        <Input
                          id="goal-name"
                          value={newGoal.goal}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, goal: e.target.value })
                          }
                          placeholder={t('profile.placeholders.goal')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline">{t('profile.fields.deadline')} *</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          placeholder={t('profile.placeholders.goalDeadline')}
                          value={newGoal.deadline}
                          onChange={(e) =>
                            setNewGoal({ ...newGoal, deadline: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-desc">{t('profile.fields.description')}</Label>
                        <Textarea
                          id="goal-desc"
                          placeholder={t('profile.placeholders.goalDescription')}
                          value={newGoal.description}
                          onChange={(e) =>
                            setNewGoal({
                              ...newGoal,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <DialogClose asChild>
                          <Button variant="outline" className="flex-1">
                            {t('profile.actions.cancel')}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleAddGoal} className="flex-1">
                          {t('profile.actions.save')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Решта діалогів редагування та видалення залишаються незмінними */}
                <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.editProject.title')}</DialogTitle>
                    </DialogHeader>
                    {editingProject && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-title">{t('profile.fields.title')} *</Label>
                          <Input
                            id="edit-project-title"
                            value={editingProject.title}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, title: e.target.value })
                            }
                            placeholder={t('profile.placeholders.projectTitle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-type">{t('profile.fields.projectType')} *</Label>
                          <Input
                            id="edit-project-type"
                            placeholder={t('profile.placeholders.projectType')}
                            value={editingProject.type}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, type: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-status">{t('profile.fields.status')} *</Label>
                          <Input
                            id="edit-project-status"
                            placeholder={t('profile.placeholders.projectStatus')}
                            value={editingProject.status}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, status: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-desc">{t('profile.fields.description')}</Label>
                          <Textarea
                            id="edit-project-desc"
                            placeholder={t('profile.placeholders.projectDescription')}
                            value={editingProject.description}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, description: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingProject(null)}
                          >
                            {t('profile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditProject} className="flex-1">
                            {t('profile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog open={!!editingAchievement} onOpenChange={() => setEditingAchievement(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.editAchievement.title')}</DialogTitle>
                    </DialogHeader>
                    {editingAchievement && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-achievement-title">{t('profile.fields.title')} *</Label>
                          <Input
                            id="edit-achievement-title"
                            value={editingAchievement.title}
                            onChange={(e) =>
                              setEditingAchievement({ ...editingAchievement, title: e.target.value })
                            }
                            placeholder={t('profile.placeholders.achievementTitle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-achievement-date">{t('profile.fields.date')} *</Label>
                          <Input
                            id="edit-achievement-date"
                            type="date"
                            placeholder={t('profile.placeholders.achievementDate')}
                            value={editingAchievement.date}
                            onChange={(e) =>
                              setEditingAchievement({ ...editingAchievement, date: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-achievement-desc">{t('profile.fields.description')}</Label>
                          <Textarea
                            id="edit-achievement-desc"
                            placeholder={t('profile.placeholders.achievementDescription')}
                            value={editingAchievement.description}
                            onChange={(e) =>
                              setEditingAchievement({
                                ...editingAchievement,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingAchievement(null)}
                          >
                            {t('profile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditAchievement} className="flex-1">
                            {t('profile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('profile.dialogs.editGoal.title')}</DialogTitle>
                    </DialogHeader>
                    {editingGoal && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-goal-name">{t('profile.fields.goal')} *</Label>
                          <Input
                            id="edit-goal-name"
                            value={editingGoal.goal}
                            onChange={(e) =>
                              setEditingGoal({ ...editingGoal, goal: e.target.value })
                            }
                            placeholder={t('profile.placeholders.goal')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-goal-deadline">{t('profile.fields.deadline')} *</Label>
                          <Input
                            id="edit-goal-deadline"
                            type="date"
                            placeholder={t('profile.placeholders.goalDeadline')}
                            value={editingGoal.deadline}
                            onChange={(e) =>
                              setEditingGoal({ ...editingGoal, deadline: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-goal-desc">{t('profile.fields.description')}</Label>
                          <Textarea
                            id="edit-goal-desc"
                            placeholder={t('profile.placeholders.goalDescription')}
                            value={editingGoal.description}
                            onChange={(e) =>                               setEditingGoal({
                                ...editingGoal,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingGoal(null)}
                          >
                            {t('profile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditGoal} className="flex-1">
                            {t('profile.actions.saveChanges')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('profile.dialogs.delete.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('profile.dialogs.delete.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-6 rounded-md">
                        {t('profile.actions.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="h-10 px-6 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('profile.actions.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}