import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getJobRecommendations } from "../services/jobs.ts";
import type { Job, JobRecommendationsResponse } from "../types/jobs.ts";
import { Card, CardContent, CardHeader } from "../components/shared/Card.tsx";
import { EmptyState } from "../components/shared/EmptyState.tsx";
import { Spinner } from "../components/shared/Spinner.tsx";
import { Button, buttonVariants } from "../components/shared/Button.tsx";
import { Input } from "../components/shared/Input.tsx";
import { FormField } from "../components/shared/FormField.tsx";
import { useToast } from "../components/shared/ToastContext.ts";
import { cn } from "../utils/cn.ts";

type SearchMode = "upload" | "existing" | null;

export const JobRecommendationsPage = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [jobsData, setJobsData] = useState<JobRecommendationsResponse | null>(null);

  const { push } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!resumeFile) {
        throw new Error("Please select a resume file");
      }
      if (!city.trim()) {
        throw new Error("Please enter a city");
      }
      if (!country.trim()) {
        throw new Error("Please enter a country");
      }

      return getJobRecommendations({
        type: "upload",
        resume: resumeFile,
        city,
        country,
      });
    },
    onSuccess: (data) => {
      setJobsData(data);
      setFilteredJobs(data.jobs);
      setSelectedSkills(new Set());
      setSearchQuery("");
      push({
        title: "Resume uploaded successfully",
        description: "Job recommendations loaded based on your resume!",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to load job recommendations";
      push({
        title: "Error",
        description: message,
        tone: "error",
      });
    },
  });

  const existingSkillsMutation = useMutation({
    mutationFn: async () => {
      if (!city.trim()) {
        throw new Error("Please enter a city");
      }
      if (!country.trim()) {
        throw new Error("Please enter a country");
      }

      return getJobRecommendations({
        type: "existing",
        city,
        country,
      });
    },
    onSuccess: (data) => {
      setJobsData(data);
      setFilteredJobs(data.jobs);
      setSelectedSkills(new Set());
      setSearchQuery("");
      push({
        title: "Jobs loaded",
        description: "Job recommendations loaded based on your existing skills!",
        tone: "success",
      });
    },
    onError: (error: unknown) => {
      console.error("Existing skills error:", error);
      let message = "Failed to load job recommendations";
      
      if (error instanceof Error) {
        message = error.message;
        console.error("Error details:", {
          message: error.message,
          response: (error as any).response?.data,
        });
      }
      
      push({
        title: "Error",
        description: message,
        tone: "error",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    filterJobs(value, selectedSkills);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = new Set(selectedSkills);
    if (newSkills.has(skill)) {
      newSkills.delete(skill);
    } else {
      newSkills.add(skill);
    }
    setSelectedSkills(newSkills);
    filterJobs(searchQuery, newSkills);
  };

  const filterJobs = (query: string, skills: Set<string>) => {
    if (!jobsData?.jobs) return;

    let filtered = jobsData.jobs;

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (job: Job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q)
      );
    }

    // Filter by selected skills
    if (skills.size > 0) {
      filtered = filtered.filter((job: Job) => {
        const jobText = `${job.title} ${job.company}`.toLowerCase();
        return Array.from(skills).some((skill: string) =>
          jobText.includes(skill.toLowerCase())
        );
      });
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSelectedSkills(new Set());
    setSearchQuery("");
    setFilteredJobs(jobsData?.jobs || []);
  };

  const resetSearch = () => {
    setJobsData(null);
    setSearchMode(null);
    setFilteredJobs([]);
    setResumeFile(null);
    setCity("");
    setCountry("");
    setSelectedSkills(new Set());
    setSearchQuery("");
  };

  // Initial selection screen
  if (!searchMode && !jobsData) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-3xl font-bold text-white">Job Recommendations</h1>
          <p className="mt-2 text-slate-300">
            Choose how you want to find job opportunities tailored to your profile.
          </p>
        </section>

        {/* Two Option Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Option 1: Upload New Resume */}
          <Card className="cursor-pointer transition-all hover:border-blue-500/60 hover:bg-slate-900/80">
            <CardHeader
              title="📄 Upload New Resume"
              description="Upload your resume to extract skills and find matching jobs"
            />
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Upload a PDF resume to automatically extract your skills and find relevant job opportunities. Your resume will be saved for future reference.
                </p>
                <Button
                  onClick={() => setSearchMode("upload")}
                  className="w-full"
                >
                  Upload Resume
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Use Existing Skills */}
          <Card className="cursor-pointer transition-all hover:border-green-500/60 hover:bg-slate-900/80">
            <CardHeader
              title="⚡ Use Existing Skills"
              description="Search jobs using skills already in your profile"
            />
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Use the skills from your previously uploaded resume to find job opportunities. Quick and easy search without uploading again.
                </p>
                <Button
                  onClick={() => setSearchMode("existing")}
                  variant="secondary"
                  className="w-full"
                >
                  Use Existing Skills
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Upload New Resume Form
  if (searchMode === "upload" && !jobsData) {
    return (
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-bold text-white">Upload Resume</h1>
          <p className="mt-2 text-slate-300">
            Upload your resume and specify your location to get job recommendations.
          </p>
        </section>

        <Card>
          <CardHeader
            title="Resume Upload"
            description="Upload your PDF resume and provide your location details"
            action={
              <button
                onClick={resetSearch}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                ← Back
              </button>
            }
          />
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                uploadMutation.mutate();
              }}
              className="space-y-4"
            >
              <FormField label="Resume (PDF)">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                {resumeFile && (
                  <p className="mt-2 text-xs text-slate-400">
                    Selected: {resumeFile.name}
                  </p>
                )}
              </FormField>

              <FormField label="City">
                <Input
                  type="text"
                  placeholder="e.g., Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Country">
                <Input
                  type="text"
                  placeholder="e.g., India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </FormField>

              <Button
                type="submit"
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Spinner />
                    Loading recommendations...
                  </>
                ) : (
                  "Get Job Recommendations"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use Existing Skills Form
  if (searchMode === "existing" && !jobsData) {
    return (
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-bold text-white">Search with Existing Skills</h1>
          <p className="mt-2 text-slate-300">
            Specify your location to find jobs based on your existing skills.
          </p>
        </section>

        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="!space-y-0 pt-0">
            <p className="text-sm text-blue-200">
              ℹ️ <strong>Note:</strong> This option uses skills from your previously uploaded resume. If you haven't uploaded a resume yet, please use the <strong>"Upload New Resume"</strong> option first.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Location Details"
            description="Provide your preferred location for job search"
            action={
              <button
                onClick={resetSearch}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                ← Back
              </button>
            }
          />
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                existingSkillsMutation.mutate();
              }}
              className="space-y-4"
            >
              <FormField label="City">
                <Input
                  type="text"
                  placeholder="e.g., Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Country">
                <Input
                  type="text"
                  placeholder="e.g., India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </FormField>

              <Button
                type="submit"
                disabled={existingSkillsMutation.isPending}
                className="w-full"
              >
                {existingSkillsMutation.isPending ? (
                  <>
                    <Spinner />
                    Loading recommendations...
                  </>
                ) : (
                  "Get Job Recommendations"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Section
  if (jobsData) {
    return (
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <section>
            <h1 className="text-3xl font-bold text-white">Job Recommendations</h1>
            <p className="mt-2 text-slate-300">
              {searchMode === "upload"
                ? "Jobs matching your resume"
                : "Jobs matching your existing skills"}
            </p>
          </section>
          <button
            onClick={resetSearch}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            ← New Search
          </button>
        </div>

        {/* Skills Filter */}
        {jobsData.skills && jobsData.skills.length > 0 && (
          <Card>
            <CardHeader
              title="Filter by Skills"
              description="Select skills to filter relevant job opportunities"
              action={
                selectedSkills.size > 0 ? (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Clear filters
                  </button>
                ) : null
              }
            />
            <CardContent className="!space-y-0">
              <div className="flex flex-wrap gap-2">
                {jobsData.skills.map((skill: string) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-all",
                      selectedSkills.has(skill)
                        ? "border-blue-400 bg-blue-500/20 text-blue-100"
                        : "border border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-900/60"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3",
              "text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none",
              "transition-all"
            )}
          />
        </div>

        {/* Results Summary */}
        <div className="text-sm text-slate-400">
          Showing <span className="text-white font-semibold">{filteredJobs.length}</span> of{" "}
          <span className="text-white font-semibold">{jobsData.jobs.length}</span> jobs
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            title={
              jobsData.jobs.length === 0
                ? "No jobs found"
                : "No matches for your filters"
            }
            description={
              jobsData.jobs.length === 0
                ? "No job recommendations available for your profile."
                : "Try adjusting your search or filter criteria."
            }
            action={
              jobsData.jobs.length > 0 && (selectedSkills.size > 0 || searchQuery)
                ? (
                  <button
                    onClick={clearFilters}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Clear filters
                  </button>
                )
                : undefined
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {filteredJobs.map((job: Job, index: number) => (
              <Card key={`${job.company}-${job.title}-${index}`} className="flex flex-col">
                <CardContent className="!space-y-0 flex-1">
                  <div>
                    <h3 className="text-base font-semibold text-white leading-tight">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-blue-300">
                      {job.company}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <svg
                        className="w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <svg
                        className="w-4 h-4 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </CardContent>

                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "primary", size: "sm" }),
                    "mt-4 w-full justify-center"
                  )}
                >
                  Apply Now
                  <svg
                    className="ml-2 w-4 h-4"
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
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default JobRecommendationsPage;
