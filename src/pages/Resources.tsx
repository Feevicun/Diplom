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
  Heart,
  BookmarkPlus,
  BookmarkCheck,
  Link as LinkIcon,
  Folder,
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
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

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
        const response = await fetch('http://localhost:4000/api/resources');
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

  // Завантаження улюблених ресурсів після отримання користувача
  useEffect(() => {
    if (user?.id) {
      const userFavoritesKey = `favoriteResources_${user.id}`;
      const saved = localStorage.getItem(userFavoritesKey);
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (error) {
          console.error('Помилка завантаження улюблених ресурсів:', error);
          setFavorites([]);
        }
      }
    }
  }, [user]);

  // Збереження улюблених ресурсів при зміні
  useEffect(() => {
    if (user?.id) {
      const userFavoritesKey = `favoriteResources_${user.id}`;
      localStorage.setItem(userFavoritesKey, JSON.stringify(favorites));
    }
  }, [favorites, user]);

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

  const toggleFavorite = (id: string): void => {
    if (!user?.id) {
      console.warn('Користувач не авторизований');
      return;
    }
    
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleAddResource = async (): Promise<void> => {
    try {
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

      const response = await fetch('http://localhost:4000/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newResource)
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
    }
  };

  const handleDeleteResource = async (dbId: number): Promise<void> => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/resources/${dbId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Видаляємо ресурс зі списку
        setDbResources(prev => prev.filter(res => res.id !== dbId));
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

    const isFavorite = favorites.includes(res.id);

    return matchesSearch && (!showOnlyFavorites || isFavorite);
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
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                      <BookmarkPlus size={20} />
                      Додати новий ресурс
                    </DialogTitle>
                    <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
                      <X className="h-4 w-4" />
                    </DialogClose>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="flex items-center gap-2">
                        <BookOpenCheck size={14} />
                        Опис
                      </Label>
                      <Input
                        id="description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                        placeholder="Введіть опис ресурсу"
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="flex items-center gap-2">
                        <Folder size={14} />
                        Категорія
                      </Label>
                      <select
                        id="category"
                        value={newResource.category}
                        onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="templates">Шаблони</option>
                        <option value="examples">Приклади</option>
                        <option value="guidelines">Інструкції</option>
                        <option value="literature">Література</option>
                        <option value="other">Інше</option>
                      </select>
                    </div>
                    <Button onClick={handleAddResource} className="w-full gap-2">
                      <BookmarkCheck size={16} />
                      Зберегти ресурс
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              variant={showOnlyFavorites ? "default" : "outline"}
              onClick={() => setShowOnlyFavorites(prev => !prev)}
              className="sm:ml-auto gap-2"
              disabled={!user?.id}
            >
              <Heart size={16} className={showOnlyFavorites ? "fill-white" : ""} />
              {showOnlyFavorites ? 'Показати всі' : 'Тільки обране'}
              {!user?.id && ' (потрібна авторизація)'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => {
              const { id, icon: Icon, title, description, action, link, isCustom, dbId, createdBy } = resource;
              
              return (
                <Card
                  key={id}
                  className="hover:shadow-lg transition-shadow duration-300 rounded-xl p-4 flex flex-col h-full relative group"
                >
                  {/* Кнопки редагування для власних ресурсів викладачів */}
                  {isCustom && user?.role === 'teacher' && user.id && createdBy && Number(user.id) === createdBy && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => dbId && handleDeleteResource(dbId)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        title="Видалити ресурс"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <CardHeader className="p-0 mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon className="text-primary flex-shrink-0" size={18} />
                      <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {description}
                        </CardDescription>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(id)}
                      className={`mt-1 flex-shrink-0 transition-all ${
                        !user?.id 
                          ? 'opacity-50 cursor-not-allowed text-gray-400' 
                          : favorites.includes(id) 
                            ? 'text-rose-500 hover:text-rose-600' 
                            : 'text-gray-400 hover:text-primary'
                      }`}
                      title={
                        !user?.id 
                          ? 'Увійдіть для збереження ресурсів'
                          : favorites.includes(id) 
                            ? 'Видалити з обраного' 
                            : 'Додати в обране'
                      }
                      disabled={!user?.id}
                    >
                      {favorites.includes(id) ? (
                        <Heart size={18} fill="currentColor" />
                      ) : (
                        <Heart size={18} />
                      )}
                    </button>
                  </CardHeader>
                  <CardContent className="p-0 mt-auto">
                    {link.startsWith('http') ? (
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        onClick={() => window.open(link, '_blank')}
                      >
                        {action}
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
              <p>Ресурси не знайдено. Спробуйте змінити пошуковий запит.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Resources;