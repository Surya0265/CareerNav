import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Brain,
  Headphones,
  Newspaper,
  Bookmark,
  BookmarkCheck,
  Play,
  Clock,
  TrendingUp,
  Users,
  ExternalLink,
  Search,
  Filter,
  Menu,
  LogOut,
  Target,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from './shared/BackButton';

interface PodcastsNewsProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSaveItem: (item: any) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export function PodcastsNews({ user, onNavigate, onLogout, onSaveItem, onBack, canGoBack = false }: PodcastsNewsProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const showBackButton = Boolean(onBack && canGoBack);

  const podcasts = [
    {
      id: 1,
      title: 'The Future of Frontend Development',
      show: 'CodeCast Weekly',
      host: 'Sarah Chen',
      duration: '45 min',
      publishDate: '2 days ago',
      description: 'Exploring emerging trends in React, Vue, and the next generation of frontend frameworks. Discussion on Web3, AI integration, and developer tooling.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
      category: 'Frontend',
      listeners: '12.5K',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Career Transitions in Tech',
      show: 'Tech Career Stories',
      host: 'Marcus Rodriguez',
      duration: '38 min',
      publishDate: '1 week ago',
      description: 'Interview with professionals who successfully transitioned from other fields into software development. Tips, challenges, and success strategies.',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
      category: 'Career',
      listeners: '8.2K',
      rating: 4.6
    },
    {
      id: 3,
      title: 'Docker & DevOps Best Practices',
      show: 'Cloud Native Show',
      host: 'Alex Kim',
      duration: '52 min',
      publishDate: '3 days ago',
      description: 'Deep dive into containerization strategies, CI/CD pipelines, and modern deployment practices for scalable applications.',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop',
      category: 'DevOps',
      listeners: '15.7K',
      rating: 4.9
    },
    {
      id: 4,
      title: 'Remote Work & Team Collaboration',
      show: 'Digital Nomad Dev',
      host: 'Lisa Thompson',
      duration: '41 min',
      publishDate: '5 days ago',
      description: 'Strategies for effective remote work, maintaining team culture, and tools that enhance distributed team productivity.',
      thumbnail: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop',
      category: 'Career',
      listeners: '9.8K',
      rating: 4.7
    }
  ];

  const newsArticles = [
    {
      id: 1,
      title: 'Top 10 Programming Skills in Highest Demand for 2025',
      source: 'TechCrunch',
      author: 'Jennifer Liu',
      publishDate: '6 hours ago',
      readTime: '5 min read',
      description: 'Analysis of job market data reveals which programming languages and frameworks are seeing the highest growth in job postings.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
      category: 'Trends',
      views: '24.8K'
    },
    {
      id: 2,
      title: 'Salary Report: Frontend Developer Compensation Trends',
      source: 'Stack Overflow',
      author: 'David Park',
      publishDate: '2 days ago',
      readTime: '8 min read',
      description: 'Comprehensive breakdown of frontend developer salaries across different regions, experience levels, and technology stacks.',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      category: 'Salary',
      views: '18.2K'
    },
    {
      id: 3,
      title: 'Remote Work Revolution: How Tech Companies Are Adapting',
      source: 'Wired',
      author: 'Rachel Kim',
      publishDate: '1 day ago',
      readTime: '6 min read',
      description: 'Major tech companies share their strategies for maintaining productivity and culture in distributed work environments.',
      thumbnail: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop',
      category: 'Workplace',
      views: '31.5K'
    },
    {
      id: 4,
      title: 'AI Tools Every Developer Should Know in 2025',
      source: 'Dev.to',
      author: 'Michael Chen',
      publishDate: '4 days ago',
      readTime: '7 min read',
      description: 'Curated list of AI-powered development tools that are transforming how we write, test, and deploy code.',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
      category: 'Tools',
      views: '42.1K'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', count: podcasts.length + newsArticles.length },
    { id: 'frontend', label: 'Frontend', count: 3 },
    { id: 'career', label: 'Career', count: 4 },
    { id: 'devops', label: 'DevOps', count: 2 },
    { id: 'trends', label: 'Trends', count: 3 },
    { id: 'salary', label: 'Salary', count: 2 }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'resume', label: 'Resume Analysis', icon: Users },
    { id: 'skills', label: 'My Skills', icon: Award },
    { id: 'recommendations', label: 'Job Recommendations', icon: Target },
    { id: 'podcasts', label: 'Podcasts & News', icon: Headphones, active: true },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
  ];

  const handleSavePodcast = (podcast: any) => {
    if (savedItems.includes(podcast.id)) {
      setSavedItems(prev => prev.filter(id => id !== podcast.id));
      toast.success('Removed from bookmarks');
    } else {
      setSavedItems(prev => [...prev, podcast.id]);
      onSaveItem({ ...podcast, type: 'podcast' });
      toast.success('Podcast saved to bookmarks');
    }
  };

  const handleSaveArticle = (article: any) => {
    if (savedItems.includes(article.id + 1000)) {
      setSavedItems(prev => prev.filter(id => id !== article.id + 1000));
      toast.success('Removed from bookmarks');
    } else {
      setSavedItems(prev => [...prev, article.id + 1000]);
      onSaveItem({ ...article, type: 'article' });
      toast.success('Article saved to bookmarks');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-sidebar backdrop-blur-xl border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl text-sidebar-foreground">CareerAI</span>
          </div>
        </div>

        <nav className="mt-8 px-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Categories Filter */}
        <div className="px-6 mt-8">
          <h4 className="text-sm text-sidebar-foreground mb-3">Categories</h4>
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <span>{category.label}</span>
                  <span className="text-xs">{category.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">AJ</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              {showBackButton ? (
                <BackButton onClick={() => onBack?.()} className="hidden sm:inline-flex" />
              ) : (
                <BackButton onClick={() => onNavigate('dashboard')} label="Back to Dashboard" />
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search content..."
                  className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">AJ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Podcasts & News Content */}
        <main className="flex-1 overflow-auto p-6">
          {showBackButton && (
            <div className="mb-4 sm:hidden">
              <BackButton onClick={() => onBack?.()} variant="outline" className="w-full justify-center" />
            </div>
          )}
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl text-foreground mb-2">Podcasts & News</h1>
              <p className="text-xl text-muted-foreground">Stay updated with the latest trends and insights in tech careers</p>
            </div>

            <Tabs defaultValue="podcasts" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="podcasts" className="flex items-center space-x-2">
                    <Headphones className="w-4 h-4" />
                    <span>Podcasts ({podcasts.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="news" className="flex items-center space-x-2">
                    <Newspaper className="w-4 h-4" />
                    <span>News ({newsArticles.length})</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                    <option>Latest</option>
                    <option>Most Popular</option>
                    <option>Trending</option>
                  </select>
                </div>
              </div>

              {/* Podcasts Tab */}
              <TabsContent value="podcasts" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {podcasts.map((podcast) => (
                    <Card key={podcast.id} className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                      <div className="relative">
                        <ImageWithFallback
                          src={podcast.thumbnail}
                          alt={podcast.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                            {podcast.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          className="absolute bottom-3 right-3 rounded-full w-10 h-10 p-0"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-lg text-foreground mb-2 line-clamp-2">{podcast.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{podcast.show} • {podcast.host}</p>
                        <p className="text-foreground text-sm mb-4 line-clamp-3">{podcast.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {podcast.duration}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {podcast.listeners}
                            </span>
                          </div>
                          <span>{podcast.publishDate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="flex-1">
                              <Play className="w-4 h-4 mr-2" />
                              Listen
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSavePodcast(podcast)}
                          >
                            {savedItems.includes(podcast.id) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* News Tab */}
              <TabsContent value="news" className="space-y-6">
                <div className="space-y-6">
                  {newsArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-6">
                          <ImageWithFallback
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-success/10 text-success hover:bg-success/10">
                                {article.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{article.publishDate}</span>
                            </div>
                            
                            <h3 className="text-xl text-foreground mb-2">{article.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{article.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{article.source}</span>
                                <span>•</span>
                                <span>By {article.author}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {article.readTime}
                                </span>
                                <span className="flex items-center">
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                  {article.views} views
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveArticle(article)}
                                >
                                  {savedItems.includes(article.id + 1000) ? (
                                    <BookmarkCheck className="w-4 h-4 mr-2" />
                                  ) : (
                                    <Bookmark className="w-4 h-4 mr-2" />
                                  )}
                                  Save
                                </Button>
                                <Button size="sm">
                                  Read More
                                  <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Trending Topics */}
            <Card className="mt-8 border-0 shadow-xl bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Trending Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['React 19', 'AI Development', 'Remote Work', 'Salary Negotiation', 'Docker', 'TypeScript', 'Career Growth', 'Web3'].map((topic, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-accent">
                      #{topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}