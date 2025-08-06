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
  Star,
  X,
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
import { format, isSameDay } from 'date-fns';
import { uk, enUS } from 'date-fns/locale'; // Імпорт локалей для date-fns

type EventType = 'task' | 'meeting' | 'deadline';

interface Event {
  id: string;
  title: string;
  date: string; // ISO string
  type: EventType;
}

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EventType>('task');

  const lastEventRef = useRef<HTMLDivElement | null>(null);

  // Визначення поточної локалі на основі мови i18n
  const currentLocale = i18n.language === 'ua' ? uk : enUS;
  const calendarLocale = i18n.language === 'ua' ? 'uk-UA' : 'en-US';

  // Функція для правильного відмінювання слова "подія" в українській мові
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

  // Функція для правильного відображення кількості подій
  const getEventCountText = (count: number): string => {
    if (i18n.language === 'ua') {
      return `${count} ${getUkrainianEventWord(count)}`;
    } else {
      // Для англійської мови
      return count === 1 ? `${count} event` : `${count} events`;
    }
  };

  const handleAddEvent = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: newTitle || t('calendar.mockEvents.newEvent'),
      date: selectedDate.toISOString(),
      type: newType,
    };
    setEvents([...events, newEvent]);
    setNewTitle('');
    setNewType('task');
    setShowModal(false);
  };

  const filteredEvents = events.filter(event =>
    isSameDay(new Date(event.date), selectedDate)
  );

  useEffect(() => {
    if (filteredEvents.length >= 1 && lastEventRef.current) {
      lastEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [filteredEvents.length]);

  // Правильний тип для onChange календаря
  const handleDateChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex text-[var(--foreground)]">
      <div className="hidden md:block sticky top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
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

            {showModal && (
              <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-background rounded-xl p-6 w-[90%] max-w-md shadow-lg space-y-4 relative">
                  <button
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold">{t('calendar.dialog.title')}</h2>
                  <Input
                    placeholder={t('calendar.dialog.placeholder')}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <div>
                    <label className="text-sm mb-1 block">{t('calendar.dialog.selectType')}</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as EventType)}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="task">{t('calendar.eventTypes.task')}</option>
                      <option value="meeting">{t('calendar.eventTypes.meeting')}</option>
                      <option value="deadline">{t('calendar.eventTypes.deadline')}</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                      {t('calendar.dialog.cancel')}
                    </Button>
                    <Button onClick={handleAddEvent}>
                      {t('calendar.dialog.save')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-10">
              <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
                <CardHeader>
                  <CardTitle>{t('calendar.card.calendarTitle')}</CardTitle>
                  <CardDescription>{t('calendar.card.calendarDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    locale={calendarLocale} // Динамічна локаль
                    className="react-calendar w-full sm:w-[450px] lg:w-[520px] rounded-xl border border-border p-2 bg-white dark:bg-muted shadow-sm text-sm"
                    tileClassName={({ date }) => {
                      const isToday = isSameDay(date, new Date());
                      const isSelected = isSameDay(date, selectedDate);
                      return [
                        'py-2 rounded-lg transition-colors duration-200 text-center',
                        isToday && !isSelected ? 'bg-blue-100 text-blue-800 font-medium' : '',
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                          : 'hover:bg-accent hover:text-accent-foreground',
                      ].join(' ');
                    }}
                    navigationLabel={({ date }) => (
                      // Використовуємо динамічну локаль для назви місяця
                      <span className="text-base font-semibold">
                        {format(date, 'LLLL yyyy', { locale: currentLocale })}
                      </span>
                    )}
                    nextLabel={<span className="text-xl px-2">›</span>}
                    prevLabel={<span className="text-xl px-2">‹</span>}
                    next2Label={null}
                    prev2Label={null}
                  />
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)] text-[var(--card-foreground)] h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {t('calendar.card.eventsTitle', {
                      // Використовуємо динамічну локаль для форматування дати
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
                  {filteredEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="border rounded-xl p-4 space-y-1"
                      ref={index === filteredEvents.length - 1 ? lastEventRef : null}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base">{event.title}</h3>
                        <Badge
                          variant={
                            event.type === 'task'
                              ? 'secondary'
                              : event.type === 'meeting'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {t(`calendar.eventTypes.${event.type}`)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {format(new Date(event.date), 'HH:mm')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[Clock, ListChecks, Plus, Star].map((Icon, i) => {
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
                      {i === 3 && <Badge variant="outline">{t('calendar.badge.comingSoon')}</Badge>}
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