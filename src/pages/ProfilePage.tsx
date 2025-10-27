import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen, Trophy, Target, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface StudentInfo {
  name: string;
  group: string;
  course: string;
  faculty: string;
  department: string;
  email: string;
  bio: string;
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

// StudentProfileCard component
interface StudentProfileCardProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function StudentProfileCard({ title, children, onEdit }: StudentProfileCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Main component
export default function StudentProfile() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
  name: "",
  group: "",
  course: "",
  faculty: "",
  department: "",
  email: "",
  bio: "",
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

  // Отримання даних студента з API
  useEffect(() => {
  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Отримуємо профіль студента
      const profileResponse = await fetch('/api/student/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // Додаємо перевірку на наявність даних
        const studentData = {
          name: profileData.name || profileData.full_name || "",
          group: profileData.group || profileData.student_group || "",
          course: profileData.course || "",
          faculty: profileData.faculty || "",
          department: profileData.department || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
        };
        
        setStudentInfo(studentData);
        setEditedInfo(studentData); // Важливо: оновлюємо editedInfo
      } else {
        console.error('Failed to fetch student profile');
      }
        // Отримуємо проєкти студента
        const projectsResponse = await fetch('/api/student/projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }

        // Отримуємо досягнення студента
        const achievementsResponse = await fetch('/api/student/achievements', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setAchievements(achievementsData);
        }

        // Отримуємо цілі студента
        const goalsResponse = await fetch('/api/student/goals', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);
        }

      } catch (error) {
      console.error('Помилка завантаження даних студента:', error);
      toast.error("Помилка при завантаженні даних");
    } finally {
      setLoading(false);
    }
  };

  fetchStudentData();
}, []);

