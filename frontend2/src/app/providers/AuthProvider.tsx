import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { setAuthToken } from "../../services/apiClient.ts";
import type { AuthContextValue, AuthState, User } from "../../types/auth.ts";

const STORAGE_KEY = "careernav.auth";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    status: "idle",
    user: null,
    token: null,
  });

  useEffect(() => {
    const persisted = sessionStorage.getItem(STORAGE_KEY);
    if (!persisted) return;

    try {
      const parsed = JSON.parse(persisted) as AuthState;
      if (parsed.token) {
        setAuthToken(parsed.token);
        setState({ ...parsed, status: "authenticated" });
      }
    } catch (error) {
      console.warn("Failed to parse auth session", error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((next: AuthState) => {
    if (next.token) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback<AuthContextValue["login"]>((user: User, token: string) => {
    setAuthToken(token);
    const nextState: AuthState = {
      status: "authenticated",
      user,
      token,
    };
    setState(nextState);
    persist(nextState);
  }, [persist]);

  const logout = useCallback(() => {
    setAuthToken(undefined);
    const nextState: AuthState = { status: "idle", user: null, token: null };
    setState(nextState);
    persist(nextState);
  }, [persist]);

  const value = useMemo<AuthContextValue>(() => ({
    status: state.status,
    user: state.user,
    token: state.token,
    isAuthenticated: state.status === "authenticated" && Boolean(state.token),
    login,
    logout,
    setUser: (user: User | null) =>
      setState((prev: AuthState) => {
        const next: AuthState = { ...prev, user };
        persist(next);
        return next;
      }),
  }), [state.status, state.user, state.token, login, logout, persist]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
