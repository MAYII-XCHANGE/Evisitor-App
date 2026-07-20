import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { configureApiSession } from "../services/apiClient";
import { hasPermission } from "../config/roles";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const clearSession = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  const applySession = useCallback((session) => {
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await authService.refresh();
    await authService.csrf();
    applySession(session);
  }, [applySession]);

  useEffect(() => {
    configureApiSession({
      refresh: refreshSession,
      csrf: authService.csrf,
      onUnauthorized: clearSession,
    });

    let active = true;
    const restoreSession = async () => {
      try {
        await authService.csrf();
        const currentUser = await authService.me();
        if (active) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        if (active) clearSession();
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [clearSession, refreshSession]);

  const login = useCallback(async (credentials) => {
    setStatus("loading");
    try {
      await authService.csrf();
      const session = await authService.login(credentials);
      await authService.csrf();
      applySession(session);
      return session.user;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [applySession, clearSession]);

  const logout = useCallback(async () => {
    try {
      await authService.csrf();
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const can = useCallback((permission) => hasPermission(user?.role, permission), [user?.role]);

  const value = useMemo(() => ({
    user,
    status,
    isAuthenticated: status === "authenticated",
    login,
    logout,
    clearSession,
    can,
  }), [can, clearSession, login, logout, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
