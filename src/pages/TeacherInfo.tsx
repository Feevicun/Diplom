import { useState, useEffect } from "react";
import { TeacherProfileCard } from "@/components/TeacherProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Award, Target, Trash2, Lightbulb, Edit } from "lucide-react";
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
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeacherInfo {
  name: string;
  title: string;
  department: string;
  email: string;
  bio: string;
}

interface Work {
  id: string;
  title: string;
  type: string;
  year: string;
  description: string;
  fileUrl?: string;
  publicationUrl?: string;
  createdAt?: string;
}

interface Direction {
  id: string;
  area: string;
  description: string;
  createdAt?: string;
}

interface FutureTopic {
  id: string;
  topic: string;
  description: string;
  createdAt?: string;
}

export default function Teacher() {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    name: "",
    title: "",
    department: "",
    email: "",
    bio: "",
  });

  const [works, setWorks] = useState<Work[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [futureTopics, setFutureTopics] = useState<FutureTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<TeacherInfo>(teacherInfo);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Стани для додавання нових елементів
  const [newWork, setNewWork] = useState<Omit<Work, "id">>({
    title: "",
    type: "",
    year: "",
    description: "",
  });

  const [newDirection, setNewDirection] = useState<Omit<Direction, "id">>({
    area: "",
    description: "",
  });

  const [newTopic, setNewTopic] = useState<Omit<FutureTopic, "id">>({
    topic: "",
    description: "",
  });

  // Стани для редагування існуючих елементів
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null);
  const [editingTopic, setEditingTopic] = useState<FutureTopic | null>(null);

  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);

  // Отримання даних викладача з API
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Отримуємо профіль викладача
        const profileResponse = await fetch('/api/teacher/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTeacherInfo({
            name: profileData.name,
            title: profileData.title || "",
            department: profileData.department || "",
            email: profileData.email,
            bio: profileData.bio || "",
          });
          setEditedInfo({
            name: profileData.name,
            title: profileData.title || "",
            department: profileData.department || "",
            email: profileData.email,
            bio: profileData.bio || "",
          });
        } else {
          console.error('Failed to fetch teacher profile');
        }

        // Отримуємо роботи викладача
        const worksResponse = await fetch('/api/teacher/works', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (worksResponse.ok) {
          const worksData = await worksResponse.json();
          setWorks(worksData);
        }

        // Отримуємо напрямки досліджень
        const directionsResponse = await fetch('/api/teacher/directions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (directionsResponse.ok) {
          const directionsData = await directionsResponse.json();
          setDirections(directionsData);
        }

        // Отримуємо майбутні теми
        const topicsResponse = await fetch('/api/teacher/topics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          setFutureTopics(topicsData);
        }

      } catch (error) {
        console.error('Помилка завантаження даних викладача:', error);
        toast.error("Помилка при завантаженні даних");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const handleSaveInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
        return;
      }

      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedInfo.title,
          bio: editedInfo.bio,
        }),
      });

      if (response.ok) {
        setTeacherInfo(editedInfo);
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

  // Функції для робіт
  const handleAddWork = async () => {
    if (newWork.title && newWork.type && newWork.year) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Необхідно увійти в систему");
          return;
        }

        const response = await fetch('/api/teacher/works', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newWork),
        });

        if (response.ok) {
          const savedWork = await response.json();
          setWorks([...works, savedWork.work]);
          setNewWork({ title: "", type: "", year: "", description: "" });
          setWorkDialogOpen(false);
          toast.success("Працю додано");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add work');
        }
      } catch (error) {
        console.error('Помилка додавання роботи:', error);
        toast.error("Помилка при додаванні роботи");
      }
    } else {
      toast.error("Будь ласка, заповніть обов'язкові поля: назва, тип та рік");
    }
  };

  const handleEditWork = async () => {
    if (!editingWork) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
        return;
      }

      const response = await fetch(`/api/teacher/works/${editingWork.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingWork.title,
          type: editingWork.type,
          year: editingWork.year,
          description: editingWork.description,
        }),
      });

      if (response.ok) {
        setWorks(works.map(work => 
          work.id === editingWork.id ? editingWork : work
        ));
        setEditingWork(null);
        toast.success("Працю оновлено");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update work');
      }
    } catch (error) {
      console.error('Помилка оновлення роботи:', error);
      toast.error("Помилка при оновленні роботи");
    }
  };

  // Функції для напрямків
  const handleAddDirection = async () => {
    if (newDirection.area && newDirection.description) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Необхідно увійти в систему");
          return;
        }

        const response = await fetch('/api/teacher/directions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDirection),
        });

        if (response.ok) {
          const savedDirection = await response.json();
          setDirections([...directions, savedDirection.direction]);
          setNewDirection({ area: "", description: "" });
          setDirectionDialogOpen(false);
          toast.success("Напрямок додано");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add direction');
        }
      } catch (error) {
        console.error('Помилка додавання напрямку:', error);
        toast.error("Помилка при додаванні напрямку");
      }
    } else {
      toast.error("Будь ласка, заповніть обов'язкові поля: область та опис");
    }
  };

  const handleEditDirection = async () => {
    if (!editingDirection) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
        return;
      }

      const response = await fetch(`/api/teacher/directions/${editingDirection.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: editingDirection.area,
          description: editingDirection.description,
        }),
      });

      if (response.ok) {
        setDirections(directions.map(direction => 
          direction.id === editingDirection.id ? editingDirection : direction
        ));
        setEditingDirection(null);
        toast.success("Напрямок оновлено");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update direction');
      }
    } catch (error) {
      console.error('Помилка оновлення напрямку:', error);
      toast.error("Помилка при оновленні напрямку");
    }
  };

  // Функції для тем
  const handleAddTopic = async () => {
    if (newTopic.topic && newTopic.description) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Необхідно увійти в систему");
          return;
        }

        const response = await fetch('/api/teacher/topics', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTopic),
        });

        if (response.ok) {
          const savedTopic = await response.json();
          setFutureTopics([...futureTopics, savedTopic.topic]);
          setNewTopic({ topic: "", description: "" });
          setTopicDialogOpen(false);
          toast.success("Тему додано");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add topic');
        }
      } catch (error) {
        console.error('Помилка додавання теми:', error);
        toast.error("Помилка при додаванні теми");
      }
    } else {
      toast.error("Будь ласка, заповніть обов'язкові поля: тему та опис");
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Необхідно увійти в систему");
        return;
      }

      const response = await fetch(`/api/teacher/topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: editingTopic.topic,
          description: editingTopic.description,
        }),
      });

      if (response.ok) {
        setFutureTopics(futureTopics.map(topic => 
          topic.id === editingTopic.id ? editingTopic : topic
        ));
        setEditingTopic(null);
        toast.success("Тему оновлено");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update topic');
      }
    } catch (error) {
      console.error('Помилка оновлення теми:', error);
      toast.error("Помилка при оновленні теми");
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
        case "work":
          endpoint = `/api/teacher/works/${itemToDelete.id}`;
          break;
        case "direction":
          endpoint = `/api/teacher/directions/${itemToDelete.id}`;
          break;
        case "topic":
          endpoint = `/api/teacher/topics/${itemToDelete.id}`;
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
          case "work":
            setWorks(works.filter((w) => w.id !== itemToDelete.id));
            toast.success("Працю видалено");
            break;
          case "direction":
            setDirections(directions.filter((d) => d.id !== itemToDelete.id));
            toast.success("Напрямок видалено");
            break;
          case "topic":
            setFutureTopics(futureTopics.filter((t) => t.id !== itemToDelete.id));
            toast.success("Тему видалено");
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

  const startEditingWork = (work: Work) => {
    setEditingWork(work);
  };

  const startEditingDirection = (direction: Direction) => {
    setEditingDirection(direction);
  };

  const startEditingTopic = (topic: FutureTopic) => {
    setEditingTopic(topic);
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
      {/* Desktop Sidebar - показується тільки на великих екранах */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar + Overlay - показується на всіх екранах менше md */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar Panel */}
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
        {/* Header завжди присутній */}
        <Header />
        
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="min-h-screen bg-background">
              <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                <div className="mb-10">
                  <h1 className="text-4xl font-bold mb-3 text-foreground">
                    Профіль викладача
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Керуйте своєю інформацією, працями та напрямками досліджень
                  </p>
                </div>

                {/* Personal Information */}
                <TeacherProfileCard
                  title="Особиста інформація"
                  onEdit={() => setIsEditingInfo(true)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ім'я</p>
                      <p className="text-lg font-semibold">{teacherInfo.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Посада</p>
                      <p className="text-lg font-semibold">{teacherInfo.title || "Не вказано"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Кафедра</p>
                      <p className="text-lg font-semibold">{teacherInfo.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-lg font-semibold text-primary">{teacherInfo.email}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Біографія</p>
                      <p className="text-base leading-relaxed">
                        {teacherInfo.bio || "Біографія ще не додана. Натисніть 'Редагувати' щоб додати інформацію."}
                      </p>
                    </div>
                  </div>
                </TeacherProfileCard>

                {/* Works and Publications */}
                <TeacherProfileCard title="Праці та публікації">
                  <div className="space-y-4">
                    <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати працю
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати нову працю</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="work-title">Назва *</Label>
                            <Input
                              id="work-title"
                              value={newWork.title}
                              onChange={(e) =>
                                setNewWork({ ...newWork, title: e.target.value })
                              }
                              placeholder="Введіть назву роботи"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="work-type">Тип роботи *</Label>
                            <Input
                              id="work-type"
                              placeholder="Монографія, Стаття, Книга..."
                              value={newWork.type}
                              onChange={(e) =>
                                setNewWork({ ...newWork, type: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="work-year">Рік *</Label>
                            <Input
                              id="work-year"
                              placeholder="2024"
                              value={newWork.year}
                              onChange={(e) =>
                                setNewWork({ ...newWork, year: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="work-desc">Опис</Label>
                            <Textarea
                              id="work-desc"
                              placeholder="Короткий опис роботи..."
                              value={newWork.description}
                              onChange={(e) =>
                                setNewWork({ ...newWork, description: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex gap-2">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1">
                                Скасувати
                              </Button>
                            </DialogClose>
                            <Button onClick={handleAddWork} className="flex-1">
                              Зберегти
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {works.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає робіт</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свою першу роботу або публікацію
                        </p>
                      </div>
                    ) : (
                      works.map((work) => (
                        <div
                          key={work.id}
                          className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{work.title}</h4>
                              <p className="text-sm font-medium text-primary/70 mb-2">
                                {work.type} • {work.year}
                              </p>
                              {work.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">{work.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingWork(work)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("work", work.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Research Directions */}
                <TeacherProfileCard title="Напрямки наукової роботи">
                  <div className="space-y-4">
                    <Dialog open={directionDialogOpen} onOpenChange={setDirectionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати напрямок
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати науковий напрямок</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="dir-area">Область досліджень *</Label>
                            <Input
                              id="dir-area"
                              placeholder="Наприклад: Штучний інтелект та машинне навчання"
                              value={newDirection.area}
                              onChange={(e) =>
                                setNewDirection({ ...newDirection, area: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dir-desc">Опис *</Label>
                            <Textarea
                              id="dir-desc"
                              placeholder="Детальний опис напрямку досліджень..."
                              value={newDirection.description}
                              onChange={(e) =>
                                setNewDirection({
                                  ...newDirection,
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
                            <Button onClick={handleAddDirection} className="flex-1">
                              Зберегти
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {directions.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає напрямків</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте свої наукові напрямки досліджень
                        </p>
                      </div>
                    ) : (
                      directions.map((direction) => (
                        <div
                          key={direction.id}
                          className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Target className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{direction.area}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {direction.description}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingDirection(direction)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("direction", direction.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Future Topics */}
                <TeacherProfileCard title="Теми для майбутніх досліджень">
                  <div className="space-y-4">
                    <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати тему
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати майбутню тему</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="topic-name">Тема дослідження *</Label>
                            <Input
                              id="topic-name"
                              placeholder="Наприклад: Квантові обчислення в AI"
                              value={newTopic.topic}
                              onChange={(e) =>
                                setNewTopic({ ...newTopic, topic: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="topic-desc">Опис *</Label>
                            <Textarea
                              id="topic-desc"
                              placeholder="Опишіть тему та плани щодо її дослідження..."
                              value={newTopic.description}
                              onChange={(e) =>
                                setNewTopic({
                                  ...newTopic,
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
                            <Button onClick={handleAddTopic} className="flex-1">
                              Зберегти
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {futureTopics.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ще немає тем</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Додайте теми для майбутніх досліджень
                        </p>
                      </div>
                    ) : (
                      futureTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Lightbulb className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{topic.topic}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {topic.description}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditingTopic(topic)}
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("topic", topic.id)}
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TeacherProfileCard>

                {/* Edit Info Dialog */}
                <Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати особисту інформацію</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Ім'я</Label>
                        <Input
                          id="edit-name"
                          value={editedInfo.name}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Ім'я не можна змінити через цю форму
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Посада</Label>
                        <Input
                          id="edit-title"
                          placeholder="Доктор наук, професор"
                          value={editedInfo.title}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept">Кафедра</Label>
                        <Input
                          id="edit-dept"
                          value={editedInfo.department}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Кафедра визначається вашим факультетом
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editedInfo.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email не можна змінити через цю форму
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-bio">Біографія</Label>
                        <Textarea
                          id="edit-bio"
                          placeholder="Розкажіть про себе, ваш досвід та досягнення..."
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

                {/* Edit Work Dialog */}
                <Dialog open={!!editingWork} onOpenChange={() => setEditingWork(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати працю</DialogTitle>
                    </DialogHeader>
                    {editingWork && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-title">Назва *</Label>
                          <Input
                            id="edit-work-title"
                            value={editingWork.title}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, title: e.target.value })
                            }
                            placeholder="Введіть назву роботи"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-type">Тип роботи *</Label>
                          <Input
                            id="edit-work-type"
                            placeholder="Монографія, Стаття, Книга..."
                            value={editingWork.type}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, type: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-year">Рік *</Label>
                          <Input
                            id="edit-work-year"
                            placeholder="2024"
                            value={editingWork.year}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, year: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-desc">Опис</Label>
                          <Textarea
                            id="edit-work-desc"
                            placeholder="Короткий опис роботи..."
                            value={editingWork.description}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, description: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingWork(null)}
                          >
                            Скасувати
                          </Button>
                          <Button onClick={handleEditWork} className="flex-1">
                            Зберегти зміни
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Direction Dialog */}
                <Dialog open={!!editingDirection} onOpenChange={() => setEditingDirection(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати напрямок</DialogTitle>
                    </DialogHeader>
                    {editingDirection && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-dir-area">Область досліджень *</Label>
                          <Input
                            id="edit-dir-area"
                            placeholder="Наприклад: Штучний інтелект та машинне навчання"
                            value={editingDirection.area}
                            onChange={(e) =>
                              setEditingDirection({ ...editingDirection, area: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dir-desc">Опис *</Label>
                          <Textarea
                            id="edit-dir-desc"
                            placeholder="Детальний опис напрямку досліджень..."
                            value={editingDirection.description}
                            onChange={(e) =>
                              setEditingDirection({
                                ...editingDirection,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingDirection(null)}
                          >
                            Скасувати
                          </Button>
                          <Button onClick={handleEditDirection} className="flex-1">
                            Зберегти зміни
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Topic Dialog */}
                <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати тему</DialogTitle>
                    </DialogHeader>
                    {editingTopic && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-topic-name">Тема дослідження *</Label>
                          <Input
                            id="edit-topic-name"
                            placeholder="Наприклад: Квантові обчислення в AI"
                            value={editingTopic.topic}
                            onChange={(e) =>
                              setEditingTopic({ ...editingTopic, topic: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-topic-desc">Опис *</Label>
                          <Textarea
                            id="edit-topic-desc"
                            placeholder="Опишіть тему та плани щодо її дослідження..."
                            value={editingTopic.description}
                            onChange={(e) =>
                              setEditingTopic({
                                ...editingTopic,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingTopic(null)}
                          >
                            Скасувати
                          </Button>
                          <Button onClick={handleEditTopic} className="flex-1">
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