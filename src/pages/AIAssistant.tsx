import { useState } from 'react';
import {
  Zap,
  FileText,
  Lightbulb,
  Search,
  CheckCircle,
  Copy,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const AIAssistant = () => {
  const { t } = useTranslation();

  const [selectedTopic, setSelectedTopic] = useState('');
  const [generatedStructure, setGeneratedStructure] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const topicSuggestions = [
    {
      title: t('aiAssistant.suggestions.title1'),
      relevance: 92,
      category: t('aiAssistant.suggestions.category1'),
      description: t('aiAssistant.suggestions.description1')
    },
    {
      title: t('aiAssistant.suggestions.title2'),
      relevance: 87,
      category: t('aiAssistant.suggestions.category2'),
      description: t('aiAssistant.suggestions.description2')
    },
    {
      title: t('aiAssistant.suggestions.title3'),
      relevance: 84,
      category: t('aiAssistant.suggestions.category3'),
      description: t('aiAssistant.suggestions.description3')
    },
    {
      title: t('aiAssistant.suggestions.title4'),
      relevance: 89,
      category: t('aiAssistant.suggestions.category4'),
      description: t('aiAssistant.suggestions.description4')
    }
  ];

  const aiFeatures = [
    {
      icon: FileText,
      title: t('aiAssistant.features.structure.title'),
      description: t('aiAssistant.features.structure.description'),
      status: 'active'
    },
    {
      icon: Lightbulb,
      title: t('aiAssistant.features.topics.title'),
      description: t('aiAssistant.features.topics.description'),
      status: 'active'
    },
    {
      icon: Search,
      title: t('aiAssistant.features.plagiarism.title'),
      description: t('aiAssistant.features.plagiarism.description'),
      status: 'coming-soon'
    },
    {
      icon: CheckCircle,
      title: t('aiAssistant.features.analysis.title'),
      description: t('aiAssistant.features.analysis.description'),
      status: 'coming-soon'
    }
  ];

  const handleGenerateStructure = () => {
    if (!selectedTopic.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedStructure(t('aiAssistant.structure.generatedText'));
      setIsGenerating(false);
    }, 2000);
  };

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
          <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="text-purple-500 w-7 h-7" />
                {t('aiAssistant.title')}
              </h1>
              <p className="text-muted-foreground">{t('aiAssistant.description')}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Card key={i} className="hover:shadow transition">
                    <CardHeader className="flex items-start justify-between pb-2">
                      <Icon className="w-5 h-5 text-purple-500" />
                      <Badge variant={feature.status === 'active' ? 'default' : 'outline'}>
                        {feature.status === 'active' ? t('aiAssistant.status.active') : t('aiAssistant.status.comingSoon')}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="suggestions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions">{t('aiAssistant.tabs.suggestions')}</TabsTrigger>
                <TabsTrigger value="structure">{t('aiAssistant.tabs.structure')}</TabsTrigger>
                <TabsTrigger value="analysis">{t('aiAssistant.tabs.analysis')}</TabsTrigger>
              </TabsList>

              {/* Suggestions */}
              <TabsContent value="suggestions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="text-yellow-500 w-5 h-5" />
                      {t('aiAssistant.suggestions.title')}
                    </CardTitle>
                    <CardDescription>{t('aiAssistant.suggestions.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topicSuggestions.map((topic, i) => (
                      <div
                        key={i}
                        className="border rounded-xl p-4 hover:shadow-md transition space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{topic.title}</h3>
                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">{topic.relevance}%</div>
                            <p className="text-xs text-muted-foreground">{t('aiAssistant.suggestions.relevance')}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <Badge variant="outline">{topic.category}</Badge>
                          <Button size="sm">{t('aiAssistant.suggestions.choose')}</Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Structure */}
              <TabsContent value="structure" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-blue-500 w-5 h-5" />
                      {t('aiAssistant.structure.title')}
                    </CardTitle>
                    <CardDescription>{t('aiAssistant.structure.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder={t('aiAssistant.structure.placeholder')}
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                    />
                    <Button
                      onClick={handleGenerateStructure}
                      disabled={!selectedTopic.trim() || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                          {t('aiAssistant.structure.generating')}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {t('aiAssistant.structure.generate')}
                        </>
                      )}
                    </Button>

                    {generatedStructure && (
                      <Card className="bg-muted/20">
                        <CardHeader className="flex justify-between items-center">
                          <CardTitle className="text-base">{t('aiAssistant.structure.resultTitle')}</CardTitle>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-1" />
                            {t('aiAssistant.structure.copy')}
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                            {generatedStructure}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis */}
              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <Search className="text-orange-500 w-5 h-5" />
                      {t('aiAssistant.analysis.title')}
                    </CardTitle>
                    <CardDescription>{t('aiAssistant.analysis.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder={t('aiAssistant.analysis.textareaPlaceholder')} className="min-h-[200px]" />
                    <div className="flex gap-3">
                      <Button disabled className="flex-1">
                        <Search className="w-4 h-4 mr-2" />
                        {t('aiAssistant.analysis.plagiarism')}
                      </Button>
                      <Button disabled variant="outline" className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('aiAssistant.analysis.quality')}
                      </Button>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-sm text-yellow-700">
                        {t('aiAssistant.analysis.comingSoonNote')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAssistant;
