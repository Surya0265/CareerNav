import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadResume } from "../services/resume.ts";
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

const parseIndustries = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const ResumeUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [industriesInput, setIndustriesInput] = useState("Software, Technology");
  const [goals, setGoals] = useState("Build a full-stack developer profile");
  const [location, setLocation] = useState("Remote");

  const { push } = useToast();
  const { latestResume, setLatestResume } = useCareerData();

  const mutation = useMutation({
    mutationFn: async (): Promise<ResumeUploadResponse> => {
      if (!file) {
        throw new Error("Please select a resume file before submitting.");
      }

      return uploadResume({
        file,
        industries: parseIndustries(industriesInput),
        goals,
        location,
      });
    },
    onSuccess: (data) => {
      setLatestResume(data);
      push({
        title: "Resume analyzed",
        description: "Fresh insights are ready on your dashboard.",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unable to process resume.";
      push({ title: "Upload failed", description: message, tone: "error" });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  const acceptedTypes = useMemo(() => ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"], []);

  const detectedSkills = latestResume?.extracted_info?.detected_skills ?? [];
  const totalSkills = latestResume?.extracted_info?.total_skills_found ?? 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader
          title="Upload your resume"
          description="We'll extract skills, analyze fit, and recommend concrete next steps."
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    if (selected) {
                      setFile(selected);
                    }
                  }}
                />
                <div className="rounded-full bg-blue-500/20 p-3 text-2xl">📁</div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {file ? file.name : "Drag & drop or browse"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {file ? "Ready to analyze" : "We'll keep your data secure."}
                  </p>
                </div>
              </label>
            </FormField>

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
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Remote, Bangalore, etc."
              />
            </FormField>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Processing
                  </span>
                ) : (
                  "Run analysis"
                )}
              </Button>
              <span className="text-xs text-slate-500">
                We'll store extracted skills to personalize future insights.
              </span>
            </div>
          </form>
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
            description="A quick preview of the most impactful recommendations."
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
                description="Your personalized recommendations show up after analysis."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
