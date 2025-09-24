import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Brain,
  Target,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ExternalLink,
  Star,
  Play,
  Menu,
  LogOut,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RecommendationsProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSaveItem: (item: any) => void;
}

export function Recommendations({ user, onNavigate, onLogout, onSaveItem }: RecommendationsProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const jobRoles = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop',
      location: 'San Francisco, CA',
      type: 'Full-time',
      remote: 'Hybrid',
      salary: '$120k - $160k',
      match: 94,
      description: 'Lead frontend development for our next-generation SaaS platform. Work with React, TypeScript, and modern web technologies.',
      requirements: ['React', 'TypeScript', 'GraphQL', 'Testing'],
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop',
      location: 'New York, NY',
      type: 'Full-time',
      remote: 'Remote',
      salary: '$100k - $140k',
      match: 87,
      description: 'Build scalable web applications using React, Node.js, and cloud technologies. Great opportunity for career growth.',
      requirements: ['React', 'Node.js', 'AWS', 'MongoDB'],
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'InnovateLabs',
      logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=60&h=60&fit=crop',
      location: 'Austin, TX',
      type: 'Contract',
      remote: 'On-site',
      salary: '$80k - $110k',
      match: 82,
      description: 'Join our team to develop cutting-edge React applications for enterprise clients. Focus on performance and user experience.',
      requirements: ['React', 'JavaScript', 'CSS', 'Redux'],
      posted: '3 days ago'
    }
  ];

  const skillGaps = [
    {
      skill: 'Docker',
      importance: 'High',
      demandIncrease: '+45%',
      currentLevel: 'Beginner',
      targetLevel: 'Intermediate',
      timeToLearn: '3-4 weeks',
      description: 'Containerization technology essential for modern deployment workflows',
      courses: ['Docker Fundamentals', 'Container Orchestration']
    },
    {
      skill: 'GraphQL',
      importance: 'Medium',
      demandIncrease: '+32%',
      currentLevel: 'None',
      targetLevel: 'Intermediate',
      timeToLearn: '2-3 weeks',
      description: 'Modern API query language gaining popularity in React applications',
      courses: ['GraphQL with Apollo', 'Building GraphQL APIs']
    },
    {
      skill: 'AWS',
      importance: 'High',
      demandIncrease: '+38%',
      currentLevel: 'Beginner',
      targetLevel: 'Advanced',
      timeToLearn: '6-8 weeks',
      description: 'Cloud computing platform skills highly valued by employers',
      courses: ['AWS Certified Developer', 'Serverless Architecture']
    }
  ];

  const learningResources = [
    {
      id: 1,
      type: 'Course',
      title: 'Advanced React Patterns',
      provider: 'Pluralsight',
      duration: '6 hours',
      rating: 4.8,
      price: 'Free with subscription',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop',
      description: 'Master advanced React concepts including hooks, context, and performance optimization.'
    },
    {
      id: 2,
      type: 'Bootcamp',
      title: 'Docker for Developers',
      provider: 'Udemy',
      duration: '12 hours',
      rating: 4.6,
      price: '$89.99',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=120&fit=crop',
      description: 'Complete guide to Docker containerization for web developers.'
    },
    {
      id: 3,
      type: 'Tutorial',
      title: 'GraphQL with React',
      provider: 'YouTube',
      duration: '3 hours',
      rating: 4.7,
      price: 'Free',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop',
      description: 'Learn to integrate GraphQL APIs with React applications.'
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'resume', label: 'Resume Analysis', icon: Target },
    { id: 'recommendations', label: 'Job Recommendations', icon: TrendingUp, active: true },
    { id: 'podcasts', label: 'Podcasts & News', icon: Users },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
  ];

  const handleSaveJob = (job: any) => {
    if (savedItems.includes(job.id)) {
      setSavedItems(prev => prev.filter(id => id !== job.id));
      toast.success('Removed from bookmarks');
    } else {
      setSavedItems(prev => [...prev, job.id]);
      onSaveItem({ ...job, type: 'job' });
      toast.success('Added to bookmarks');
    }
  };

  const handleSaveResource = (resource: any) => {
    onSaveItem({ ...resource, type: 'resource' });
    toast.success('Learning resource saved');
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
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">AJ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Recommendations Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl text-foreground mb-2">Your Recommendations</h1>
              <p className="text-xl text-muted-foreground">Personalized job matches, skill insights, and learning resources</p>
            </div>

            <Tabs defaultValue="jobs" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jobs" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Job Roles ({jobRoles.length})</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Skill Gaps ({skillGaps.length})</span>
                </TabsTrigger>
                <TabsTrigger value="learning" className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Learning ({learningResources.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Job Roles Tab */}
              <TabsContent value="jobs" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <select 
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                    >
                      <option value="all">All Locations</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {jobRoles.length} matches found
                  </Badge>
                </div>

                <div className="grid gap-6">
                  {jobRoles.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <ImageWithFallback
                              src={job.logo}
                              alt={job.company}
                              className="w-16 h-16 rounded-lg object-cover ring-2 ring-border"
                            />
                            <div>
                              <h3 className="text-xl text-foreground mb-1">{job.title}</h3>
                              <p className="text-muted-foreground mb-2">{job.company}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {job.location}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {job.type}
                                </span>
                                <Badge variant="outline">{job.remote}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge className="bg-success/10 text-success hover:bg-success/10 mb-2">
                              {job.match}% match
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {job.salary}
                            </div>
                          </div>
                        </div>

                        <p className="text-foreground mb-4">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements.map((req, index) => (
                            <Badge key={index} variant="secondary">{req}</Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Posted {job.posted}
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveJob(job)}
                            >
                              {savedItems.includes(job.id) ? (
                                <BookmarkCheck className="w-4 h-4 mr-2" />
                              ) : (
                                <Bookmark className="w-4 h-4 mr-2" />
                              )}
                              {savedItems.includes(job.id) ? 'Saved' : 'Save'}
                            </Button>
                            <Button size="sm">
                              Apply Now
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Skill Gaps Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skillGaps.map((skill, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{skill.skill}</span>
                          <Badge 
                            className={
                              skill.importance === 'High' 
                                ? 'bg-destructive/10 text-destructive hover:bg-destructive/10' 
                                : 'bg-warning/10 text-warning hover:bg-warning/10'
                            }
                          >
                            {skill.importance}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">{skill.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Market Demand</span>
                            <span className="text-success">{skill.demandIncrease}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Level</span>
                            <span className="text-foreground">{skill.currentLevel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Target Level</span>
                            <span className="text-foreground">{skill.targetLevel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Time to Learn</span>
                            <span className="text-primary">{skill.timeToLearn}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm text-foreground">Recommended Courses:</h5>
                          {skill.courses.map((course, courseIndex) => (
                            <div key={courseIndex} className="text-sm text-primary hover:text-primary/80 cursor-pointer">
                              • {course}
                            </div>
                          ))}
                        </div>

                        <Button className="w-full" size="sm">
                          Start Learning
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Learning Resources Tab */}
              <TabsContent value="learning" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                      <div className="relative">
                        <ImageWithFallback
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground hover:bg-primary">
                          {resource.type}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-lg text-foreground mb-2">{resource.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Provider</span>
                            <span className="text-foreground">{resource.provider}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="text-foreground">{resource.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price</span>
                            <span className="text-success">{resource.price}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rating</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-foreground">{resource.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button className="flex-1" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Start
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveResource(resource)}
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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