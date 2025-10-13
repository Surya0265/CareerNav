import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
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
  const { latestResume, setLatestResume } = useCareerData();

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
      setLatestResume(data);
      setStep("review");
      push({
        title: "Resume extracted",
        description: "Review and confirm your details before generating insights.",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
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
      setLatestResume(data);
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
    uploadMutation.mutate();
  };

  const handleFinalize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    finalizeMutation.mutate();
  };

  const acceptedTypes = useMemo(() => ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], []);

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

    setStep((prev) => (prev === "upload" ? "review" : prev));

    setProfileDetails({
      name:
        (latestResume.extracted_info?.name as string | undefined) ??
        (latestResume.extracted_info?.full_name as string | undefined) ??
        "",
      email: (latestResume.extracted_info?.email as string | undefined) ?? "",
    });

    setSkillsInput(formatList(latestResume.extracted_info?.detected_skills));

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
      <Card>
        <CardHeader
          title={
            isUploadStep
              ? "Upload your resume"
              : isReviewStep
              ? "Review extracted details"
              : "Tell us about your goals"
          }
          description={
            isUploadStep
              ? "We'll scan the file and surface everything we can find."
              : isReviewStep
              ? "Double-check what we detected so you can correct anything before analysis."
              : "These preferences guide the personalized recommendations."
          }
        />
        <CardContent>
          {isUploadStep ? (
            <form onSubmit={handleUpload} className="space-y-5">
              <FormField
                label="Resume file"
                description="Accepted formats: PDF or Word documents (max 10MB)."
                action={
                  <span className="text-xs text-slate-500">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Up to 10 MB"}
                  </span>
                }
              >
                <label
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center transition hover:border-blue-500/60 hover:bg-slate-900/70",
                    file && "border-blue-500 bg-blue-500/10"
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
                  <div className="rounded-full bg-blue-500/20 p-3 text-2xl">📁</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {file ? file.name : "Drag & drop or browse"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {file ? "Ready to extract" : "We'll keep your data secure."}
                    </p>
                  </div>
                </label>
              </FormField>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={uploadMutation.isPending || !file}>
                  {uploadMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Extracting
                    </span>
                  ) : (
                    "Extract details"
                  )}
                </Button>
                <span className="text-xs text-slate-500">
                  We'll store extracted skills to personalize future insights.
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
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Detected name</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    {profileDetails.name || "Not detected"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
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
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setProfileDetails({ name: "", email: "" });
                      setSkillsInput("");
                      setExperienceInput("");
                      setProjectsInput("");
                      setLatestResume(undefined);
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
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden md:inline-flex"
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
