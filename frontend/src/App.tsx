import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Dashboard } from './components/Dashboard';
import { ResumeUpload } from './components/ResumeUpload';
import { Recommendations } from './components/Recommendations';
import { PodcastsNews } from './components/PodcastsNews';
import { Bookmarks } from './components/Bookmarks';
import { Toaster } from './components/ui/sonner';
import { getUserFromStorage, logoutUser } from './utils/api';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'resume' | 'recommendations' | 'podcasts' | 'bookmarks';

interface User {
  name: string;
  email: string;
  avatar: string;
  resumeUploaded: boolean;
  lastActivity: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<User | null>(getUserFromStorage());
  const [savedItems, setSavedItems] = useState<any[]>([]);

  // Effect to update view based on user authentication status
  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('landing');
  };

  const handleSaveItem = (item: any) => {
    setSavedItems(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const handleRemoveItem = (id: number) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const renderCurrentView = () => {
    // Handle authentication pages
    if (!user) {
      switch (currentView) {
        case 'login':
          return <Login onLogin={handleLogin} onNavigate={setCurrentView} />;
        case 'signup':
          return <Signup onLogin={handleLogin} onNavigate={setCurrentView} />;
        case 'landing':
          return <LandingPage onNavigate={setCurrentView} />;
        default:
          // If trying to access protected routes without authentication, redirect to landing
          return <LandingPage onNavigate={setCurrentView} />;
      }
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        );
      case 'resume':
        return (
          <ResumeUpload 
            user={user}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        );
      case 'recommendations':
        return (
          <Recommendations 
            user={user}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            onSaveItem={handleSaveItem}
          />
        );
      case 'podcasts':
        return (
          <PodcastsNews 
            user={user}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            onSaveItem={handleSaveItem}
          />
        );
      case 'bookmarks':
        return (
          <Bookmarks 
            user={user}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            savedItems={savedItems}
            onRemoveItem={handleRemoveItem}
          />
        );
      default:
        return (
          <Dashboard 
            user={user}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {renderCurrentView()}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}