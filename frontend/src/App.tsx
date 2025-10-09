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
import { MySkills } from './components/MySkills';
import { AIAnalysis } from './components/AIAnalysis';
import { Toaster } from './components/ui/sonner';
import { getUserFromStorage, logoutUser } from './utils/api';

type View =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'resume'
  | 'recommendations'
  | 'podcasts'
  | 'bookmarks'
  | 'skills'
  | 'ai-analysis';

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
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  const canGoBack = viewHistory.length > 0;

  // Effect to update view based on user authentication status
  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
      setViewHistory([]);
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView('dashboard');
    setViewHistory([]);
  };

  const validViews: View[] = [
    'landing',
    'login',
    'signup',
    'dashboard',
    'resume',
    'recommendations',
    'podcasts',
    'bookmarks',
    'skills',
    'ai-analysis'
  ];

  const isValidView = (view: string): view is View =>
    validViews.includes(view as View);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentView('landing');
    setViewHistory([]);
  };

    const navigateTo = (view: string) => {
      if (!isValidView(view)) {
        return;
      }

      if (view === currentView) return;

      setViewHistory(prev => [...prev, currentView]);
      setCurrentView(view);
    };

  const goBack = () => {
    setViewHistory(prev => {
      if (prev.length === 0) {
        const fallback = user ? 'dashboard' : 'landing';
        if (currentView !== fallback) {
          setCurrentView(fallback);
        }
        return prev;
      }

      const history = [...prev];
      const previousView = history.pop();
      if (previousView) {
        setCurrentView(previousView);
        return history;
      }

      return prev;
    });
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
          return <Login onLogin={handleLogin} onNavigate={navigateTo} />;
        case 'signup':
          return <Signup onLogin={handleLogin} onNavigate={navigateTo} />;
        case 'landing':
          return <LandingPage onNavigate={navigateTo} />;
        default:
          // If trying to access protected routes without authentication, redirect to landing
          return <LandingPage onNavigate={navigateTo} />;
      }
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      case 'resume':
        return (
          <ResumeUpload 
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      case 'recommendations':
        return (
          <Recommendations 
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onSaveItem={handleSaveItem}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      case 'podcasts':
        return (
          <PodcastsNews 
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onSaveItem={handleSaveItem}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      case 'bookmarks':
        return (
          <Bookmarks 
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            savedItems={savedItems}
            onRemoveItem={handleRemoveItem}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      case 'skills':
        return (
          <MySkills
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      case 'ai-analysis':
        return (
          <AIAnalysis
            user={user}
            onNavigate={navigateTo}
            onBack={goBack}
            canGoBack={canGoBack}
          />
        );
      default:
        return (
          <Dashboard 
            user={user}
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onBack={goBack}
            canGoBack={canGoBack}
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