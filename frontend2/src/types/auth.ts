export interface Preferences {
  industries?: string[];
  jobInterests?: string[];
  locationPreferences?: string[];
}

export interface AccountSettings {
  notifications?: {
    email?: boolean;
    jobAlerts?: boolean;
    resourceUpdates?: boolean;
  };
  privacy?: {
    profileVisibility?: "public" | "private";
    resumeVisibility?: "public" | "private";
  };
  theme?: "light" | "dark" | "system" | string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: Preferences;
  accountSettings?: AccountSettings;
}

export interface AuthResponse extends User {
  token: string;
}

export interface AuthState {
  status: "idle" | "authenticated";
  user: User | null;
  token: string | null;
}

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}
