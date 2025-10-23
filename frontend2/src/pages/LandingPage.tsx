import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/shared/Button.tsx";
import { Card } from "../components/shared/Card.tsx";
import { Badge } from "../components/shared/Badge.tsx";
// ImageWithFallback and ThemeToggle are not part of frontend2; use native img and omit theme toggle
import {
  Brain,
  Target,
  Youtube,
  Users,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

interface LandingPageProps {
  // App routing in frontend2 uses react-router; we only need a navigate function to reuse existing flows
  onNavigate?: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // testimonials removed per request

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your resume and provide personalized career recommendations.",
    },
    {
      icon: Target,
      title: "Smart Job Matching",
      description: "Get matched with roles that fit your skills, experience, and career aspirations.",
    },
    {
      icon: Youtube,
      title: "YouTube Learning",
      description: "Role-focused video paths and quick tutorials to help you learn the exact skills employers ask for.",
    },
    {
      icon: Users,
      title: "Expert Content",
      description: "Curated plans and projects to close the skill gaps in your resume.",
    },
  ];

  const goTo = (path: string) => {
    if (onNavigate) return onNavigate(path);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
  <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border bg-opacity-100 h-16 w-full backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-3">
                  <img src="/careernav.svg" alt="CareerNav" className="h-8 w-auto" />
                  <span className="text-lg font-semibold text-white">CareerNav</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button onClick={() => goTo('/')} className="text-white hover:text-primary px-3 py-2">Home</button>
                <a href="#features" className="text-white hover:text-primary px-3 py-2">Features</a>
                <button onClick={() => goTo('/')} className="text-white hover:text-primary px-3 py-2">About</button>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" onClick={() => goTo("/login")} className="text-white border-transparent">Log In</Button>
              <Button onClick={() => goTo("/signup")} className="text-white">Get Started</Button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
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

            {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border bg-opacity-100">
              <button onClick={() => goTo('/')} className="block px-3 py-2 text-white">Home</button>
              <a href="#features" className="block px-3 py-2 text-white">Features</a>
              <button onClick={() => goTo('/')} className="block px-3 py-2 text-white">About</button>
              <div className="px-3 py-2 space-y-2">
                <Button variant="ghost" className="w-full text-white" onClick={() => goTo("/login")}>
                  Log In
                </Button>
                <Button className="w-full text-white" onClick={() => goTo("/signup")}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">AI-Powered Career Guidance</Badge>
              <h1 className="text-4xl lg:text-6xl text-foreground mb-6">
                Navigate Your Career with <span className="text-primary"> AI-Powered Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Upload your resume, get personalized job recommendations, identify skill gaps, and stay ahead of market trends with our intelligent career navigator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => goTo("/signup")} className="bg-primary hover:bg-primary/90 text-white">
                  Get Started 
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl text-foreground mb-1">Extensive</div>
                  <div className="text-sm text-muted-foreground">Profiles coverage across domains</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-foreground mb-1">Reliable</div>
                  <div className="text-sm text-muted-foreground">High match confidence for recommendations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-foreground mb-1">Curated</div>
                  <div className="text-sm text-muted-foreground">Handpicked learning resources and pathways</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop" alt="Career navigation dashboard" className="rounded-xl shadow-2xl w-full h-auto" />
              
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-foreground mb-4">Intelligent Career Guidance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Our AI analyzes millions of job postings, career paths, and market trends to provide you with personalized recommendations that accelerate your career growth.</p>
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

      {/* Testimonials removed per request */}

      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl text-primary-foreground mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">Join thousands of professionals who have successfully navigated their careers with our AI-powered platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-card text-primary hover:bg-card/90" onClick={() => goTo("/signup")}>
              Start Your Journey Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
           
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <img src="/careernav.svg" alt="CareerNav" className="h-8 w-auto" />
                  <span className="text-lg font-semibold text-white">CareerNav</span>
                </div>
              </div>
              <p className="text-white">AI-powered career navigation for the next generation of professionals.</p>
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
            <p>© 2025 CareerNav. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
