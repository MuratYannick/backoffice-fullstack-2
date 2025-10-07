import { usePermissions } from "./ProtectedRoute";

// Composant pour conditionnellement afficher du contenu selon les permissions
export const PermissionGate = ({
  children,
  roles = [],
  permissions = [],
  userId = null,
  resourceUserId = null,
  fallback = null,
  condition = null,
}) => {
  const { user, hasAnyRole, canModifyResource } = usePermissions();

  // Si aucune restriction, afficher le contenu
  if (roles.length === 0 && permissions.length === 0 && !condition && !userId) {
    return children;
  }

  // Vérification de l'utilisateur spécifique
  if (userId && user?.id !== userId) {
    return fallback;
  }

  // Vérification des rôles
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return fallback;
  }

  // Vérification des permissions personnalisées
  if (permissions.length > 0) {
    const hasPermissions = permissions.every((permission) =>
      user?.permissions?.includes(permission)
    );
    if (!hasPermissions) {
      return fallback;
    }
  }

  // Vérification de la propriété d'une ressource
  if (resourceUserId !== null) {
    if (!canModifyResource({ userId: resourceUserId, type: "generic" })) {
      return fallback;
    }
  }

  // Condition personnalisée
  if (condition && !condition(user)) {
    return fallback;
  }
  return children;
};

// Hook pour utiliser PermissionGate plus facilement
// eslint-disable-next-line
export const usePermissionGate = () => {
  const permissions = usePermissions();
  const canShow = (config) => {
    const { roles = [], userId = null, condition = null } = config;

    if (userId && permissions.user?.id !== userId) {
      return false;
    }

    if (roles.length > 0 && !permissions.hasAnyRole(roles)) {
      return false;
    }

    if (condition && !condition(permissions.user)) {
      return false;
    }

    return true;
  };
  return { canShow, ...permissions };
};

export default PermissionGate;
