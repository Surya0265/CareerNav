import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.ts";
import { Button } from "../shared/Button.tsx";
import { cn } from "../../utils/cn.ts";
import { useCareerData } from "../../app/providers/CareerDataContext.ts";
import { fetchProfile } from "../../services/auth.ts";
import { fetchLatestResume } from "../../services/resume.ts";
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  Calendar,
  Briefcase,
  Youtube,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume Upload", icon: FileText },
  { to: "/analysis", label: "AI Analysis", icon: BrainCircuit },
  { to: "/timeline", label: "Career Timeline", icon: Calendar },
  { to: "/jobs", label: "Job Recommendations", icon: Briefcase},
  { to: "/youtube", label: "YouTube Learning", icon: Youtube }
  
];

export const AppLayout = () => {
  const { user, token, logout, setUser } = useAuth();
  const { setLatestResume, setLatestTimeline, isResumeBeingReplaced } = useCareerData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setLatestResume(undefined);
    setLatestTimeline(undefined);
    logout();
  };

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: Boolean(token),
  });

  const resumeQuery = useQuery({
    queryKey: ["latest-resume", token],
    queryFn: fetchLatestResume,
    enabled: Boolean(token) && !isResumeBeingReplaced,
    retry: false,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
  });

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  // Sync resume data whenever query data changes (including after login)
  useEffect(() => {
    if (resumeQuery.data) {
      setLatestResume(resumeQuery.data);
    } else if (resumeQuery.status === 'success' && resumeQuery.data === null) {
      // Explicitly handle null case (no resume found)
      setLatestResume(undefined);
    }
    // Don't set to undefined on error - keep previous data
  }, [resumeQuery.data, resumeQuery.status, setLatestResume]);

  useEffect(() => {
    if (resumeQuery.error) {
      console.error("Failed to fetch latest resume", resumeQuery.error);
    }
  }, [resumeQuery.error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen w-full">
        {/* Sidebar - Toggleable on mobile, always visible on desktop */}
        <aside className={cn(
          "fixed md:static left-0 top-0 bottom-0 z-50 w-64 flex-col border-r border-slate-800 bg-slate-950 p-6 overflow-y-auto transition-all duration-300 md:flex md:sticky md:top-0 md:h-screen",
          mobileMenuOpen ? "flex translate-x-0" : "hidden md:flex -translate-x-full md:translate-x-0"
        )}>
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-2">
              <img src="/careernav.svg" alt="CareerNav" className="h-8 w-auto" />
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-400">CareerNav</p>
                <h1 className="text-xl font-semibold text-white">Growth Hub</h1>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-6">Plan, learn, and track your career journey.</p>
          <nav className="flex flex-1 flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="flex min-h-screen flex-1 flex-col w-full">
          {/* Header */}
          <header className={cn(
            "fixed top-0 left-0 right-0 z-30 flex flex-col gap-2 border-b border-slate-800 bg-slate-950/95 px-4 py-3 md:px-6 md:py-4 backdrop-blur transition-all duration-300 md:left-64 md:w-[calc(100%-16rem)]"
          )}>
            <div className="flex items-center justify-between gap-2">
              {/* Mobile toggle button and logo (only when sidebar closed) */}
              <div className="flex items-center gap-2 md:hidden flex-shrink-0">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                {!mobileMenuOpen && (
                  <img src="/careernav.svg" alt="CareerNav" className="h-6 w-auto" />
                )}
              </div>

              {/* Greeting with user name */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-bold text-white truncate">
                  {user?.name?.split(" ")[0] ?? "Welcome"}
                </h2>
                <p className="text-xs text-slate-400 hidden md:block">
                  You&apos;re just a few steps away from your next opportunity.
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <div className="hidden text-right md:flex md:flex-col md:items-end md:gap-0.5">
                  <p className="text-sm font-semibold text-slate-50">
                    {user?.name ?? ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    {user?.email ?? ""}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="whitespace-nowrap text-xs md:text-sm flex-shrink-0"
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile nav pills - removed since sidebar is always open */}
          </header>

          {/* Main content with proper padding */}
          <main className={cn(
            "flex-1 px-4 py-6 md:px-8 md:py-10 transition-all duration-300 w-full",
            "pt-[6.5rem] md:pt-24"
          )}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
