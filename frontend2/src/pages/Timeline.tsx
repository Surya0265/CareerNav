import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateTimeline } from "../services/timeline.ts";
import type { TimelineRequest, TimelineResponse } from "../types/timeline.ts";
import { useCareerData } from "../app/providers/CareerDataContext.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Input } from "../components/shared/Input.tsx";
import { Textarea } from "../components/shared/Textarea.tsx";
import { Button } from "../components/shared/Button.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { Badge } from "../components/shared/Badge.tsx";

const defaultRequest: TimelineRequest = {
  current_skills: ["JavaScript", "React", "Node.js"],
  target_job: "Full-Stack Developer",
  timeframe_months: 6,
};

export const TimelinePage = () => {
  const { latestResume, latestTimeline, setLatestTimeline } = useCareerData();
  const { push } = useToast();

  const [skillsInput, setSkillsInput] = useState(defaultRequest.current_skills.join(", "));
  const [targetRole, setTargetRole] = useState(defaultRequest.target_job);
  const [timeframe, setTimeframe] = useState(defaultRequest.timeframe_months.toString());
  const [context, setContext] = useState("Focus on open-source contributions and interview prep.");

  useEffect(() => {
    const detected = latestResume?.extracted_info?.detected_skills;
    if (detected?.length) {
      setSkillsInput(detected.slice(0, 10).join(", "));
    }
  }, [latestResume]);

  const mutation = useMutation({
    mutationFn: async (): Promise<TimelineResponse> => {
      const payload: TimelineRequest = {
        current_skills: skillsInput
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        target_job: targetRole,
        timeframe_months: Number(timeframe) || defaultRequest.timeframe_months,
        additional_context: context
          ? {
              notes: context,
            }
          : undefined,
      };

      return generateTimeline(payload);
    },
    onSuccess: (data) => {
      setLatestTimeline(data);
      push({
        title: "Timeline ready",
        description: "Your roadmap is updated based on the latest details.",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to generate timeline.";
      push({
        title: "Generation failed",
        description: message,
        tone: "error",
      });
    },
  });

  const milestones = useMemo(() => latestTimeline?.timeline ?? [], [latestTimeline]);

  const totalDuration = useMemo(() => {
    return milestones.reduce((acc, item) => acc + (item.duration_weeks ?? 0), 0);
  }, [milestones]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader
          title="Generate your next sprint"
          description="Tailor the plan by adjusting skills, time horizon, and focus."
        />
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5"
          >
            <FormField label="Key skills" description="Separate with commas">
              <Textarea
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                placeholder="React, APIs, DSA"
              />
            </FormField>

            <FormField label="Target role">
              <Input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="e.g. Frontend Engineer"
              />
            </FormField>

            <FormField label="Timeframe (months)">
              <Input
                type="number"
                min={3}
                max={24}
                value={timeframe}
                onChange={(event) => setTimeframe(event.target.value)}
              />
            </FormField>

            <FormField label="Additional context" description="Optional nuance for the AI">
              <Textarea
                value={context}
                onChange={(event) => setContext(event.target.value)}
              />
            </FormField>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Generating
                </span>
              ) : (
                "Generate timeline"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Milestones"
          description={
            milestones.length
              ? `Total duration ~${Math.round(totalDuration / 4)} months`
              : "Create a plan to see structured milestones."
          }
        />
        <CardContent>
          {milestones.length ? (
            <div className="space-y-4">
              {milestones.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      {item.description ? (
                        <p className="mt-2 text-xs text-slate-400">{item.description}</p>
                      ) : null}
                    </div>
                    {item.duration_weeks ? (
                      <Badge tone="default">{item.duration_weeks} weeks</Badge>
                    ) : null}
                  </div>
                  {item.resources?.length ? (
                    <ul className="mt-3 space-y-1 text-xs text-blue-200">
                      {item.resources.map((resource) => (
                        <li key={`${item.title}-${resource}`}>{resource}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : mutation.isPending ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : (
            <EmptyState
              title="No timeline yet"
              description="Generate a plan to see curated milestones and checkpoints."
            />
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="Mermaid chart"
          description="Copy this into your favorite Mermaid renderer to visualize the flow."
        />
        <CardContent>
          {latestTimeline?.mermaid_chart ? (
            <pre className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-xs text-slate-200">
              {latestTimeline.mermaid_chart}
            </pre>
          ) : (
            <EmptyState
              title="No chart available"
              description="Generate a timeline to receive Mermaid diagram output."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
