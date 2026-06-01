import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserSession, logoutUser, type UserProfile } from "@/api/auth";

interface UserAuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await getUserSession();
      setUser(session ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        refresh,
        signOut,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}
