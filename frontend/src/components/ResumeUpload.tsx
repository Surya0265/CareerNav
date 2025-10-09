import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BackButton } from './shared/BackButton';
import { getUserFromStorage } from '../utils/api';
import { isPythonServerRunning } from '../utils/serverCheck';
import { 
  Brain,
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Edit3,
  Download,
  Trash2,
  Menu,
  LogOut,
  ArrowLeft,
  Target,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { extractSkillsFromResume, saveExtractedSkills } from '../utils/skillsApiExtensions';

interface ResumeUploadProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export function ResumeUpload({ user, onNavigate, onLogout, onBack, canGoBack = false }: ResumeUploadProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<'upload' | 'parsing' | 'review' | 'analysis'>('upload');
  const [parseProgress, setParseProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isPythonServerActive, setIsPythonServerActive] = useState(true); // Assume server is running initially
  const showBackButton = Boolean(onBack && canGoBack);
  
  // Check if Python server is running
  useEffect(() => {
    const checkServer = async () => {
      const isRunning = await isPythonServerRunning();
      setIsPythonServerActive(isRunning);
      if (!isRunning) {
        toast.error("Python server is not running. Resume processing will not work.", {
          duration: 6000,
          id: "python-server-error"
        });
      }
    };
    
    checkServer();
    // Check server every 30 seconds
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  const [parsedData, setParsedData] = useState({
    personalInfo: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA'
    },
    summary: 'Experienced Full Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Passionate about building scalable web applications and leading development teams.',
    skills: [
      { name: 'JavaScript', level: 'Expert', verified: true, type: 'technical', selected: true, category: 'Technical' },
      { name: 'React', level: 'Expert', verified: true, type: 'technical', selected: true, category: 'Technical' },
      { name: 'Node.js', level: 'Advanced', verified: true, type: 'technical', selected: true, category: 'Technical' },
      { name: 'TypeScript', level: 'Advanced', verified: true, type: 'technical', selected: true, category: 'Technical' },
      { name: 'Python', level: 'Intermediate', verified: false, type: 'technical', selected: true, category: 'Technical' },
      { name: 'Docker', level: 'Beginner', verified: false, type: 'technical', selected: true, category: 'Technical' },
    ],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'TechStart Inc.',
        duration: '2022 - Present',
        description: 'Led frontend development for SaaS platform serving 10K+ users'
      },
      {
        title: 'Full Stack Developer',
        company: 'WebSolutions Co.',
        duration: '2020 - 2022',
        description: 'Developed and maintained multiple client web applications'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        year: '2020'
      }
    ]
  });

  // Ref for file input element
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'resume', label: 'Resume Analysis', icon: Upload, active: true },
    { id: 'skills', label: 'My Skills', icon: User },
    { id: 'recommendations', label: 'Job Recommendations', icon: Target },
    { id: 'podcasts', label: 'Podcasts & News', icon: GraduationCap },
    { id: 'bookmarks', label: 'Bookmarks', icon: Code }
  ];

    const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast.error('No file selected. Please select a valid resume file.');
      return;
    }
    
    // Check if Python server is running before proceeding
    if (!isPythonServerActive) {
      const serverStatus = await isPythonServerRunning();
      setIsPythonServerActive(serverStatus);
      
      if (!serverStatus) {
        toast.error(
          "Python server is not running. Please start the Python server at http://127.0.0.1:5000 before uploading resumes.",
          { duration: 6000 }
        );
        return;
      }
    }
    
    const file = files[0];
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && 
        !file.name.endsWith('.pdf') && 
        !file.name.endsWith('.doc') && 
        !file.name.endsWith('.docx')) {
      toast.error('Please upload a PDF or Word document (.pdf, .doc, or .docx)');
      return;
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    // Show parsing progress
    setUploadStep('parsing');
    setParseProgress(0);
    
    // Set up progress simulation during upload
    const progressInterval = setInterval(() => {
      setParseProgress(prev => {
        return prev < 90 ? prev + 5 : prev;
      });
    }, 300);

    try {
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('resume', file);

      // Use the imported getUserFromStorage function
      const userInfo = getUserFromStorage();
      if (!userInfo || !userInfo.token) {
        clearInterval(progressInterval);
        setUploadStep('upload');
        toast.error('Authentication required. Please log in again.');
        return;
      }

      // Use only the extract-skills endpoint for resume upload
      const API_BASE_URL = 'http://127.0.0.1:5000'; // Python backend URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

      // Make API request to /extract-skills
      const response = await fetch(`${API_BASE_URL}/extract-skills`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Please ensure the Python server is running at http://127.0.0.1:5000');
        } else {
          throw new Error(`Connection failed: ${err.message}. Please ensure the Python server is running.`);
        }
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setParseProgress(100);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        } else {
          throw new Error(`Server error (${response.status}): Please check the server is running`);
        }
      }

      // Get response data
      const data = await response.json();
      console.log('Extracted skills API response:', data);

      // Update parsedData state with the extracted info and skills
      setParsedData(prev => ({
        ...prev,
        personalInfo: {
          name: data.extracted_info?.full_name || data.extracted_info?.email?.split('@')[0] || 'User',
          email: data.extracted_info?.email || '',
          phone: data.extracted_info?.phone || data.extracted_info?.phone_number || '',
          location: data.extracted_info?.location || '',
        },
        skills: (data.skills || []).map((skillStr: string | { name?: string; type?: string }) => {
          const inferredType = inferSkillType(skillStr, data.skills_by_category);
          return {
            name: typeof skillStr === 'string' ? skillStr : (skillStr && skillStr.name ? skillStr.name : ''),
            level: 'Intermediate',
            type: inferredType,
            selected: true,
            verified: true,
            category: inferredType === 'soft' ? 'Soft Skill' : 'Technical'
          };
        }),
        experience: Array.isArray(data.extracted_info?.experience)
          ? data.extracted_info.experience.map((exp: Record<string, string>) => ({
              title: exp.title || '',
              company: exp.company || '',
              duration: exp.duration || '',
              description: exp.description || ''
            }))
          : [],
        education: Array.isArray(data.extracted_info?.education)
          ? data.extracted_info.education.map((edu: Record<string, string>) => ({
              degree: edu.degree || '',
              school: edu.school || edu.institution || '',
              year: edu.year || ''
            }))
          : []
      }));
      setUploadStep('review');

      // Helper to infer skill type from skills_by_category
      function inferSkillType(
        skill: string | { name?: string; type?: string },
        categories: Record<string, string[]> | undefined
      ) {
        if (!categories) return 'technical';
        const skillName = typeof skill === 'string' ? skill : (skill && skill.name ? skill.name : '');
        if (categories.soft_skills && categories.soft_skills.includes(skillName)) return 'soft';
        return 'technical';
      }

    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadStep('upload');
      console.error('Resume upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setDragActive(false);
    
    // Safety check for files
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    } else {
      toast.error("No file detected. Please try again or use the Choose File button.");
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent further propagation
    setDragActive(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent further propagation
    setDragActive(false);
  };

  // Extract and save skills from resume
  const handleExtractSkills = async (fileObj: File) => {
    try {
      if (!fileObj) {
        toast.error('No file available for skills extraction');
        return;
      }
      
      // Extract skills using the API
      const result = await extractSkillsFromResume(fileObj);
      
      if (!result || !result.skills || result.skills.length === 0) {
        toast.warning('No skills were detected in your resume');
        return;
      }
      
      // Format skills for saving - add selected flag
      const formattedSkills = result.skills.map((skill: any) => ({
        name: skill.name,
        level: skill.level || 'intermediate',
        type: skill.type || 'technical',
        selected: true
      }));
      
      // Save extracted skills to user profile
      await saveExtractedSkills(formattedSkills);
      
      toast.success(`Successfully extracted ${formattedSkills.length} skills from your resume`);
      return formattedSkills;
    } catch (error: any) {
      console.error('Error extracting skills:', error);
      toast.error(`Failed to extract skills: ${error.message}`);
      return null;
    }
  };
  
  const handleAnalyze = async () => {
    setUploadStep('analysis');
    
    // Extract skills from the parsed resume data
    try {
      // We need to get the file again since we might need to reupload it
      if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
        await handleExtractSkills(fileInputRef.current.files[0]);
      } else {
        toast.error('Resume file not available. Please upload your resume again.');
      }
      
      toast.success('Analysis complete! Your skills have been updated.');
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`);
    }
    
    setTimeout(() => {
      // Navigate to skills page instead of dashboard to show extracted skills
      onNavigate('skills');
    }, 3000);
  };

  const editSkill = (index: number, newLevel: string) => {
    setParsedData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, level: newLevel } : skill
      )
    }));
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
            <div className="flex items-center space-x-3 sm:space-x-4">
              {showBackButton && (
                <BackButton onClick={() => onBack?.()} className="hidden sm:inline-flex" />
              )}
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
                Dashboard
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

        {/* Resume Upload Content */}
        <main className="flex-1 overflow-auto p-6">
          {uploadStep === 'upload' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl text-foreground mb-4">Upload Your Resume</h1>
                <p className="text-xl text-muted-foreground">Let AI analyze your resume and provide personalized career recommendations</p>
              </div>

              <Card className="mb-8 border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl text-foreground mb-2">Drag & Drop Your Resume</h3>
                    <p className="text-muted-foreground mb-6">or click to browse files</p>
                    
                    {/* Use useRef for more robust file input handling */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target && e.target.files) {
                          handleFileUpload(e.target.files);
                        }
                      }}
                      className="hidden"
                      id="resume-upload"
                      aria-label="Resume file input"
                    />
                    <Button 
                      type="button" 
                      className="cursor-pointer" 
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        } else {
                          toast.error("File input not available. Please refresh the page and try again.");
                        }
                      }}
                    >
                      Choose File
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </p>
                    
                    <div className="flex items-center justify-center mt-4 text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isPythonServerActive ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                      <span>
                        {isPythonServerActive 
                          ? 'Python server connected' 
                          : 'Python server not responding - resume processing unavailable'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg text-foreground mb-2">AI Analysis</h3>
                    <p className="text-muted-foreground">Advanced algorithms extract and analyze your skills, experience, and achievements</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 text-success mx-auto mb-4" />
                    <h3 className="text-lg text-foreground mb-2">Job Matching</h3>
                    <p className="text-muted-foreground">Get personalized job recommendations based on your profile and market trends</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-chart-3 mx-auto mb-4" />
                    <h3 className="text-lg text-foreground mb-2">Skill Assessment</h3>
                    <p className="text-muted-foreground">Identify skill gaps and get learning recommendations to advance your career</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {uploadStep === 'parsing' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <File className="w-20 h-20 text-primary mx-auto mb-6" />
                <h2 className="text-2xl text-foreground mb-4">Parsing Your Resume</h2>
                <p className="text-muted-foreground">Our AI is analyzing your resume and extracting key information</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Progress value={parseProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{parseProgress}% complete</p>
                </div>

                <div className="text-left space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${parseProgress > 20 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={parseProgress > 20 ? 'text-foreground' : 'text-muted-foreground'}>
                      Extracting personal information
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${parseProgress > 40 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={parseProgress > 40 ? 'text-foreground' : 'text-muted-foreground'}>
                      Identifying skills and technologies
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${parseProgress > 60 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={parseProgress > 60 ? 'text-foreground' : 'text-muted-foreground'}>
                      Processing work experience
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${parseProgress > 80 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className={parseProgress > 80 ? 'text-foreground' : 'text-muted-foreground'}>
                      Analyzing education background
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadStep === 'review' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl text-foreground mb-2">Review Parsed Information</h2>
                <p className="text-muted-foreground">Please review and edit the extracted information before analysis</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Personal Info */}
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Name</label>
                      <p className="text-foreground">{parsedData.personalInfo?.name || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-foreground">{parsedData.personalInfo?.email || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="text-foreground">{parsedData.personalInfo?.phone || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Location</label>
                      <p className="text-foreground">{parsedData.personalInfo?.location || 'Not available'}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5" />
                      <span>Skills</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {parsedData.skills && Array.isArray(parsedData.skills) ? 
                        parsedData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-foreground">{skill.name}</span>
                              {skill.verified ? (
                                <CheckCircle className="w-4 h-4 text-success" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-warning" />
                              )}
                            </div>
                            <select 
                              value={skill.level}
                              onChange={(e) => editSkill(index, e.target.value)}
                              className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                            >
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                              <option>Expert</option>
                            </select>
                          </div>
                        ))
                        : <p className="text-muted-foreground text-center py-2">No skills detected</p>
                      }
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="w-1/2">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Add Skill
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-1/2"
                        onClick={async () => {
                          if (!parsedData.skills || parsedData.skills.length === 0) {
                            toast.error('No skills to save.');
                            return;
                          }
                          try {
                            const formattedSkills = parsedData.skills.map((skill: any) => {
                              const type = skill.type ?? 'technical';
                              return {
                                name: skill.name,
                                level: skill.level ?? 'Intermediate',
                                selected: skill.selected ?? true,
                                type,
                                verified: skill.verified ?? true,
                                category: skill.category ?? (type === 'soft' ? 'Soft Skill' : 'Technical')
                              };
                            });

                            await saveExtractedSkills(formattedSkills);
                            toast.success(`${parsedData.skills.length} skills saved to your profile`);
                          } catch (error) {
                            const message = error instanceof Error ? error.message : String(error);
                            toast.error(`Failed to save skills: ${message}`);
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Save to Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Experience & Education */}
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5" />
                      <span>Experience</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {parsedData.experience.map((exp, index) => (
                      <div key={index} className="p-3 bg-secondary rounded-lg">
                        <h4 className="text-foreground">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">{exp.duration}</p>
                      </div>
                    ))}
                    
                    <div className="border-t border-border pt-4">
                      <h4 className="flex items-center space-x-2 mb-3">
                        <GraduationCap className="w-4 h-4" />
                        <span>Education</span>
                      </h4>
                      {parsedData.education.map((edu, index) => (
                        <div key={index} className="p-3 bg-secondary rounded-lg">
                          <p className="text-foreground">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                          <p className="text-xs text-muted-foreground">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <Button variant="outline" onClick={() => setUploadStep('upload')}>
                  Upload Different Resume
                </Button>
                <Button variant="outline" onClick={() => onNavigate('skills')}>
                  View & Edit Skills
                </Button>
                <Button onClick={handleAnalyze} className="bg-primary hover:bg-primary/90">
                  Analyze with AI
                  <Brain className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {uploadStep === 'analysis' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <Brain className="w-20 h-20 text-primary mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl text-foreground mb-4">AI Analysis in Progress</h2>
                <p className="text-muted-foreground">Our AI is generating personalized recommendations based on your profile</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-foreground">Matching skills with job market demands...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-foreground">Identifying skill gaps and growth opportunities...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-foreground">Generating personalized job recommendations...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-foreground">Curating relevant learning resources...</span>
                </div>
              </div>

              <div className="mt-8">
                <Progress value={65} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">Analysis will complete in ~30 seconds</p>
              </div>
            </div>
          )}
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