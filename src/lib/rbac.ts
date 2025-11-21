export const roleHierarchy = {
  ADMIN: 5,
  PURCHASE_OFFICER: 4,
  CHINA_WAREHOUSE: 3,
  LIBYA_WAREHOUSE: 3,
  CUSTOMER: 1,
} as const;

export function hasRole(userRole: string, allowedRoles: string[]) {
  return allowedRoles.includes(userRole);
}

export function requireRole(userRole: string, allowedRoles: string[]) {
  if (!hasRole(userRole, allowedRoles)) {
    const message = `Role ${userRole} cannot access this resource`;
    throw new Error(message);
  }
}