const handleSaveInfo = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Необхідно увійти в систему");
      return;
    }

    const response = await fetch('/api/student/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editedInfo.name,
        group: editedInfo.group,
        course: editedInfo.course,
        faculty_id: editedInfo.faculty, // або зберігайте faculty_id окремо
        email: editedInfo.email,
        bio: editedInfo.bio,
      }),
    });

    if (response.ok) {
      setStudentInfo(editedInfo);
      setIsEditingInfo(false);
      toast.success("Інформацію оновлено");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Помилка оновлення профілю:', error);
    toast.error("Помилка при оновленні профілю");
  }
};

  // Функції для проєктів
  const handleAddProject = async () => {
    if (newProject.title && newProject.type && newProject.status) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Необхідно увійти в систему");
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
          toast.success("Проєкт додано");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add project');
        }
      } catch (error) {
        console.error('Помилка додавання проєкту:', error);
        toast.error("Помилка при додаванні проєкту");
      }
    } else {
      toast.error("Будь ласка, заповніть обов'язкові поля: назва, тип та статус");
    }
  };

  const handleEditProject = async () => {
    if (!editingProject) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
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
        toast.success("Проєкт оновлено");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Помилка оновлення проєкту:', error);
      toast.error("Помилка при оновленні проєкту");
    }
  };

  // Функції для досягнень
  const handleAddAchievement = async () => {
    if (newAchievement.title && newAchievement.date) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Необхідно увійти в систему");
          return;
        }

        const response = await fetch('/api/student/achievements', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAchievement),
        });

        if (response.ok) {
          const savedAchievement = await response.json();
          setAchievements([...achievements, savedAchievement.achievement]);
          setNewAchievement({ title: "", date: "", description: "" });
          setAchievementDialogOpen(false);
          toast.success("Досягнення додано");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add achievement');
        }
      } catch (error) {
        console.error('Помилка додавання досягнення:', error);
        toast.error("Помилка при додаванні досягнення");
      }
    } else {
      toast.error("Будь ласка, заповніть обов'язкові поля: назва та дата");
    }
  };

  const handleEditAchievement = async () => {
    if (!editingAchievement) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
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
          date: editingAchievement.date,
          description: editingAchievement.description,
        }),
      });

      if (response.ok) {
        setAchievements(achievements.map(achievement => 
          achievement.id === editingAchievement.id ? editingAchievement : achievement
        ));
        setEditingAchievement(null);
        toast.success("Досягнення оновлено");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update achievement');
      }
    } catch (error) {
      console.error('Помилка оновлення досягнення:', error);
      toast.error("Помилка при оновленні досягнення");
    }
  };

  // Функції для цілей
  const handleAddGoal = async () => {
    if (newGoal.goal && newGoal.deadline) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Необхідно увійти в систему");
          return;
        }

        const response = await fetch('/api/student/goals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newGoal),
        });

        if (response.ok) {
          const savedGoal = await response.json();
          setGoals([...goals, savedGoal.goal]);
          setNewGoal({ goal: "", deadline: "", description: "" });
          setGoalDialogOpen(false);
          toast.success("Ціль додано");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add goal');
        }
      } catch (error) {
        console.error('Помилка додавання цілі:', error);
        toast.error("Помилка при додаванні цілі");
      }
    } else {
      toast.error("Будь ласка, заповніть обов'язкові поля: ціль та дедлайн");
    }
  };

  const handleEditGoal = async () => {
    if (!editingGoal) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
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
          deadline: editingGoal.deadline,
          description: editingGoal.description,
        }),
      });

      if (response.ok) {
        setGoals(goals.map(goal => 
          goal.id === editingGoal.id ? editingGoal : goal
        ));
        setEditingGoal(null);
        toast.success("Ціль оновлено");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update goal');
      }
    } catch (error) {
      console.error('Помилка оновлення цілі:', error);
      toast.error("Помилка при оновленні цілі");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
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
            toast.success("Проєкт видалено");
            break;
          case "achievement":
            setAchievements(achievements.filter((a) => a.id !== itemToDelete.id));
            toast.success("Досягнення видалено");
            break;
          case "goal":
            setGoals(goals.filter((g) => g.id !== itemToDelete.id));
            toast.success("Ціль видалено");
            break;
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
      toast.error("Помилка при видаленні");
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
              <p className="text-muted-foreground">Завантаження профілю...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                    Профіль студента
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Керуйте своєю інформацією, проєктами та досягненнями
                  </p>
                </div>

                {/* Personal Information */}
                {/* Personal Information */}
<StudentProfileCard
  title="Особиста інформація"
  onEdit={() => setIsEditingInfo(true)}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ім'я</p>
      <p className="text-lg font-semibold">{studentInfo.name}</p>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Група</p>
      <p className="text-lg font-semibold">{studentInfo.group || "Не вказано"}</p>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Курс</p>
      <p className="text-lg font-semibold">{studentInfo.course || "Не вказано"}</p>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Факультет</p>
      <p className="text-lg font-semibold">{studentInfo.faculty || "Не вказано"}</p>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
      <p className="text-lg font-semibold text-primary">{studentInfo.email}</p>
    </div>
    <div className="space-y-1 md:col-span-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Про себе</p>
      <p className="text-base leading-relaxed">
        {studentInfo.bio || "Інформація про себе ще не додана. Натисніть іконку редагування щоб додати інформацію."}
      </p>
    </div>
  </div>
</StudentProfileCard>

                {/* Projects */}
                <StudentProfileCard title="Мої проєкти">
                  <div className="space-y-4">
                    <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати проєкт
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати новий проєкт</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-title">Назва *</Label>
                            <Input
                              id="project-title"
                              value={newProject.title}
                              onChange={(e) =>
                                setNewProject({ ...newProject, title: e.target.value })
                              }
                              placeholder="Введіть назву проєкту"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-type">Тип проєкту *</Label>
                            <Input
                              id="project-type"
                              placeholder="Курсовий, Дипломний, Особистий..."
                              value={newProject.type}
                              onChange={(e) =>
                                setNewProject({ ...newProject, type: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-status">Статус *</Label>
                            <Input
                              id="project-status"
                              placeholder="В процесі, Завершено..."
                              value={newProject.status}
                              onChange={(e) =>
                                setNewProject({ ...newProject, status: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-desc">Опис</Label>
                            <Textarea
                              id="project-desc"
                              placeholder="Опишіть ваш проєкт..."
                              value={newProject.description}
                              onChange={(e) =>
                                setNewProject({ ...newProject, description: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1">
                                Скасувати
                              </Button>
                            </DialogClose>
                            <Button onClick={handleAddProject} className="flex-1">
                              Зберегти
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {projects.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає проєктів</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свій перший проєкт
                        </p>
                      </div>
                    ) : (
                      projects.map((project) => (
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
                                title="Редагувати проєкт"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("project", project.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Видалити проєкт"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </StudentProfileCard>

                {/* Achievements */}
                <StudentProfileCard title="Досягнення">
                  <div className="space-y-4">
                    <Dialog open={achievementDialogOpen} onOpenChange={setAchievementDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати досягнення
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати досягнення</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="achievement-title">Назва *</Label>
                            <Input
                              id="achievement-title"
                              value={newAchievement.title}
                              onChange={(e) =>
                                setNewAchievement({ ...newAchievement, title: e.target.value })
                              }
                              placeholder="Введіть назву досягнення"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="achievement-date">Дата *</Label>
                            <Input
                              id="achievement-date"
                              placeholder="Березень 2024"
                              value={newAchievement.date}
                              onChange={(e) =>
                                setNewAchievement({ ...newAchievement, date: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="achievement-desc">Опис</Label>
                            <Textarea
                              id="achievement-desc"
                              placeholder="Опишіть ваше досягнення..."
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
                                Скасувати
                              </Button>
                            </DialogClose>
                            <Button onClick={handleAddAchievement} className="flex-1">
                              Зберегти
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {achievements.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає досягнень</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свої досягнення
                        </p>
                      </div>
                    ) : (
                      achievements.map((achievement) => (
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
                                title="Редагувати досягнення"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("achievement", achievement.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Видалити досягнення"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </StudentProfileCard>

                {/* Goals */}
                <StudentProfileCard title="Цілі та плани">
                  <div className="space-y-4">
                    <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати ціль
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати нову ціль</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="goal-name">Ціль *</Label>
                            <Input
                              id="goal-name"
                              value={newGoal.goal}
                              onChange={(e) =>
                                setNewGoal({ ...newGoal, goal: e.target.value })
                              }
                              placeholder="Введіть вашу ціль"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="goal-deadline">Дедлайн *</Label>
                            <Input
                              id="goal-deadline"
                              placeholder="Грудень 2025"
                              value={newGoal.deadline}
                              onChange={(e) =>
                                setNewGoal({ ...newGoal, deadline: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="goal-desc">Опис</Label>
                            <Textarea
                              id="goal-desc"
                              placeholder="Опишіть вашу ціль детальніше..."
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
                                Скасувати
                              </Button>
                            </DialogClose>
                            <Button onClick={handleAddGoal} className="flex-1">
                              Зберегти
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {goals.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає цілей</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свої цілі та плани
                        </p>
                      </div>
                    ) : (
                      goals.map((goal) => (
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
                                Дедлайн: {goal.deadline}
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
                                title="Редагувати ціль"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("goal", goal.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Видалити ціль"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </StudentProfileCard>

                {/* Edit Info Dialog */}
<Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Редагувати особисту інформацію</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Ім'я *</Label>
        <Input
          id="edit-name"
          value={editedInfo.name}
          onChange={(e) =>
            setEditedInfo({ ...editedInfo, name: e.target.value })
          }
          placeholder="Введіть ваше ім'я"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-group">Група *</Label>
        <Input
          id="edit-group"
          placeholder="Введіть вашу групу"
          value={editedInfo.group}
          onChange={(e) =>
            setEditedInfo({ ...editedInfo, group: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-course">Курс *</Label>
        <Input
          id="edit-course"
          placeholder="Введіть ваш курс"
          value={editedInfo.course}
          onChange={(e) =>
            setEditedInfo({ ...editedInfo, course: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-faculty">Факультет *</Label>
        <Input
          id="edit-faculty"
          placeholder="Введіть ваш факультет"
          value={editedInfo.faculty}
          onChange={(e) =>
            setEditedInfo({ ...editedInfo, faculty: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-email">Email *</Label>
        <Input
          id="edit-email"
          type="email"
          placeholder="Введіть ваш email"
          value={editedInfo.email}
          onChange={(e) =>
            setEditedInfo({ ...editedInfo, email: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-bio">Про себе</Label>
        <Textarea
          id="edit-bio"
          placeholder="Розкажіть про себе, ваші інтереси та досягнення..."
          value={editedInfo.bio}
          onChange={(e) =>
            setEditedInfo({ ...editedInfo, bio: e.target.value })
          }
          rows={6}
        />
      </div>
      <div className="flex gap-2">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1">
            Скасувати
          </Button>
        </DialogClose>
        <Button onClick={handleSaveInfo} className="flex-1">
          Зберегти зміни
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

                {/* Edit Project Dialog */}
                <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати проєкт</DialogTitle>
                    </DialogHeader>
                    {editingProject && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-title">Назва *</Label>
                          <Input
                            id="edit-project-title"
                            value={editingProject.title}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, title: e.target.value })
                            }
                            placeholder="Введіть назву проєкту"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-type">Тип проєкту *</Label>
                          <Input
                            id="edit-project-type"
                            placeholder="Курсовий, Дипломний, Особистий..."
                            value={editingProject.type}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, type: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-status">Статус *</Label>
                          <Input
                            id="edit-project-status"
                            placeholder="В процесі, Завершено..."
                            value={editingProject.status}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, status: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-project-desc">Опис</Label>
                          <Textarea
                            id="edit-project-desc"
                            placeholder="Опишіть ваш проєкт..."
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
                            Скасувати
                          </Button>
                          <Button onClick={handleEditProject} className="flex-1">
                            Зберегти зміни
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Achievement Dialog */}
                <Dialog open={!!editingAchievement} onOpenChange={() => setEditingAchievement(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати досягнення</DialogTitle>
                    </DialogHeader>
                    {editingAchievement && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-achievement-title">Назва *</Label>
                          <Input
                            id="edit-achievement-title"
                            value={editingAchievement.title}
                            onChange={(e) =>
                              setEditingAchievement({ ...editingAchievement, title: e.target.value })
                            }
                            placeholder="Введіть назву досягнення"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-achievement-date">Дата *</Label>
                          <Input
                            id="edit-achievement-date"
                            placeholder="Березень 2024"
                            value={editingAchievement.date}
                            onChange={(e) =>
                              setEditingAchievement({ ...editingAchievement, date: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-achievement-desc">Опис</Label>
                          <Textarea
                            id="edit-achievement-desc"
                            placeholder="Опишіть ваше досягнення..."
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
                            Скасувати
                          </Button>
                          <Button onClick={handleEditAchievement} className="flex-1">
                            Зберегти зміни
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Goal Dialog */}
                <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати ціль</DialogTitle>
                    </DialogHeader>
                    {editingGoal && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-goal-name">Ціль *</Label>
                          <Input
                            id="edit-goal-name"
                            value={editingGoal.goal}
                            onChange={(e) =>
                              setEditingGoal({ ...editingGoal, goal: e.target.value })
                            }
                            placeholder="Введіть вашу ціль"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-goal-deadline">Дедлайн *</Label>
                          <Input
                            id="edit-goal-deadline"
                            placeholder="Грудень 2025"
                            value={editingGoal.deadline}
                            onChange={(e) =>
                              setEditingGoal({ ...editingGoal, deadline: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-goal-desc">Опис</Label>
                          <Textarea
                            id="edit-goal-desc"
                            placeholder="Опишіть вашу ціль детальніше..."
                            value={editingGoal.description}
                            onChange={(e) =>
                              setEditingGoal({
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
                            Скасувати
                          </Button>
                          <Button onClick={handleEditGoal} className="flex-1">
                            Зберегти зміни
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
                      <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ця дія не може бути скасована. Це видалить елемент назавжди.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-6 rounded-md">Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="h-10 px-6 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Видалити
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