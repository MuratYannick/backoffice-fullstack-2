import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  // Afficher le spinner pendant le chargement
  if (loading) {
    return <LoadingSpinner />;
  }
  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: "Vous devez être connecté pour accéder à cette page",
        }}
        replace
      />
    );
  }
  // Si des rôles spécifiques sont requis
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
        </div>
      </div>
    );
  }
  return children;
}
