import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { 
  Brain,
  Target,
  Users,
  Headphones,
  Bookmark,
  LogOut,
  Sparkles
} from 'lucide-react';

interface AppSidebarProps {
  user: any;
  currentPage: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  children?: React.ReactNode;
}

const iconMap = {
  Brain,
  Target,
  Users,
  Headphones,
  Bookmark,
  Sparkles
};

export function AppSidebar({ user, currentPage, onNavigate, onLogout, sidebarOpen, children }: AppSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Brain' },
    { id: 'resume', label: 'Resume Analysis', icon: 'Target' },
    { id: 'skills', label: 'My Skills', icon: 'Sparkles' },
    { id: 'recommendations', label: 'Job Recommendations', icon: 'Users' },
    { id: 'podcasts', label: 'Podcasts & News', icon: 'Headphones' },
    { id: 'bookmarks', label: 'Bookmarks', icon: 'Bookmark' }
  ];

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl text-foreground">CareerAI</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="mt-8 px-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="w-full justify-start">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}