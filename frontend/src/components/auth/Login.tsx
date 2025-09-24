import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { useTheme } from '../providers/ThemeProvider';
import { loginUser } from '../../utils/api';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Moon, 
  Sun,
  ArrowLeft,
  Github,
  Chrome
} from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (user: any) => void;
  onNavigate: (view: string) => void;
}

export function Login({ onLogin, onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = await loginUser(email, password);
      setIsLoading(false);
      toast.success('Successfully logged in!');
      onLogin(userData);
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = () => {
    onLogin({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      resumeUploaded: true,
      lastActivity: 'Just now'
    });
  };

  return (
     <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-foreground">CareerAI</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer text-foreground">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 hover:underline"
                  onClick={() => toast.info('Password reset functionality coming soon!')}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => toast.info('Google login coming soon!')} className="border-border text-foreground hover:bg-accent">
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button variant="outline" onClick={() => toast.info('GitHub login coming soon!')} className="border-border text-foreground hover:bg-accent">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                Try Demo Account
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-primary hover:text-primary/80 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to home
            </button>
            
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}