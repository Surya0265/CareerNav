import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { useTheme } from '../providers/ThemeProvider';
import { signupUser } from '../../utils/api';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Moon, 
  Sun,
  ArrowLeft,
  Github,
  Chrome,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface SignupProps {
  onLogin: (user: any) => void;
  onNavigate: (view: string) => void;
}

export function Signup({ onLogin, onNavigate }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const userData = await signupUser(formData.name, formData.email, formData.password);
      setIsLoading(false);
      toast.success('Account created successfully!');
      onLogin(userData);
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return { 
      strength: (strength / 5) * 100, 
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-muted'
    };
  };

  const passwordStrength = getPasswordStrength();

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
            <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
            <p className="text-muted-foreground">Join thousands of professionals advancing their careers</p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Sign Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${passwordStrength.strength > 60 ? 'text-success' : 'text-warning'}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer text-foreground">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 hover:underline"
                      onClick={() => toast.info('Terms page coming soon!')}
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      className="text-primary hover:text-primary/80 hover:underline"
                      onClick={() => toast.info('Privacy policy coming soon!')}
                    >
                      Privacy Policy
                    </button>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={setSubscribeNewsletter}
                  />
                  <Label htmlFor="newsletter" className="text-sm cursor-pointer text-foreground">
                    Subscribe to career tips and updates
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
              <Button variant="outline" onClick={() => toast.info('Google signup coming soon!')} className="border-border text-foreground hover:bg-accent">
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button variant="outline" onClick={() => toast.info('GitHub signup coming soon!')} className="border-border text-foreground hover:bg-accent">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-primary hover:text-primary/80 hover:underline font-medium"
            >
              Sign in
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