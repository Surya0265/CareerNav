import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Brain,
  Upload,
  Target,
  TrendingUp,
  Bookmark,
  Settings,
  Bell,
  Search,
  ChevronRight,
  BarChart3,
  Users,
  Award,
  Clock,
  Menu,
  LogOut,
  Star,
  ArrowUpRight,
  Sparkles,
  Calendar,
  BookOpen
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, active: true },
    { id: 'resume', label: 'Resume Analysis', icon: Upload },
    { id: 'recommendations', label: 'Job Recommendations', icon: Target },
    { id: 'podcasts', label: 'Podcasts & News', icon: TrendingUp },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const jobRecommendations = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      match: 94,
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $160k',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop',
      isNew: true
    },
    {
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      match: 87,
      location: 'New York, NY',
      type: 'Remote',
      salary: '$100k - $140k',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop',
      isNew: false
    },
    {
      title: 'React Developer',
      company: 'InnovateLabs',
      match: 82,
      location: 'Austin, TX',
      type: 'Hybrid',
      salary: '$90k - $120k',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop',
      isNew: false
    }
  ];

  const latestNews = [
    {
      title: 'Top 10 Skills in Demand for 2025',
      source: 'TechCrunch',
      time: '2h ago',
      category: 'Skills',
      trending: true
    },
    {
      title: 'Remote Work Trends in Software Development',
      source: 'Dev.to',
      time: '4h ago',
      category: 'Trends',
      trending: false
    },
    {
      title: 'Salary Expectations for Frontend Developers',
      source: 'Stack Overflow',
      time: '6h ago',
      category: 'Salary',
      trending: true
    }
  ];

  const skills = [
    { name: 'React', level: 92, trend: 'up' },
    { name: 'TypeScript', level: 88, trend: 'up' },
    { name: 'Node.js', level: 85, trend: 'stable' },
    { name: 'Docker', level: 45, trend: 'learning' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-sidebar/90 backdrop-blur-xl border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-20 px-8 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-sidebar-foreground">CareerAI</span>
              <div className="text-xs text-muted-foreground">Professional</div>
            </div>
          </div>
        </div>

        <nav className="mt-8 px-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    item.active 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.active && <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-secondary/50 to-muted rounded-xl mb-4">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">AJ</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card/90 backdrop-blur-xl border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Good morning, {user.name.split(' ')[0]}! 
                  <Sparkles className="inline w-6 h-6 ml-2 text-yellow-500" />
                </h1>
                <p className="text-muted-foreground mt-1">Ready to advance your career today?</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="pl-12 pr-6 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 w-80 text-foreground"
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">AJ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-xl shadow-green-500/25">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Resume Score</p>
                    <p className="text-3xl font-bold">85/100</p>
                    <p className="text-xs text-green-100 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +5 from last week
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-xl shadow-blue-500/25">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Job Matches</p>
                    <p className="text-3xl font-bold">127</p>
                    <p className="text-xs text-blue-100 flex items-center mt-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      12 new today
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-xl shadow-orange-500/25">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Skill Gaps</p>
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-xs text-orange-100">Focus areas identified</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-xl shadow-cyan-500/25">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">Learning Hours</p>
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-xs text-cyan-100">This month</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills Progress */}
              <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span className="flex items-center">
                      <Star className="w-6 h-6 mr-2 text-yellow-500" />
                      Skill Development
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('resume')} className="text-primary hover:text-primary/80">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-foreground">{skill.name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`
                              ${skill.trend === 'up' ? 'bg-success/10 text-success' : ''}
                              ${skill.trend === 'learning' ? 'bg-warning/10 text-warning' : ''}
                              ${skill.trend === 'stable' ? 'bg-primary/10 text-primary' : ''}
                            `}
                          >
                            {skill.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                            {skill.trend === 'learning' && <Clock className="w-3 h-3 mr-1" />}
                            {skill.trend === 'stable' && <Target className="w-3 h-3 mr-1" />}
                            {skill.trend === 'up' ? 'Growing' : skill.trend === 'learning' ? 'Learning' : 'Stable'}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={skill.level} className="h-3 bg-muted" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${skill.level}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Job Recommendations */}
              <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span className="flex items-center">
                      <Target className="w-6 h-6 mr-2 text-blue-500" />
                      Perfect Matches
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('recommendations')} className="text-primary hover:text-primary/80">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobRecommendations.map((job, index) => (
                      <div key={index} className="flex items-center space-x-4 p-5 bg-gradient-to-r from-secondary/50 to-muted/50 rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <div className="relative">
                          <ImageWithFallback
                            src={job.logo}
                            alt={job.company}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-border"
                          />
                          {job.isNew && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                              <Sparkles className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{job.title}</h4>
                            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-sm">
                              {job.match}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{job.company} • {job.location}</p>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg">{job.type}</span>
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur"
                      onClick={() => onNavigate('resume')}
                    >
                      <Upload className="w-4 h-4 mr-3" />
                      Update Resume
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur"
                      onClick={() => onNavigate('recommendations')}
                    >
                      <Target className="w-4 h-4 mr-3" />
                      Find Jobs
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur"
                      onClick={() => onNavigate('podcasts')}
                    >
                      <TrendingUp className="w-4 h-4 mr-3" />
                      Market Trends
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Latest News */}
              <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                      Latest Insights
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('podcasts')} className="text-primary hover:text-primary/80">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestNews.map((article, index) => (
                      <div key={index} className="space-y-3 p-4 bg-secondary/50 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <h5 className="text-sm font-semibold text-foreground line-clamp-2 flex-1">{article.title}</h5>
                          {article.trending && (
                            <TrendingUp className="w-4 h-4 text-orange-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{article.source}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
                              {article.category}
                            </Badge>
                            <span className="text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-xl">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <span className="text-foreground font-medium">Resume updated</span>
                        <p className="text-muted-foreground text-xs">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-xl">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <span className="text-foreground font-medium">Applied to TechCorp</span>
                        <p className="text-muted-foreground text-xs">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-xl">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <span className="text-foreground font-medium">Skill gap identified</span>
                        <p className="text-muted-foreground text-xs">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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