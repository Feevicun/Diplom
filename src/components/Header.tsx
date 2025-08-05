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
  X,
  User,
  Globe,
  Palette,
  Moon,
  Sun,
  Sparkles
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
  const [isClosing, setIsClosing] = useState(false);

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

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'rose': return <Sparkles className="h-4 w-4" />;
      case 'mint': return <Palette className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <>
      <header className="h-16 bg-[--sidebar]/95 backdrop-blur border-b sticky top-0 z-50 text-[--sidebar-foreground]">
        <div className="container flex h-16 items-center justify-between px-6">
          {/* Left: Mobile burger and search */}
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden relative overflow-hidden group" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
                className="gap-2 w-[110px] justify-center transition-all duration-200 hover:scale-105"
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                aria-expanded={isCreateMenuOpen}
                aria-haspopup="true"
              >
                <Plus className={`h-4 w-4 transition-transform duration-300 ${isCreateMenuOpen ? 'rotate-45' : ''}`} />
                {t('header.create')}
              </Button>

              {isCreateMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-popover text-popover-foreground shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => handleCreateSelect('coursework')} 
                    className="w-full text-left px-4 py-3 text-sm rounded-t-xl hover:bg-accent transition-colors duration-200 flex items-center gap-3"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t('header.createCoursework')}
                  </button>
                  <button 
                    onClick={() => handleCreateSelect('diploma')} 
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors duration-200 flex items-center gap-3"
                  >
                    <GraduationCap className="h-4 w-4" />
                    {t('header.createDiploma')}
                  </button>
                  <button 
                    onClick={() => handleCreateSelect('practice')} 
                    className="w-full text-left px-4 py-3 text-sm rounded-b-xl hover:bg-accent transition-colors duration-200 flex items-center gap-3"
                  >
                    <Briefcase className="h-4 w-4" />
                    {t('header.createPractice')}
                  </button>
                </div>
              )}
            </div>

            <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
              <SelectTrigger className="w-[110px] transition-all duration-200 hover:scale-105">
                <SelectValue placeholder={t('header.theme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </SelectItem>
                <SelectItem value="dark" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </SelectItem>
                <SelectItem value="rose" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Rose
                </SelectItem>
                <SelectItem value="mint" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Mint
                </SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage} 
              className="rounded-full text-sm px-3 py-1 transition-all duration-200 hover:scale-110 relative overflow-hidden group"
            >
              <Globe className="h-4 w-4 mr-1" />
              {i18n.language === 'ua' ? 'UA' : 'EN'}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full transition-all duration-200 hover:scale-110 hover:rotate-12" 
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{firstName}</p>
                <p 
                  onClick={toggleOnlineStatus} 
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200"
                >
                  {isOnline ? t('header.online') : t('header.offline')}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isOnline ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`fixed top-0 left-0 w-77 h-full bg-background border-r border-border text-foreground shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isClosing ? '-translate-x-full' : 'translate-x-0'}`}>
            
            {/* Header */}
            <div className="relative py-2 px-3 bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold truncate">
                      {firstName || 'User'}
                    </h2>
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span 
                        onClick={toggleOnlineStatus}
                        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors truncate"
                      >
                        {isOnline ? t('header.online') : t('header.offline')}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeMobileMenu}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200 h-6 w-6 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div 
                className="p-2"
                style={{ 
                  animation: isClosing ? 'none' : 'slideInLeft 0.3s ease-out forwards'
                }}
              >
                <Sidebar />
              </div>
            </div>

            {/* Footer Controls */}
            <div className="p-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Lang</span>
                <Button 
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="gap-1 h-6 px-2 text-xs"
                >
                  <Globe className="h-3 w-3" />
                  {i18n.language === 'ua' ? 'EN' : 'UA'}
                </Button>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Theme</span>
                <div className="flex gap-0.5 justify-between">
                  <Button
                    variant={theme === 'light' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="p-1 h-6 w-6 flex-1"
                  >
                    <Sun className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="p-1 h-6 w-6 flex-1"
                  >
                    <Moon className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={theme === 'rose' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('rose')}
                    className="p-1 h-6 w-6 flex-1"
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={theme === 'mint' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('mint')}
                    className="p-1 h-6 w-6 flex-1"
                  >
                    <Palette className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Header;