import { useState } from "react";
import { TeacherProfileCard } from "@/components/TeacherProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Award, Target, Trash2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeacherInfo {
  name: string;
  title: string;
  department: string;
  email: string;
  bio: string;
}

interface Work {
  id: string;
  title: string;
  type: string;
  year: string;
  description: string;
}

interface Direction {
  id: string;
  area: string;
  description: string;
}

interface FutureTopic {
  id: string;
  topic: string;
  description: string;
}

export default function Teacher() {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    name: "Іванов Іван Іванович",
    title: "Доктор наук, професор",
    department: "Кафедра інформаційних систем",
    email: "ivanov@university.edu",
    bio: "Досвідчений викладач з більш ніж 15-річним стажем роботи в галузі інформаційних технологій.",
  });

  const [works, setWorks] = useState<Work[]>([
    {
      id: "1",
      title: "Розробка інтелектуальних систем",
      type: "Монографія",
      year: "2023",
      description: "Дослідження сучасних підходів до створення AI систем",
    },
  ]);

  const [directions, setDirections] = useState<Direction[]>([
    {
      id: "1",
      area: "Штучний інтелект та машинне навчання",
      description: "Дослідження алгоритмів глибокого навчання та їх застосування",
    },
  ]);

  const [futureTopics, setFutureTopics] = useState<FutureTopic[]>([
    {
      id: "1",
      topic: "Квантові обчислення в AI",
      description: "Планую дослідити застосування квантових алгоритмів у машинному навчанні",
    },
  ]);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedInfo, setEditedInfo] = useState<TeacherInfo>(teacherInfo);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [newWork, setNewWork] = useState<Omit<Work, "id">>({
    title: "",
    type: "",
    year: "",
    description: "",
  });

  const [newDirection, setNewDirection] = useState<Omit<Direction, "id">>({
    area: "",
    description: "",
  });

  const [newTopic, setNewTopic] = useState<Omit<FutureTopic, "id">>({
    topic: "",
    description: "",
  });

  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);

  const handleSaveInfo = () => {
    setTeacherInfo(editedInfo);
    setIsEditingInfo(false);
    toast.success("Інформацію оновлено");
  };

  const handleAddWork = () => {
    if (newWork.title && newWork.type && newWork.year) {
      setWorks([...works, { ...newWork, id: Date.now().toString() }]);
      setNewWork({ title: "", type: "", year: "", description: "" });
      setWorkDialogOpen(false);
      toast.success("Працю додано");
    }
  };

  const handleAddDirection = () => {
    if (newDirection.area && newDirection.description) {
      setDirections([
        ...directions,
        { ...newDirection, id: Date.now().toString() },
      ]);
      setNewDirection({ area: "", description: "" });
      setDirectionDialogOpen(false);
      toast.success("Напрямок додано");
    }
  };

  const handleAddTopic = () => {
    if (newTopic.topic && newTopic.description) {
      setFutureTopics([
        ...futureTopics,
        { ...newTopic, id: Date.now().toString() },
      ]);
      setNewTopic({ topic: "", description: "" });
      setTopicDialogOpen(false);
      toast.success("Тему додано");
    }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case "work":
        setWorks(works.filter((w) => w.id !== itemToDelete.id));
        toast.success("Працю видалено");
        break;
      case "direction":
        setDirections(directions.filter((d) => d.id !== itemToDelete.id));
        toast.success("Напрямок видалено");
        break;
      case "topic":
        setFutureTopics(futureTopics.filter((t) => t.id !== itemToDelete.id));
        toast.success("Тему видалено");
        break;
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - показується тільки на великих екранах */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar + Overlay - показується на всіх екранах менше md */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar Panel */}
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
        {/* Header завжди присутній */}
        <Header />
        
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="min-h-screen bg-background">
              <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
                <div className="mb-10">
                  <h1 className="text-4xl font-bold mb-3 text-foreground">
                    Профіль викладача
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Керуйте своєю інформацією, працями та напрямками досліджень
                  </p>
                </div>

                {/* Personal Information */}
                <TeacherProfileCard
                  title="Особиста інформація"
                  onEdit={() => setIsEditingInfo(true)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ім'я</p>
                      <p className="text-lg font-semibold">{teacherInfo.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Посада</p>
                      <p className="text-lg font-semibold">{teacherInfo.title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Кафедра</p>
                      <p className="text-lg font-semibold">{teacherInfo.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-lg font-semibold text-primary">{teacherInfo.email}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Біографія</p>
                      <p className="text-base leading-relaxed">{teacherInfo.bio}</p>
                    </div>
                  </div>
                </TeacherProfileCard>

                {/* Works and Publications */}
                <TeacherProfileCard title="Праці та публікації">
                  <div className="space-y-4">
                    <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати працю
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати нову працю</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="work-title">Назва</Label>
                            <Input
                              id="work-title"
                              value={newWork.title}
                              onChange={(e) =>
                                setNewWork({ ...newWork, title: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="work-type">Тип роботи</Label>
                            <Input
                              id="work-type"
                              placeholder="Монографія, Стаття, Книга..."
                              value={newWork.type}
                              onChange={(e) =>
                                setNewWork({ ...newWork, type: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="work-year">Рік</Label>
                            <Input
                              id="work-year"
                              value={newWork.year}
                              onChange={(e) =>
                                setNewWork({ ...newWork, year: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="work-desc">Опис</Label>
                            <Textarea
                              id="work-desc"
                              value={newWork.description}
                              onChange={(e) =>
                                setNewWork({ ...newWork, description: e.target.value })
                              }
                            />
                          </div>
                          <DialogClose asChild>
                            <Button onClick={handleAddWork} className="w-full">
                              Зберегти
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {works.map((work) => (
                      <div
                        key={work.id}
                        className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{work.title}</h4>
                            <p className="text-sm font-medium text-primary/70 mb-2">
                              {work.type} • {work.year}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{work.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog("work", work.id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TeacherProfileCard>

                {/* Research Directions */}
                <TeacherProfileCard title="Напрямки наукової роботи">
                  <div className="space-y-4">
                    <Dialog open={directionDialogOpen} onOpenChange={setDirectionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати напрямок
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати науковий напрямок</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="dir-area">Область</Label>
                            <Input
                              id="dir-area"
                              value={newDirection.area}
                              onChange={(e) =>
                                setNewDirection({ ...newDirection, area: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dir-desc">Опис</Label>
                            <Textarea
                              id="dir-desc"
                              value={newDirection.description}
                              onChange={(e) =>
                                setNewDirection({
                                  ...newDirection,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <DialogClose asChild>
                            <Button onClick={handleAddDirection} className="w-full">
                              Зберегти
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {directions.map((direction) => (
                      <div
                        key={direction.id}
                        className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{direction.area}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {direction.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog("direction", direction.id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TeacherProfileCard>

                {/* Future Topics */}
                <TeacherProfileCard title="Теми для майбутніх досліджень">
                  <div className="space-y-4">
                    <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Додати тему
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Додати майбутню тему</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="topic-name">Тема</Label>
                            <Input
                              id="topic-name"
                              value={newTopic.topic}
                              onChange={(e) =>
                                setNewTopic({ ...newTopic, topic: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="topic-desc">Опис</Label>
                            <Textarea
                              id="topic-desc"
                              value={newTopic.description}
                              onChange={(e) =>
                                setNewTopic({
                                  ...newTopic,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <DialogClose asChild>
                            <Button onClick={handleAddTopic} className="w-full">
                              Зберегти
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {futureTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Lightbulb className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{topic.topic}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {topic.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog("topic", topic.id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TeacherProfileCard>

                {/* Edit Info Dialog */}
                <Dialog open={isEditingInfo} onOpenChange={setIsEditingInfo}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Редагувати особисту інформацію</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Ім'я</Label>
                        <Input
                          id="edit-name"
                          value={editedInfo.name}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Посада</Label>
                        <Input
                          id="edit-title"
                          value={editedInfo.title}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept">Кафедра</Label>
                        <Input
                          id="edit-dept"
                          value={editedInfo.department}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, department: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editedInfo.email}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-bio">Біографія</Label>
                        <Textarea
                          id="edit-bio"
                          value={editedInfo.bio}
                          onChange={(e) =>
                            setEditedInfo({ ...editedInfo, bio: e.target.value })
                          }
                        />
                      </div>
                      <DialogClose asChild>
                        <Button onClick={handleSaveInfo} className="w-full">
                          Зберегти зміни
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ця дія не може бути скасована. Це видалить елемент назавжди.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-6 rounded-md">Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="h-10 px-6 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}