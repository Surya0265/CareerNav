import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AppSidebar } from './shared/AppSidebar';
import { 
  JobItemRenderer,
  PodcastItemRenderer, 
  ArticleItemRenderer,
  ResourceItemRenderer 
} from './bookmarks/BookmarkItemRenderers';
import { sampleSavedItems } from './constants/mockData';
import { 
  Download,
  Menu,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BookmarksProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  savedItems: any[];
  onRemoveItem: (id: number) => void;
}

export function Bookmarks({ user, onNavigate, onLogout, savedItems, onRemoveItem }: BookmarksProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allSavedItems = [...savedItems, ...sampleSavedItems];

  const filteredItems = allSavedItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    all: allSavedItems.length,
    job: allSavedItems.filter(item => item.type === 'job').length,
    podcast: allSavedItems.filter(item => item.type === 'podcast').length,
    article: allSavedItems.filter(item => item.type === 'article').length,
    resource: allSavedItems.filter(item => item.type === 'resource').length
  };

  const categories = [
    { id: 'all', label: 'All Items', count: categoryCounts.all },
    { id: 'job', label: 'Jobs', count: categoryCounts.job },
    { id: 'podcast', label: 'Podcasts', count: categoryCounts.podcast },
    { id: 'article', label: 'Articles', count: categoryCounts.article },
    { id: 'resource', label: 'Courses', count: categoryCounts.resource }
  ];

  const handleRemoveItem = (item: any) => {
    onRemoveItem(item.id);
    toast.success('Item removed from bookmarks');
  };

  const handleExportReport = () => {
    toast.success('Generating your personalized career report...');
    setTimeout(() => {
      toast.success('Report downloaded successfully!');
    }, 2000);
  };

  const renderItem = (item: any) => {
    switch (item.type) {
      case 'job':
        return <JobItemRenderer key={item.id} item={item} onRemove={handleRemoveItem} />;
      case 'podcast':
        return <PodcastItemRenderer key={item.id} item={item} onRemove={handleRemoveItem} />;
      case 'article':
        return <ArticleItemRenderer key={item.id} item={item} onRemove={handleRemoveItem} />;
      case 'resource':
        return <ResourceItemRenderer key={item.id} item={item} onRemove={handleRemoveItem} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      <AppSidebar 
        user={user}
        currentPage="bookmarks"
        onNavigate={onNavigate}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
      >
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
      </AppSidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl text-foreground mb-2">Your Bookmarks</h1>
                <p className="text-xl text-muted-foreground">
                  {filteredItems.length} saved {filteredItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <Card className="text-center py-12 border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                <CardContent>
                  <div className="text-muted-foreground mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg text-foreground mb-2">No bookmarks found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Save jobs, articles, and resources to see them here'
                    }
                  </p>
                  <Button onClick={() => onNavigate('recommendations')}>
                    Browse Recommendations
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredItems.map(renderItem)}
              </div>
            )}

            {allSavedItems.length > 0 && (
              <Card className="mt-8 border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Export Your Career Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Get a comprehensive PDF report with all your saved jobs, recommended skills, and learning resources.
                  </p>
                  <Button onClick={handleExportReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Personalized Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}