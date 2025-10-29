import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Download, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  X,
  Phone
} from 'lucide-react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Типи для заявок
type ApplicationStatus = "pending" | "accepted" | "rejected";
type ApplicationType = "course" | "diploma";

interface Application {
  id: number;
  studentName: string;
  studentAvatar: string;
  program: string;
  year: string;
  topic: string;
  type: ApplicationType;
  status: ApplicationStatus;
  date: string;
  email: string;
  phone: string;
  description: string;
  expanded: boolean;
}

interface AcceptedStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
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

const TeacherApplications = () => {
  const { t } = useTranslation();
  const [expandedApplication, setExpandedApplication] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Мокові дані заявок
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      studentName: "Андрій Коваленко",
      studentAvatar: "",
      program: "Комп'ютерні науки",
      year: "3 курс",
      topic: "Розробка системи штучного інтелекту для аналізу медичних зображень",
      type: "diploma",
      status: "pending",
      date: "15.05.2024",
      email: "a.kovalenko@lnu.edu.ua",
      phone: "+380991234567",
      description: "Я цікавлюсь машинним навчанням та комп'ютерним зором. Пройшов курси з глибокого навчання та маю досвід роботи з TensorFlow. Хотів би розробити систему, яка могла б допомогти в діагностиці захворювань.",
      expanded: false
    },
    {
      id: 2,
      studentName: "Марія Петренко",
      studentAvatar: "",
      program: "Програмна інженерія",
      year: "4 курс",
      topic: "Оптимізація алгоритмів обробки великих даних",
      type: "course",
      status: "accepted",
      date: "10.05.2024",
      email: "m.petrenko@lnu.edu.ua",
      phone: "+380671234567",
      description: "Зацікавлена в high-performance computing та distributed systems. Маю досвід роботи з Apache Spark та Hadoop.",
      expanded: false
    },
    {
      id: 3,
      studentName: "Олексій Іваненко",
      studentAvatar: "",
      program: "Кібербезпека",
      year: "2 курс",
      topic: "Аналіз вразливостей в IoT пристроях",
      type: "course",
      status: "rejected",
      date: "05.05.2024",
      email: "o.ivanenko@lnu.edu.ua",
      phone: "+380931234567",
      description: "Спеціалізуюся на аналізі безпеки мережевих пристроїв. Пройшов курс з етичного хакінгу.",
      expanded: false
    }
  ]);

  const toggleApplication = (id: number) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  // Функція для прийняття студента
  const acceptStudent = async (application: Application) => {
    try {
      // Створюємо нового студента на основі заявки
      const newStudent: AcceptedStudent = {
        id: `student-${application.id}`,
        name: application.studentName,
        email: application.email,
        phone: application.phone,
        avatar: application.studentAvatar,
        course: parseInt(application.year) || 3, // Конвертуємо курс з рядка
        faculty: "Факультет інформаційних технологій",
        specialty: application.program,
        workType: application.type === "course" ? "coursework" : "diploma",
        workTitle: application.topic,
        startDate: new Date().toISOString().split('T')[0],
        progress: 10, // Початковий прогрес
        status: 'active',
        nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Через тиждень
      };

      // Зберігаємо в localStorage (тимчасове рішення)
      const existingStudents = JSON.parse(localStorage.getItem('teacherStudents') || '[]');
      const updatedStudents = [...existingStudents, newStudent];
      localStorage.setItem('teacherStudents', JSON.stringify(updatedStudents));

      // Оновлюємо статус заявки
      updateApplicationStatus(application.id, "accepted");

      // Показуємо повідомлення про успіх
      alert(`Студент ${application.studentName} успішно прийнятий!`);

    } catch (error) {
      console.error('Помилка при прийнятті студента:', error);
      alert('Сталася помилка при прийнятті студента');
    }
  };

  const updateApplicationStatus = (id: number, status: ApplicationStatus) => {
    setApplications(applications.map(app => 
      app.id === id ? { ...app, status } : app
    ));
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = typeFilter === "all" || app.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    accepted: applications.filter(app => app.status === "accepted").length,
    rejected: applications.filter(app => app.status === "rejected").length
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Виправлена секція Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen bg-background border-r border-border">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-2xl font-bold">{t('studentapplications', { defaultValue: "Заявки студентів" })}</h1>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('header.searchPlaceholder', { defaultValue: "Пошук заявок..." })}
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('teacherApplications.status', { defaultValue: "Статус" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('teacherApplications.allStatuses', { defaultValue: "Всі статуси" })}</SelectItem>
                    <SelectItem value="pending">{t('teacherApplications.pending', { defaultValue: "Очікують" })}</SelectItem>
                    <SelectItem value="accepted">{t('teacherApplications.accepted', { defaultValue: "Прийняті" })}</SelectItem>
                    <SelectItem value="rejected">{t('teacherApplications.rejected', { defaultValue: "Відхилені" })}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t('teacherApplications.workType', { defaultValue: "Тип роботи" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('teacherApplications.allTypes', { defaultValue: "Всі типи" })}</SelectItem>
                    <SelectItem value="course">{t('thesis.projectTypes.coursework', { defaultValue: "Курсова" })}</SelectItem>
                    <SelectItem value="diploma">{t('thesis.projectTypes.diploma', { defaultValue: "Дипломна" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.totalApplications', { defaultValue: "Всього заявок" })}
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.pending', { defaultValue: "Очікують" })}
                      </p>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.accepted', { defaultValue: "Прийняті" })}
                      </p>
                      <p className="text-2xl font-bold">{stats.accepted}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('teacherApplications.rejected', { defaultValue: "Відхилені" })}
                      </p>
                      <p className="text-2xl font-bold">{stats.rejected}</p>
                    </div>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Список заявок */}
            <div className="space-y-4">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <Card key={application.id} className="bg-card overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className={`p-4 cursor-pointer transition-colors ${
                          expandedApplication === application.id ? "border-b border-border" : ""
                        }`}
                        onClick={() => toggleApplication(application.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border">
                              <AvatarImage src={application.studentAvatar} />
                              <AvatarFallback>
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{application.studentName}</h3>
                                <Badge 
                                  variant={
                                    application.status === "accepted" ? "default" : 
                                    application.status === "rejected" ? "destructive" : "secondary"
                                  }
                                  className="ml-2"
                                >
                                  {application.status === "accepted" && t('teacherApplications.accepted', { defaultValue: "Прийнято" })}
                                  {application.status === "rejected" && t('teacherApplications.rejected', { defaultValue: "Відхилено" })}
                                  {application.status === "pending" && t('teacherApplications.underReview', { defaultValue: "На розгляді" })}
                                </Badge>
                                <Badge variant="outline">
                                  {application.type === "course" 
                                    ? t('thesis.projectTypes.coursework', { defaultValue: "Курсова" }) 
                                    : t('thesis.projectTypes.diploma', { defaultValue: "Дипломна" })
                                  }
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {application.program} • {application.year}
                              </p>
                              <p className="mt-1 text-sm">{application.topic}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{application.date}</span>
                            {expandedApplication === application.id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedApplication === application.id && (
                        <div className="px-4 pb-4 space-y-4 mt-2">
                          <div className="pt-2">
                            <h4 className="font-medium mb-2">
                              {t('teacherApplications.applicationDetails', { defaultValue: "Деталі заявки" })}
                            </h4>
                            <p className="text-sm">{application.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="text-sm">{application.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{application.phone}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                            {application.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 text-white hover:bg-green-700"
                                  onClick={() => acceptStudent(application)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {t('teacherApplications.acceptApplication', { defaultValue: "Прийняти заявку" })}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => updateApplicationStatus(application.id, "rejected")}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  {t('teacherApplications.rejectApplication', { defaultValue: "Відхилити заявку" })}
                                </Button>
                              </>
                            )}
                            {application.status === "accepted" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                onClick={() => updateApplicationStatus(application.id, "rejected")}
                              >
                                <X className="w-4 h-4 mr-2" />
                                {t('teacherApplications.rejectApplication', { defaultValue: "Відхилити заявку" })}
                              </Button>
                            )}
                            {application.status === "rejected" && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => acceptStudent(application)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t('teacherApplications.acceptApplication', { defaultValue: "Прийняти заявку" })}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              {t('teacherApplications.writeToStudent', { defaultValue: "Написати студенту" })}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {t('teacherApplications.downloadMaterials', { defaultValue: "Завантажити матеріали" })}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-card text-center py-8">
                  <CardContent>
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      {t('teacherApplications.noApplicationsFound', { defaultValue: "Заявок не знайдено" })}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('teacherApplications.noMatchingApplications', { defaultValue: "Немає заявок, що відповідають вашим критеріям пошуку" })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherApplications;