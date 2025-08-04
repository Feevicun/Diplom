// Header.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Settings,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import Sidebar from './Sidebar';

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFirstName(user.firstName || '');
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

  return (
    <>
      <header className="h-16 bg-[--sidebar]/95 backdrop-blur border-b sticky top-0 z-50 text-[--sidebar-foreground]">
        <div className="container flex h-16 items-center justify-between px-6">
          {/* Left: Mobile burger and search */}
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
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

          {/* Right: Full menu */}
          <div className="hidden md:flex items-center gap-6 relative">
            <div ref={menuRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-[110px] justify-center"
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                aria-expanded={isCreateMenuOpen}
                aria-haspopup="true"
              >
                <Plus className="h-4 w-4" />
                {t('header.create')}
              </Button>

              {isCreateMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50">
                  <button onClick={() => handleCreateSelect('coursework')} className="w-full text-left px-4 py-2 text-sm rounded-t-xl hover:bg-accent">
                    {t('header.createCoursework')}
                  </button>
                  <button onClick={() => handleCreateSelect('diploma')} className="w-full text-left px-4 py-2 text-sm hover:bg-accent">
                    {t('header.createDiploma')}
                  </button>
                  <button onClick={() => handleCreateSelect('practice')} className="w-full text-left px-4 py-2 text-sm rounded-b-xl hover:bg-accent">
                    {t('header.createPractice')}
                  </button>
                </div>
              )}
            </div>

            <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
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

            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="rounded-full text-sm px-3 py-1">
              {i18n.language === 'ua' ? 'UA' : 'EN'}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/profile')}>
              <Settings className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{firstName}</p>
                <p onClick={toggleOnlineStatus} className="text-xs text-muted-foreground cursor-pointer">
                  {isOnline ? t('header.online') : t('header.offline')}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          </div>
        </div>
      </header>

{isMobileMenuOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
    <div className="fixed top-0 left-0 w-76 h-full bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{t('header.menu')}</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Sidebar />

      <div className="mt-auto space-y-2">
        <Button onClick={toggleLanguage} className="w-full">
          {i18n.language === 'ua' ? 'Змінити на EN' : 'Switch to UA'}
        </Button>

        <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('header.theme')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="rose">Rose</SelectItem>
            <SelectItem value="mint">Mint</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default Header;
