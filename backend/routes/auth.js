import { useState, useContext, createContext, useEffect, useCallback } from "react";
import ApiService from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Vérification périodique du token
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await ApiService.verifyToken();
      setAuthState({
        user: response.user,
        token,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.warn("Token invalide ou expiré:", error.message);
      localStorage.removeItem("token");
      setAuthState({
        user: null,
        token: null,
        loading: false,
        error: error.message,
      });
    }
  }, []);

  // Vérification au démarrage et périodiquement
  useEffect(() => {
    checkAuthStatus();

    // Vérifier le token toutes les 5 minutes
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await ApiService.login({ email, password });
      const { token: newToken, user: userData } = response;

      localStorage.setItem("token", newToken);
      ApiService.setToken(newToken);

      setAuthState({
        user: userData,
        token: newToken,
        loading: false,
        error: null,
      });

      return { success: true, user: userData };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));

      return {
        success: false,
        message: error.message || "Erreur lors de la connexion",
      };
    }
  };

  const register = async (userData) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await ApiService.register(userData);
      const { token: newToken, user: newUser } = response;

      localStorage.setItem("token", newToken);
      ApiService.setToken(newToken);

      setAuthState({
        user: newUser,
        token: newToken,
        loading: false,
        error: null,
      });

      return { success: true, user: newUser };
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));

      return {
        success: false,
        message: error.message || "Erreur lors de l'inscription",
      };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    ApiService.setToken(null);
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setAuthState((prev) => ({
      ...prev,
      user: { ...prev.user, ...updatedUser },
    }));
  }, []);

  // Helpers pour les permissions
  const hasRole = useCallback(
    (role) => {
      return authState.user?.role === role;
    },
    [authState.user]
  );

  const hasAnyRole = useCallback(
    (roles) => {
      return roles.includes(authState.user?.role);
    },
    [authState.user]
  );

  const canAccessRoute = useCallback(
    (requiredRoles = []) => {
      if (!authState.user) return false;
      if (requiredRoles.length === 0) return true;
      return requiredRoles.includes(authState.user.role);
    },
    [authState.user]
  );

  const canModifyResource = useCallback(
    (resource) => {
      if (!authState.user) return false;

      // Admin peut tout
      if (authState.user.role === "admin") return true;

      // Editor peut modifier les articles
      if (authState.user.role === "editor" && resource.type === "article")
        return true;

      // Propriétaire peut modifier ses ressources
      return resource.userId === authState.user.id;
    },
    [authState.user]
  );

  const value = {
    ...authState,
    isAuthenticated: !!authState.user && !!authState.token,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    canModifyResource,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
