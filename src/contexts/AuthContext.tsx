import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/react";
import { useAuthHook, type Profile } from "@/hooks/useAuth";

type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

interface AuthContextType {
  user: UserResource | null | undefined;
  profile: Profile | null;
  loading: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<{ error: null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: null }>;
  fetchProfile: () => Promise<void>;
  canCreateProposal: () => boolean;
  getRemainingProposals: () => number;
  openSignIn: () => void;
  openSignUp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}

export type { Profile };
