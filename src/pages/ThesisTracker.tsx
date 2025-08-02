import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, Download, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const chapters = [
  { id: 1, key: 'intro', progress: 100, status: 'completed' },
  { id: 2, key: 'theory', progress: 85, status: 'review' },
  { id: 3, key: 'design', progress: 50, status: 'inProgress' },
  { id: 4, key: 'implementation', progress: 30, status: 'inProgress' },
  { id: 5, key: 'conclusion', progress: 20, status: 'inProgress' },
  { id: 6, key: 'appendix', progress: 0, status: 'pending' },
  { id: 7, key: 'sources', progress: 75, status: 'review' },
  { id: 8, key: 'abstract', progress: 10, status: 'inProgress' },
  { id: 9, key: 'cover', progress: 100, status: 'completed' },
  { id: 10, key: 'content', progress: 100, status: 'completed' }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-[var(--primary)]" />;
    case 'review':
      return <Clock className="w-4 h-4 text-[var(--secondary)]" />;
    case 'inProgress':
      return <FileText className="w-4 h-4 text-[var(--accent)]" />;
    default:
      return <AlertCircle className="w-4 h-4 text-[var(--muted-foreground)]" />;
  }
};

const ThesisTracker = () => {
  const { t } = useTranslation();

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
          <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 pb-20">
            {/* Основна карточка з інформацією про роботу */}
            <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  {t('thesis.cardTitle')}
                </CardTitle>
                <CardDescription className="text-sm text-[var(--muted-foreground)] mt-1">
                  {t('thesis.supervisor')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{t('thesis.startDate')}:</span> 01.09.2024
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">{t('thesis.deadline')}:</span> 15.01.2025
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--primary)]">65%</div>
                    <p className="text-sm text-[var(--muted-foreground)]">{t('thesis.progress')}</p>
                  </div>
                </div>
                <Progress value={65} className="h-2 bg-[var(--muted)]" />
                <div className="flex gap-3 flex-wrap">
                  <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('index.chatWithSupervisor')}
                  </Button>
                  <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('index.planner')}
                  </Button>
                  <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]">
                    <Download className="w-4 h-4 mr-2" />
                    {t('thesis.export')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Карточка прогресу по главах */}
            <Card className="bg-[var(--card)] text-[var(--card-foreground)]">
              <CardHeader>
                <CardTitle>{t('index.projectProgress')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="border-b border-[var(--border)] pb-4 last:border-none last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(chapter.status)}
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {t(`thesis.chapters.${chapter.key}`)}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {t(`thesis.chapterDescriptions.${chapter.key}`)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-[var(--muted-foreground)]">{chapter.progress}%</span>
                    </div>
                    <Progress value={chapter.progress} className="h-2 mt-2 bg-[var(--muted)]" />
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]">
                        <FileText className="w-4 h-4 mr-1" />
                        {t('thesis.actions.file')}
                      </Button>
                      {chapter.status === 'inProgress' && (
                        <Button size="sm" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)]">
                          {t('thesis.actions.sendForReview')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThesisTracker;
