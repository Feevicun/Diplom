import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Zap,
  LogOut,
  ChevronRight,
  Search,
  Book 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const mainMenuItems = [
    {
      title: t('sidebar.dashboard'),
      href: '/',
      icon: Home,
      badge: null
    },
    {
      title: t('sidebar.projects'),
      href: '/tracker',
      icon: FileText,
      badge: '2'
    },
    {
      title: t('sidebar.tasks'),
      href: '/chat',
      icon: MessageSquare,
      badge: '3'
    },
    {
      title: t('sidebar.calendar'),
      href: '/calendar',
      icon: Calendar,
      badge: null
    }
  ];

  const toolsItems = [
    {
      title: t('sidebar.aiAssistant'),
      href: '/ai-assistant',
      icon: Zap,
      badge: 'BETA'
    },
    {
      title: t('sidebar.analytics'),
      href: '/analytics',
      icon: TrendingUp,
      badge: null
    },
    {
      title: t('sidebar.resources'),
      href: '/resources',
      icon: Book,
      badge: null
    }
  ];

  const MenuItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
    const Icon = item.icon;

    return (
      <Link
        to={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-accent/50 hover:text-accent-foreground",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <Badge
            variant={item.badge === 'BETA' ? "default" : "secondary"}
            className="h-5 px-2 text-xs"
          >
            {item.badge}
          </Badge>
        )}
        {isActive && (
          <ChevronRight className="h-3 w-3 text-primary-foreground/70" />
        )}
      </Link>
    );
  };

  return (
    <div className="w-72 h-screen bg-[--sidebar] text-[--sidebar-foreground] border-r flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Search className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ThesisHub</h1>
            <p className="text-xs text-muted-foreground">Research Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-8">
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-3">
            {t('sidebar.sectionMain')}
          </h2>
          <nav className="space-y-1">
            {mainMenuItems.map((item) => (
              <MenuItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
              />
            ))}
          </nav>
        </div>

        <Separator />

        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-3">
            {t('sidebar.sectionTools')}
          </h2>
          <nav className="space-y-1">
            {toolsItems.map((item) => (
              <MenuItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              ОП
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Олександр Петренко
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Студент 4 курсу
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
