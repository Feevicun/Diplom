import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  User,
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Trophy,
  Activity,
  FileText,
  GraduationCap,
  Download,
  Upload,
  Clock,
  ListChecks,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  course: number;
  faculty: string;
  specialty: string;
  workType: 'coursework' | 'diploma';
  workTitle: string;
  startDate: string;
  progress: number;
  status: 'active' | 'completed' | 'behind';
  lastMeeting?: string;
  nextMeeting?: string;
}

// Інтерфейс для даних користувача
interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Інтерфейс для подій з календаря
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'meeting' | 'deadline';
}

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'coursework' | 'diploma'>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Отримання даних користувача з API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/current-user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data.user);
        
        // Завантажуємо події календаря після отримання даних користувача
        if (data.user?.email) {
          await fetchCalendarEvents(data.user.email, token);
        }
      } catch (error) {
        console.error('Помилка завантаження даних користувача:', error);
        setUser({
          firstName: 'Користувач',
          lastName: '',
          email: '',
          role: 'teacher'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Функція для завантаження подій календаря
  const fetchCalendarEvents = async (userEmail: string, token: string) => {
    try {
      const response = await fetch(`/api/events?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const events = await response.json();
        setCalendarEvents(events);
      } else {
        console.error('Failed to fetch calendar events');
      }
    } catch (error) {
      console.error('Помилка завантаження подій календаря:', error);
    }
  };

  // Mock data для студентів
  useEffect(() => {
    const mockStudents: Student[] = [];

    setTimeout(() => {
      setStudents(mockStudents);
    }, 1000);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.workTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || student.workType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Отримання найближчих подій (наступні 7 днів)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return calendarEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Обмежуємо до 3 найближчих подій
  };

  const upcomingEvents = getUpcomingEvents();

  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Активний' },
      completed: { variant: 'outline' as const, text: 'Завершено' },
      behind: { variant: 'destructive' as const, text: 'Відстає' }
    };
    
    return (
      <Badge variant={statusConfig[status].variant} className="text-xs">
        {statusConfig[status].text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Форматування дати для подій
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сьогодні';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task':
        return ListChecks;
      case 'meeting':
        return Users;
      case 'deadline':
        return Clock;
      default:
        return Calendar;
    }
  };

  const getEventPriority = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'Високий';
      case 'meeting':
        return 'Середній';
      case 'task':
        return 'Низький';
      default:
        return 'Середній';
    }
  };

  // Статистика для карток
  const quickStats = [
    {
      label: 'Всього студентів',
      value: students.length.toString(),
      icon: Users,
      change: students.length > 0 ? '+2 цього місяця' : 'Ще немає студентів',
      trend: students.length > 0 ? 'up' : 'neutral' as const,
    },
    {
      label: 'Середній прогрес',
      value: students.length > 0 ? `${Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)}%` : '0%',
      icon: Target,
      change: students.length > 0 ? 'На 5% вище ніж минулого місяця' : 'Очікуємо роботи',
      trend: students.length > 0 ? 'up' : 'neutral' as const,
    },
    {
      label: 'Заплановані зустрічі',
      value: students.filter(s => s.nextMeeting).length.toString(),
      icon: Calendar,
      change: students.length > 0 ? 'На цьому тижні' : 'Немає запланованих',
      trend: 'neutral' as const,
    },
    {
      label: 'Найближчі події',
      value: upcomingEvents.length.toString(),
      icon: Clock,
      change: upcomingEvents.length > 0 ? 'У найближчі 7 днів' : 'Немає подій',
      trend: 'neutral' as const,
    },
  ];

  // Відображення завантаження
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Завантаження...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative w-64 bg-background border-r shadow-xl z-50">
            <Sidebar />
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-8 lg:p-8 space-y-8 pb-20 max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-primary">
                        Панель керівника
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
                      Ласкаво просимо, {user?.firstName || "Користувач"}!
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-6">
                      {students.length > 0 
                        ? 'Керуйте роботами ваших студентів та відстежуйте їхній прогрес' 
                        : 'Почніть роботу з прийняття студентів для керівництва'
                      }
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <Users className="w-4 h-4 mr-2" />
                        {students.length} студентів
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 bg-background/50">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {students.filter(s => s.workType === 'coursework').length} курсових
                      </Badge>
                      <Badge variant="default" className="px-4 py-2">
                        <Target className="w-4 h-4 mr-2" />
                        {students.length > 0 ? 'Активний' : 'Готовий до роботи'}
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:block ml-8">
                    <div className="w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                          {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary inline-block" />}
                          {stat.trend === 'down' && <Activity className="w-4 h-4 text-muted-foreground inline-block" />}
                          {stat.trend === 'neutral' && <div className="w-4 h-4 inline-block" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground mb-1">{stat.label}</p>
                        <p className="text-sm text-muted-foreground">{stat.change}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Основний контент - список студентів */}
                <div className="lg:col-span-2">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl md:text-2xl font-bold">Мої студенти</CardTitle>
                          <CardDescription>
                            {students.length > 0 
                              ? 'Студенти, які працюють під вашим керівництвом' 
                              : 'Прийміть студентів для початку роботи'
                            }
                          </CardDescription>
                        </div>
                        
                        {students.length > 0 && (
                          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Пошук студентів..."
                                className="pl-8 w-full sm:w-[250px] text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => setFilterType('all')}
                              >
                                Всі
                              </Button>
                              <Button
                                variant={filterType === 'coursework' ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => setFilterType('coursework')}
                              >
                                Курсові
                              </Button>
                              <Button
                                variant={filterType === 'diploma' ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => setFilterType('diploma')}
                              >
                                Дипломні
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {students.length === 0 ? (
                        // Екран коли немає студентів
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-4">Ще немає студентів</h3>
                          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Почніть роботу з прийняття студентів, які будуть працювати під вашим керівництвом над курсовими та дипломними роботами
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button 
                              size="lg" 
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              asChild
                            >
                              <Link to="/teacher/students">
                                <Users className="w-5 h-5 mr-2" />
                                Прийняти студента
                              </Link>
                            </Button>
                            <Button variant="outline" size="lg">
                              <Download className="w-5 h-5 mr-2" />
                              Імпортувати список
                            </Button>
                          </div>
                          
                          {/* Додаткові опції */}
                          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            <div className="text-center p-4 border rounded-lg bg-muted/50">
                              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold mb-1">Прийняти заявки</h4>
                              <p className="text-sm text-muted-foreground">Переглянути список заявок</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-muted/50">
                              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold mb-1">Імпорт з файлу</h4>
                              <p className="text-sm text-muted-foreground">Завантажте список з Excel</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-muted/50">
                              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                              <h4 className="font-semibold mb-1">Шаблони</h4>
                              <p className="text-sm text-muted-foreground">Використовуйте готові шаблони</p>
                            </div>
                          </div>
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        // Екран коли є студенти, але пошук не знайшов результатів
                        <div className="text-center py-12">
                          <User className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">Студентів не знайдено</h3>
                          <p className="text-muted-foreground text-sm">
                            Спробуйте змінити параметри пошуку або фільтрації
                          </p>
                          <Button 
                            className="mt-4" 
                            asChild
                          >
                            <Link to="/teacher/students">
                              <Users className="w-4 h-4 mr-2" />
                              Прийняти ще студентів
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        // Основний список студентів
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                          {filteredStudents.map((student) => (
                            <Card key={student.id} className="hover:shadow-md transition-shadow border flex flex-col h-full">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={student.avatar} />
                                      <AvatarFallback className="text-sm">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <CardTitle className="text-base">{student.name}</CardTitle>
                                      <CardDescription className="text-xs">
                                        {student.course} курс • {student.specialty}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  {getStatusBadge(student.status)}
                                </div>
                              </CardHeader>
                              
                              <CardContent className="space-y-3 pb-3 flex-1">
                                <div>
                                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    <span>
                                      {student.workType === 'coursework' ? 'Курсова' : 'Дипломна'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium line-clamp-2">
                                    {student.workTitle}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Початок:</p>
                                    <p className="font-medium">{formatDate(student.startDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Прогрес:</p>
                                    <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                      <div 
                                        className="bg-primary h-2 rounded-full transition-all" 
                                        style={{ width: `${student.progress}%` }}
                                      />
                                    </div>
                                    <p className="font-medium text-xs mt-1">{student.progress}%</p>
                                  </div>
                                </div>
                                
                                {student.nextMeeting && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Зустріч: {formatDate(student.nextMeeting)}
                                  </div>
                                )}
                              </CardContent>
                              
                              <CardFooter className="pt-0 mt-auto">
                                <div className="flex w-full gap-2 items-center">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                  <Button asChild className="ml-auto text-xs h-8 px-3 flex-shrink-0" variant="outline">
                                    <Link to={`/teacher/students/${student.id}`}>
                                      Детальніше
                                      <ChevronRight className="ml-1 h-3 w-3" />
                                    </Link>
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {students.length > 0 && (
                      <CardFooter className="border-t pt-4">
                        <Button asChild variant="outline" className="ml-auto">
                          <Link to="/teacher/students">
                            <Users className="w-4 h-4 mr-2" />
                            Прийняти ще студентів
                          </Link>
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>

                {/* Бокова панель - події та швидкі дії */}
                <div className="space-y-6">
                  {/* Найближчі події */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <CardTitle className="text-lg">Найближчі події</CardTitle>
                      </div>
                      <CardDescription>
                        {upcomingEvents.length > 0 
                          ? 'Події на найближчі 7 днів' 
                          : 'Немає запланованих подій'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingEvents.length === 0 ? (
                          <div className="text-center py-6">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-sm mb-4">
                              Немає запланованих подій
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <Link to="/calendar">
                                <Calendar className="w-4 h-4 mr-2" />
                                Перейти до календаря
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          upcomingEvents.map((event) => {
                            const Icon = getEventIcon(event.type);
                            const priority = getEventPriority(event.type);
                            return (
                              <div key={event.id} className="p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className={`inline-flex px-2 py-1 rounded text-xs font-medium mb-2 ${
                                  priority === 'Високий'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    : priority === 'Середній'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                  {priority}
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {event.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatEventDate(event.date)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Швидкі дії */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Швидкі дії</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/calendar">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          Календар
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/teacher/students">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          Прийняти студентів
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/analytics">
                          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                            <BarChart3 className="h-4 w-4 text-primary" />
                          </div>
                          Аналітика
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Статистика - розтягнута по всій ширині */}
              <Card className="hover:shadow-lg transition-shadow w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Загальна статистика</CardTitle>
                  <CardDescription>
                    {students.length > 0 ? 'Огляд роботи зі студентами' : 'Готовість до початку роботи'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 border rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-foreground">{students.length}</div>
                      <div className="text-sm text-muted-foreground">Всього студентів</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-foreground">
                        {students.filter(s => s.workType === 'coursework').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Курсові роботи</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-foreground">
                        {students.filter(s => s.workType === 'diploma').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Дипломні роботи</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-foreground">
                        {students.filter(s => s.status === 'completed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Завершено</div>
                    </div>
                  </div>
                  
                  {/* Додаткова статистика */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">
                        {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length) : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Середній прогрес</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">
                        {students.filter(s => s.nextMeeting).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Заплановані зустрічі</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-foreground">
                        {upcomingEvents.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Найближчі події</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;