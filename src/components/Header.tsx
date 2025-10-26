// Header.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Settings,
  Plus,
  Menu,
  X,
  User,
  BookOpen,
  GraduationCap,
  Briefcase,
  Home,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Zap,
  LogOut,
  Book
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ThemeType = 'light' | 'dark' | 'rose' | 'mint';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [isOnline, setIsOnline] = useState(true);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.firstName) {
        setFirstName(user.firstName);
      } else if (user.name) {
        const [firstName] = user.name.split(' ');
        setFirstName(firstName || '');
        localStorage.setItem(
          'currentUser',
          JSON.stringify({ ...user, firstName })
        );
      } else {
        setFirstName('');
      }

      // Встановлюємо роль користувача
      if (user.role) {
        setUserRole(user.role);
      }
    }
    
    const storedStatus = localStorage.getItem('userStatus');
    setIsOnline(storedStatus === null ? true : storedStatus === 'online');
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    }
    if (isCreateMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateMenuOpen]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ua' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    localStorage.setItem('userStatus', newStatus ? 'online' : 'offline');
  };

  const handleCreateSelect = (type: string) => {
    setIsCreateMenuOpen(false);
    navigate(`/tracker?type=${type}`);
  };

  const handleProfileClick = () => {
    // Перенаправляємо на відповідний профіль в залежності від ролі
    if (userRole === 'teacher') {
      navigate('/teacher/info');
    } else {
      navigate('/profile');
    }
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    setIsClosing(false);
  };

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeMobileMenu();
    }
  };

  // Визначаємо пункти меню в залежності від ролі
  const getMenuItems = () => {
    const baseItems = [
      { title: t('sidebar.dashboard'), href: userRole === 'teacher' ? '/teacherdashboard' : '/dashboard', icon: Home },
      { title: t('sidebar.projects'), href: userRole === 'teacher' ? '/teacher/grades' : '/tracker', icon: FileText },
      { title: t('sidebar.tasks'), href: '/chat', icon: MessageSquare },
      { title: t('sidebar.calendar'), href: '/calendar', icon: Calendar },
      { title: t('sidebar.aiAssistant'), href: '/ai-assistant', icon: Zap, badge: 'BETA' },
      { title: t('sidebar.analytics'), href: '/analytics', icon: TrendingUp },
      { title: t('sidebar.resources'), href: '/resources', icon: Book }
    ];

    // Додаємо профіль викладача, якщо це викладач
    if (userRole === 'teacher') {
      baseItems.splice(2, 0, { 
        title: 'Мої студенти', 
        href: '/teacher/students', 
        icon: User 
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      <header className="h-16 bg-[--sidebar]/95 backdrop-blur border-b sticky top-0 z-50 text-[--sidebar-foreground]">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={openMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder={t('header.searchPlaceholder')}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 relative">
            {userRole === 'student' && (
              <div ref={menuRef} className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-[110px] justify-center"
                  onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                >
                  <Plus className="h-4 w-4" />
                  {t('header.create')}
                </Button>

                {isCreateMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => handleCreateSelect('coursework')}
                      className="w-full text-left px-4 py-3 text-sm rounded-t-xl hover:bg-accent flex items-center gap-3"
                    >
                      <BookOpen className="h-4 w-4" />
                      {t('header.createCoursework')}
                    </button>
                    <button
                      onClick={() => handleCreateSelect('diploma')}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-accent flex items-center gap-3"
                    >
                      <GraduationCap className="h-4 w-4" />
                      {t('header.createDiploma')}
                    </button>
                    <button
                      onClick={() => handleCreateSelect('practice')}
                      className="w-full text-left px-4 py-3 text-sm rounded-b-xl hover:bg-accent flex items-center gap-3"
                    >
                      <Briefcase className="h-4 w-4" />
                      {t('header.createPractice')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <Select
              value={theme}
              onValueChange={(value) => setTheme(value as ThemeType)}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder={t('header.theme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="rose">Rose</SelectItem>
                <SelectItem value="mint">Mint</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="rounded-full text-sm px-3 py-1"
            >
              {i18n.language === 'ua' ? 'UA' : 'EN'}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleProfileClick}
              className="rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{firstName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole === 'teacher' ? 'Викладач' : 'Студент'}
                </p>
                <p
                  onClick={toggleOnlineStatus}
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {isOnline ? t('header.online') : t('header.offline')}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Мінімалістичне бургер-меню з анімаціями */}
      {isMobileMenuOpen && (
        <div 
          ref={overlayRef}
          className="fixed inset-0 z-50 md:hidden"
          onClick={handleOverlayClick}
        >
          {/* Overlay з анімацією */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300",
              isClosing ? "opacity-0" : "opacity-100"
            )}
          />
          
          {/* Меню панель з анімацією слайду */}
          <div 
            className={cn(
              "absolute top-0 left-0 h-full w-80 bg-background border-r shadow-xl transform transition-transform duration-300 ease-out",
              isClosing ? "-translate-x-full" : "translate-x-0"
            )}
          >
            {/* Заголовок з анімацією появи */}
            <div 
              className={cn(
                "flex items-center justify-between p-6 border-b transition-all duration-300",
                isClosing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: isClosing ? '0ms' : '100ms' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">{firstName || 'User'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-muted-foreground">
                      {isOnline ? t('header.online') : t('header.offline')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {userRole === 'teacher' ? 'Викладач' : 'Студент'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Навігація з послідовною анімацією елементів */}
            <div className="p-4 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const delay = index * 50;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href);
                      closeMobileMenu();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-300 transform",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground",
                      isClosing ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
                    )}
                    style={{
                      transitionDelay: isClosing ? '0ms' : `${delay}ms`,
                      animationDelay: isClosing ? '0ms' : `${delay}ms`
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Нижня частина з анімацією */}
            <div 
              className={cn(
                "absolute bottom-0 left-0 right-0 p-4 border-t transition-all duration-300",
                isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: isClosing ? '0ms' : '200ms' }}
            >
              <div className="space-y-3">
                {/* Мова */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Мова</span>
                  <div className="flex gap-1">
                    <Button
                      variant={i18n.language === 'ua' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        i18n.changeLanguage('ua');
                        localStorage.setItem('i18nextLng', 'ua');
                      }}
                      className="h-8 px-3 text-xs transition-all hover:scale-105"
                    >
                      UA
                    </Button>
                    <Button
                      variant={i18n.language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        i18n.changeLanguage('en');
                        localStorage.setItem('i18nextLng', 'en');
                      }}
                      className="h-8 px-3 text-xs transition-all hover:scale-105"
                    >
                      EN
                    </Button>
                  </div>
                </div>

                {/* Тема */}
                <div>
                  <span className="text-sm font-medium block mb-2">Тема</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'dark', 'rose', 'mint'] as ThemeType[]).map((t) => (
                      <Button
                        key={t}
                        variant={theme === t ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme(t)}
                        className="h-8 capitalize text-xs transition-all hover:scale-105"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Вийти */}
                <Button
                  variant="outline"
                  className="w-full gap-2 transition-all hover:scale-105 hover:border-destructive/50 hover:text-destructive"
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    navigate('/');
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Вийти
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;