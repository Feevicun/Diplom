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
  Edit,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  colorScheme?: string;
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

// Кольорові схеми для папок, що використовують CSS змінні теми
const folderColorSchemes = [
  {
    name: 'primary',
    light: 'bg-primary/10 border-primary/20 text-foreground',
    dark: 'bg-primary/20 border-primary/30 text-primary-foreground'
  },
  {
    name: 'secondary',
    light: 'bg-secondary/10 border-secondary/20 text-foreground',
    dark: 'bg-secondary/20 border-secondary/30 text-secondary-foreground'
  },
  {
    name: 'accent',
    light: 'bg-accent/10 border-accent/20 text-foreground',
    dark: 'bg-accent/20 border-accent/30 text-accent-foreground'
  },
  {
    name: 'muted',
    light: 'bg-muted/50 border-muted/200 text-foreground',
    dark: 'bg-muted/80 border-muted/400 text-muted-foreground'
  },
  {
    name: 'blue',
    light: 'bg-blue-50 border-blue-200 text-gray-900',
    dark: 'bg-blue-950/40 border-blue-800 text-blue-100'
  },
  {
    name: 'green',
    light: 'bg-green-50 border-green-200 text-gray-900',
    dark: 'bg-green-950/40 border-green-800 text-green-100'
  },
  {
    name: 'purple',
    light: 'bg-purple-50 border-purple-200 text-gray-900',
    dark: 'bg-purple-950/40 border-purple-800 text-purple-100'
  },
  {
    name: 'amber',
    light: 'bg-amber-50 border-amber-200 text-gray-900',
    dark: 'bg-amber-950/40 border-amber-800 text-amber-100'
  }
];

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
          const loadedFolders = JSON.parse(savedFolders);
          // Додаємо кольорові схеми до існуючих папок, якщо їх немає
          const foldersWithColors = loadedFolders.map((folder: ResourceFolder, index: number) => ({
            ...folder,
            colorScheme: folder.colorScheme || folderColorSchemes[index % folderColorSchemes.length].name
          }));
          setFolders(foldersWithColors);
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
        alert(t('resources.alerts.unauthorized'));
        return;
      }

      if (!newResource.title.trim() || !newResource.link.trim()) {
        alert(t('resources.alerts.fillRequiredFields'));
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
        alert(`${t('resources.alerts.addError')}: ${result.message}`);
      }
    } catch (error) {
      console.error('Помилка додавання ресурсу:', error);
      alert(t('resources.alerts.networkError'));
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
        alert(t('resources.alerts.cannotEdit'));
        setIsEditDialogOpen(false);
        setEditingResource(null);
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert(t('resources.alerts.unauthorized'));
        setIsEditDialogOpen(false);
        setEditingResource(null);
        setIsSubmitting(false);
        return;
      }

      if (!editingResource.title.trim() || !editingResource.link.trim()) {
        alert(t('resources.alerts.fillRequiredFields'));
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
        alert(`${t('resources.alerts.editError')}: ${result.message}`);
      }
    } catch (error) {
      console.error('Помилка редагування ресурсу:', error);
      alert(t('resources.alerts.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (dbId: number): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(t('resources.alerts.unauthorized'));
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
        alert(`${t('resources.alerts.deleteError')}: ${result.message}`);
      }
    } catch (error) {
      console.error('Помилка видалення ресурсу:', error);
      alert(t('resources.alerts.networkError'));
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
      isExpanded: false,
      colorScheme: folderColorSchemes[folders.length % folderColorSchemes.length].name
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

  // Отримати класи для папки на основі кольорової схеми
  const getFolderClasses = (colorScheme: string) => {
    const scheme = folderColorSchemes.find(s => s.name === colorScheme) || folderColorSchemes[0];
    return `${scheme.light} dark:${scheme.dark}`;
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
              <p className="text-muted-foreground">{t('resources.loading')}</p>
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
          <div className="max-w-7xl mx-auto">
            {/* ОНОВЛЕНО: Заголовок з іконкою та описом як у інших сторінках */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Library className="text-primary w-7 h-7" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('resources.title')}</h1>
                  <p className="text-muted-foreground text-sm">
                    {t('resources.subtitle')}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t('resources.stats.available', { count: allResources.length })}
                    {folders.length > 0 && ` • ${t('resources.stats.folders', { count: folders.length })}`}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Пошук */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('resources.searchPlaceholder')}
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
                        {t('resources.actions.createFolder')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{t('resources.dialogs.createFolder.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="folder-name">{t('resources.dialogs.createFolder.name')} *</Label>
                          <Input
                            id="folder-name"
                            value={newFolder.name}
                            onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                            placeholder={t('resources.dialogs.createFolder.namePlaceholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="folder-description">{t('resources.dialogs.createFolder.description')}</Label>
                          <Textarea
                            id="folder-description"
                            value={newFolder.description}
                            onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                            placeholder={t('resources.dialogs.createFolder.descriptionPlaceholder')}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline"
                          onClick={() => setIsFolderDialogOpen(false)}
                        >
                          {t('resources.dialogs.cancel')}
                        </Button>
                        <Button 
                          onClick={handleCreateFolder}
                          disabled={!newFolder.name.trim()}
                        >
                          {t('resources.dialogs.createFolder.createButton')}
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
                        {t('resources.actions.addResource')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{t('resources.dialogs.addResource.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">{t('resources.dialogs.addResource.name')} *</Label>
                          <Input
                            id="title"
                            value={newResource.title}
                            onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                            placeholder={t('resources.dialogs.addResource.namePlaceholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">{t('resources.dialogs.addResource.description')}</Label>
                          <Textarea
                            id="description"
                            value={newResource.description}
                            onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                            placeholder={t('resources.dialogs.addResource.descriptionPlaceholder')}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link">{t('resources.dialogs.addResource.link')} *</Label>
                          <Input
                            id="link"
                            value={newResource.link}
                            onChange={(e) => setNewResource({...newResource, link: e.target.value})}
                            placeholder={t('resources.dialogs.addResource.linkPlaceholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">{t('resources.dialogs.addResource.category')}</Label>
                          <Select
                            value={newResource.category}
                            onValueChange={(value) => setNewResource({...newResource, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('resources.dialogs.addResource.categoryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="templates">{t('resources.categories.templates')}</SelectItem>
                              <SelectItem value="examples">{t('resources.categories.examples')}</SelectItem>
                              <SelectItem value="guidelines">{t('resources.categories.guidelines')}</SelectItem>
                              <SelectItem value="literature">{t('resources.categories.literature')}</SelectItem>
                              <SelectItem value="library">{t('resources.categories.library')}</SelectItem>
                              <SelectItem value="other">{t('resources.categories.other')}</SelectItem>
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
                          {t('resources.dialogs.cancel')}
                        </Button>
                        <Button 
                          onClick={handleAddResource}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              {t('resources.dialogs.addResource.adding')}
                            </>
                          ) : (
                            t('resources.dialogs.addResource.addButton')
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
                  {showOnlySaved ? t('resources.actions.showAll') : t('resources.actions.showSaved')}
                </Button>
              </div>
            </div>

            {/* Папки з ресурсами - з правильними кольорами для світлих тем */}
            {folders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    {t('resources.sections.myFolders')}
                  </h2>
                  <Badge variant="outline" className="text-sm">
                    {t('resources.stats.foldersCount', { count: folders.length })}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {folders.map((folder) => {
                    const folderResources = filteredResources.filter(resource => 
                      folder.resources.includes(resource.id)
                    );

                    return (
                      <div key={folder.id} className="relative">
                        {/* Компактна картка папки з правильними кольорами */}
                        <div 
                          className={`group relative border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                            dragOverFolder === folder.id 
                              ? 'ring-4 ring-primary/30 scale-[1.02] shadow-lg' 
                              : 'hover:scale-[1.01] hover:shadow-md'
                          } ${getFolderClasses(folder.colorScheme || folderColorSchemes[0].name)} ${
                            folder.isExpanded ? 'rounded-b-none border-b-0' : ''
                          }`}
                          onClick={() => toggleFolder(folder.id)}
                          onDragOver={(e) => handleDragOver(e, folder.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, folder.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-white/80 dark:bg-black/40 rounded-lg border border-current/30 flex-shrink-0">
                                {folder.isExpanded ? (
                                  <FolderOpen className="h-4 w-4 text-current" />
                                ) : (
                                  <Folder className="h-4 w-4 text-current" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-base truncate text-gray-900 dark:text-white">
                                  {folder.name}
                                </h3>
                                {folder.description && (
                                  <p className="text-sm opacity-80 truncate mt-0.5 text-gray-700 dark:text-gray-300">
                                    {folder.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <Badge variant="secondary" className="text-xs bg-white/90 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600">
                                {folderResources.length}
                              </Badge>
                              <div className="flex items-center gap-1 opacity-70 text-gray-700 dark:text-gray-300">
                                {folder.isExpanded ? (
                                  <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 transition-transform duration-300" />
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-white/50 dark:hover:bg-black/30 transition-all text-gray-700 dark:text-gray-300"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFolder(folder.id);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 size={14} className="mr-2" />
                                    {t('resources.actions.deleteFolder')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {/* Індикатор перетягування - тепер видимий на світлих темах */}
                          <div className="absolute inset-0 border-2 border-dashed border-gray-400 dark:border-current/30 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Вміст папки (розгорнутий) */}
                        {folder.isExpanded && folderResources.length > 0 && (
                          <div className="bg-muted/30 border-2 border-t-0 rounded-b-xl p-4 transition-all duration-300">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                            </div>
                          </div>
                        )}

                        {/* Порожня папка */}
                        {folder.isExpanded && folderResources.length === 0 && (
                          <div className="bg-muted/30 border-2 border-t-0 rounded-b-xl p-6 text-center text-muted-foreground transition-all duration-300">
                            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{t('resources.empty.folder')}</p>
                            <p className="text-xs mt-1">{t('resources.empty.folderHint')}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ресурси без папок - на весь екран */}
            {resourcesWithoutFolders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-primary" />
                    {t('resources.sections.allResources')}
                  </h2>
                  <Badge variant="outline" className="text-sm">
                    {t('resources.stats.resourcesCount', { count: resourcesWithoutFolders.length })}
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              </div>
            )}

            {filteredResources.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileSearch size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {showOnlySaved ? t('resources.empty.saved') : t('resources.empty.noResults')}
                </p>
                <p className="text-sm">
                  {showOnlySaved 
                    ? t('resources.empty.savedHint')
                    : t('resources.empty.noResultsHint')
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
            <DialogTitle>{t('resources.dialogs.editResource.title')}</DialogTitle>
          </DialogHeader>
          {editingResource && !editingResource.isStatic && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">{t('resources.dialogs.editResource.name')} *</Label>
                <Input
                  id="edit-title"
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                  placeholder={t('resources.dialogs.editResource.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">{t('resources.dialogs.editResource.description')}</Label>
                <Textarea
                  id="edit-description"
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({...editingResource, description: e.target.value})}
                  placeholder={t('resources.dialogs.editResource.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-link">{t('resources.dialogs.editResource.link')} *</Label>
                <Input
                  id="edit-link"
                  value={editingResource.link}
                  onChange={(e) => setEditingResource({...editingResource, link: e.target.value})}
                  placeholder={t('resources.dialogs.editResource.linkPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">{t('resources.dialogs.editResource.category')}</Label>
                <Select
                  value={editingResource.category}
                  onValueChange={(value) => setEditingResource({...editingResource, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('resources.dialogs.editResource.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="templates">{t('resources.categories.templates')}</SelectItem>
                    <SelectItem value="examples">{t('resources.categories.examples')}</SelectItem>
                    <SelectItem value="guidelines">{t('resources.categories.guidelines')}</SelectItem>
                    <SelectItem value="literature">{t('resources.categories.literature')}</SelectItem>
                    <SelectItem value="library">{t('resources.categories.library')}</SelectItem>
                    <SelectItem value="other">{t('resources.categories.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {editingResource?.isStatic && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                {t('resources.alerts.cannotEditSystem')}
              </p>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                {t('resources.dialogs.understand')}
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
                {t('resources.dialogs.cancel')}
              </Button>
              <Button 
                onClick={handleEditResource}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('resources.dialogs.editResource.saving')}
                  </>
                ) : (
                  t('resources.dialogs.editResource.saveButton')
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
  const { t } = useTranslation();
  const { id, icon: Icon, title, description, category, isCustom, dbId, createdBy } = resource;

  const getCategoryLabel = (cat: string) => {
    const categories = {
      templates: t('resources.categories.templates'),
      examples: t('resources.categories.examples'),
      guidelines: t('resources.categories.guidelines'),
      literature: t('resources.categories.literature'),
      library: t('resources.categories.library'),
      other: t('resources.categories.other')
    };
    return categories[cat as keyof typeof categories] || cat;
  };

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 rounded-lg p-4 flex flex-col h-full relative group border-2 border-border hover:border-primary/40 min-h-[180px]"
      draggable={true}
      onDragStart={(e) => onDragStart(e, id)}
    >
      {/* Верхня панель з кнопками */}
      <div className="flex justify-between items-start mb-3">
        <Badge 
          variant="secondary" 
          className={`text-xs ${categoryColors[category]}`}
        >
          {getCategoryLabel(category)}
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
            title={isSaved ? t('resources.actions.removeSaved') : t('resources.actions.save')}
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* Кнопка перетягування */}
          <button
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-accent cursor-grab active:cursor-grabbing"
            draggable={true}
            onDragStart={(e) => onDragStart(e, id)}
            title={t('resources.actions.dragToFolder')}
          >
            <GripVertical size={16} />
          </button>

          {/* Кнопка редагування для викладачів */}
          {isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
              title={t('resources.actions.edit')}
            >
              <Edit size={16} />
            </button>
          )}

          {/* Кнопка видалення з папки */}
          {showRemoveFromFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromFolder();
              }}
              className="p-1.5 rounded text-orange-600 hover:text-orange-800 hover:bg-orange-100 transition-colors"
              title={t('resources.actions.removeFromFolder')}
            >
              <Folder size={16} />
            </button>
          )}

          {/* Кнопка видалення для викладачів */}
          {isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (dbId && window.confirm(t('resources.alerts.confirmDelete'))) {
                  onDelete(dbId);
                }
              }}
              className="p-1.5 rounded text-red-600 hover:text-red-800 hover:bg-red-100 transition-colors"
              title={t('resources.actions.delete')}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Контент ресурсу */}
      <CardHeader className="p-0 mb-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0 mt-1">
            <Icon className="text-primary" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2 leading-tight mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-3 leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="p-0 mt-auto">
        <Button
          onClick={() => onResourceClick(resource)}
          variant="outline"
          className="w-full gap-2 text-xs h-8 hover:bg-primary hover:text-primary-foreground"
        >
          {t('resources.actions.goToResource')}
          <ExternalLink size={12} />
        </Button>
      </div>
    </Card>
  );
};

export default Resources;