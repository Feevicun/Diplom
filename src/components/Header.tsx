import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
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
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFirstName(user.firstName || '');
    }

    const storedStatus = localStorage.getItem('userStatus');
    setIsOnline(storedStatus === null ? true : storedStatus === 'online');
  }, []);

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
        <div className="hidden md:flex items-center gap-6">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-[110px] justify-center"
          >
            <Plus className="h-4 w-4" />
            {t('header.create')}
          </Button>

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

          <Button variant="ghost" size="icon" className="rounded-full">
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
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
