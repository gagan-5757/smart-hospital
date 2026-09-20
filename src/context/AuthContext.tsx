"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  name: string;
  email: string;
  role: "ADMIN" | "COORDINATOR";
  hospital?: string;
};

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "nexuscare-user";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to restore user:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  function login(email: string, password: string) {
    if (
      email === "admin@nexuscare.com" &&
      password === "admin123"
    ) {
      const admin: User = {
        name: "Network Admin",
        email,
        role: "ADMIN",
      };

      setUser(admin);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(admin)
      );

      return true;
    }

    if (
      email === "coordinator@nexuscare.com" &&
      password === "coord123"
    ) {
      const coordinator: User = {
        name: "Hospital Coordinator",
        email,
        role: "COORDINATOR",
        hospital: "Bengaluru Central",
      };

      setUser(coordinator);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(coordinator)
      );

      return true;
    }

    return false;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
