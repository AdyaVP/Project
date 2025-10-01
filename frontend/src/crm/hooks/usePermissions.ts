import { useAuth } from '../context/AuthContext';
import { SIDEBAR_MODULES } from '../config/permissions';

export const usePermissions = (module: string) => {
  const { currentUser, hasPermission, getPermission } = useAuth();

  const canView = hasPermission(module, 'canView');
  const canCreate = hasPermission(module, 'canCreate');
  const canEdit = hasPermission(module, 'canEdit');
  const canDelete = hasPermission(module, 'canDelete');
  const canApprove = hasPermission(module, 'canApprove');

  const permission = getPermission(module);
  const hasAccess = permission !== null && canView;

  const allowedModules = currentUser ? SIDEBAR_MODULES[currentUser.role] : [];

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    hasAccess,
    permission,
    allowedModules,
  };
};
