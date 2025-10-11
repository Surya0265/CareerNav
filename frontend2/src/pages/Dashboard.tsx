import { Link } from "react-router-dom";
import { useCareerData } from "../app/providers/CareerDataContext.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { buttonVariants } from "../components/shared/Button.tsx";
import { Badge } from "../components/shared/Badge.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { cn } from "../utils/cn.ts";

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
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                View full analysis
              </Link>
            }
          />
          <CardContent>
            {nextSteps.length ? (
              <ol className="space-y-3 text-sm text-slate-200">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full border border-blue-500/40 bg-blue-500/10 text-center text-xs font-semibold leading-6 text-blue-200">
                      {index + 1}
                    </span>
                    <span>{step}</span>
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
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Upload resume
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-500/40 bg-blue-500/10">
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
                    className="rounded-xl border border-blue-400/30 bg-slate-950/30 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{role.title}</p>
                      {role.match_percentage ? (
                        <Badge tone="success">Match {role.match_percentage}%</Badge>
                      ) : null}
                    </div>
                    {role.reasoning ? (
                      <p className="mt-2 text-xs text-slate-300/80">{role.reasoning}</p>
                    ) : null}
                    {role.missing_skills?.length ? (
                      <div className="mt-3 text-xs text-slate-400">
                        Missing skills: {role.missing_skills.join(", ")}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No roles yet"
                description="We&apos;ll recommend roles once you run an analysis."
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
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Open timeline
              </Link>
            }
          />
          <CardContent>
            {latestTimeline?.timeline?.length ? (
              <div className="space-y-4">
                {latestTimeline.timeline.slice(0, 4).map((milestone) => (
                  <div
                    key={milestone.title}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100">
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
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Generate timeline
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
                      "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No highlights yet"
                description="We&apos;ll surface resume insights after your upload."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
