export const roleHierarchy = {
  Admin: 5,
  PurchaseOfficer: 4,
  ChinaWarehouse: 3,
  LibyaWarehouse: 3,
  Customer: 1,
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
