import { useEffect, useMemo, useState } from "react";
import { apiRequest, clearToken, getToken, setToken } from "./api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const result = await apiRequest("/api/auth/me");
        if (active) setUser(result.user);
      } catch {
        clearToken();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(email, password) {
        const result = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      async register(name, email, password) {
        const result = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setToken(result.token);
        setUser(result.user);
        return result.user;
      },
      logout() {
        clearToken();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
