import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  ListChecks,
  Edit3,
  Trash2,
  Link as LinkIcon,
  MapPin,
  FileText,
} from 'lucide-react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

type EventType = 'task' | 'meeting' | 'deadline';

interface Event {
  id: string;
  title: string;
  date: string;
  type: EventType;
  time?: string;
  location?: string;
  link?: string;
  description?: string;
}

interface CurrentUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date().toISOString(),
    type: 'task',
    time: '09:00',
    location: '',
    link: '',
    description: '',
  });

  const [user, setUser] = useState<CurrentUser | null>(null);
  const lastEventRef = useRef<HTMLDivElement | null>(null);

  const currentLocale = i18n.language === 'ua' ? uk : enUS;
  const calendarLocale = i18n.language === 'ua' ? 'uk-UA' : 'en-US';
  const token = localStorage.getItem('token');

  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/current-user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    }
  };

  const fetchEvents = async (email: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/events?userEmail=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data: Event[] = await res.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchEvents(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (showModal && !editingEvent) {
      setNewEvent({
        title: '',
        date: selectedDate.toISOString(),
        type: 'task',
        time: '09:00',
        location: '',
        link: '',
        description: '',
      });
    }
  }, [showModal, editingEvent, selectedDate]);

  const handleAddEvent = async () => {
    if (!user?.email || !token) return;

    try {
      const eventDateTime = new Date(selectedDate);
      const [hours, minutes] = newEvent.time?.split(':').map(Number) || [9, 0];
      eventDateTime.setHours(hours, minutes, 0, 0);

      const eventData = {
        title: newEvent.title || t('calendar.mockEvents.newEvent'),
        date: eventDateTime.toISOString(),
        type: newEvent.type,
        time: newEvent.time,
        location: newEvent.location,
        link: newEvent.link,
        description: newEvent.description,
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        const { event } = await res.json();
        setEvents((prev) => [...prev, event]);
        setShowModal(false);
        toast.success('Подію успішно додано');
      } else {
        console.error('Failed to create event');
        toast.error('Помилка при додаванні події');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Помилка при додаванні події');
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !token) return;

    try {
      const eventDateTime = new Date(selectedDate);
      const [hours, minutes] = newEvent.time?.split(':').map(Number) || [9, 0];
      eventDateTime.setHours(hours, minutes, 0, 0);

      const eventData = {
        title: newEvent.title,
        date: eventDateTime.toISOString(),
        type: newEvent.type,
        time: newEvent.time,
        location: newEvent.location,
        link: newEvent.link,
        description: newEvent.description,
      };

      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        const { event } = await res.json();
        setEvents((prev) => prev.map(e => e.id === editingEvent.id ? event : e));
        setEditingEvent(null);
        setShowModal(false);
        toast.success('Подію успішно оновлено');
      } else {
        console.error('Failed to update event');
        toast.error('Помилка при оновленні події');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Помилка при оновленні події');
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !token) return;

    setDeletingEventId(eventToDelete);
    
    try {
      const res = await fetch(`/api/events/${eventToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Додаємо затримку для анімації
        setTimeout(() => {
          setEvents((prev) => prev.filter(event => event.id !== eventToDelete));
          setDeletingEventId(null);
          setDeleteDialogOpen(false);
          setEventToDelete(null);
          toast.success('Подію успішно видалено');
        }, 300);
      } else {
        console.error('Failed to delete event');
        setDeletingEventId(null);
        toast.error('Помилка при видаленні події');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setDeletingEventId(null);
      toast.error('Помилка при видаленні події');
    }
  };

  const startEditing = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      type: event.type,
      time: event.time || '09:00',
      location: event.location || '',
      link: event.link || '',
      description: event.description || '',
    });
    setShowModal(true);
  };

  const startDeleting = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const filteredEvents = events.filter(event =>
    isSameDay(new Date(event.date), selectedDate)
  );

  useEffect(() => {
    if (filteredEvents.length >= 1 && lastEventRef.current) {
      lastEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [filteredEvents.length]);

  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const getUkrainianEventWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return 'подія';
    } else if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
      return 'події';
    } else {
      return 'подій';
    }
  };

  const getEventCountText = (count: number): string => {
    if (i18n.language === 'ua') {
      return `${count} ${getUkrainianEventWord(count)}`;
    } else {
      return count === 1 ? `${count} event` : `${count} events`;
    }
  };

  const formatEventTime = (event: Event) => {
    if (event.time) {
      return event.time;
    }
    return format(new Date(event.date), 'HH:mm');
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'meeting':
        return 'bg-green-100 text-green-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'task':
        return ListChecks;
      case 'meeting':
        return Clock;
      case 'deadline':
        return FileText;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-blue-500 w-7 h-7" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('calendar.pageTitle')}</h1>
                  <p className="text-muted-foreground text-sm">{t('calendar.pageDescription')}</p>
                </div>
              </div>
              <Button onClick={() => setShowModal(true)} className="px-4 py-2 shadow-md" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                {t('calendar.button.addEvent')}
              </Button>
            </div>

            {/* Модальне вікно для додавання/редагування події */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editingEvent ? 'Редагувати подію' : 'Додати нову подію'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Назва події *</Label>
                    <Input
                      id="event-title"
                      placeholder="Введіть назву події"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Тип події</Label>
                      <select
                        id="event-type"
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="task">Завдання</option>
                        <option value="meeting">Зустріч</option>
                        <option value="deadline">Дедлайн</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-time">Час</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-location">Місце проведення</Label>
                    <Input
                      id="event-location"
                      placeholder="Аудиторія, адреса..."
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-link">Посилання (для онлайн зустрічей)</Label>
                    <Input
                      id="event-link"
                      placeholder="https://meet.google.com/..."
                      value={newEvent.link}
                      onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Опис</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Додаткові деталі..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setShowModal(false);
                        setEditingEvent(null);
                      }}
                    >
                      Скасувати
                    </Button>
                    <Button 
                      onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                      disabled={!newEvent.title.trim()}
                    >
                      {editingEvent ? 'Оновити' : 'Додати'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Діалог підтвердження видалення */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent className="max-w-sm">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mb-3">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <AlertDialogTitle className="text-lg font-semibold mb-2">
                    Видалити подію?
                  </AlertDialogTitle>
                  
                  <AlertDialogDescription className="text-muted-foreground text-sm mb-4">
                    Ця дія незворотня. Підтвердіть видалення.
                  </AlertDialogDescription>

                  <div className="flex gap-2 w-full">
                    <AlertDialogCancel className="flex-1 h-9 text-sm">
                      Скасувати
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteEvent}
                      className="flex-1 h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Видалити
                    </AlertDialogAction>
                  </div>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Календар - завжди світлий */}
              <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
                <CardHeader>
                  <CardTitle>{t('calendar.card.calendarTitle')}</CardTitle>
                  <CardDescription>{t('calendar.card.calendarDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    locale={calendarLocale}
                    className="react-calendar w-full sm:w-[450px] lg:w-[520px] rounded-xl border border-border p-2 bg-white shadow-sm text-sm"
                    tileClassName={({ date }) => {
                      const isToday = isSameDay(date, new Date());
                      const isSelected = isSameDay(date, selectedDate);
                      const hasEvents = events.some(event => isSameDay(new Date(event.date), date));
                      
                      return [
                        'py-2 rounded-lg transition-colors duration-200 text-center',
                        isToday && !isSelected ? 'bg-blue-100 text-blue-800 font-medium' : '',
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                          : 'hover:bg-gray-100 hover:text-gray-900',
                        hasEvents && !isSelected 
                          ? 'after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full' 
                          : '',
                      ].join(' ');
                    }}
                    navigationLabel={({ date }) => (
                      <span className="text-base font-semibold text-gray-900">
                        {format(date, 'LLLL yyyy', { locale: currentLocale })}
                      </span>
                    )}
                    nextLabel={<span className="text-xl px-2 text-gray-600 hover:text-gray-900">›</span>}
                    prevLabel={<span className="text-xl px-2 text-gray-600 hover:text-gray-900">‹</span>}
                    next2Label={null}
                    prev2Label={null}
                  />
                </CardContent>
              </Card>

              {/* Події - адаптуються до теми */}
              <Card className="bg-[var(--card)] text-[var(--card-foreground)] h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {t('calendar.card.eventsTitle', {
                      date: format(selectedDate, 'dd MMMM yyyy', { locale: currentLocale }),
                    })}
                  </CardTitle>
                  <CardDescription>
                    {filteredEvents.length === 0
                      ? t('calendar.card.noEvents')
                      : getEventCountText(filteredEvents.length)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 overflow-y-auto scroll-smooth flex-1">
                  {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Немає подій на цей день
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                        На {format(selectedDate, 'dd MMMM yyyy', { locale: currentLocale })} не заплановано жодних подій.
                        Додайте першу подію, щоб почати планування.
                      </p>
                      <Button onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Додати подію
                      </Button>
                    </div>
                  ) : (
                    filteredEvents.map((event, index) => {
                      const EventIcon = getEventTypeIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          className={`border rounded-xl p-4 space-y-2 group relative bg-card dark:bg-card dark:border-border transition-all duration-300 ${
                            deletingEventId === event.id 
                              ? 'opacity-0 scale-95 -translate-y-2' 
                              : 'opacity-100 scale-100 translate-y-0'
                          }`}
                          ref={index === filteredEvents.length - 1 ? lastEventRef : null}
                        >
                          {/* Кнопки редагування та видалення */}
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                              onClick={() => startEditing(event)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => startDeleting(event.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getEventTypeColor(event.type)}`}>
                                <EventIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base pr-8 dark:text-foreground truncate">
                                  {event.title}
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground mt-1 dark:text-muted-foreground">
                                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span>{formatEventTime(event)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                event.type === 'task'
                                  ? 'secondary'
                                  : event.type === 'meeting'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className="flex-shrink-0"
                            >
                              {t(`calendar.eventTypes.${event.type}`)}
                            </Badge>
                          </div>

                          {event.location && (
                            <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {event.link && (
                            <div className="flex items-center text-sm">
                              <LinkIcon className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0" />
                              <a 
                                href={event.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline truncate"
                              >
                                Приєднатися до зустрічі
                              </a>
                            </div>
                          )}

                          {event.description && (
                            <p className="text-sm text-muted-foreground pt-2 border-t dark:text-muted-foreground dark:border-border line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[Clock, ListChecks, Plus, FileText].map((Icon, i) => {
                const titles = [
                  t('calendar.features.upcoming'),
                  t('calendar.features.tasks'),
                  t('calendar.features.addEvent'),
                  t('calendar.features.deadlines'),
                ];
                const descs = [
                  t('calendar.features.upcomingDesc'),
                  t('calendar.features.tasksDesc'),
                  t('calendar.features.addEventDesc'),
                  t('calendar.features.deadlinesDesc'),
                ];
                return (
                  <Card key={i} className="shadow-sm">
                    <CardHeader className="flex items-start justify-between">
                      <Icon className="text-blue-500 w-5 h-5" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-base">{titles[i]}</CardTitle>
                      <CardDescription>{descs[i]}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;