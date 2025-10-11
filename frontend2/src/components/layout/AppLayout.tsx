import { NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.ts";
import { Button } from "../shared/Button.tsx";
import { cn } from "../../utils/cn.ts";
import { useCareerData } from "../../app/providers/CareerDataContext.ts";
import { fetchProfile } from "../../services/auth.ts";

const navLinks = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/resume", label: "Resume Upload", icon: "📄" },
  { to: "/analysis", label: "AI Analysis", icon: "🧠" },
  { to: "/timeline", label: "Career Timeline", icon: "🗓️" },
];

export const AppLayout = () => {
  const { user, token, logout, setUser } = useAuth();
  const { setLatestResume, setLatestTimeline } = useCareerData();

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

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
  <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950/80 p-6 md:flex">
          <div className="mb-8 space-y-1">
            <p className="text-xs uppercase tracking-widest text-blue-400">CareerNav</p>
            <h1 className="text-xl font-semibold text-white">Growth Hub</h1>
            <p className="text-xs text-slate-400">Plan, learn, and track your career journey.</p>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition",
                    isActive
                      ? "bg-blue-600/20 text-blue-100"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                  )
                }
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/80 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Hey {user?.name?.split(" ")[0] ?? "there"}</h2>
                <p className="text-xs text-slate-400">
                  You&apos;re just a few steps away from your next opportunity.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-slate-100">{user?.name ?? ""}</p>
                  <p className="text-xs text-slate-400">{user?.email ?? ""}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto md:hidden">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-xs",
                      isActive
                        ? "bg-blue-600/20 text-blue-100"
                        : "border border-slate-800 text-slate-300"
                    )
                  }
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
