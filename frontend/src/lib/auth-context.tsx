"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchApi } from "./api";

type User = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkMe = async () => {
    try {
      const data = await fetchApi("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMe();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    setUser(data.user);
  };

  const logout = async () => {
    await fetchApi("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
