import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Settings,
  Plus,
  Menu
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

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

  // Закриття меню при кліку поза ним
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

  // Обробка вибору пункту меню "Створити"
const handleCreateSelect = (type: string) => {
  setIsCreateMenuOpen(false);
  
  if (type === 'coursework') {
    navigate('/tracker?type=coursework');
  } else if (type === 'diploma') {
    navigate('/tracker?type=diploma');
  } else if (type === 'practice') {
    navigate('/tracker?type=practice');
  }
};


  return (
    <header className="h-16 bg-[--sidebar]/95 backdrop-blur border-b sticky top-0 z-50 text-[--sidebar-foreground]">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Mobile menu + search */}
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" className="md:hidden">
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

        {/* Actions */}
        <div className="hidden md:flex items-center gap-6 relative">
          {/* Кнопка "Створити" з меню */}
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleCreateSelect('coursework')}
                  type="button"
                >
                  Курсова робота
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleCreateSelect('diploma')}
                  type="button"
                >
                  Дипломна
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => handleCreateSelect('practice')}
                  type="button"
                >
                  Практика
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

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-full text-sm px-3 py-1"
          >
            {i18n.language === 'ua' ? 'UA' : 'EN'}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/profile')}>
            <Settings className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">{firstName}</p>
              <p
                onClick={toggleOnlineStatus}
                className="text-xs text-muted-foreground cursor-pointer"
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
  );
};

export default Header;
