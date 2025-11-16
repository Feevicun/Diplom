// components/TeacherProfileModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Target, 
  Lightbulb,
  Calendar,
  ExternalLink,
  GraduationCap,
  Building,
  Award
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TeacherProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  faculty: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  officeHours?: string;
  phone?: string;
  website?: string;
  skills?: string[];
  departmentId?: string;
  facultyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Work {
  id: string;
  title: string;
  type: string;
  year: string;
  description: string;
  fileUrl?: string;
  publicationUrl?: string;
  createdAt?: string;
}

interface Direction {
  id: string;
  area: string;
  description: string;
  createdAt?: string;
}

interface FutureTopic {
  id: string;
  topic: string;
  description: string;
  createdAt?: string;
}

interface TeacherProfileModalProps {
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeacherProfileModal({ teacherId, open, onOpenChange }: TeacherProfileModalProps) {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [topics, setTopics] = useState<FutureTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && teacherId) {
      fetchTeacherData();
    }
  }, [open, teacherId]);

  const fetchTeacherData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Отримуємо основну інформацію про викладача
      const teacherResponse = await fetch(`/api/teachers/${teacherId}`, {
        headers
      });

      if (teacherResponse.ok) {
        const teacherData = await teacherResponse.json();
        setTeacher(teacherData);
      } else {
        console.error('Failed to fetch teacher:', teacherResponse.status);
        toast.error('Не вдалося завантажити дані викладача');
        return;
      }

      // Отримуємо роботи викладача
      const worksResponse = await fetch(`/api/teachers/${teacherId}/works`, {
        headers
      });

      if (worksResponse.ok) {
        const worksData = await worksResponse.json();
        setWorks(worksData);
      }

      // Отримуємо напрямки досліджень
      const directionsResponse = await fetch(`/api/teachers/${teacherId}/directions`, {
        headers
      });

      if (directionsResponse.ok) {
        const directionsData = await directionsResponse.json();
        setDirections(directionsData);
      }

      // Отримуємо майбутні теми
      const topicsResponse = await fetch(`/api/teachers/${teacherId}/topics`, {
        headers
      });

      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        setTopics(topicsData);
      }

    } catch (error) {
      console.error('Помилка завантаження даних викладача:', error);
      toast.error('Помилка завантаження даних викладача');
    } finally {
      setIsLoading(false);
    }
  };

  // Функції для безпечного отримання даних
  const getTeacherName = () => teacher?.name || 'Викладач';
  const getTeacherTitle = () => teacher?.title || 'Викладач';
  const getTeacherDepartment = () => teacher?.department || 'Кафедра не вказана';
  const getTeacherFaculty = () => teacher?.faculty || 'Факультет не вказаний';
  const getTeacherEmail = () => teacher?.email || 'email@lnu.edu.ua';
  const getTeacherBio = () => teacher?.bio || 'Біографія не вказана';
  const getTeacherPhone = () => teacher?.phone || 'Не вказано';
  const getTeacherOfficeHours = () => teacher?.officeHours || 'Не вказано';
  const getTeacherWebsite = () => teacher?.website;
  const getTeacherAvatar = () => teacher?.avatarUrl;
  const getSkills = () => teacher?.skills || [];

//   const getInitials = (name: string): string => {
//     if (!name) return '??';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Огляд', icon: User },
    { id: 'works', label: 'Роботи', icon: BookOpen },
    { id: 'directions', label: 'Напрямки', icon: Target },
    { id: 'topics', label: 'Теми', icon: Lightbulb },
  ];

  if (!teacher && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Профіль викладача</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : teacher ? (
          <div className="flex flex-col h-full">
            {/* Навігація по вкладкам */}
            <div className="border-b">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <ScrollArea className="flex-1 py-6 pr-4">
              {/* Вкладка Огляд */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Основна інформація */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <Avatar className="h-20 w-20 border-2">
                          <AvatarImage src={getTeacherAvatar()} />
                          <AvatarFallback className="bg-primary/10 text-lg">
                            <User className="h-10 w-10 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold mb-3">{getTeacherName()}</h2>
                          <p className="text-xl text-muted-foreground mb-4">{getTeacherTitle()}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getTeacherEmail()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getTeacherPhone()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getTeacherDepartment()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getTeacherFaculty()}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="text-sm">
                              {getTeacherDepartment()}
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                              {getTeacherFaculty()}
                            </Badge>
                          </div>
                          
                          {/* Контактні кнопки */}
                          <div className="flex gap-3 mt-4">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`mailto:${getTeacherEmail()}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Написати
                              </a>
                            </Button>
                            {getTeacherWebsite() && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={getTeacherWebsite()} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Вебсайт
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {getTeacherBio() && (
                        <div className="mt-6">
                          <h3 className="font-semibold text-lg mb-3">Про себе</h3>
                          <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                            {getTeacherBio()}
                          </p>
                        </div>
                      )}

                      {getTeacherOfficeHours() && (
                        <div className="mt-4">
                          <h3 className="font-semibold text-lg mb-3">Години прийому</h3>
                          <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg">
                            {getTeacherOfficeHours()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Статистика */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{works.length}</div>
                        <div className="text-sm text-muted-foreground">Робіт</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{directions.length}</div>
                        <div className="text-sm text-muted-foreground">Напрямків</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{topics.length}</div>
                        <div className="text-sm text-muted-foreground">Тем</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{getSkills().length}</div>
                        <div className="text-sm text-muted-foreground">Навичок</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Навички */}
                  {getSkills().length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-500" />
                          Навички та компетенції
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {getSkills().map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-sm py-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Вкладка Роботи */}
              {activeTab === 'works' && (
                <div className="space-y-4">
                  {works.length > 0 ? (
                    works.map((work) => (
                      <Card key={work.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline">{work.type}</Badge>
                                <Badge variant="secondary">{work.year}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {work.publicationUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={work.publicationUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {work.fileUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={work.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <BookOpen className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            {work.description}
                          </p>
                          
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Додано: {work.createdAt ? formatDate(work.createdAt) : 'Не вказано'}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium mb-2">Робіт поки немає</h3>
                        <p className="text-muted-foreground">
                          Викладач ще не додав жодної роботи до свого профілю
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Вкладка Напрямки */}
              {activeTab === 'directions' && (
                <div className="space-y-4">
                  {directions.length > 0 ? (
                    directions.map((direction) => (
                      <Card key={direction.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Target className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{direction.area}</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {direction.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium mb-2">Напрямків поки немає</h3>
                        <p className="text-muted-foreground">
                          Викладач ще не додав напрямків досліджень до свого профілю
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Вкладка Теми */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  {topics.length > 0 ? (
                    topics.map((topic) => (
                      <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Lightbulb className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{topic.topic}</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {topic.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-medium mb-2">Тем поки немає</h3>
                        <p className="text-muted-foreground">
                          Викладач ще не додав майбутніх тем для досліджень
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Профіль не знайдено</h3>
            <p className="text-muted-foreground">
              Не вдалося завантажити інформацію про викладача
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}