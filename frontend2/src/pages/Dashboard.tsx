import { Link } from "react-router-dom";
import { useCareerData } from "../app/providers/CareerDataContext.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { buttonVariants } from "../components/shared/Button.tsx";
import { Badge } from "../components/shared/Badge.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { cn } from "../utils/cn.ts";
import { BarChart3, TrendingUp, Zap, Check } from "lucide-react";

export const DashboardPage = () => {
  const { latestResume, latestTimeline } = useCareerData();

  const recommendedRoles =
    latestResume?.ai_insights?.career_recommendations?.recommended_roles ?? [];
  const nextSteps = latestResume?.ai_insights?.career_recommendations?.next_steps ?? [];
  const strengths = latestResume?.ai_insights?.resume_analysis?.strengths ?? [];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            title="Personalized next steps"
            description="Keep momentum by following these action items tailored to your goals."
            action={
              <Link
                to="/analysis"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Full Analysis
              </Link>
            }
          />
          <CardContent>
            {nextSteps.length ? (
              <ol className="space-y-4 text-sm text-slate-200">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex-shrink-0 h-8 w-8 rounded-full border-2 border-blue-500 bg-blue-500/10 text-center leading-[1.75rem] text-xs font-bold text-blue-300">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                title="No recommendations yet"
                description="Upload your resume to unlock AI-powered guidance."
                action={
                  <Link
                    to="/resume"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "gap-2"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                    Upload Resume
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader
            title="Top matching roles"
            description="Aligned to your skills and preferences"
          />
          <CardContent>
            {recommendedRoles.length ? (
              <div className="space-y-3">
                {recommendedRoles.slice(0, 3).map((role) => (
                  <div
                    key={role.title}
                    className="group rounded-xl border border-slate-700 bg-slate-900/40 p-4 hover:border-slate-600 hover:bg-slate-900/60 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-white">{role.title}</p>
                      {role.match_percentage ? (
                        <Badge tone="success">Match {role.match_percentage}%</Badge>
                      ) : null}
                    </div>
                    {role.reasoning ? (
                      <p className="mt-2 text-xs text-slate-400">{role.reasoning}</p>
                    ) : null}
                    {role.missing_skills?.length ? (
                      <div className="mt-3 text-xs text-slate-500">
                        Missing skills: {role.missing_skills.join(", ")}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No roles yet"
                description="We'll recommend roles once you run an analysis."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader
            title="Career timeline snapshot"
            description="Track milestones from your latest generated plan."
            action={
              <Link
                to="/timeline"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                Open Timeline
              </Link>
            }
          />
          <CardContent>
            {latestTimeline?.timeline?.length ? (
              <div className="space-y-4">
                {latestTimeline.timeline.slice(0, 4).map((milestone) => (
                  <div
                    key={milestone.title}
                    className="group rounded-xl border border-slate-700 bg-slate-900/40 p-4 hover:border-slate-600 hover:bg-slate-900/60 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-white">
                        {milestone.title}
                      </p>
                      {milestone.duration_weeks ? (
                        <Badge tone="default">{milestone.duration_weeks} weeks</Badge>
                      ) : null}
                    </div>
                    {milestone.description ? (
                      <p className="mt-2 text-xs text-slate-400">
                        {milestone.description}
                      </p>
                    ) : null}
                    {milestone.resources?.length ? (
                      <p className="mt-3 text-xs text-slate-500">
                        Resources: {milestone.resources.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No timeline generated"
                description="Create a timeline to visualize your journey."
                action={
                  <Link
                    to="/timeline"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "gap-2"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                    Generate Timeline
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Resume highlights"
            description="Key strengths identified in your latest upload."
          />
          <CardContent>
            {strengths.length ? (
              <ul className="space-y-3">
                {strengths.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 flex items-start gap-3"
                    )}
                  >
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No highlights yet"
                description="We'll surface resume insights after your upload."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
