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
import { useTranslation } from "react-i18next";

interface TeacherInfo {
  name: string;
  title: string;
  department: string;
  faculty: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  officeHours?: string;
  phone?: string;
  website?: string;
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

export default function TeacherInfo() {
  const { t } = useTranslation();
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    name: "",
    title: "",
    department: "",
    faculty: "",
    email: "",
    bio: "",
  });

  const [works, setWorks] = useState<Work[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [futureTopics, setFutureTopics] = useState<FutureTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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

  // Функція для декодування JWT токена
  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Отримання даних викладача з API
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          console.error('No token found');
          toast.error(t('teacherProfile.alerts.loginRequired'));
          setLoading(false);
          return;
        }

        // Декодуємо токен для отримання userId
        const decodedToken = decodeToken(token);
        console.log('Decoded token:', decodedToken);
        
        if (decodedToken && decodedToken.userId) {
          setUserId(decodedToken.userId);
          console.log('User ID:', decodedToken.userId);
          console.log('User role:', decodedToken.role);
        }

        console.log('Fetching teacher data...');

        // Отримуємо профіль викладача
        const profileResponse = await fetch('/api/teacher/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Profile response status:', profileResponse.status);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Full Profile data:', profileData);
          
          const teacherData = {
            name: profileData.name || "",
            title: profileData.title || "",
            department: profileData.department || "",
            faculty: profileData.faculty || "",
            email: profileData.email || "",
            bio: profileData.bio || "",
            avatarUrl: profileData.avatarUrl || "",
            officeHours: profileData.officeHours || "",
            phone: profileData.phone || "",
            website: profileData.website || ""
          };
          console.log('Processed teacher data:', teacherData);
          
          setTeacherInfo(teacherData);
          setEditedInfo(teacherData);
        } else {
          console.error('Failed to fetch teacher profile:', profileResponse.status);
          const errorText = await profileResponse.text();
          console.error('Profile error response:', errorText);
          toast.error(t('teacherProfile.alerts.loadError'));
        }

        // Отримуємо роботи викладача
        console.log('Fetching works...');
        const worksResponse = await fetch('/api/teacher/works', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Works response status:', worksResponse.status);

        if (worksResponse.ok) {
          const worksData = await worksResponse.json();
          console.log('Full Works data:', worksData);
          console.log('Works count:', worksData.length);
          setWorks(worksData);
        } else {
          console.error('Failed to fetch teacher works:', worksResponse.status);
          const errorText = await worksResponse.text();
          console.error('Works error response:', errorText);
        }

        // Отримуємо напрямки досліджень
        console.log('Fetching directions...');
        const directionsResponse = await fetch('/api/teacher/directions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Directions response status:', directionsResponse.status);

        if (directionsResponse.ok) {
          const directionsData = await directionsResponse.json();
          console.log('Full Directions data:', directionsData);
          console.log('Directions count:', directionsData.length);
          setDirections(directionsData);
        } else {
          console.error('Failed to fetch teacher directions:', directionsResponse.status);
          const errorText = await directionsResponse.text();
          console.error('Directions error response:', errorText);
        }

        // Отримуємо майбутні теми
        console.log('Fetching topics...');
        const topicsResponse = await fetch('/api/teacher/topics', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Topics response status:', topicsResponse.status);

        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          console.log('Full Topics data:', topicsData);
          console.log('Topics count:', topicsData.length);
          setFutureTopics(topicsData);
        } else {
          console.error('Failed to fetch teacher topics:', topicsResponse.status);
          const errorText = await topicsResponse.text();
          console.error('Topics error response:', errorText);
        }

      } catch (error) {
        console.error('Помилка завантаження даних викладача:', error);
        toast.error(t('teacherProfile.alerts.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [t]);

  // Додаємо логування станів
  useEffect(() => {
    console.log('Current works state:', works);
  }, [works]);

  useEffect(() => {
    console.log('Current directions state:', directions);
  }, [directions]);

  useEffect(() => {
    console.log('Current topics state:', futureTopics);
  }, [futureTopics]);

  const handleSaveInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('Saving teacher info...', editedInfo);

      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedInfo.title,
          bio: editedInfo.bio,
          avatarUrl: editedInfo.avatarUrl,
          officeHours: editedInfo.officeHours,
          phone: editedInfo.phone,
          website: editedInfo.website
        }),
      });

      if (response.ok) {
        setTeacherInfo(editedInfo);
        setIsEditingInfo(false);
        toast.success(t('teacherProfile.alerts.infoUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Profile update error:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Помилка оновлення профілю:', error);
      toast.error(t('teacherProfile.alerts.updateError'));
    }
  };

  // Функції для робіт
  const handleAddWork = async () => {
    if (newWork.title && newWork.type && newWork.year) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('Adding new work:', newWork);

        const response = await fetch('/api/teacher/works', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newWork),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Work added successfully:', result.work);
          setWorks([...works, result.work]);
          setNewWork({ title: "", type: "", year: "", description: "" });
          setWorkDialogOpen(false);
          toast.success(t('teacherProfile.alerts.workAdded'));
        } else {
          const errorData = await response.json();
          console.error('Work add error:', errorData);
          throw new Error(errorData.message || 'Failed to add work');
        }
      } catch (error) {
        console.error('Помилка додавання роботи:', error);
        toast.error(t('teacherProfile.alerts.workAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditWork = async () => {
    if (!editingWork) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('Editing work:', editingWork);

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
          fileUrl: editingWork.fileUrl,
          publicationUrl: editingWork.publicationUrl
        }),
      });

      if (response.ok) {
        setWorks(works.map(work => 
          work.id === editingWork.id ? editingWork : work
        ));
        setEditingWork(null);
        toast.success(t('teacherProfile.alerts.workUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Work update error:', errorData);
        throw new Error(errorData.message || 'Failed to update work');
      }
    } catch (error) {
      console.error('Помилка оновлення роботи:', error);
      toast.error(t('teacherProfile.alerts.workUpdateError'));
    }
  };

  // Функції для напрямків
  const handleAddDirection = async () => {
    if (newDirection.area && newDirection.description) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('Adding new direction:', newDirection);

        const response = await fetch('/api/teacher/directions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDirection),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Direction added successfully:', result.direction);
          setDirections([...directions, result.direction]);
          setNewDirection({ area: "", description: "" });
          setDirectionDialogOpen(false);
          toast.success(t('teacherProfile.alerts.directionAdded'));
        } else {
          const errorData = await response.json();
          console.error('Direction add error:', errorData);
          throw new Error(errorData.message || 'Failed to add direction');
        }
      } catch (error) {
        console.error('Помилка додавання напрямку:', error);
        toast.error(t('teacherProfile.alerts.directionAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditDirection = async () => {
    if (!editingDirection) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('Editing direction:', editingDirection);

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
        toast.success(t('teacherProfile.alerts.directionUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Direction update error:', errorData);
        throw new Error(errorData.message || 'Failed to update direction');
      }
    } catch (error) {
      console.error('Помилка оновлення напрямку:', error);
      toast.error(t('teacherProfile.alerts.directionUpdateError'));
    }
  };

  // Функції для тем
  const handleAddTopic = async () => {
    if (newTopic.topic && newTopic.description) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error(t('teacherProfile.alerts.loginRequired'));
          return;
        }

        console.log('Adding new topic:', newTopic);

        const response = await fetch('/api/teacher/topics', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTopic),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Topic added successfully:', result.topic);
          setFutureTopics([...futureTopics, result.topic]);
          setNewTopic({ topic: "", description: "" });
          setTopicDialogOpen(false);
          toast.success(t('teacherProfile.alerts.topicAdded'));
        } else {
          const errorData = await response.json();
          console.error('Topic add error:', errorData);
          throw new Error(errorData.message || 'Failed to add topic');
        }
      } catch (error) {
        console.error('Помилка додавання теми:', error);
        toast.error(t('teacherProfile.alerts.topicAddError'));
      }
    } else {
      toast.error(t('teacherProfile.alerts.fillRequiredFields'));
    }
  };

  const handleEditTopic = async () => {
    if (!editingTopic) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
        return;
      }

      console.log('Editing topic:', editingTopic);

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
        toast.success(t('teacherProfile.alerts.topicUpdated'));
      } else {
        const errorData = await response.json();
        console.error('Topic update error:', errorData);
        throw new Error(errorData.message || 'Failed to update topic');
      }
    } catch (error) {
      console.error('Помилка оновлення теми:', error);
      toast.error(t('teacherProfile.alerts.topicUpdateError'));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('teacherProfile.alerts.loginRequired'));
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

      console.log('Deleting item:', itemToDelete, 'from endpoint:', endpoint);

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
            toast.success(t('teacherProfile.alerts.workDeleted'));
            break;
          case "direction":
            setDirections(directions.filter((d) => d.id !== itemToDelete.id));
            toast.success(t('teacherProfile.alerts.directionDeleted'));
            break;
          case "topic":
            setFutureTopics(futureTopics.filter((t) => t.id !== itemToDelete.id));
            toast.success(t('teacherProfile.alerts.topicDeleted'));
            break;
        }
      } else {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        throw new Error(errorData.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
      toast.error(t('teacherProfile.alerts.deleteError'));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteDialog = (type: string, id: string) => {
    console.log('Opening delete dialog for:', type, id);
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const startEditingWork = (work: Work) => {
    console.log('Starting to edit work:', work);
    setEditingWork({...work});
  };

  const startEditingDirection = (direction: Direction) => {
    console.log('Starting to edit direction:', direction);
    setEditingDirection({...direction});
  };

  const startEditingTopic = (topic: FutureTopic) => {
    console.log('Starting to edit topic:', topic);
    setEditingTopic({...topic});
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
              <p className="text-muted-foreground">{t('teacherProfile.loading')}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Компонент кнопки додавання для робіт
  const AddWorkButton = () => (
    <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addWork')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherProfile.dialogs.addWork.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-title">{t('teacherProfile.fields.workTitle')} *</Label>
            <Input
              id="work-title"
              value={newWork.title}
              onChange={(e) =>
                setNewWork({ ...newWork, title: e.target.value })
              }
              placeholder={t('teacherProfile.placeholders.workTitle')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-type">{t('teacherProfile.fields.workType')} *</Label>
            <Input
              id="work-type"
              placeholder={t('teacherProfile.placeholders.workType')}
              value={newWork.type}
              onChange={(e) =>
                setNewWork({ ...newWork, type: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-year">{t('teacherProfile.fields.year')} *</Label>
            <Input
              id="work-year"
              placeholder={t('teacherProfile.placeholders.year')}
              value={newWork.year}
              onChange={(e) =>
                setNewWork({ ...newWork, year: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-desc">{t('teacherProfile.fields.description')}</Label>
            <Textarea
              id="work-desc"
              placeholder={t('teacherProfile.placeholders.workDescription')}
              value={newWork.description}
              onChange={(e) =>
                setNewWork({ ...newWork, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-file">{t('teacherProfile.fields.fileLink')}</Label>
            <Input
              id="work-file"
              placeholder={t('teacherProfile.placeholders.fileLink')}
              value={newWork.fileUrl || ""}
              onChange={(e) =>
                setNewWork({ ...newWork, fileUrl: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-pub">{t('teacherProfile.fields.publicationLink')}</Label>
            <Input
              id="work-pub"
              placeholder={t('teacherProfile.placeholders.publicationLink')}
              value={newWork.publicationUrl || ""}
              onChange={(e) =>
                setNewWork({ ...newWork, publicationUrl: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleAddWork} className="flex-1">
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Компонент кнопки додавання для напрямків
  const AddDirectionButton = () => (
    <Dialog open={directionDialogOpen} onOpenChange={setDirectionDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addDirection')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherProfile.dialogs.addDirection.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dir-area">{t('teacherProfile.fields.researchArea')} *</Label>
            <Input
              id="dir-area"
              placeholder={t('teacherProfile.placeholders.researchArea')}
              value={newDirection.area}
              onChange={(e) =>
                setNewDirection({ ...newDirection, area: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dir-desc">{t('teacherProfile.fields.description')} *</Label>
            <Textarea
              id="dir-desc"
              placeholder={t('teacherProfile.placeholders.directionDescription')}
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
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleAddDirection} className="flex-1">
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Компонент кнопки додавання для тем
  const AddTopicButton = () => (
    <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('teacherProfile.actions.addTopic')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('teacherProfile.dialogs.addTopic.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-name">{t('teacherProfile.fields.topic')} *</Label>
            <Input
              id="topic-name"
              placeholder={t('teacherProfile.placeholders.topicName')}
              value={newTopic.topic}
              onChange={(e) =>
                setNewTopic({ ...newTopic, topic: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic-desc">{t('teacherProfile.fields.description')} *</Label>
            <Textarea
              id="topic-desc"
              placeholder={t('teacherProfile.placeholders.topicDescription')}
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
                {t('teacherProfile.actions.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleAddTopic} className="flex-1">
              {t('teacherProfile.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
                {/* Debug Information - видимо тільки в режимі розробки */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-yellow-800">Debug Information</h3>
                    <p className="text-sm text-yellow-700">
                      User ID: {userId} | Works: {works.length} | Directions: {directions.length} | Topics: {futureTopics.length}
                    </p>
                  </div>
                )}

                <div className="mb-10">
                  <h1 className="text-4xl font-bold mb-3 text-foreground">
                    {t('teacherProfile.title')}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t('teacherProfile.subtitle')}
                  </p>
                </div>

                {/* Personal Information */}
                <TeacherProfileCard
                  title={t('teacherProfile.sections.personalInfo')}
                  onEdit={() => setIsEditingInfo(true)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.name')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.title')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.title || t('teacherProfile.fields.notSpecified')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.department')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.faculty')}
                      </p>
                      <p className="text-lg font-semibold">{teacherInfo.faculty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.email')}
                      </p>
                      <p className="text-lg font-semibold text-primary">{teacherInfo.email}</p>
                    </div>
                    {teacherInfo.phone && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('teacherProfile.fields.phone')}
                        </p>
                        <p className="text-lg font-semibold">{teacherInfo.phone}</p>
                      </div>
                    )}
                    {teacherInfo.officeHours && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('teacherProfile.fields.officeHours')}
                        </p>
                        <p className="text-base leading-relaxed">{teacherInfo.officeHours}</p>
                      </div>
                    )}
                    {teacherInfo.website && (
                      <div className="space-y-1 md:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t('teacherProfile.fields.website')}
                        </p>
                        <a href={teacherInfo.website} className="text-base text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {teacherInfo.website}
                        </a>
                      </div>
                    )}
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('teacherProfile.fields.bio')}
                      </p>
                      <p className="text-base leading-relaxed">
                        {teacherInfo.bio || t('profile.fields.bioPlaceholder')}
                      </p>
                    </div>
                  </div>
                </TeacherProfileCard>

                {/* Works and Publications */}
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.works')}
                  // Кнопка зверху тільки якщо є роботи
                  actionButton={works.length > 0 ? <AddWorkButton /> : undefined}
                >
                  <div className="space-y-4">
                    {works.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.works.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.works.hint')}
                        </p>
                        {/* Кнопка всередині блоку коли немає робіт */}
                        <AddWorkButton />
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
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{work.description}</p>
                              )}
                              {(work.fileUrl || work.publicationUrl) && (
                                <div className="flex gap-3 mt-2">
                                  {work.fileUrl && (
                                    <a 
                                      href={work.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {t('teacherProfile.links.file')}
                                    </a>
                                  )}
                                  {work.publicationUrl && (
                                    <a 
                                      href={work.publicationUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {t('teacherProfile.links.publication')}
                                    </a>
                                  )}
                                </div>
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
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.researchDirections')}
                  // Кнопка зверху тільки якщо є напрямки
                  actionButton={directions.length > 0 ? <AddDirectionButton /> : undefined}
                >
                  <div className="space-y-4">
                    {directions.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.directions.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.directions.hint')}
                        </p>
                        {/* Кнопка всередині блоку коли немає напрямків */}
                        <AddDirectionButton />
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
                <TeacherProfileCard 
                  title={t('teacherProfile.sections.futureTopics')}
                  // Кнопка зверху тільки якщо є теми
                  actionButton={futureTopics.length > 0 ? <AddTopicButton /> : undefined}
                >
                  <div className="space-y-4">
                    {futureTopics.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {t('teacherProfile.empty.topics.title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('teacherProfile.empty.topics.hint')}
                        </p>
                        {/* Кнопка всередині блоку коли немає тем */}
                        <AddTopicButton />
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('teacherProfile.dialogs.editInfo.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">{t('teacherProfile.fields.name')}</Label>
                          <Input
                            id="edit-name"
                            value={editedInfo.name}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('teacherProfile.dialogs.editInfo.nameHelp')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-title">{t('teacherProfile.fields.title')}</Label>
                          <Input
                            id="edit-title"
                            placeholder={t('teacherProfile.placeholders.title')}
                            value={editedInfo.title}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, title: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dept">{t('teacherProfile.fields.department')}</Label>
                          <Input
                            id="edit-dept"
                            value={editedInfo.department}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-faculty">{t('teacherProfile.fields.faculty')}</Label>
                          <Input
                            id="edit-faculty"
                            value={editedInfo.faculty}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">{t('teacherProfile.fields.email')}</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editedInfo.email}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">{t('teacherProfile.fields.phone')}</Label>
                          <Input
                            id="edit-phone"
                            placeholder={t('teacherProfile.placeholders.phone')}
                            value={editedInfo.phone || ""}
                            onChange={(e) =>
                              setEditedInfo({ ...editedInfo, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-office-hours">{t('teacherProfile.fields.officeHours')}</Label>
                        <Input
                          id="edit-office-hours"
                          placeholder={t('teacherProfile.placeholders.officeHours')}
                          value={editedInfo.officeHours || ""}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, officeHours: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-website">{t('teacherProfile.fields.website')}</Label>
                        <Input
                          id="edit-website"
                          placeholder={t('teacherProfile.placeholders.website')}
                          value={editedInfo.website || ""}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, website: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-bio">{t('teacherProfile.fields.bio')}</Label>
                        <Textarea
                          id="edit-bio"
                          placeholder={t('teacherProfile.placeholders.bio')}
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
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                        </DialogClose>
                        <Button onClick={handleSaveInfo} className="flex-1">
                          {t('teacherProfile.actions.saveChanges')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Edit Work Dialog */}
                <Dialog open={!!editingWork} onOpenChange={() => setEditingWork(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('teacherProfile.dialogs.editWork.title')}</DialogTitle>
                    </DialogHeader>
                    {editingWork && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-title">{t('teacherProfile.fields.workTitle')} *</Label>
                          <Input
                            id="edit-work-title"
                            value={editingWork.title}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, title: e.target.value })
                            }
                            placeholder={t('teacherProfile.placeholders.workTitle')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-type">{t('teacherProfile.fields.workType')} *</Label>
                          <Input
                            id="edit-work-type"
                            placeholder={t('teacherProfile.placeholders.workType')}
                            value={editingWork.type}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, type: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-year">{t('teacherProfile.fields.year')} *</Label>
                          <Input
                            id="edit-work-year"
                            placeholder={t('teacherProfile.placeholders.year')}
                            value={editingWork.year}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, year: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-desc">{t('teacherProfile.fields.description')}</Label>
                          <Textarea
                            id="edit-work-desc"
                            placeholder={t('teacherProfile.placeholders.workDescription')}
                            value={editingWork.description}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, description: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-file">{t('teacherProfile.fields.fileLink')}</Label>
                          <Input
                            id="edit-work-file"
                            placeholder={t('teacherProfile.placeholders.fileLink')}
                            value={editingWork.fileUrl || ""}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, fileUrl: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-work-pub">{t('teacherProfile.fields.publicationLink')}</Label>
                          <Input
                            id="edit-work-pub"
                            placeholder={t('teacherProfile.placeholders.publicationLink')}
                            value={editingWork.publicationUrl || ""}
                            onChange={(e) =>
                              setEditingWork({ ...editingWork, publicationUrl: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setEditingWork(null)}
                          >
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditWork} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
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
                      <DialogTitle>{t('teacherProfile.dialogs.editDirection.title')}</DialogTitle>
                    </DialogHeader>
                    {editingDirection && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-dir-area">{t('teacherProfile.fields.researchArea')} *</Label>
                          <Input
                            id="edit-dir-area"
                            placeholder={t('teacherProfile.placeholders.researchArea')}
                            value={editingDirection.area}
                            onChange={(e) =>
                              setEditingDirection({ ...editingDirection, area: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dir-desc">{t('teacherProfile.fields.description')} *</Label>
                          <Textarea
                            id="edit-dir-desc"
                            placeholder={t('teacherProfile.placeholders.directionDescription')}
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
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditDirection} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
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
                      <DialogTitle>{t('teacherProfile.dialogs.editTopic.title')}</DialogTitle>
                    </DialogHeader>
                    {editingTopic && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-topic-name">{t('teacherProfile.fields.topic')} *</Label>
                          <Input
                            id="edit-topic-name"
                            placeholder={t('teacherProfile.placeholders.topicName')}
                            value={editingTopic.topic}
                            onChange={(e) =>
                              setEditingTopic({ ...editingTopic, topic: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-topic-desc">{t('teacherProfile.fields.description')} *</Label>
                          <Textarea
                            id="edit-topic-desc"
                            placeholder={t('teacherProfile.placeholders.topicDescription')}
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
                            {t('teacherProfile.actions.cancel')}
                          </Button>
                          <Button onClick={handleEditTopic} className="flex-1">
                            {t('teacherProfile.actions.saveChanges')}
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
                      <AlertDialogTitle>{t('teacherProfile.dialogs.delete.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('teacherProfile.dialogs.delete.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-6 rounded-md">
                        {t('teacherProfile.actions.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="h-10 px-6 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('teacherProfile.actions.delete')}
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