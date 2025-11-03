import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finalizeResume, uploadResume } from "../services/resume.ts";
import type { ResumeUploadResponse } from "../types/resume.ts";
import { Input } from "../components/shared/Input.tsx";
import { Textarea } from "../components/shared/Textarea.tsx";
import { Button, buttonVariants } from "../components/shared/Button.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { Badge } from "../components/shared/Badge.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { useToast } from "../components/shared/ToastContext.ts";
import { useCareerData } from "../app/providers/CareerDataContext.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { cn } from "../utils/cn.ts";

type Step = "upload" | "review" | "preferences";

const parseIndustries = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const ResumeUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [industriesInput, setIndustriesInput] = useState("");
  const [goals, setGoals] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    email: "",
  });
  const [skillsInput, setSkillsInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [projectsInput, setProjectsInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { push } = useToast();
  const { latestResume, setLatestResume, setIsResumeBeingReplaced } = useCareerData();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (): Promise<ResumeUploadResponse> => {
      if (!file) {
        throw new Error("Please select a resume file before submitting.");
      }

      return uploadResume({
        file,
      });
    },
    onSuccess: (data) => {
      console.log('Upload successful, data:', data);
      setLatestResume(data);
      // Set the query data explicitly to ensure AppLayout gets updated data immediately
      queryClient.setQueryData(["latest-resume", token], data);
      // Allow AppLayout to resume fetching
      setIsResumeBeingReplaced(false);
      setStep("review");
      
      // Scroll to top to show the review section
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      push({
        title: "Resume extracted",
        description: "Review and confirm your details before generating insights.",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      console.error('Upload error:', error);
      const message =
        error instanceof Error ? error.message : "Unable to process resume.";
      push({ title: "Upload failed", description: message, tone: "error" });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const preferencesPayload = {
        industries: parseIndustries(industriesInput),
        goals,
        location: preferredLocation,
      };

      return finalizeResume({
        personalInfo: profileDetails,
        preferences: preferencesPayload,
        sections: {
          technicalSkills: parseListInput(skillsInput),
          experienceEntries: parseListInput(experienceInput),
          projectEntries: parseListInput(projectsInput),
        },
      });
    },
    onSuccess: (data) => {
      console.log('Finalize successful, response data:', data);
      console.log('AI Insights in response:', data.ai_insights);
      setLatestResume(data);
      // Set the query data explicitly to ensure AppLayout gets updated data immediately
      queryClient.setQueryData(["latest-resume", token], data);
      push({
        title: "Preferences saved",
        description: "We tailored the insights to your goals.",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to finalize resume.";
      push({ title: "Update failed", description: message, tone: "error" });
    },
  });

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!file) {
      push({
        title: "No file selected",
        description: "Please select a resume file to upload.",
        tone: "error",
      });
      return;
    }
    
    // Validate file before uploading
    const validation = validateFile(file);
    if (!validation.isValid) {
      push({
        title: "Invalid file",
        description: validation.error,
        tone: "error",
      });
      return;
    }

    uploadMutation.mutate();
  };

  const handleFinalize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    finalizeMutation.mutate();
  };

  const acceptedTypes = useMemo(() => ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], []);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Validate file before upload
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check if file is empty
    if (file.size === 0) {
      return { isValid: false, error: "File is empty. Please upload a valid resume." };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return {
        isValid: false,
        error: `File is too large (${sizeMB}MB). Maximum size is 10MB.`,
      };
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Invalid file type. Please upload a PDF or Word document.",
      };
    }

    return { isValid: true };
  };

  const parseListInput = (input: string) =>
    input
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  const formatList = (items?: string[] | null) => {
    if (!Array.isArray(items) || !items.length) {
      return "";
    }
    return items.join("\n");
  };

  const detectedSkills = latestResume?.extracted_info?.detected_skills ?? [];
  const totalSkills = latestResume?.extracted_info?.total_skills_found ?? 0;

  useEffect(() => {
    if (!latestResume) {
      console.log('No latest resume, resetting to upload step');
      setStep("upload");
      setProfileDetails({ name: "", email: "" });
      setSkillsInput("");
      setExperienceInput("");
      setProjectsInput("");
      setIndustriesInput("");
      setGoals("");
      setPreferredLocation("");
      return;
    }

    console.log('Latest resume updated, populating form fields');
    setStep((prev) => (prev === "upload" ? "review" : prev));

    setProfileDetails({
      name:
        (latestResume.extracted_info?.name as string | undefined) ??
        (latestResume.extracted_info?.full_name as string | undefined) ??
        "",
      email: (latestResume.extracted_info?.email as string | undefined) ?? "",
    });

    const detectedSkills = latestResume.extracted_info?.detected_skills ?? [];
    console.log('Detected skills:', detectedSkills);
    setSkillsInput(formatList(detectedSkills));

    const experienceSource = Array.isArray(latestResume.extracted_info?.experience_entries)
      ? latestResume.extracted_info?.experience_entries
      : latestResume.extracted_info?.experience_keywords;
    setExperienceInput(formatList(experienceSource ?? []));

    setProjectsInput(formatList(latestResume.extracted_info?.project_entries));

    const industriesPref = latestResume.preferences?.industries;
    setIndustriesInput(
      Array.isArray(industriesPref)
        ? industriesPref.join(", ")
        : typeof industriesPref === "string"
        ? industriesPref
        : ""
    );
    setGoals(latestResume.preferences?.goals ?? "");
    setPreferredLocation(latestResume.preferences?.location ?? "");
  }, [latestResume]);

  const isUploadStep = step === "upload";
  const isReviewStep = step === "review";
  const isPreferencesStep = step === "preferences";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      {/* Header Section - Mobile Optimized */}
      <section className="lg:col-span-2 mb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isUploadStep
              ? "Upload your resume"
              : isReviewStep
              ? "Review your details"
              : "Your career goals"}
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            {isUploadStep
              ? "We'll scan the file and surface everything we can find."
              : isReviewStep
              ? "Double-check what we detected. You can correct anything before analysis."
              : "These preferences guide the personalized recommendations we'll create for you."}
          </p>
          {isUploadStep && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PDF or Word
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Max 10MB
              </span>
            </div>
          )}
        </div>
      </section>

      <Card>
        <CardContent className="pt-6">
          {isUploadStep ? (
            <form onSubmit={handleUpload} className="space-y-6">
              <FormField
                label="Resume file"
                description={
                  <div className="space-y-1 text-xs">
                    <p>• Accepted formats: PDF or Word documents (max 10MB)</p>
                    <p>• Avoid graphical elements and infographics for better parsing</p>
                    <p>• Use structured, text-based resume for best results</p>
                  </div>
                }
                action={
                  <span className="text-xs text-slate-500 font-medium">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Up to 10 MB"}
                  </span>
                }
              >
                <label
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition",
                    file
                      ? "border-blue-500 bg-blue-500/15 p-8"
                      : "border-slate-700 bg-slate-900/30 hover:border-blue-500/50 hover:bg-slate-900/50 p-10 md:p-12"
                  )}
                >
                  <input
                    type="file"
                    accept={acceptedTypes.join(",")}
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(event) => {
                      const selected = event.target.files?.[0];
                      if (selected) {
                        setFile(selected);
                        event.target.value = "";
                      }
                    }}
                  />
                  <div className={cn(
                    "rounded-full p-3 text-2xl",
                    file ? "bg-blue-500/30 text-blue-200" : "bg-slate-800 text-slate-300"
                  )}>
                    �
                  </div>
                  <div className="text-center">
                    <p className="text-sm md:text-base font-semibold text-slate-100">
                      {file ? file.name : "Drag & drop your resume"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {file ? "Ready to extract and analyze" : "or click to browse files"}
                    </p>
                  </div>
                </label>
              </FormField>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={uploadMutation.isPending || !file}
                  className="gap-2 min-h-10 md:min-h-9"
                >
                  {uploadMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Extracting
                    </span>
                  ) : (
                    "Extract details"
                  )}
                </Button>
                <span className="text-xs text-slate-400">
                  We'll keep your data secure and private.
                </span>
              </div>
            </form>
          ) : null}

          {isReviewStep ? (
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                setStep("preferences");
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">Detected name</p>
                  <p className="mt-3 text-sm font-semibold text-slate-100">
                    {profileDetails.name || "Not detected"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">Email</p>
                  <p className="mt-3 text-sm font-semibold text-slate-100">
                    {profileDetails.email || "Not detected"}
                  </p>
                </div>
              </div>

              <FormField
                label="Technical skills"
                description="One skill per line. We'll sync these with your talent profile."
              >
                <Textarea
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  rows={6}
                  placeholder={"React\nTypeScript\nGraphQL"}
                />
              </FormField>

              <FormField
                label="Experience highlights"
                description="List roles or standout accomplishments. One entry per line works best."
              >
                <Textarea
                  value={experienceInput}
                  onChange={(event) => setExperienceInput(event.target.value)}
                  rows={6}
                  placeholder={
                    "Senior Frontend Engineer – Led redesign for analytics suite\nSoftware Developer – Built automation tooling that reduced release time"
                  }
                />
              </FormField>

              <FormField
                label="Project highlights"
                description="Optional. Include personal or professional projects you'd like factored into recommendations."
              >
                <Textarea
                  value={projectsInput}
                  onChange={(event) => setProjectsInput(event.target.value)}
                  rows={4}
                  placeholder={"Realtime analytics dashboard\nOpen-source UI component library"}
                />
              </FormField>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-slate-500">
                  Fine-tune your skills and experience before we personalize insights.
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      // Set flag to prevent AppLayout from auto-refetching old resume
                      setIsResumeBeingReplaced(true);
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setProfileDetails({ name: "", email: "" });
                      setSkillsInput("");
                      setExperienceInput("");
                      setProjectsInput("");
                      setLatestResume(undefined);
                      // Clear the query cache and invalidate so AppLayout doesn't show stale data
                      queryClient.setQueryData(["latest-resume", token], null);
                      queryClient.invalidateQueries({ queryKey: ["latest-resume"] });
                      setStep("upload");
                    }}
                  >
                    Replace resume
                  </Button>
                  <Button type="submit">Continue</Button>
                </div>
              </div>
            </form>
          ) : null}

          {isPreferencesStep ? (
            <form onSubmit={handleFinalize} className="space-y-5">
              <FormField
                label="Focus industries"
                description="Separate with commas"
              >
                <Input
                  value={industriesInput}
                  onChange={(event) => setIndustriesInput(event.target.value)}
                  placeholder="e.g. Software, Fintech"
                />
              </FormField>

              <FormField label="Career goals">
                <Textarea
                  value={goals}
                  onChange={(event) => setGoals(event.target.value)}
                  placeholder="Describe the type of role or impact you're targeting"
                />
              </FormField>

              <FormField label="Preferred location">
                <Input
                  value={preferredLocation}
                  onChange={(event) => setPreferredLocation(event.target.value)}
                  placeholder="Remote, Bangalore, etc."
                />
              </FormField>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("review")}
                >
                  Back
                </Button>
                <Button type="submit" disabled={finalizeMutation.isPending}>
                  {finalizeMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Updating insights
                    </span>
                  ) : (
                    "Save & generate insights"
                  )}
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Latest highlights"
            description="We surface the essentials from your most recent upload."
            action={
              latestResume ? (
                <a
                  href="#analysis"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "hidden md:inline-flex gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  Jump to analysis
                </a>
              ) : undefined
            }
          />
          <CardContent>
            {latestResume ? (
              <div className="space-y-5 text-sm text-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Skills captured
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{totalSkills}</p>
                </div>
                <div className="space-y-2">
                  {detectedSkills.slice(0, 12).map((skill) => (
                    <Badge key={skill} className="mr-2">
                      {skill}
                    </Badge>
                  ))}
                  {detectedSkills.length > 12 ? (
                    <p className="text-xs text-slate-500">
                      +{detectedSkills.length - 12} more detected
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No resume analyzed yet"
                description="Upload to see AI-powered resume breakdowns and suggestions."
              />
            )}
          </CardContent>
        </Card>

        <Card id="analysis">
          <CardHeader
            title="AI insights snapshot"
            description={
              latestResume?.ai_insights?.career_recommendations
                ? "A quick preview of the most impactful recommendations."
                : "Complete your preferences to unlock tailored guidance."
            }
          />
          <CardContent>
            {latestResume?.ai_insights?.career_recommendations?.recommended_roles ? (
              <ul className="space-y-3 text-sm text-slate-200">
                {latestResume.ai_insights.career_recommendations.recommended_roles
                  ?.slice(0, 3)
                  .map((role) => (
                    <li
                      key={role.title}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{role.title}</span>
                        {role.match_percentage ? (
                          <Badge tone="success">{role.match_percentage}% match</Badge>
                        ) : null}
                      </div>
                      {role.required_skills?.length ? (
                        <p className="mt-2 text-xs text-slate-400">
                          Core skills: {role.required_skills.slice(0, 4).join(", ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
              </ul>
            ) : (
              <EmptyState
                title="Insights will appear here"
                description={
                  isPreferencesStep
                    ? "Finish setting your preferences to get recommendations."
                    : "Upload and confirm your resume to unlock AI guidance."
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
