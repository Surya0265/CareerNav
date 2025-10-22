import { useMemo, useEffect } from "react";
import { useCareerData } from "../app/providers/CareerDataContext.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { Badge } from "../components/shared/Badge.tsx";

export const AnalysisPage = () => {
  const { latestResume } = useCareerData();
  const insights = latestResume?.ai_insights;

  useEffect(() => {
    console.log('Analysis page - latestResume:', {
      hasResume: !!latestResume,
      hasAiInsights: !!insights,
      insightsKeys: insights ? Object.keys(insights) : []
    });
    if (insights) {
      console.log('Insights content:', insights);
    }
  }, [latestResume, insights]);

  const recommendedRoles = insights?.career_recommendations?.recommended_roles ?? [];
  const skillGaps = insights?.skill_improvements?.skill_gaps ?? [];
  const resumeStrengths = insights?.resume_analysis?.strengths ?? [];
  const resumeGaps = insights?.resume_analysis?.weaknesses ?? [];
  const learningPhases = insights?.learning_path?.learning_path?.phases ?? [];

  const hasInsights = useMemo(
    () =>
      Boolean(
        recommendedRoles.length ||
          skillGaps.length ||
          resumeStrengths.length ||
          resumeGaps.length ||
          learningPhases.length
      ),
    [learningPhases.length, recommendedRoles.length, resumeGaps.length, resumeStrengths.length, skillGaps.length]
  );

  if (!insights || !hasInsights) {
    return (
      <EmptyState
        title="No analysis yet"
        description="Upload your resume or generate an analysis to populate this page."
      />
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader
          title="Recommended roles"
          description="Top matches based on your skills, goals, and resume highlights."
        />
        <CardContent>
          {recommendedRoles.length ? (
            <div className="space-y-4">
              {recommendedRoles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{role.title}</p>
                      {role.industry ? (
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {role.industry}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.match_percentage ? (
                        <Badge tone="success">Match {role.match_percentage}%</Badge>
                      ) : null}
                      {role.salary_range ? (
                        <Badge tone="default">{role.salary_range}</Badge>
                      ) : null}
                      {role.growth_potential ? (
                        <Badge tone="warning">{role.growth_potential} growth</Badge>
                      ) : null}
                    </div>
                  </div>
                  {role.reasoning ? (
                    <p className="mt-3 text-sm text-slate-300">{role.reasoning}</p>
                  ) : null}
                  {role.missing_skills?.length ? (
                    <p className="mt-3 text-xs text-slate-400">
                      Suggested focus: {role.missing_skills.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No role matches"
              description="We\'ll recommend roles once your analysis has enough data."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Skill gaps & learning path"
          description="Prioritize the capabilities that will unlock your next role."
        />
        <CardContent>
          {skillGaps.length ? (
            <div className="space-y-4">
              {skillGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{gap.skill}</p>
                    <span className="text-xs uppercase tracking-wide text-amber-200">
                      Priority {gap.learning_priority ?? "-"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-amber-100/80">
                    Target level: {gap.target_level ?? "Advanced"}
                  </p>
                  {gap.resources?.length ? (
                    <p className="mt-3 text-xs text-amber-100/70">
                      Recommended resources: {gap.resources.slice(0, 3).join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No skill gaps identified"
              description="Nice work! Keep refining your strengths for even better matches."
            />
          )}

          {learningPhases.length ? (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Learning roadmap
              </h3>
              {learningPhases.map((phase, index) => (
                <div
                  key={phase.phase_number ?? phase.title ?? `phase-${index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {phase.phase_number ? `Phase ${phase.phase_number}: ` : ""}
                    {phase.title ?? "Focused practice"}
                  </p>
                  {phase.duration ? (
                    <p className="text-xs text-slate-400">{phase.duration}</p>
                  ) : null}
                  {phase.skills?.length ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Focus skills: {phase.skills.join(", ")}
                    </p>
                  ) : null}
                  {phase.resources?.length ? (
                    <ul className="mt-3 space-y-2 text-xs text-blue-200">
                      {phase.resources.map((resource, resourceIndex) => {
                        // Log for debugging - show EXACTLY what's in the resource
                        if (resourceIndex === 0) {
                          console.log('[ANALYSIS] First resource FULL DUMP:', resource);
                          console.log('[ANALYSIS] First resource keys:', Object.keys(resource as any));
                          console.log('[ANALYSIS] First resource .link:', (resource as any)?.link);
                          console.log('[ANALYSIS] First resource .externalLink:', (resource as any)?.externalLink);
                          console.log('[ANALYSIS] First resource .name:', (resource as any)?.name);
                        }
                        
                        const href = (resource as any)?.link || (resource as any)?.externalLink;
                        const displayName = (resource as any)?.name || (resource as any)?.title || resource?.type || (typeof resource === 'string' ? resource : 'Resource');
                        const provider = (resource as any)?.provider;
                        
                        // Only render links that have valid https:// URLs
                        if (!href || typeof href !== 'string' || !href.startsWith('http')) {
                          console.log('[ANALYSIS] Skipping resource (no valid href):', { href, displayName });
                          return (
                            <li key={`${phase.title ?? `phase-${index}`}-resource-${resourceIndex}`}>
                              <span>{displayName}</span>
                              {provider && <span className="ml-2 text-xs text-slate-400">({provider})</span>}
                            </li>
                          );
                        }
                        
                        return (
                          <li key={`${phase.title ?? `phase-${index}`}-resource-${resourceIndex}`}>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-white"
                            >
                              {displayName}
                            </a>
                            {provider && <span className="ml-2 text-xs text-slate-400">({provider})</span>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Resume analysis"
          description="Where your resume shines and where it can grow stronger."
        />
        <CardContent>
          {resumeStrengths.length || resumeGaps.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-emerald-200">Strengths</h3>
                {resumeStrengths.length ? (
                  <ul className="space-y-2 text-sm text-slate-100">
                    {resumeStrengths.map((item) => (
                      <li
                        key={item}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No highlights captured yet.</p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-rose-200">Opportunities</h3>
                {resumeGaps.length ? (
                  <ul className="space-y-2 text-sm text-slate-100">
                    {resumeGaps.map((item) => (
                      <li
                        key={item}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No obvious gaps identified.</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Resume review pending"
              description="Run an analysis to reveal detailed resume feedback."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
