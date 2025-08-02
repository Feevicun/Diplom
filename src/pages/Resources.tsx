import React from 'react';
import {
  FileText,
  BookOpenCheck,
  FileSignature,
  BookMarked,
  FileSearch,
  ShieldCheck
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const Resources = () => {
  const { t } = useTranslation();

  const resources = [
    {
      icon: FileText,
      title: t('resources.cards.templates.title'),
      description: t('resources.cards.templates.description'),
      action: t('resources.cards.templates.action')
    },
    {
      icon: BookOpenCheck,
      title: t('resources.cards.examples.title'),
      description: t('resources.cards.examples.description'),
      action: t('resources.cards.examples.action')
    },
    {
      icon: FileSignature,
      title: t('resources.cards.guidelines.title'),
      description: t('resources.cards.guidelines.description'),
      action: t('resources.cards.guidelines.action')
    },
    {
      icon: BookMarked,
      title: t('resources.cards.literature.title'),
      description: t('resources.cards.literature.description'),
      action: t('resources.cards.literature.action')
    },
    {
      icon: FileSearch,
      title: t('resources.cards.faq.title'),
      description: t('resources.cards.faq.description'),
      action: t('resources.cards.faq.action')
    },
    {
      icon: ShieldCheck,
      title: t('resources.cards.defense.title'),
      description: t('resources.cards.defense.description'),
      action: t('resources.cards.defense.action')
    }
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-6">{t('resources.title')}</h1>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map(({ icon: Icon, title, description, action }, idx) => (
              <Card
                key={idx}
                className="hover:shadow-lg transition-shadow duration-300 rounded-xl p-4"
              >
                <CardHeader className="p-0 mb-3 flex items-center gap-3">
                  <Icon className="text-primary" size={28} />
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 mt-3">
                  <Button variant="outline" className="w-full text-sm">
                          {action}
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Resources;
