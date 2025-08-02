import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  ListChecks,
  Star
} from 'lucide-react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isSameDay } from 'date-fns';

type Event = {
  id: string;
  title: string; // тут ключ для перекладу
  date: string;
  type: 'task' | 'meeting' | 'deadline';
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'calendar.mockEvents.meeting1', // ключ перекладу
    date: new Date().toISOString(),
    type: 'meeting'
  },
  {
    id: '2',
    title: 'calendar.mockEvents.deadline1', // ключ перекладу
    date: new Date().toISOString(),
    type: 'deadline'
  },
  {
    id: '3',
    title: 'calendar.mockEvents.task1', // ключ перекладу
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    type: 'task'
  }
];

const CalendarPage = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredEvents = mockEvents.filter(event =>
    isSameDay(new Date(event.date), selectedDate)
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="sticky top-0 z-10">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
            {/* Заголовок + кнопка додавання */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-blue-500 w-7 h-7" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{t('calendar.pageTitle')}</h1>
                  <p className="text-muted-foreground text-sm">{t('calendar.pageDescription')}</p>
                </div>
              </div>
              <Button className="px-4 py-2 shadow-md" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                {t('calendar.button.addEvent')}
              </Button>
            </div>

            {/* Календар + події */}
            <div className="grid md:grid-cols-2 gap-10">
              {/* Ліва колонка — Календар */}
              <div className="w-full">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>{t('calendar.card.calendarTitle')}</CardTitle>
                    <CardDescription>{t('calendar.card.calendarDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <Calendar
                        onChange={(date) => setSelectedDate(date as Date)}
                        value={selectedDate}
                        locale="uk-UA"
                        className="react-calendar w-full sm:w-[450px] lg:w-[520px] rounded-xl border border-border p-2 bg-white dark:bg-muted shadow-sm text-sm"
                        tileClassName={({ date }) => {
                          const isToday = isSameDay(date, new Date());
                          const isSelected = isSameDay(date, selectedDate);
                          return [
                            'py-2 rounded-lg transition-colors duration-200 text-center',
                            isToday && !isSelected ? 'bg-blue-100 text-blue-800 font-medium' : '',
                            isSelected ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700' : 'hover:bg-accent hover:text-accent-foreground'
                          ].join(' ');
                        }}
                        navigationLabel={({ date }) => (
                          <span className="text-base font-semibold">
                            {format(date, 'MMMM yyyy')}
                          </span>
                        )}
                        nextLabel={<span className="text-xl px-2">›</span>}
                        prevLabel={<span className="text-xl px-2">‹</span>}
                        next2Label={null}
                        prev2Label={null}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Права колонка — Події */}
              <div className="w-full">
                <Card className="h-full shadow-md">
                  <CardHeader>
                    <CardTitle>
                      {t('calendar.card.eventsTitle', {
                        date: format(selectedDate, 'dd MMMM yyyy')
                      })}
                    </CardTitle>
                    <CardDescription>
                      {filteredEvents.length === 0
                        ? t('calendar.card.noEvents')
                        : t('calendar.card.eventCount', { count: filteredEvents.length })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="border rounded-xl p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          {/* Використовуємо t() для перекладу заголовку */}
                          <h3 className="font-semibold text-base">{t(event.title)}</h3>
                          {/* Badge з перекладом */}
                          <Badge variant={
                            event.type === 'task' ? 'secondary' :
                            event.type === 'meeting' ? 'default' : 'destructive'
                          }>
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
            </div>

            {/* Функції календаря */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[Clock, ListChecks, Plus, Star].map((Icon, i) => {
                const titles = [
                  t('calendar.features.upcoming'),
                  t('calendar.features.tasks'),
                  t('calendar.features.addEvent'),
                  t('calendar.features.deadlines')
                ];
                const descs = [
                  t('calendar.features.upcomingDesc'),
                  t('calendar.features.tasksDesc'),
                  t('calendar.features.addEventDesc'),
                  t('calendar.features.deadlinesDesc')
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
