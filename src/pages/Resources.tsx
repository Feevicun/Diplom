import {
  FileText,
  BookOpenCheck,
  FileSignature,
  BookMarked,
  FileSearch,
  Library,
  Search,
  Plus,
  Trash2,
  Loader2,
  Bookmark,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  X
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { User } from '../types/types';

interface DbResource {
  id: number;
  title: string;
  description: string;
  link: string;
  category: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  click_count: number;
}

interface StaticResource {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: string;
  link: string;
  isStatic: boolean;
  category: string;
  clickCount: number;
}

interface CombinedResource {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: string;
  link: string;
  category: string;
  isStatic?: boolean;
  isCustom?: boolean;
  dbId?: number;
  createdBy?: number;
  clickCount: number;
  folderId?: string;
}

interface ResourceFolder {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  resources: string[];
  isExpanded: boolean;
}

// Статичні ресурси
const staticResources: StaticResource[] = [
  {
    id: 'templates',
    icon: FileText,
    title: 'Шаблони робіт',
    description: 'Готові шаблони для курсових та дипломних робіт',
    action: 'Переглянути шаблони',
    link: 'http://kiis.khmnu.edu.ua/wp-content/uploads/sites/31/metodychni-vkaziky-kr-ist.pdf',
    isStatic: true,
    category: 'templates',
    clickCount: 0
  },
  {
    id: 'examples',
    icon: BookOpenCheck,
    title: 'Приклади робіт',
    description: 'Зразки готових курсових та дипломних робіт',
    action: 'Переглянути приклади',
    link: 'https://kursovye-raboty.kiev.ua/priklad-zrazok-kursovoyi-roboti/?srsltid=AfmBOooJXsIdXE3DGYzBZCZym3rdjWU-dc9egVDltOBWTTgLJXcPPWJp',
    isStatic: true,
    category: 'examples',
    clickCount: 0
  },
  {
    id: 'guidelines',
    icon: FileSignature,
    title: 'Методичні вказівки',
    description: 'Інструкції з оформлення та написання робіт',
    action: 'Переглянути вказівки',
    link: 'https://electronics.lnu.edu.ua/wp-content/uploads/OK_25_dypl_2023.pdf',
    isStatic: true,
    category: 'guidelines',
    clickCount: 0
  },
  {
    id: 'literature',
    icon: BookMarked,
    title: 'Список літератури',
    description: 'Джерела та бібліографічні матеріали',
    action: 'Переглянути літературу',
    link: 'https://zulu-help.com/yak-znajti-spisok-literaturi-dlya-kursovoyi-roboti/#header-23',
    isStatic: true,
    category: 'literature',
    clickCount: 0
  },
  {
    id: 'scientific-library',
    icon: Library,
    title: 'Наукова бібліотека',
    description: 'Електронні ресурси бібліотеки',
    action: 'Відвідати бібліотеку',
    link: 'http://library.khmnu.edu.ua/',
    isStatic: true,
    category: 'library',
    clickCount: 0
  }
];

const categoryIcons: { [key: string]: any } = {
  templates: FileText,
  examples: BookOpenCheck,
  guidelines: FileSignature,
  literature: BookMarked,
  library: Library,
  other: FileSearch
};

const categoryColors: { [key: string]: string } = {
  templates: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  examples: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  guidelines: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  literature: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  library: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const Resources = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbResources, setDbResources] = useState<DbResource[]>([]);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    link: '',
    category: 'other'
  });
  const [editingResource, setEditingResource] = useState<CombinedResource | null>(null);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: ''
  });
  const [search, setSearch] = useState<string>('');
  const [savedResources, setSavedResources] = useState<string[]>([]);
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setDragItem] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);

  // Отримання користувача
  useEffect(() => {
    const fetchUser = (): void => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Помилка парсингу користувача:', error);
        }
      }
    };
    
    fetchUser();
  }, []);

  // Завантаження ресурсів з бази даних
  useEffect(() => {
    fetchResources();
  }, []);

  // Завантаження збережених ресурсів та папок
  useEffect(() => {
    if (user?.id) {
      const userSavedKey = `savedResources_${user.id}`;
      const userFoldersKey = `resourceFolders_${user.id}`;
      
      const saved = localStorage.getItem(userSavedKey);
      const savedFolders = localStorage.getItem(userFoldersKey);
      
      if (saved) {
        try {
          setSavedResources(JSON.parse(saved));
        } catch (error) {
          console.error('Помилка завантаження збережених ресурсів:', error);
          setSavedResources([]);
        }
      }
      
      if (savedFolders) {
        try {
          setFolders(JSON.parse(savedFolders));
        } catch (error) {
          console.error('Помилка завантаження папок:', error);
          setFolders([]);
        }
      }
    }
  }, [user]);

  // Збереження збережених ресурсів та папок
  useEffect(() => {
    if (user?.id) {
      const userSavedKey = `savedResources_${user.id}`;
      const userFoldersKey = `resourceFolders_${user.id}`;
      
      localStorage.setItem(userSavedKey, JSON.stringify(savedResources));
      localStorage.setItem(userFoldersKey, JSON.stringify(folders));
    }
  }, [savedResources, folders, user]);

  // Комбінуємо ресурси
  const allResources: CombinedResource[] = [
    ...dbResources.map(res => ({
      id: `db-${res.id}`,
      icon: categoryIcons[res.category] || FileSearch,
      title: res.title,
      description: res.description || '',
      action: 'Перейти до ресурсу',
      link: res.link,
      category: res.category || 'other',
      isCustom: true,
      dbId: res.id,
      createdBy: res.created_by,
      clickCount: res.click_count || 0
    })),
    ...staticResources.map(res => ({
      ...res,
      id: res.id,
      category: res.category,
      clickCount: res.clickCount
    }))
  ].map(resource => ({
    ...resource,
    folderId: getResourceFolderId(resource.id)
  }));

  // Отримати ID папки для ресурсу
  function getResourceFolderId(resourceId: string): string | undefined {
    for (const folder of folders) {
      if (folder.resources.includes(resourceId)) {
        return folder.id;
      }
    }
    return undefined;
  }

  // Фільтрація ресурсів
  const filteredResources = allResources
    .filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(search.toLowerCase()));

      const isSaved = savedResources.includes(res.id);

      return matchesSearch && (!showOnlySaved || isSaved);
    })
    .sort((a, b) => b.clickCount - a.clickCount);

  const toggleSaved = (id: string): void => {
    if (!user?.id) return;
    
    setSavedResources(prev =>
      prev.includes(id) ? prev.filter(saved => saved !== id) : [...prev, id]
    );
  };

  const handleResourceClick = async (resource: CombinedResource) => {
    window.open(resource.link, '_blank', 'noopener,noreferrer');
  };

  const fetchResources = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resources');
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setDbResources(data);
        } else {
          console.error('Неочікувана структура даних від API:', data);
          setDbResources([]);
        }
      } else {
        console.error('Помилка завантаження ресурсів. Статус:', response.status);
        setDbResources([]);
      }
    } catch (error) {
      console.error('Мережева помилка при завантаженні ресурсів:', error);
      setDbResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Користувач не авторизований");
        return;
      }

      if (!newResource.title.trim() || !newResource.link.trim()) {
        alert("Будь ласка, заповніть назву та посилання");
        return;
      }

      let formattedLink = newResource.link;
      if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = 'https://' + formattedLink;
      }

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newResource,
          link: formattedLink
        })
      });

      const result = await response.json();

      if (response.ok) {
        setDbResources(prev => [result.resource, ...prev]);
        setIsAddDialogOpen(false);
        setNewResource({
          title: '',
          description: '',
          link: '',
          category: 'other'
        });
      } else {
        console.error('Помилка додавання ресурсу:', result.message);
        alert(`Помилка додавання: ${result.message}`);
      }
    } catch (error) {
      console.error('Помилка додавання ресурсу:', error);
      alert('Мережева помилка при додаванні ресурсу');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResource = async (): Promise<void> => {
    if (!editingResource) return;

    try {
      setIsSubmitting(true);
      
      // Перевіряємо, чи це кастомний ресурс (має dbId)
      if (!editingResource.dbId || editingResource.isStatic) {
        alert("Неможливо редагувати цей ресурс");
        setIsEditDialogOpen(false);
        setEditingResource(null);
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert("Користувач не авторизований");
        setIsEditDialogOpen(false);
        setEditingResource(null);
        setIsSubmitting(false);
        return;
      }

      if (!editingResource.title.trim() || !editingResource.link.trim()) {
        alert("Будь ласка, заповніть назву та посилання");
        setIsSubmitting(false);
        return;
      }

      let formattedLink = editingResource.link;
      if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = 'https://' + formattedLink;
      }

      const response = await fetch(`/api/resources/${editingResource.dbId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingResource.title,
          description: editingResource.description,
          link: formattedLink,
          category: editingResource.category
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Оновлюємо ресурс в стані
        setDbResources(prev => 
          prev.map(resource => 
            resource.id === editingResource.dbId 
              ? result.resource
              : resource
          )
        );
        
        // Закриваємо діалог і очищаємо стан
        setIsEditDialogOpen(false);
        setEditingResource(null);
      } else {
        console.error('Помилка редагування ресурсу:', result.message);
        alert(`Помилка редагування: ${result.message}`);
      }
    } catch (error) {
      console.error('Помилка редагування ресурсу:', error);
      alert('Мережева помилка при редагуванні ресурсу');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (dbId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Користувач не авторизований");
        return;
      }

      const response = await fetch(`/api/resources/${dbId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const resourceId = `db-${dbId}`;
        setDbResources(prev => prev.filter(resource => resource.id !== dbId));
        setSavedResources(prev => prev.filter(id => id !== resourceId));
        // Видаляємо ресурс з усіх папок
        setFolders(prev => 
          prev.map(folder => ({
            ...folder,
            resources: folder.resources.filter(resId => resId !== resourceId)
          }))
        );
      } else {
        const result = await response.json();
        console.error('Помилка видалення ресурсу:', result.message);
        alert(`Помилка видалення: ${result.message}`);
      }
    } catch (error) {
      console.error('Помилка видалення ресурсу:', error);
      alert('Мережева помилка при видаленні ресурсу');
    }
  };

  const handleCreateFolder = (): void => {
    if (!newFolder.name.trim() || !user?.id) return;

    const newFolderObj: ResourceFolder = {
      id: `folder-${Date.now()}`,
      name: newFolder.name,
      description: newFolder.description,
      createdBy: user.id.toString(),
      resources: [],
      isExpanded: true
    };

    setFolders(prev => [...prev, newFolderObj]);
    setIsFolderDialogOpen(false);
    setNewFolder({ name: '', description: '' });
  };

  const handleDeleteFolder = (folderId: string): void => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  const toggleFolder = (folderId: string): void => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  // Drag and Drop функції
  const handleDragStart = (e: React.DragEvent, resourceId: string): void => {
    setDragItem(resourceId);
    e.dataTransfer.setData('text/plain', resourceId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string): void => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = (): void => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string): void => {
    e.preventDefault();
    const resourceId = e.dataTransfer.getData('text/plain');
    
    if (resourceId && folderId) {
      setFolders(prev => 
        prev.map(folder => {
          if (folder.id === folderId) {
            // Додаємо ресурс до цієї папки, якщо його там ще немає
            return {
              ...folder,
              resources: folder.resources.includes(resourceId) 
                ? folder.resources 
                : [...folder.resources, resourceId]
            };
          } else {
            // Видаляємо ресурс з інших папок
            return {
              ...folder,
              resources: folder.resources.filter(id => id !== resourceId)
            };
          }
        })
      );
    }
    
    setDragItem(null);
    setDragOverFolder(null);
  };

  const handleRemoveFromFolder = (resourceId: string, folderId: string): void => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, resources: folder.resources.filter(id => id !== resourceId) }
          : folder
      )
    );
  };

  const resetForms = () => {
    setNewResource({
      title: '',
      description: '',
      link: '',
      category: 'other'
    });
  };

  // Ресурси без папок
  const resourcesWithoutFolders = filteredResources.filter(resource => !resource.folderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Завантаження ресурсів...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-background border-b">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Заголовок та пошук */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-semibold mb-2">{t('resources.title')}</h1>
                <p className="text-muted-foreground">
                  {allResources.length} ресурсів доступно
                  {folders.length > 0 && ` • ${folders.length} папок`}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Пошук */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Пошук ресурсів..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                {/* Кнопка створення папки */}
                {user?.id && (
                  <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <FolderPlus size={16} />
                        Створити папку
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Створити нову папку</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="folder-name">Назва папки *</Label>
                          <Input
                            id="folder-name"
                            value={newFolder.name}
                            onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                            placeholder="Введіть назву папки"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="folder-description">Опис</Label>
                          <Textarea
                            id="folder-description"
                            value={newFolder.description}
                            onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                            placeholder="Опишіть папку..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline"
                          onClick={() => setIsFolderDialogOpen(false)}
                        >
                          Скасувати
                        </Button>
                        <Button 
                          onClick={handleCreateFolder}
                          disabled={!newFolder.name.trim()}
                        >
                          Створити папку
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Кнопка додавання для викладачів */}
                {user?.role === 'teacher' && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus size={16} />
                        Додати ресурс
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Додати новий ресурс</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Назва ресурсу *</Label>
                          <Input
                            id="title"
                            value={newResource.title}
                            onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                            placeholder="Введіть назву ресурсу"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Опис</Label>
                          <Textarea
                            id="description"
                            value={newResource.description}
                            onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                            placeholder="Опишіть ресурс..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link">Посилання *</Label>
                          <Input
                            id="link"
                            value={newResource.link}
                            onChange={(e) => setNewResource({...newResource, link: e.target.value})}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Категорія</Label>
                          <Select
                            value={newResource.category}
                            onValueChange={(value) => setNewResource({...newResource, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть категорію" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="templates">Шаблони</SelectItem>
                              <SelectItem value="examples">Приклади</SelectItem>
                              <SelectItem value="guidelines">Інструкції</SelectItem>
                              <SelectItem value="literature">Література</SelectItem>
                              <SelectItem value="library">Бібліотеки</SelectItem>
                              <SelectItem value="other">Інше</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            resetForms();
                          }}
                        >
                          Скасувати
                        </Button>
                        <Button 
                          onClick={handleAddResource}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Додавання...
                            </>
                          ) : (
                            'Додати ресурс'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Збережені ресурси */}
                <Button
                  variant={showOnlySaved ? "default" : "outline"}
                  onClick={() => setShowOnlySaved(prev => !prev)}
                  className="gap-2"
                  disabled={!user?.id}
                >
                  <Bookmark size={16} className={showOnlySaved ? "fill-white" : ""} />
                  {showOnlySaved ? 'Всі ресурси' : 'Збережені'}
                </Button>
              </div>
            </div>

            {/* Папки з ресурсами */}
            {folders.map(folder => {
              const folderResources = filteredResources.filter(resource => 
                folder.resources.includes(resource.id)
              );

              return (
                <div key={folder.id} className="mb-6">
                  <div 
                    className={`flex items-center gap-3 p-4 rounded-lg border mb-3 cursor-pointer transition-colors ${
                      dragOverFolder === folder.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-muted/50 hover:bg-muted/80'
                    }`}
                    onClick={() => toggleFolder(folder.id)}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                  >
                    {folder.isExpanded ? (
                      <FolderOpen className="h-5 w-5 text-primary" />
                    ) : (
                      <Folder className="h-5 w-5 text-primary" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-sm text-muted-foreground">{folder.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="px-2 py-1">
                        {folderResources.length} ресурсів
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>

                  {folder.isExpanded && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ml-4">
                      {folderResources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          user={user}
                          isSaved={savedResources.includes(resource.id)}
                          onToggleSaved={toggleSaved}
                          onEdit={(res) => {
                            setEditingResource(res);
                            setIsEditDialogOpen(true);
                          }}
                          onDelete={handleDeleteResource}
                          onResourceClick={handleResourceClick}
                          onDragStart={handleDragStart}
                          onRemoveFromFolder={() => handleRemoveFromFolder(resource.id, folder.id)}
                          showRemoveFromFolder={true}
                        />
                      ))}
                      {folderResources.length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                          <p>Перетягніть ресурси сюди</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ресурси без папок */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resourcesWithoutFolders.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  user={user}
                  isSaved={savedResources.includes(resource.id)}
                  onToggleSaved={toggleSaved}
                  onEdit={(res) => {
                    setEditingResource(res);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={handleDeleteResource}
                  onResourceClick={handleResourceClick}
                  onDragStart={handleDragStart}
                  onRemoveFromFolder={() => {}}
                  showRemoveFromFolder={false}
                />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileSearch size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {showOnlySaved ? 'Немає збережених ресурсів' : 'Ресурси не знайдено'}
                </p>
                <p className="text-sm">
                  {showOnlySaved 
                    ? 'Зберігайте ресурси, натискаючи на іконку закладки' 
                    : 'Спробуйте змінити пошуковий запит'
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Діалог редагування ресурсу */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingResource(null);
          setIsSubmitting(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редагувати ресурс</DialogTitle>
          </DialogHeader>
          {editingResource && !editingResource.isStatic && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Назва ресурсу *</Label>
                <Input
                  id="edit-title"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                  placeholder="Введіть назву ресурсу"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Опис</Label>
                <Textarea
                  id="edit-description"
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({...editingResource, description: e.target.value})}
                  placeholder="Опишіть ресурс..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-link">Посилання *</Label>
                <Input
                  id="edit-link"
                  value={editingResource.link}
                  onChange={(e) => setEditingResource({...editingResource, link: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Категорія</Label>
                <Select
                  value={editingResource.category}
                  onValueChange={(value) => setEditingResource({...editingResource, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="templates">Шаблони</SelectItem>
                    <SelectItem value="examples">Приклади</SelectItem>
                    <SelectItem value="guidelines">Інструкції</SelectItem>
                    <SelectItem value="literature">Література</SelectItem>
                    <SelectItem value="library">Бібліотеки</SelectItem>
                    <SelectItem value="other">Інше</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {editingResource?.isStatic && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Цей ресурс є системним і не може бути відредагований.
              </p>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                Зрозуміло
              </Button>
            </div>
          )}
          {editingResource && !editingResource.isStatic && (
            <DialogFooter>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingResource(null);
                  setIsSubmitting(false);
                }}
                disabled={isSubmitting}
              >
                Скасувати
              </Button>
              <Button 
                onClick={handleEditResource}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Збереження...
                  </>
                ) : (
                  'Зберегти зміни'
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Окремий компонент для картки ресурсу
interface ResourceCardProps {
  resource: CombinedResource;
  user: User | null;
  isSaved: boolean;
  onToggleSaved: (id: string) => void;
  onEdit: (resource: CombinedResource) => void;
  onDelete: (dbId: number) => void;
  onResourceClick: (resource: CombinedResource) => void;
  onDragStart: (e: React.DragEvent, resourceId: string) => void;
  onRemoveFromFolder: () => void;
  showRemoveFromFolder: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  user,
  isSaved,
  onToggleSaved,
  onEdit,
  onDelete,
  onResourceClick,
  onDragStart,
  onRemoveFromFolder,
  showRemoveFromFolder
}) => {
  const { id, icon: Icon, title, description, category, isCustom, dbId, createdBy } = resource;

  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200 rounded-lg p-4 flex flex-col h-full relative group"
      draggable={true}
      onDragStart={(e) => onDragStart(e, id)}
    >
      {/* Верхня панель з кнопками */}
      <div className="flex justify-between items-start mb-3">
        <Badge 
          variant="secondary" 
          className={categoryColors[category]}
        >
          {category === 'templates' && 'Шаблони'}
          {category === 'examples' && 'Приклади'}
          {category === 'guidelines' && 'Інструкції'}
          {category === 'literature' && 'Література'}
          {category === 'library' && 'Бібліотека'}
          {category === 'other' && 'Інше'}
        </Badge>

        <div className="flex gap-1">
          {/* Кнопка збереження */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSaved(id);
            }}
            className={`p-1.5 rounded transition-colors ${
              !user?.id 
                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                : isSaved 
                  ? 'text-primary hover:bg-primary/10' 
                  : 'text-gray-400 hover:text-primary hover:bg-accent'
            }`}
            disabled={!user?.id}
          >
            <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* Кнопка перетягування */}
          <button
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-accent cursor-grab active:cursor-grabbing"
            draggable={true}
            onDragStart={(e) => onDragStart(e, id)}
          >
            <GripVertical size={18} />
          </button>

          {/* Меню для редагування/видалення */}
          {(isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy) || showRemoveFromFolder ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy && (
                  <DropdownMenuItem 
                    onClick={() => onEdit(resource)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редагувати
                  </DropdownMenuItem>
                )}
                {showRemoveFromFolder && (
                  <DropdownMenuItem 
                    onClick={onRemoveFromFolder}
                    className="cursor-pointer"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Видалити з папки
                  </DropdownMenuItem>
                )}
                {isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy && (
                  <DropdownMenuItem 
                    onClick={() => {
                      if (dbId && window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
                        onDelete(dbId);
                      }
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {/* Контент ресурсу */}
      <CardHeader className="p-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Icon className="text-primary" size={20} />
          </div>
          <CardTitle className="text-base font-medium line-clamp-2 flex-1">{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1">
        <CardDescription className="text-sm line-clamp-3 mb-4">
          {description}
        </CardDescription>
      </CardContent>

      <div className="p-0 mt-auto">
        <Button
          onClick={() => onResourceClick(resource)}
          variant="outline"
          className="w-full gap-2"
        >
          Перейти до ресурсу
          <ExternalLink size={14} />
        </Button>
      </div>
    </Card>
  );
};

export default Resources;