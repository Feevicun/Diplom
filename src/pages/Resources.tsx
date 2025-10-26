import {
  FileText,
  BookOpenCheck,
  FileSignature,
  BookMarked,
  FileSearch,
  ShieldCheck,
  FileCheck,
  Scale,
  Library,
  Globe,
  Search,
  BookOpen,
  PenTool,
  Quote,
  Target,
  ShieldAlert,
  CheckCircle,
  Code,
  BarChart,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  Play,
  Plus,
  Trash2,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Link as LinkIcon,
  Folder,
  ExternalLink
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
  DialogClose,
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
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from '../types/types'; 

// Додайте ці типи
interface DbResource {
  id: number;
  title: string;
  description: string;
  link: string;
  category: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface StaticResource {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: string;
  link: string;
  isStatic: boolean;
}

interface CombinedResource {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: string;
  link: string;
  isStatic?: boolean;
  isCustom?: boolean;
  dbId?: number;
  createdBy?: number;
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
    isStatic: true
  },
  {
    id: 'examples',
    icon: BookOpenCheck,
    title: 'Приклади робіт',
    description: 'Зразки готових курсових та дипломних робіт',
    action: 'Переглянути приклади',
    link: 'https://kursovye-raboty.kiev.ua/priklad-zrazok-kursovoyi-roboti/?srsltid=AfmBOooJXsIdXE3DGYzBZCZym3rdjWU-dc9egVDltOBWTTgLJXcPPWJp',
    isStatic: true
  },
  {
    id: 'guidelines',
    icon: FileSignature,
    title: 'Методичні вказівки',
    description: 'Інструкції з оформлення та написання робіт',
    action: 'Переглянути вказівки',
    link: 'https://electronics.lnu.edu.ua/wp-content/uploads/OK_25_dypl_2023.pdf',
    isStatic: true
  },
  {
    id: 'literature',
    icon: BookMarked,
    title: 'Список літератури',
    description: 'Джерела та бібліографічні матеріали',
    action: 'Переглянути літературу',
    link: 'https://zulu-help.com/yak-znajti-spisok-literaturi-dlya-kursovoyi-roboti/#header-23',
    isStatic: true
  },
  {
    id: 'faq',
    icon: FileSearch,
    title: 'Часті запитання',
    description: 'Відповіді на поширені питання',
    action: 'Переглянути FAQ',
    link: 'https://www.youtube.com/watch?v=0OC5rmSBJLk',
    isStatic: true
  },
  {
    id: 'defense',
    icon: ShieldCheck,
    title: 'Захист робіт',
    description: 'Поради щодо успішного захисту',
    action: 'Дізнатися більше',
    link: 'https://www.youtube.com/watch?v=HA8bWBnXXv0',
    isStatic: true
  },
  {
    id: 'state-standards',
    icon: FileCheck,
    title: 'Держстандарти',
    description: 'Державні стандарти оформлення',
    action: 'Переглянути стандарти',
    link: 'https://nus.org.ua/articles/derzhavni-standarty-ukrayiny/',
    isStatic: true
  },
  {
    id: 'mon-regulations',
    icon: Scale,
    title: 'Вимоги МОН',
    description: 'Нормативні документи Міністерства освіти',
    action: 'Переглянути вимоги',
    link: 'https://mon.gov.ua/ua/osvita/visha-osvita/licenzuvannya-ta-akreditaciya',
    isStatic: true
  },
  {
    id: 'scientific-library',
    icon: Library,
    title: 'Наукова бібліотека',
    description: 'Електронні ресурси бібліотеки',
    action: 'Відвідати бібліотеку',
    link: 'http://library.khmnu.edu.ua/',
    isStatic: true
  },
  {
    id: 'nbuv',
    icon: Globe,
    title: 'НБУВ',
    description: 'Національна бібліотека України',
    action: 'Перейти до НБУВ',
    link: 'http://www.nbuv.gov.ua/',
    isStatic: true
  },
  {
    id: 'google-scholar',
    icon: Search,
    title: 'Google Scholar',
    description: 'Академічний пошук від Google',
    action: 'Перейти до Scholar',
    link: 'https://scholar.google.com.ua/',
    isStatic: true
  },
  {
    id: 'cyberleninka',
    icon: BookOpen,
    title: 'CyberLeninka',
    description: 'Відкрита наукова бібліотека',
    action: 'Відвідати бібліотеку',
    link: 'https://cyberleninka.ru/',
    isStatic: true
  },
  {
    id: 'writing-guide',
    icon: PenTool,
    title: 'Посібник з написання',
    description: 'Методичні рекомендації',
    action: 'Переглянути посібник',
    link: 'https://vseosvita.ua/library/metodicni-rekomendacii-sodo-napisanna-kursovoi-roboti-151578.html',
    isStatic: true
  },
  {
    id: 'citation-styles',
    icon: Quote,
    title: 'Стилі цитування',
    description: 'Правила оформлення цитат',
    action: 'Дізнатися більше',
    link: 'https://guides.library.oregonstate.edu/c.php?g=286121&p=1906617',
    isStatic: true
  },
  {
    id: 'research-methods',
    icon: Target,
    title: 'Методи дослідження',
    description: 'Наукові методи та підходи',
    action: 'Вивчити методи',
    link: 'https://pidruchniki.com/1584072065557/psihologiya/metodi_doslidzhennya',
    isStatic: true
  },
  {
    id: 'antiplagiat',
    icon: ShieldAlert,
    title: 'Антиплагіат',
    description: 'Перевірка унікальності текстів',
    action: 'Перевірити роботу',
    link: 'https://www.antiplagiat.ru/',
    isStatic: true
  },
  {
    id: 'grammar-check',
    icon: CheckCircle,
    title: 'Перевірка граматики',
    description: 'Інструменти перевірки тексту',
    action: 'Перевірити текст',
    link: 'https://languagetool.org/uk',
    isStatic: true
  },
  {
    id: 'latex-templates',
    icon: Code,
    title: 'LaTeX шаблони',
    description: 'Шаблони для наукових робіт',
    action: 'Переглянути шаблони',
    link: 'https://www.overleaf.com/latex/templates',
    isStatic: true
  },
  {
    id: 'mendeley',
    icon: BookmarkCheck,
    title: 'Mendeley',
    description: 'Менеджер наукових цитат',
    action: 'Перейти до Mendeley',
    link: 'https://www.mendeley.com/',
    isStatic: true
  },
  {
    id: 'ukrstat',
    icon: BarChart,
    title: 'Держстат України',
    description: 'Статистичні дані України',
    action: 'Перейти до статистики',
    link: 'http://www.ukrstat.gov.ua/',
    isStatic: true
  },
  {
    id: 'world-bank',
    icon: TrendingUp,
    title: 'Світовий банк',
    description: 'Міжнародна статистика',
    action: 'Перейти до даних',
    link: 'https://data.worldbank.org/',
    isStatic: true
  },
  {
    id: 'internship-guide',
    icon: Users,
    title: 'Стажування',
    description: 'Поради щодо стажування',
    action: 'Дізнатися більше',
    link: 'https://www.osvita.ua/vnz/guide/search/practice/',
    isStatic: true
  },
  {
    id: 'job-portals',
    icon: Briefcase,
    title: 'Портали працевлаштування',
    description: 'Пошук роботи для студентів',
    action: 'Знайти роботу',
    link: 'https://www.work.ua/',
    isStatic: true
  },
  {
    id: 'coursera-ukraine',
    icon: GraduationCap,
    title: 'Coursera',
    description: 'Онлайн-курси для студентів',
    action: 'Перейти до курсів',
    link: 'https://www.coursera.org/ukraine',
    isStatic: true
  },
  {
    id: 'ted-talks',
    icon: Play,
    title: 'TED Talks',
    description: 'Навчальні відео-лекції',
    action: 'Дивитися лекції',
    link: 'https://www.ted.com/talks?language=uk',
    isStatic: true
  }
];

const Resources = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbResources, setDbResources] = useState<DbResource[]>([]);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    link: '',
    category: 'other'
  });

  const [search, setSearch] = useState<string>('');
  const [savedResources, setSavedResources] = useState<string[]>([]);
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Отримання користувача при завантаженні компонента
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
    const fetchResources = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/resources');
        if (response.ok) {
          const data = await response.json();
          setDbResources(data);
        } else {
          console.error('Помилка завантаження ресурсів з бази даних');
        }
      } catch (error) {
        console.error('Мережева помилка при завантаженні ресурсів:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Завантаження збережених ресурсів після отримання користувача
  useEffect(() => {
    if (user?.id) {
      const userSavedKey = `savedResources_${user.id}`;
      const saved = localStorage.getItem(userSavedKey);
      if (saved) {
        try {
          setSavedResources(JSON.parse(saved));
        } catch (error) {
          console.error('Помилка завантаження збережених ресурсів:', error);
          setSavedResources([]);
        }
      }
    }
  }, [user]);

  // Збереження збережених ресурсів при зміні
  useEffect(() => {
    if (user?.id) {
      const userSavedKey = `savedResources_${user.id}`;
      localStorage.setItem(userSavedKey, JSON.stringify(savedResources));
    }
  }, [savedResources, user]);

  // Функція для отримання іконки за категорією
  const getIconByCategory = (category: string) => {
    const iconMap: { [key: string]: any } = {
      templates: FileText,
      examples: BookOpenCheck,
      guidelines: FileSignature,
      literature: BookMarked,
      faq: FileSearch,
      defense: ShieldCheck,
      standards: FileCheck,
      regulations: Scale,
      library: Library,
      database: Globe,
      search: Search,
      writing: PenTool,
      citation: Quote,
      research: Target,
      plagiarism: ShieldAlert,
      grammar: CheckCircle,
      latex: Code,
      reference: BookmarkCheck,
      statistics: BarChart,
      internship: Users,
      job: Briefcase,
      courses: GraduationCap,
      videos: Play,
      other: FileSearch
    };
    return iconMap[category] || FileSearch;
  };

  // Комбінуємо статичні ресурси з тими, що з бази даних
  const allResources: CombinedResource[] = [
    ...dbResources.map(res => ({
      id: `db-${res.id}`,
      icon: getIconByCategory(res.category || 'other'),
      title: res.title,
      description: res.description || '',
      action: 'Перейти до ресурсу',
      link: res.link,
      isCustom: true,
      dbId: res.id,
      createdBy: res.created_by
    })),
    ...staticResources
  ];

  const toggleSaved = (id: string): void => {
    if (!user?.id) {
      console.warn('Користувач не авторизований');
      return;
    }
    
    setSavedResources(prev =>
      prev.includes(id) ? prev.filter(saved => saved !== id) : [...prev, id]
    );
  };

  const handleAddResource = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Потрібна авторизація');
        return;
      }

      // Валідація
      if (!newResource.title.trim() || !newResource.link.trim()) {
        alert('Назва та посилання обов\'язкові для заповнення');
        return;
      }

      // Додаємо https:// якщо немає
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

      if (!response.ok) {
        const data = await response.json();
        alert(`Помилка: ${data.message}`);
        return;
      }

      const result = await response.json();
      
      // Додаємо новий ресурс до списку
      setDbResources(prev => [result.resource, ...prev]);
      
      alert('Ресурс успішно додано!');
      setIsAddDialogOpen(false);
      setNewResource({
        title: '',
        description: '',
        link: '',
        category: 'other'
      });
    } catch (error) {
      console.error('Помилка додавання ресурсу:', error);
      alert('Помилка мережі. Спробуйте пізніше.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (dbId: number): Promise<void> => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${dbId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Видаляємо ресурс зі списку
        setDbResources(prev => prev.filter(res => res.id !== dbId));
        // Видаляємо зі збережених, якщо він там був
        setSavedResources(prev => prev.filter(id => id !== `db-${dbId}`));
        alert('Ресурс видалено успішно');
      } else {
        const data = await response.json();
        alert(`Помилка: ${data.message}`);
      }
    } catch (error) {
      console.error('Помилка видалення ресурсу:', error);
      alert('Помилка мережі');
    }
  };

  const filteredResources = allResources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      (res.description && res.description.toLowerCase().includes(search.toLowerCase()));

    const isSaved = savedResources.includes(res.id);

    return matchesSearch && (!showOnlySaved || isSaved);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">{t('resources.title')}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('resources.searchPlaceholder')}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Кнопка додавання ресурсу для викладачів */}
            {user?.role === 'teacher' && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="sm:ml-auto gap-2">
                    <Plus size={16} />
                    {t('resources.addResource')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bookmark size={20} />
                      Додати новий ресурс
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="flex items-center gap-2">
                        <FileText size={14} />
                        Назва ресурсу *
                      </Label>
                      <Input
                        id="title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        placeholder="Введіть назву ресурсу"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="flex items-center gap-2">
                        <BookOpenCheck size={14} />
                        Опис
                      </Label>
                      <Textarea
                        id="description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        placeholder="Введіть опис ресурсу"
                        rows={3}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link" className="flex items-center gap-2">
                        <LinkIcon size={14} />
                        Посилання *
                      </Label>
                      <Input
                        id="link"
                        value={newResource.link}
                        onChange={(e) => setNewResource({...newResource, link: e.target.value})}
                        placeholder="https://example.com"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="flex items-center gap-2">
                        <Folder size={14} />
                        Категорія
                      </Label>
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
                          <SelectItem value="faq">FAQ</SelectItem>
                          <SelectItem value="defense">Захист робіт</SelectItem>
                          <SelectItem value="other">Інше</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Скасувати
                      </Button>
                    </DialogClose>
                    <Button 
                      onClick={handleAddResource} 
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Додавання...
                        </>
                      ) : (
                        <>
                          <BookmarkCheck size={16} />
                          Зберегти ресурс
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              variant={showOnlySaved ? "default" : "outline"}
              onClick={() => setShowOnlySaved(prev => !prev)}
              className="sm:ml-auto gap-2"
              disabled={!user?.id}
            >
              <Bookmark size={16} className={showOnlySaved ? "fill-white" : ""} />
              {showOnlySaved ? 'Показати всі' : 'Тільки збережені'}
              {!user?.id && ' (потрібна авторизація)'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => {
              const { id, icon: Icon, title, description, action, link, isCustom, dbId, createdBy } = resource;
              
              return (
                <Card
                  key={id}
                  className="hover:shadow-lg transition-shadow duration-300 rounded-xl p-4 flex flex-col h-full relative group border"
                >
                  {/* Кнопки редагування для власних ресурсів викладачів */}
                  {isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy && (
                    <div className="absolute top-3 right-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => dbId && handleDeleteResource(dbId)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Видалити ресурс"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* Кнопка збереження */}
                  <button
                    onClick={() => toggleSaved(id)}
                    className={`absolute top-3 right-3 transition-all ${
                      !user?.id 
                        ? 'opacity-50 cursor-not-allowed text-gray-400' 
                        : savedResources.includes(id) 
                          ? 'text-primary hover:text-primary/80' 
                          : 'text-gray-400 hover:text-primary'
                    }`}
                    title={
                      !user?.id 
                        ? 'Увійдіть для збереження ресурсів'
                        : savedResources.includes(id) 
                          ? 'Видалити зі збережених' 
                          : 'Зберегти ресурс'
                    }
                    disabled={!user?.id}
                  >
                    {savedResources.includes(id) ? (
                      <BookmarkCheck size={20} fill="currentColor" />
                    ) : (
                      <Bookmark size={20} />
                    )}
                  </button>

                  <CardHeader className="p-0 mb-3 flex items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Icon className="text-primary" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-medium line-clamp-2">{title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-auto">
                    {link.startsWith('http') ? (
                      <Button
                        variant="outline"
                        className="w-full text-sm gap-2"
                        onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                      >
                        {action}
                        <ExternalLink size={14} />
                      </Button>
                    ) : (
                      <Link to={link}>
                        <Button variant="outline" className="w-full text-sm">
                          {action}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {showOnlySaved ? 'Немає збережених ресурсів' : 'Ресурси не знайдено'}
              </p>
              <p className="text-sm">
                {showOnlySaved 
                  ? 'Зберігайте ресурси, натискаючи на іконку закладки' 
                  : 'Спробуйте змінити пошуковий запит або очистіть фільтри'
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Resources;