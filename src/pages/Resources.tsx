import {
    FileText,
  BookOpenCheck,
  FileSignature,
  BookMarked,
  FileSearch,
  ShieldCheck,
  Bookmark,
  BookmarkMinus,
  // Додати ці іконки:
  FileCheck,
  Scale,
  Library,
  Globe,
  Search,
  BookOpen,
  PenTool,
  Quote,
  Target,
  ShieldAlert,
  CheckCircle,
  Code,
  BarChart,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  Play
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
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Resources = () => {
  const { t } = useTranslation();

const allResources = [
  {
    id: 'templates',
    icon: FileText,
    title: t('resources.cards.templates.title'),
    description: t('resources.cards.templates.description'),
    action: t('resources.cards.templates.action'),
    link: 'http://kiis.khmnu.edu.ua/wp-content/uploads/sites/31/metodychni-vkaziky-kr-ist.pdf'
  },
  {
    id: 'examples',
    icon: BookOpenCheck,
    title: t('resources.cards.examples.title'),
    description: t('resources.cards.examples.description'),
    action: t('resources.cards.examples.action'),
    link: 'https://kursovye-raboty.kiev.ua/priklad-zrazok-kursovoyi-roboti/?srsltid=AfmBOooJXsIdXE3DGYzBZCZym3rdjWU-dc9egVDltOBWTTgLJXcPPWJp'
  },
  {
    id: 'guidelines',
    icon: FileSignature,
    title: t('resources.cards.guidelines.title'),
    description: t('resources.cards.guidelines.description'),
    action: t('resources.cards.guidelines.action'),
    link: 'https://electronics.lnu.edu.ua/wp-content/uploads/OK_25_dypl_2023.pdf'
  },
  {
    id: 'literature',
    icon: BookMarked,
    title: t('resources.cards.literature.title'),
    description: t('resources.cards.literature.description'),
    action: t('resources.cards.literature.action'),
    link: 'https://zulu-help.com/yak-znajti-spisok-literaturi-dlya-kursovoyi-roboti/#header-23'
  },
  {
    id: 'faq',
    icon: FileSearch,
    title: t('resources.cards.faq.title'),
    description: t('resources.cards.faq.description'),
    action: t('resources.cards.faq.action'),
    link: 'https://www.youtube.com/watch?v=0OC5rmSBJLk'
  },
  {
    id: 'defense',
    icon: ShieldCheck,
    title: t('resources.cards.defense.title'),
    description: t('resources.cards.defense.description'),
    action: t('resources.cards.defense.action'),
    link: 'https://www.youtube.com/watch?v=HA8bWBnXXv0'
  },
  {
    id: 'state-standards',
    icon: FileCheck,
    title: t('resources.cards.state-standards.title'),
    description: t('resources.cards.state-standards.description'),
    action: t('resources.cards.state-standards.action'),
    link: 'https://nus.org.ua/articles/derzhavni-standarty-ukrayiny/'
  },
  {
    id: 'mon-regulations',
    icon: Scale,
    title: t('resources.cards.mon-regulations.title'),
    description: t('resources.cards.mon-regulations.description'),
    action: t('resources.cards.mon-regulations.action'),
    link: 'https://mon.gov.ua/ua/osvita/visha-osvita/licenzuvannya-ta-akreditaciya'
  },
  {
    id: 'scientific-library',
    icon: Library,
    title: t('resources.cards.scientific-library.title'),
    description: t('resources.cards.scientific-library.description'),
    action: t('resources.cards.scientific-library.action'),
    link: 'http://library.khmnu.edu.ua/'
  },
  {
    id: 'nbuv',
    icon: Globe,
    title: t('resources.cards.nbuv.title'),
    description: t('resources.cards.nbuv.description'),
    action: t('resources.cards.nbuv.action'),
    link: 'http://www.nbuv.gov.ua/'
  },
  {
    id: 'google-scholar',
    icon: Search,
    title: t('resources.cards.google-scholar.title'),
    description: t('resources.cards.google-scholar.description'),
    action: t('resources.cards.google-scholar.action'),
    link: 'https://scholar.google.com.ua/'
  },
  {
    id: 'cyberleninka',
    icon: BookOpen,
    title: t('resources.cards.cyberleninka.title'),
    description: t('resources.cards.cyberleninka.description'),
    action: t('resources.cards.cyberleninka.action'),
    link: 'https://cyberleninka.ru/'
  },
  {
    id: 'writing-guide',
    icon: PenTool,
    title: t('resources.cards.writing-guide.title'),
    description: t('resources.cards.writing-guide.description'),
    action: t('resources.cards.writing-guide.action'),
    link: 'https://vseosvita.ua/library/metodicni-rekomendacii-sodo-napisanna-kursovoi-roboti-151578.html'
  },
  {
    id: 'citation-styles',
    icon: Quote,
    title: t('resources.cards.citation-styles.title'),
    description: t('resources.cards.citation-styles.description'),
    action: t('resources.cards.citation-styles.action'),
    link: 'https://guides.library.oregonstate.edu/c.php?g=286121&p=1906617'
  },
  {
    id: 'research-methods',
    icon: Target,
    title: t('resources.cards.research-methods.title'),
    description: t('resources.cards.research-methods.description'),
    action: t('resources.cards.research-methods.action'),
    link: 'https://pidruchniki.com/1584072065557/psihologiya/metodi_doslidzhennya'
  },
  {
    id: 'antiplagiat',
    icon: ShieldAlert,
    title: t('resources.cards.antiplagiat.title'),
    description: t('resources.cards.antiplagiat.description'),
    action: t('resources.cards.antiplagiat.action'),
    link: 'https://www.antiplagiat.ru/'
  },
  {
    id: 'grammar-check',
    icon: CheckCircle,
    title: t('resources.cards.grammar-check.title'),
    description: t('resources.cards.grammar-check.description'),
    action: t('resources.cards.grammar-check.action'),
    link: 'https://languagetool.org/uk'
  },
  {
    id: 'latex-templates',
    icon: Code,
    title: t('resources.cards.latex-templates.title'),
    description: t('resources.cards.latex-templates.description'),
    action: t('resources.cards.latex-templates.action'),
    link: 'https://www.overleaf.com/latex/templates'
  },
  {
    id: 'mendeley',
    icon: Bookmark,
    title: t('resources.cards.mendeley.title'),
    description: t('resources.cards.mendeley.description'),
    action: t('resources.cards.mendeley.action'),
    link: 'https://www.mendeley.com/'
  },
  {
    id: 'ukrstat',
    icon: BarChart,
    title: t('resources.cards.ukrstat.title'),
    description: t('resources.cards.ukrstat.description'),
    action: t('resources.cards.ukrstat.action'),
    link: 'http://www.ukrstat.gov.ua/'
  },
  {
    id: 'world-bank',
    icon: TrendingUp,
    title: t('resources.cards.world-bank.title'),
    description: t('resources.cards.world-bank.description'),
    action: t('resources.cards.world-bank.action'),
    link: 'https://data.worldbank.org/'
  },
  {
    id: 'internship-guide',
    icon: Users,
    title: t('resources.cards.internship-guide.title'),
    description: t('resources.cards.internship-guide.description'),
    action: t('resources.cards.internship-guide.action'),
    link: 'https://www.osvita.ua/vnz/guide/search/practice/'
  },
  {
    id: 'job-portals',
    icon: Briefcase,
    title: t('resources.cards.job-portals.title'),
    description: t('resources.cards.job-portals.description'),
    action: t('resources.cards.job-portals.action'),
    link: 'https://www.work.ua/'
  },
  {
    id: 'coursera-ukraine',
    icon: GraduationCap,
    title: t('resources.cards.coursera-ukraine.title'),
    description: t('resources.cards.coursera-ukraine.description'),
    action: t('resources.cards.coursera-ukraine.action'),
    link: 'https://www.coursera.org/ukraine'
  },
  {
    id: 'ted-talks',
    icon: Play,
    title: t('resources.cards.ted-talks.title'),
    description: t('resources.cards.ted-talks.description'),
    action: t('resources.cards.ted-talks.action'),
    link: 'https://www.ted.com/talks?language=uk'
  }
];


  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('favoriteResources');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteResources', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filteredResources = allResources.filter(res => {
    const matchesSearch =
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.description.toLowerCase().includes(search.toLowerCase());

    const isFavorite = favorites.includes(res.id);

    return matchesSearch && (!showOnlyFavorites || isFavorite);
  });

  return (
    <div className="min-h-screen bg-[var(--background)] flex text-[var(--foreground)]">
      <div className="hidden md:block sticky top-0 h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">{t('resources.title')}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Input
              placeholder={t('resources.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Button
              variant={showOnlyFavorites ? 'default' : 'outline'}
              onClick={() => setShowOnlyFavorites(prev => !prev)}
              className="sm:ml-auto"
            >
              {showOnlyFavorites ? 'Показати всі' : 'Тільки обране'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map(({ id, icon: Icon, title, description, action, link }) => (
              <Card
                key={id}
                className="hover:shadow-lg transition-shadow duration-300 rounded-xl p-4 flex flex-col h-full"
              >
                <CardHeader className="p-0 mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon className="text-primary flex-shrink-0" size={18} />
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(id)}
                    className="text-primary hover:opacity-80 mt-1 flex-shrink-0"
                    title={favorites.includes(id) ? 'Видалити з обраного' : 'Додати в обране'}
                  >
                    {favorites.includes(id) ? (
                      <Bookmark size={18} fill="currentColor" />
                    ) : (
                      <BookmarkMinus size={18} />
                    )}
                  </button>
                </CardHeader>
                <CardContent className="p-0 mt-auto">
                  {link.startsWith('http') ? (
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => window.open(link, '_blank')}
                    >
                      {action}
                    </Button>
                  ) : (
                    <Link to={link}>
                      <Button variant="outline" className="w-full text-sm">
                        {action}
                      </Button>
                    </Link>
                  )}
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