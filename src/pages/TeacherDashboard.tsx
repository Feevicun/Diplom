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
import {
  Search,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  User,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
// import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const TeacherDashboard = () => {
  // const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'coursework' | 'diploma'>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - в реальному додатку буде запит до API
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Іваненко Олексій',
        email: 'oleksiy.ivanenko@example.com',
        phone: '+380991234567',
        avatar: '/avatars/student1.jpg',
        course: 4,
        faculty: 'Факультет інформаційних технологій',
        specialty: 'Комп\'ютерні науки',
        workType: 'diploma',
        workTitle: 'Розробка системи машинного навчання для аналізу медичних даних',
        startDate: '2024-01-15',
        progress: 75,
        status: 'active',
        lastMeeting: '2024-03-10',
        nextMeeting: '2024-03-20'
      },
      {
        id: '2',
        name: 'Петренко Марія',
        email: 'maria.petrenko@example.com',
        phone: '+380992345678',
        avatar: '/avatars/student2.jpg',
        course: 3,
        faculty: 'Факультет інформаційних технологій',
        specialty: 'Інженерія програмного забезпечення',
        workType: 'coursework',
        workTitle: 'Створення веб-додатку для управління проектами',
        startDate: '2024-02-01',
        progress: 60,
        status: 'active',
        lastMeeting: '2024-03-12',
        nextMeeting: '2024-03-22'
      },
      {
        id: '3',
        name: 'Сидоренко Андрій',
        email: 'andriy.sydorenko@example.com',
        phone: '+380993456789',
        course: 4,
        faculty: 'Факультет економіки',
        specialty: 'Фінанси та кредит',
        workType: 'diploma',
        workTitle: 'Аналіз інвестиційної привабливості IT-сектору України',
        startDate: '2023-09-10',
        progress: 100,
        status: 'completed',
        lastMeeting: '2024-01-20'
      },
      {
        id: '4',
        name: 'Коваленко Юлія',
        email: 'yulia.kovalenko@example.com',
        phone: '+380994567890',
        avatar: '/avatars/student4.jpg',
        course: 3,
        faculty: 'Факультет інформаційних технологій',
        specialty: 'Кібербезпека',
        workType: 'coursework',
        workTitle: 'Дослідження методів захисту від DDoS-атак',
        startDate: '2024-02-15',
        progress: 45,
        status: 'behind',
        lastMeeting: '2024-03-05',
        nextMeeting: '2024-03-18'
      },
      {
        id: '5',
        name: 'Шевченко Максим',
        email: 'maxym.shevchenko@example.com',
        phone: '+380995678901',
        course: 4,
        faculty: 'Факультет математики',
        specialty: 'Прикладна математика',
        workType: 'diploma',
        workTitle: 'Математичне моделювання економічних процесів',
        startDate: '2024-01-20',
        progress: 80,
        status: 'active',
        lastMeeting: '2024-03-11',
        nextMeeting: '2024-03-25'
      }
    ];

    setStudents(mockStudents);
    setLoading(false);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.workTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || student.workType === filterType;
    
    return matchesSearch && matchesFilter;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - фіксована ширина */}
      <div className="hidden md:flex flex-shrink-0">
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

      {/* Основний контент - займає всю доступну ширину і має прокрутку */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - фіксований */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-background border-b">
          <Header />
        </div>

        {/* Основний контент з ScrollArea */}
        <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
            {/* Заголовок та фільтри */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Мої студенти</h1>
                <p className="text-muted-foreground text-sm">
                  Студенти, які працюють під вашим керівництвом
                </p>
              </div>
              
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
            </div>

            {/* Картки студентів */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Студентів не знайдено</h3>
                <p className="text-muted-foreground text-sm">
                  Спробуйте змінити параметри пошуку або фільтрації
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Статистика */}
            <Card className="mt-6">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Статистика</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{students.length}</div>
                    <div className="text-xs text-muted-foreground">Всього студентів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {students.filter(s => s.workType === 'coursework').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Курсові</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {students.filter(s => s.workType === 'diploma').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Дипломні</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {students.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Завершено</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TeacherDashboard;