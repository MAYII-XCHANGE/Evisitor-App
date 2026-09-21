import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { configureApiSession } from "../services/apiClient";
import { hasPermission } from "../config/roles";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const restorationPromiseRef = useRef(null);
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
    applySession(session);
  }, [applySession]);

  useEffect(() => {
    configureApiSession({
      refresh: refreshSession,
      onUnauthorized: clearSession,
    });

    let active = true;
    const restoreSession = () => {
      restorationPromiseRef.current ||= (async () => {
        try {
          return { user: await authService.profile({ skipAuthRefresh: true }) };
        } catch (error) {
          if (![401, 403].includes(error.response?.status)) throw error;
          const session = await authService.refresh();
          return session;
        }
      })().finally(() => {
        restorationPromiseRef.current = null;
      });
      return restorationPromiseRef.current;
    };

    restoreSession()
      .then((session) => {
        if (active) applySession(session);
      })
      .catch(() => {
        if (active) clearSession();
      });
    return () => {
      active = false;
    };
  }, [applySession, clearSession, refreshSession]);

  const login = useCallback(async (credentials) => {
    setStatus("loading");
    try {
      const session = await authService.login(credentials);
      applySession(session);
      return session.user;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [applySession, clearSession]);

  const logout = useCallback(async () => {
    try {
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
