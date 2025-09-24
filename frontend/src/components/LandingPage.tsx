import * as React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ThemeToggle } from './shared/ThemeToggle';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'This platform helped me identify skill gaps I didn\'t even know I had. Got my dream job within 3 months!',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Product Manager at Microsoft',
      content: 'The AI recommendations were spot-on. It guided me from data analysis to product management seamlessly.',
      rating: 5
    },
    {
      name: 'Emily Thompson',
      role: 'UX Designer at Airbnb',
      content: 'Amazing career insights and trend analysis. The podcast recommendations alone were worth it!',
      rating: 5
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced algorithms analyze your resume and provide personalized career recommendations.'
    },
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'Get matched with roles that fit your skills, experience, and career aspirations.'
    },
    {
      icon: TrendingUp,
      title: 'Live Market Trends',
      description: 'Stay updated with real-time job market insights and emerging skill demands.'
    },
    {
      icon: Users,
      title: 'Expert Content',
      description: 'Access curated podcasts, articles, and learning resources from industry experts.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl text-foreground">CareerAI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2">Home</a>
                <a href="#features" className="text-muted-foreground hover:text-primary px-3 py-2">Features</a>
                <a href="#testimonials" className="text-muted-foreground hover:text-primary px-3 py-2">Success Stories</a>
                <a href="#" className="text-muted-foreground hover:text-primary px-3 py-2">About</a>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => onNavigate('login')}>
                Log In
              </Button>
              <Button onClick={() => onNavigate('signup')}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              <a href="#" className="block px-3 py-2 text-muted-foreground">Home</a>
              <a href="#features" className="block px-3 py-2 text-muted-foreground">Features</a>
              <a href="#testimonials" className="block px-3 py-2 text-muted-foreground">Success Stories</a>
              <a href="#" className="block px-3 py-2 text-muted-foreground">About</a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="ghost" className="w-full" onClick={() => onNavigate('login')}>
                  Log In
                </Button>
                <Button className="w-full" onClick={() => onNavigate('signup')}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
                🚀 AI-Powered Career Guidance
              </Badge>
              <h1 className="text-4xl lg:text-6xl text-foreground mb-6">
                Navigate Your Career with 
                <span className="text-primary"> AI-Powered Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Upload your resume, get personalized job recommendations, identify skill gaps, and stay ahead of market trends with our intelligent career navigator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => onNavigate('signup')} className="bg-primary hover:bg-primary/90">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
              
              <div className="mt-8 flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl text-foreground mb-1">50K+</div>
                  <div className="text-sm text-muted-foreground">Careers Launched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-foreground mb-1">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-foreground mb-1">500+</div>
                  <div className="text-sm text-muted-foreground">Companies</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
                alt="Career navigation dashboard"
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">Job Match Found</div>
                    <div className="text-xs text-muted-foreground">95% compatibility</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-foreground mb-4">
              Intelligent Career Guidance
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI analyzes millions of job postings, career paths, and market trends to provide you with personalized recommendations that accelerate your career growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground">
              See how CareerAI has helped thousands land their dream jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl text-primary-foreground mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of professionals who have successfully navigated their careers with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-card text-primary hover:bg-card/90" onClick={() => onNavigate('signup')}>
              Start Your Journey Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl text-foreground">CareerAI</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered career navigation for the next generation of professionals.
              </p>
            </div>
            <div>
              <h4 className="text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Resume Analysis</a></li>
                <li><a href="#" className="hover:text-foreground">Job Recommendations</a></li>
                <li><a href="#" className="hover:text-foreground">Market Trends</a></li>
                <li><a href="#" className="hover:text-foreground">Learning Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 CareerAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}