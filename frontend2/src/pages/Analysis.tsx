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
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold text-white">Career Analysis</h1>
        <p className="mt-2 text-slate-300">
          AI-powered insights about your career path, skills, and resume
        </p>
      </section>

      <Card>
        <CardHeader
          title="Recommended Roles"
          description="Top matches based on your skills, goals, and resume highlights."
        />
        <CardContent>
          {recommendedRoles.length ? (
            <div className="space-y-4">
              {recommendedRoles.map((role) => (
                <div
                  key={role.title}
                  className="group rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-slate-900/60 p-5 hover:border-blue-500/50 hover:from-blue-500/20 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition">{role.title}</p>
                      {role.industry ? (
                        <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">
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
                    <p className="mt-3 text-sm text-slate-200">{role.reasoning}</p>
                  ) : null}
                  {role.missing_skills?.length ? (
                    <p className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                      <span className="font-semibold">Suggested focus:</span>
                      <span>{role.missing_skills.join(", ")}</span>
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
          title="Skill Gaps & Learning Path"
          description="Prioritize the capabilities that will unlock your next role."
        />
        <CardContent>
          {skillGaps.length ? (
            <div className="space-y-4">
              {skillGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="group rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-slate-900/60 p-5 hover:border-amber-500/60 hover:from-amber-500/25 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base font-bold text-amber-200 group-hover:text-amber-100">{gap.skill}</p>
                    <span className="text-xs uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full">
                      Priority {gap.learning_priority ?? "-"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-amber-100/90">
                    <span className="font-semibold">Target level:</span> {gap.target_level ?? "Advanced"}
                  </p>
                  {gap.resources?.length ? (
                    <p className="mt-3 text-sm text-amber-100/80">
                      <span className="font-semibold">Recommended resources:</span> {gap.resources.slice(0, 3).join(", ")}
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
            <div className="mt-8 pt-8 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Learning Roadmap</h3>
              <div className="space-y-4">
                {learningPhases.map((phase, index) => (
                  <div
                    key={phase.phase_number ?? phase.title ?? `phase-${index}`}
                    className="group rounded-xl border border-slate-700 bg-slate-900/40 p-5 hover:border-blue-500/40 hover:bg-slate-900/60 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-500/40 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-300">{phase.phase_number ?? index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-white">
                          {phase.title ?? "Focused practice"}
                        </p>
                        {phase.duration ? (
                          <p className="text-sm text-slate-400 mt-1">Duration: {phase.duration}</p>
                        ) : null}
                      </div>
                    </div>
                    {phase.skills?.length ? (
                      <div className="mt-4">
                        <p className="text-sm text-slate-300 font-medium">Focus Skills:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {phase.skills.map((skill) => (
                            <span key={skill} className="text-xs bg-slate-700/50 text-slate-200 px-3 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {phase.resources?.length ? (
                      <ul className="mt-4 space-y-2">
                        <p className="text-sm text-slate-300 font-medium">Resources:</p>
                        {phase.resources.map((resource, resourceIndex) => {
                          const href = (resource as any)?.link || (resource as any)?.externalLink;
                          const displayName = (resource as any)?.name || (resource as any)?.title || resource?.type || (typeof resource === 'string' ? resource : 'Resource');
                          const provider = (resource as any)?.provider;
                          
                          if (!href || typeof href !== 'string' || !href.startsWith('http')) {
                            return (
                              <li key={`${phase.title ?? `phase-${index}`}-resource-${resourceIndex}`} className="text-sm text-slate-400">
                                <span>• {displayName}</span>
                                {provider && <span className="ml-2 text-xs text-slate-500">({provider})</span>}
                              </li>
                            );
                          }
                          
                          return (
                            <li key={`${phase.title ?? `phase-${index}`}-resource-${resourceIndex}`}>
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2 transition"
                              >
                                <span>→ {displayName}</span>
                                {provider && <span className="text-xs text-slate-500">({provider})</span>}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Resume Analysis"
          description="Detailed insights into your resume strengths and opportunities."
        />
        <CardContent>
          {resumeStrengths.length || resumeGaps.length ? (
            <div className="space-y-6">
              {/* Strengths Section */}
              {resumeStrengths.length ? (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Resume Strengths</h3>
                  <div className="space-y-3">
                    {resumeStrengths.map((item) => (
                      <div
                        key={item}
                        className="group rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-slate-900/60 p-4 hover:border-emerald-500/60 hover:from-emerald-500/25 transition-all duration-300"
                      >
                        <p className="text-base font-semibold text-emerald-200 group-hover:text-emerald-100">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Gaps Section */}
              {resumeGaps.length ? (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Areas for Improvement</h3>
                  <div className="space-y-3">
                    {resumeGaps.map((item) => (
                      <div
                        key={item}
                        className="group rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 to-slate-900/60 p-4 hover:border-rose-500/60 hover:from-rose-500/25 transition-all duration-300"
                      >
                        <p className="text-base font-semibold text-rose-200 group-hover:text-rose-100">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
