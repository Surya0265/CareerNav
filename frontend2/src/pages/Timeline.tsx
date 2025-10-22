import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateTimeline } from "../services/timeline.ts";
import type { TimelineRequest, TimelineResponse } from "../types/timeline.ts";
import { useCareerData } from "../app/providers/CareerDataContext.ts";
import { getTimelineHistory } from "../services/timeline.ts";
import { useAuth } from "../hooks/useAuth.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Input } from "../components/shared/Input.tsx";
import { Textarea } from "../components/shared/Textarea.tsx";
import { Button } from "../components/shared/Button.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { Badge } from "../components/shared/Badge.tsx";
import { MermaidChart } from "../components/MermaidChart.tsx";
import { useNavigate } from "react-router-dom";

const defaultRequest: TimelineRequest = {
  current_skills: ["JavaScript", "React", "Node.js"],
  target_job: "Full-Stack Developer",
  timeframe_months: 6,
};

export const TimelinePage = () => {
  const { latestResume, latestTimeline, setLatestTimeline } = useCareerData();
  const { push } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      // Include resume data (projects, experience, etc.) in the context
      const additionalContext: Record<string, unknown> = {};
      
      if (context) {
        additionalContext.notes = context;
      }
      
      if (latestResume?.extracted_info) {
        additionalContext.experience = latestResume.extracted_info.experience_entries || [];
        additionalContext.education = latestResume.extracted_info.has_education_keywords || false;
        additionalContext.projects = latestResume.extracted_info.project_entries || [];
        additionalContext.summary = latestResume.extracted_info.name || "";
      }
      
      const payload: TimelineRequest = {
        current_skills: skillsInput
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        target_job: targetRole,
        timeframe_months: Number(timeframe) || defaultRequest.timeframe_months,
        additional_context: Object.keys(additionalContext).length > 0 ? additionalContext : undefined,
      };

      console.log('TimelinePage: Sending payload:', payload);
      return generateTimeline(payload);
    },
    onSuccess: (data) => {
      console.log('TimelinePage: Timeline generated successfully:', {
        hasData: !!data,
        hasTimeline: !!data?.timeline,
        timelineLength: data?.timeline?.length,
        data: JSON.stringify(data, null, 2)
      });
      setLatestTimeline(data);
      push({
        title: "Timeline ready",
        description: "Your roadmap is updated based on the latest details.",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      console.error('TimelinePage: Error generating timeline:', error);
      const message = error instanceof Error ? error.message : "Failed to generate timeline.";
      push({
        title: "Generation failed",
        description: message,
        tone: "error",
      });
    },
  });

  const milestones = latestTimeline?.timeline ?? [];
  
  const totalDuration = milestones.reduce((acc, item) => acc + (item.duration_weeks ?? 0), 0);
  
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  
  const selectedPhase = milestones[selectedPhaseIndex];
  // container reference for exports (set by MermaidChart via onExportRef)
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // NOTE: downloadFile and extractNodeText removed — this page only offers
  // a high-quality JPG export of the rendered Mermaid chart.

  async function downloadSvgAsJpeg(container: HTMLDivElement | null, filename = 'career-roadmap.jpg', quality = 1.0) {
    if (!container) return alert('Chart not ready');
    const svgEl = container.querySelector('svg') as SVGSVGElement | null;
    if (!svgEl) return alert('Chart SVG not available');

    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(svgEl);
    if (!svgStr.match(/^<svg[^>]+xmlns="http/)) {
      svgStr = svgStr.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const rect = svgEl.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert('Unable to create canvas');
          resolve();
          return;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // black background for JPG export (user requested)
  ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to create JPEG');
            resolve();
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/jpeg', quality);
      };
      img.onerror = () => {
        alert('Failed to load SVG as image');
        resolve();
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    });
  }

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <Card>
        <CardHeader
          title="Generate your next sprint"
          description="Tailor the plan by adjusting skills, time horizon, and focus."
        />
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              console.log('TimelinePage: Form submitted!');
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
                "Generate Timeline"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div />
        <div>
          <button
            onClick={async () => {
              if (!isAuthenticated) {
                push({ title: 'Sign in required', description: 'Please login to view your saved timelines', tone: 'info' });
                return;
              }
              try {
                setHistoryLoading(true);
                const resp = await getTimelineHistory();
                setHistory(resp.records || []);
              } catch (err) {
                console.error('Failed to fetch timeline history', err);
                push({ title: 'Error', description: 'Failed to fetch timeline history', tone: 'error' });
              } finally {
                setHistoryLoading(false);
              }
            }}
            className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm"
          >
            {historyLoading ? 'Loading...' : 'Mark your progess'}
          </button>
        </div>
      </div>

      {/* History list (if present) */}
      {history && history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Timeline Plans</h2>
          <div className="grid gap-3">
            {history.map((rec: any) => (
              <div key={rec._id} className="p-3 bg-slate-900 rounded border border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-300">{rec.target_job || '—'}</div>
                    <div className="text-xs text-slate-500">{rec.current_skills?.join?.(', ') || ''} • {new Date(rec.createdAt).toLocaleString()}</div>
                  </div>
                  <button
                    className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
                    onClick={() => navigate(`/timeline/${rec._id}`)}
                  >
                    Mark
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases with Details Layout */}
      {milestones.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left column - Phases list (single column) */}
          <Card>
            <CardHeader
              title="Phases"
              description={`${milestones.length} phases • ~${Math.round(totalDuration / 4)} months`}
            />
            <CardContent>
              <div className="space-y-2">
                {milestones.map((phase, idx) => (
                  <button
                    key={phase.title}
                    onClick={() => setSelectedPhaseIndex(idx)}
                    className={`w-full text-left rounded-lg p-3 transition-colors ${
                      selectedPhaseIndex === idx
                        ? "bg-blue-900 border-2 border-blue-500 text-white"
                        : "bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {phase.title}
                        </p>
                        {phase.duration_weeks && (
                          <p className="text-xs text-slate-400 mt-1">
                            {phase.duration_weeks} weeks
                          </p>
                        )}
                      </div>
                      <div className="text-blue-400">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right column - Details for selected phase */}
          <div className="space-y-4">
            {selectedPhase ? (
              <>
                {/* Phase Title and Description */}
                <Card>
                  <CardHeader
                    title={`${selectedPhase.title}`}
                    description={`${selectedPhase.duration_weeks} weeks`}
                  />
                  <CardContent>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {selectedPhase.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Skills to Learn */}
                {selectedPhase.skills && selectedPhase.skills.length > 0 && (
                  <Card>
                    <CardHeader
                      title="Skills to Learn"
                      description={`${selectedPhase.skills.length} skills`}
                    />
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhase.skills.map((skill) => (
                          <Badge key={`${selectedPhase.title}-skill-${skill}`} tone="default">
                            ✓ {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Projects to Build */}
                {selectedPhase.projects && selectedPhase.projects.length > 0 && (
                  <Card>
                    <CardHeader
                      title="Projects to Build"
                      description={`${selectedPhase.projects.length} projects`}
                    />
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedPhase.projects.map((project) => (
                          <li key={`${selectedPhase.title}-project-${project}`} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-blue-400 mt-1">→</span>
                            <span>{project}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Milestones */}
                {selectedPhase.milestones && selectedPhase.milestones.length > 0 && (
                  <Card>
                    <CardHeader
                      title="Milestones"
                      description={`${selectedPhase.milestones.length} milestones`}
                    />
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedPhase.milestones.map((milestone) => (
                          <li key={`${selectedPhase.title}-milestone-${milestone}`} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent>
                  <EmptyState
                    title="Select a phase"
                    description="Click on a phase from the left to see details."
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : mutation.isPending ? (
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              title="No milestones yet"
              description="Generate a plan to see your phases and details."
            />
          </CardContent>
        </Card>
      )}

      {/* Full width - Diagram */}
      <Card>
        <CardHeader
          title="Career Roadmap Visualization"
          description="Your step-by-step path to your target role"
        />
        <CardContent>
          {latestTimeline?.mermaid_chart && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 overflow-x-auto">
              {/* Download JPG only (high quality) */}
              <div className="flex gap-2 mb-4">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                  onClick={async () => {
                    await downloadSvgAsJpeg(chartContainerRef.current, 'career-roadmap.jpg', 1.0);
                  }}
                >
                  Download Image
                </button>
              </div>

              <MermaidChart chart={latestTimeline.mermaid_chart} onExportRef={(el) => (chartContainerRef.current = el)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
