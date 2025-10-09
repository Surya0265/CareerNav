import { useState, type ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Brain,
  Upload,
  Settings,
  FileText,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  ArrowLeft,
  ArrowUpRight
} from 'lucide-react';
import { getUserFromStorage } from '../utils/api';

interface AIAnalysisProps {
  user: any;
  onNavigate: (view: string) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

interface AnalysisResult {
  recommendations?: any;
  analysis?: any;
  extractedSkills?: any[];
  totalSkills?: any;
  preferences?: any;
  extractedInfo?: any;
  suggestions?: any;
  currentSkills?: string[];
  userSkills?: {
    technical?: string[];
    soft?: string[];
  };
  message?: string;
}

export function AIAnalysis({ user, onNavigate, onBack, canGoBack = false }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showBackButton = Boolean(onBack && canGoBack);

  // Form states
  const [industry, setIndustry] = useState('');
  const [goals, setGoals] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const buildAnalysisData = (result: AnalysisResult) => {
    const {
      message,
      analysis,
      recommendations,
      extractedSkills,
      preferences,
      userSkills,
      totalSkills
    } = result;

    const aiRecommendations = analysis?.recommendations ?? recommendations ?? {};
    const recommendedRoles = aiRecommendations?.recommended_roles ?? aiRecommendations?.career_matches ?? [];
    const industryInsights = aiRecommendations?.industry_insights ?? analysis?.industry_insights ?? {};
    const nextSteps = aiRecommendations?.next_steps ?? analysis?.next_steps ?? [];
    const skillGaps = aiRecommendations?.skill_gaps ?? analysis?.skill_gaps ?? [];
    const learningResources = aiRecommendations?.learning_resources ?? analysis?.learning_resources ?? [];
    const confidenceScore = aiRecommendations?.confidence_score;
    const success = analysis?.success ?? aiRecommendations?.success;

    const combinedSkills = totalSkills || userSkills || { technical: [], soft: [] };

    return {
      message,
      extractedSkills,
      preferences,
      combinedSkills,
      recommendedRoles,
      industryInsights,
      nextSteps,
      skillGaps,
      learningResources,
      confidenceScore,
      success
    };
  };

  const analysisData = analysisResult ? buildAnalysisData(analysisResult) : null;

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Engineering',
    'Design',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Other'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)' },
    { value: 'advanced', label: 'Advanced (5-10 years)' },
    { value: 'expert', label: 'Expert (10+ years)' }
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setResumeFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF, DOC, or DOCX file');
        setResumeFile(null);
      }
    }
  };

  const runAnalysis = async () => {
    if (!industry || !goals) {
      setError('Please fill in all required fields');
      return;
    }

    if (resumeFile && resumeFile.size === 0) {
      setError('Your resume file appears to be empty. Please try uploading again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userInfo = getUserFromStorage();

      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('industry', industry);
        formData.append('goals', goals);
        formData.append('experienceLevel', experienceLevel);

        const response = await fetch('http://localhost:3000/api/ai/analyze-resume', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        const result = await response.json();
        setAnalysisResult(result);
      } else {
        const response = await fetch('http://localhost:3000/api/ai/analyze-existing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          },
          body: JSON.stringify({
            industry,
            goals,
            experienceLevel
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        const result = await response.json();
        setAnalysisResult(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setIndustry('');
    setGoals('');
    setExperienceLevel('intermediate');
    setResumeFile(null);
  };

  const renderAnalysisResults = () => {
    if (!analysisData) return null;

    const {
      message,
      extractedSkills,
      preferences,
      combinedSkills,
      recommendedRoles,
      industryInsights,
      nextSteps,
      skillGaps,
      learningResources,
      confidenceScore,
      success
    } = analysisData;

    return (
      <div className="space-y-6">
        <Card className="rounded-3xl border-border/60 shadow-lg">
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">AI Analysis Results</h3>
              {message && <p className="text-muted-foreground text-sm">{message}</p>}
            </div>
            <Button variant="secondary" onClick={resetAnalysis} className="self-start sm:self-auto">
              Start New Analysis
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Status:</span>
                <Badge variant={success ? 'secondary' : 'outline'}>
                  {success ? 'Analysis complete' : 'Partial results'}
                </Badge>
              </div>
              {typeof confidenceScore === 'number' && (
                <div className="text-sm text-muted-foreground">
                  Confidence score: <span className="font-semibold text-foreground">{Math.round(confidenceScore * 100)}%</span>
                </div>
              )}
              {preferences && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><span className="font-medium text-foreground">Industry:</span> {preferences.industry || '—'}</div>
                  <div><span className="font-medium text-foreground">Goals:</span> {preferences.goals || '—'}</div>
                  <div><span className="font-medium text-foreground">Experience:</span> {preferences.experienceLevel || '—'}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Skills Used for Analysis
              </CardTitle>
              <CardDescription>Technical and soft skills considered in this analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Technical:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(combinedSkills.technical || []).length
                    ? (combinedSkills.technical || []).map((skill: string, index: number) => (
                        <Badge key={`tech-${index}`} variant="secondary">{skill}</Badge>
                      ))
                    : <span className="text-xs">No technical skills were detected.</span>}
                </div>
              </div>
              <div>
                <span className="font-medium text-foreground">Soft:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(combinedSkills.soft || []).length
                    ? (combinedSkills.soft || []).map((skill: string, index: number) => (
                        <Badge key={`soft-${index}`} variant="outline">{skill}</Badge>
                      ))
                    : <span className="text-xs">No soft skills were detected.</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extracted Skills (for resume analysis) */}
        {extractedSkills && extractedSkills.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Skills Added from Resume
              </CardTitle>
              <CardDescription>
                {extractedSkills.length} new skills were extracted from your resume and saved to your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Roles */}
        {recommendedRoles.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Recommended Roles
              </CardTitle>
              <CardDescription>Top matches based on your skills and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedRoles.map((role: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">{role.title || role.name}</h4>
                      {role.reasoning && (
                        <p className="text-sm text-muted-foreground mt-1">{role.reasoning}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {role.match_percentage && (
                        <Badge variant="outline">Match: {role.match_percentage}%</Badge>
                      )}
                      {role.growth_potential && (
                        <Badge variant="secondary">Growth: {role.growth_potential}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    {role.required_skills && role.required_skills.length > 0 && (
                      <div>
                        <span className="font-medium text-foreground">Required skills:</span> {role.required_skills.join(', ')}
                      </div>
                    )}
                    {role.missing_skills && role.missing_skills.length > 0 && (
                      <div>
                        <span className="font-medium text-foreground">Skills to improve:</span> {role.missing_skills.join(', ')}
                      </div>
                    )}
                    {role.salary_range && (
                      <div>
                        <span className="font-medium text-foreground">Salary range:</span> {role.salary_range}
                      </div>
                    )}
                    {role.industry && (
                      <div>
                        <span className="font-medium text-foreground">Industry:</span> {role.industry}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Industry Insights */}
        {(industryInsights?.growth_sectors || industryInsights?.trending_industries) && (
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Industry Insights
              </CardTitle>
              {industryInsights?.recommendations && (
                <CardDescription>{industryInsights.recommendations}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {industryInsights.growth_sectors && (
                <div>
                  <span className="font-medium text-foreground">Growth sectors:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {industryInsights.growth_sectors.map((sector: string, index: number) => (
                      <Badge key={index} variant="outline">{sector}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {industryInsights.trending_industries && (
                <div>
                  <span className="font-medium text-foreground">Trending industries:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {industryInsights.trending_industries.map((industry: string, index: number) => (
                      <Badge key={index} variant="secondary">{industry}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skill Gaps */}
        {skillGaps.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Skills to Develop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillGaps.map((skill: any, index: number) => (
                <div key={index} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground">{skill.skill || skill.name}</p>
                    {skill.reason && (
                      <p className="text-sm text-muted-foreground mt-1">{skill.reason}</p>
                    )}
                  </div>
                  {skill.priority && (
                    <Badge variant={skill.priority === 'High' ? 'destructive' : 'secondary'}>{skill.priority}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Learning Resources */}
        {learningResources.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Learning Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {learningResources.map((resource: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <h5 className="font-medium text-foreground">{resource.title}</h5>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {resource.type && <Badge variant="outline">{resource.type}</Badge>}
                    {resource.duration && <span>Duration: {resource.duration}</span>}
                    {resource.level && <span>Level: {resource.level}</span>}
                  </div>
                  {resource.link && (
                    <Button asChild variant="ghost" size="sm" className="mt-2">
                      <a href={resource.link} target="_blank" rel="noreferrer">
                        Open resource
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <Card className="rounded-3xl border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recommended Next Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {nextSteps.map((step: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const handleBack = () => {
    if (showBackButton) {
      onBack?.();
    } else {
      onNavigate('dashboard');
    }
  };

  const renderHeroCard = () => {
    const heroStats = analysisData
      ? [
          {
            title: 'Role matches',
            value: analysisData.recommendedRoles.length,
            description: 'Top AI-selected paths'
          },
          {
            title: 'Skill gaps',
            value: analysisData.skillGaps.length,
            description: 'Focus areas to strengthen'
          },
          {
            title: 'Confidence',
            value: analysisData.confidenceScore ? `${Math.round(analysisData.confidenceScore * 100)}%` : '—',
            description: 'Model certainty level'
          }
        ]
      : [
          {
            title: 'Step 1',
            value: 'Share your goals',
            description: 'Tell us your target industry and ambitions'
          },
          {
            title: 'Step 2',
            value: 'Add a resume (optional)',
            description: 'Upload to unlock deeper insights'
          },
          {
            title: 'Step 3',
            value: 'Get AI guidance',
            description: 'Review roles, skill gaps, and next steps'
          }
        ];

    const statusLabel = analysisData ? 'Results ready' : 'Ready for analysis';

    return (
      <Card className="overflow-hidden rounded-3xl border-none bg-gradient-to-br from-primary/15 via-primary/5 to-background shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBack}
                    className="rounded-2xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
                    <Brain className="h-4 w-4" /> AI Career Copilot
                  </span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {analysisData ? 'Your personalized AI insights' : 'Analyze your career with AI'}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    {analysisData
                      ? 'Review how your skills stack up, explore strategic roles, and follow the guided next steps recommended by Gemini.'
                      : 'Uncover tailored career paths, uncover skill gaps, and get learning plans powered by Gemini. Pick your starting point below.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full bg-background/80 text-foreground shadow-sm">
                  {statusLabel}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm text-left"
                >
                  <p className="text-xs uppercase tracking-wide text-foreground/70">{stat.title}</p>
                  <p className="text-2xl font-semibold text-foreground mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFormView = () => (
    <>
      {error && (
        <Card className="rounded-2xl border-destructive/60 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-border/60 bg-background/90 shadow-xl">
          <CardHeader className="space-y-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600">
              <Brain className="h-4 w-4" /> Personalized analysis
            </span>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600">
                <Brain className="h-6 w-6" />
              </span>
              Share your context
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Provide a bit more context so our AI can spotlight the roles, skills, and learning paths that fit your ambitions. Uploading a resume is optional but unlocks deeper insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Preferred Industry *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind.toLowerCase()}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="goals">Career Goals *</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Describe the roles, industries, or growth you're aiming for."
                rows={4}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume Upload <span className="text-muted-foreground">(optional)</span></Label>
              <div className="rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6">
                <div className="text-center space-y-4">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload" className="cursor-pointer text-sm">
                      <span className="font-medium text-primary hover:underline">
                        Click to upload
                      </span>{' '}
                      or drag and drop your resume
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, or DOCX (max 10MB)
                    </p>
                  </div>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {resumeFile && (
                  <div className="mt-4 text-center">
                    <Badge variant="secondary" className="rounded-xl px-4 py-1">
                      {resumeFile.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={resetAnalysis}
                className="rounded-xl border-border/70 px-6"
                disabled={isLoading}
              >
                Reset form
              </Button>
              <Button
                onClick={runAnalysis}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/20"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : 'Start AI Analysis'}
              </Button>
            </div>
          </CardContent>
        </Card>
    </>
  );

  return (
    <div className="min-h-[calc(100vh-140px)] bg-muted/40 py-10 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {renderHeroCard()}
        {analysisData ? renderAnalysisResults() : renderFormView()}
      </div>
    </div>
  );
}