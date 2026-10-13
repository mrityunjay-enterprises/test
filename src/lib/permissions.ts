// ============================================================================
// GarmentFlow ERP — Role-Based Access Control (RBAC) Permission Engine
// ============================================================================

export interface ModulePermission {
  label: string;
  paths: string[];
}

export const OWNER_ROLES = [
  "Managing Director (MD)",
  "Owner",
  "Super Admin",
  "Executive Management",
];

export const FACTORY_ROLE_PERMISSIONS: Record<string, ModulePermission[]> = {
  "Managing Director (MD)": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Stitching", paths: ["/factory/stitching"] },
    { label: "Finishing", paths: ["/factory/finishing"] },
    { label: "Quality", paths: ["/factory/quality"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Dispatch", paths: ["/factory/dispatch"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Employees", paths: ["/factory/employees"] },
    { label: "Attendance", paths: ["/factory/attendance"] },
    { label: "Leave", paths: ["/factory/leave"] },
    { label: "Invoices", paths: ["/factory/invoices"] },
    { label: "Payments", paths: ["/factory/payments"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Super Admin": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Stitching", paths: ["/factory/stitching"] },
    { label: "Finishing", paths: ["/factory/finishing"] },
    { label: "Quality", paths: ["/factory/quality"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Dispatch", paths: ["/factory/dispatch"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Employees", paths: ["/factory/employees"] },
    { label: "Attendance", paths: ["/factory/attendance"] },
    { label: "Leave", paths: ["/factory/leave"] },
    { label: "Invoices", paths: ["/factory/invoices"] },
    { label: "Payments", paths: ["/factory/payments"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Merchandising Head": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Quality", paths: ["/factory/quality"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Dispatch", paths: ["/factory/dispatch"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Quality Manager": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Quality", paths: ["/factory/quality"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Stitching", paths: ["/factory/stitching"] },
    { label: "Finishing", paths: ["/factory/finishing"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Store & Cutting Head": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Attendance", paths: ["/factory/attendance"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Finance Manager": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Invoices", paths: ["/factory/invoices"] },
    { label: "Payments", paths: ["/factory/payments"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Employees", paths: ["/factory/employees"] },
    { label: "Attendance", paths: ["/factory/attendance"] },
    { label: "Leave", paths: ["/factory/leave"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Floor Supervisor": [
    { label: "Dashboard", paths: ["/factory", "/factory/dashboard"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Stitching", paths: ["/factory/stitching"] },
    { label: "Finishing", paths: ["/factory/finishing"] },
    { label: "Quality", paths: ["/factory/quality"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Dispatch", paths: ["/factory/dispatch"] },
    { label: "Attendance", paths: ["/factory/attendance"] },
    { label: "Leave", paths: ["/factory/leave"] },
  ],
};

/**
 * Check if the given role is an Owner/Super Admin role
 */
export function isOwnerRole(roleName: string): boolean {
  if (!roleName) return false;
  return OWNER_ROLES.some(
    r => roleName.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(roleName.toLowerCase())
  );
}

/**
 * Check if the role is allowed to access the specified /owner/... path.
 * Only Owner / Super Admin roles are authorized.
 */
export function isOwnerPathAllowed(roleName: string, path: string): boolean {
  return isOwnerRole(roleName);
}

/**
 * Check if the role is allowed to access the specified /factory/... path.
 * Super Admin / MD can access all factory modules.
 * Department roles can only access modules assigned to their department.
 */
export function isFactoryPathAllowed(roleName: string, path: string): boolean {
  if (isOwnerRole(roleName)) return true;
  if (
    path === "/factory" ||
    path === "/factory/dashboard" ||
    path === "/factory/profile" ||
    path === "/factory/help" ||
    path === "/factory/notifications"
  ) return true;

  const allowed = FACTORY_ROLE_PERMISSIONS[roleName];
  if (!allowed) {
    // Check fallback by role keywords
    if (roleName.includes("Merchandis")) return FACTORY_ROLE_PERMISSIONS["Merchandising Head"]?.some(p => p.paths.some(x => path.startsWith(x))) ?? false;
    if (roleName.includes("Quality")) return FACTORY_ROLE_PERMISSIONS["Quality Manager"]?.some(p => p.paths.some(x => path.startsWith(x))) ?? false;
    if (roleName.includes("Store") || roleName.includes("Cutting")) return FACTORY_ROLE_PERMISSIONS["Store & Cutting Head"]?.some(p => p.paths.some(x => path.startsWith(x))) ?? false;
    if (roleName.includes("Finance") || roleName.includes("Accounts")) return FACTORY_ROLE_PERMISSIONS["Finance Manager"]?.some(p => p.paths.some(x => path.startsWith(x))) ?? false;
    if (roleName.includes("Floor") || roleName.includes("Supervisor")) return FACTORY_ROLE_PERMISSIONS["Floor Supervisor"]?.some(p => p.paths.some(x => path.startsWith(x))) ?? false;
    return false;
  }

  return allowed.some(item => item.paths.some(p => path === p || path.startsWith(p + "/")));
}

/**
 * Returns default landing path for a given role:
 * - Owner/Executive: /owner/dashboard
 * - Factory staff: /factory/dashboard
 */
export function getRedirectForRole(roleName: string): string {
  return isOwnerRole(roleName) ? "/owner/dashboard" : "/factory/dashboard";
}

