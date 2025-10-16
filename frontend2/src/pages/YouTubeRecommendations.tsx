import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.ts";
import { useToast } from "../components/shared/ToastContext.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { Button } from "../components/shared/Button.tsx";
import { Input } from "../components/shared/Input.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { fetchProfile } from "../services/auth.ts";
import {
  getYouTubeRecommendations,
  type YouTubeRecommendationsResponse,
  type YouTubeVideo,
  type TimelinePhase,
} from "../services/youtube.ts";

export const YouTubeRecommendationsPage = () => {
  const { user: authUser, token, setUser } = useAuth();
  const { push } = useToast();

  const [targetJob, setTargetJob] = useState("");
  const [timeframeMonths, setTimeframeMonths] = useState("6");
  const [recommendations, setRecommendations] =
    useState<YouTubeRecommendationsResponse | null>(null);

  // Fetch fresh user data to ensure skills are loaded
  const { data: freshUser } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: Boolean(token),
  });

  // Use fresh user data if available, otherwise use auth user
  const user = freshUser || authUser;

  useEffect(() => {
    if (freshUser) {
      setUser(freshUser);
    }
  }, [freshUser, setUser]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.skills || user.skills.length === 0) {
        throw new Error("Please upload your resume first to extract skills");
      }

      if (!targetJob.trim()) {
        throw new Error("Please enter your target job role");
      }

      const skillNames = user.skills.map((skill) =>
        typeof skill === "string" ? skill : skill.name
      );

      return getYouTubeRecommendations({
        current_skills: skillNames,
        target_job: targetJob,
        timeframe_months: parseInt(timeframeMonths),
        additional_context: {},
      });
    },
    onSuccess: (data) => {
      setRecommendations(data);
      push({
        title: "Recommendations loaded!",
        description: "YouTube videos and career timeline ready",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load recommendations";
      push({
        title: "Error",
        description: message,
        tone: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (!recommendations) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            YouTube Learning Path
          </h1>
          <p className="text-slate-400">
            Get personalized YouTube recommendations based on your career goal
          </p>
        </div>

        {!user?.skills || user.skills.length === 0 ? (
          <Card>
            <CardHeader title="No Skills Found" />
            <CardContent>
              <p className="text-slate-300 mb-4">
                Please upload your resume first to extract your skills.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader title="Career Goal" />
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Your Current Skills">
                  <div className="flex flex-wrap gap-2">
                    {(user.skills || []).map((skill, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full text-sm"
                      >
                        {typeof skill === "string" ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </FormField>

                <FormField label="Target Job Role">
                  <Input
                    type="text"
                    placeholder="e.g., Data Scientist, Full Stack Developer"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Timeframe (months)">
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    placeholder="e.g., 6"
                    value={timeframeMonths}
                    onChange={(e) => setTimeframeMonths(e.target.value)}
                    required
                  />
                </FormField>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full"
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner />
                      Loading recommendations...
                    </>
                  ) : (
                    "Get Recommendations"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{recommendations.title}</h1>
          <p className="text-slate-400 mt-1">{recommendations.summary}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setRecommendations(null);
            setTargetJob("");
            setTimeframeMonths("6");
          }}
        >
          New Search
        </Button>
      </div>

      {/* YouTube Videos Section */}
      <Card>
        <CardHeader
          title="Recommended Videos"
          description={`${recommendations.youtube_resources.length} videos to help you learn`}
        />
        <CardContent>
          <div className="space-y-3">
            {recommendations.youtube_resources.map((video: YouTubeVideo, idx: number) => (
              <a
                key={idx}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-700 hover:border-blue-500 transition group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-blue-400 group-hover:text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-blue-300 truncate">
                      {video.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{video.channel}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>
                          {parseInt(video.views).toLocaleString()} views
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-slate-500 group-hover:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Timeline Section */}
      <Card>
        <CardHeader
          title="Career Timeline"
          description="Your personalized learning phases"
        />
        <CardContent>
          <div className="space-y-4">
            {recommendations.timeline.map((phase: TimelinePhase, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <h3 className="font-semibold text-white mb-2">{phase.phase}</h3>
                <div className="space-y-2">
                  {phase.skills.map((skill: string, skillIdx: number) => (
                    <div key={skillIdx} className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-slate-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advice Section */}
      <Card>
        <CardHeader title="Career Advice" />
        <CardContent>
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p className="text-slate-300">{recommendations.advice}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
