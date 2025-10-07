import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./ui/LoadingSpinner";
import { AlertTriangle, Lock, User } from "lucide-react";

const AccessDenied = ({
  requiredRoles = [],
  currentRole = null,
  message = null,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
      <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justifycenter mb-6">
        <Lock className="h-8 w-8 text-red-600" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>

      <p className="text-gray-600 mb-4">
        {message ||
          "Vous n'avez pas les permissions nécessaires pour accéder à cette page."}
      </p>

      {requiredRoles.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Rôles requis :</span>
            <span className="text-gray-600">{requiredRoles.join(", ")}</span>
          </div>
          {currentRole && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Votre rôle :</span>
              <span className="text-gray-600">{currentRole}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        Retour
      </button>
    </div>
  </div>
);

const MaintenanceMode = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
      <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-yellow-600" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Maintenance en cours
      </h3>

      <p className="text-gray-600">
        Cette fonctionnalité est temporairement indisponible. Veuillez réessayer
        plus tard.
      </p>
    </div>
  </div>
);

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  fallbackComponent = null,
  redirectTo = "/login",
  maintenanceMode = false,
  customPermissionCheck = null,
}) {
  const { user, loading, isAuthenticated, canAccessRoute } = useAuth();
  const location = useLocation();

  // Mode maintenance
  if (maintenanceMode) {
    return <MaintenanceMode />;
  }

  // Afficher le spinner pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Vérification de l'authentification
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          message: "Vous devez être connecté pour accéder à cette page",
        }}
        replace
      />
    );
  }

  // Vérification des rôles
  if (requiredRoles.length > 0 && !canAccessRoute(requiredRoles)) {
    return (
      fallbackComponent || (
        <AccessDenied requiredRoles={requiredRoles} currentRole={user?.role} />
      )
    );
  }

  // Vérification personnalisée
  if (customPermissionCheck && !customPermissionCheck(user)) {
    return (
      fallbackComponent || (
        <AccessDenied
          message="Permissions insuffisantes pour cette action"
          currentRole={user?.role}
        />
      )
    );
  }

  return children;
}

// Hook pour utiliser les permissions dans les composants
/* eslint-disable-next-line react-refresh/only-export-components */
export const usePermissions = () => {
  const { 
    user, 
    hasRole, 
    hasAnyRole, 
    canAccessRoute, 
    canModifyResource 
  } = useAuth();

  return {
    user,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    canModifyResource,
    isAdmin: hasRole("admin"),
    isEditor: hasRole("editor"),
    isAuthor: hasRole("author"),
    canManageUsers: hasAnyRole(["admin"]),
    canManageCategories: hasAnyRole(["admin", "editor"]),
    canCreateArticles: hasAnyRole(["admin", "editor", "author"]),
  };
};
