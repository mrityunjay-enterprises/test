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
  "Director / Partner",
  "General Manager",
  "Admin",
  "Admin (Full Permission)",
];

const FULL_ADMIN_PERMISSIONS: ModulePermission[] = [
  { label: "Dashboard", paths: ["/factory/dashboard"] },
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
];

export const FACTORY_ROLE_PERMISSIONS: Record<string, ModulePermission[]> = {
  // 1. Executive Management & Super Admin (Full 360° Access)
  "Managing Director (MD)": FULL_ADMIN_PERMISSIONS,
  "Director / Partner": FULL_ADMIN_PERMISSIONS,
  "General Manager": FULL_ADMIN_PERMISSIONS,
  "Super Admin": FULL_ADMIN_PERMISSIONS,
  "Admin": FULL_ADMIN_PERMISSIONS,

  // 2. HR & Accounts Department (Only HRMS & Accounts, NO Floor Reports)
  "Accounts & HR Executive": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "HRMS", paths: ["/factory/employees", "/factory/attendance", "/factory/leave"] },
    { label: "Invoices & Billing", paths: ["/factory/invoices"] },
    { label: "Payment Receipts", paths: ["/factory/payments"] },
  ],
  "Finance Manager": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "HRMS", paths: ["/factory/employees", "/factory/attendance", "/factory/leave"] },
    { label: "Invoices & Billing", paths: ["/factory/invoices"] },
    { label: "Payment Receipts", paths: ["/factory/payments"] },
  ],
  "HR Manager": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "HRMS", paths: ["/factory/employees", "/factory/attendance", "/factory/leave"] },
    { label: "Invoices & Billing", paths: ["/factory/invoices"] },
    { label: "Payment Receipts", paths: ["/factory/payments"] },
  ],

  // 3. Merchandising Department (Orders, Approvals, Cutting, Production, Store/Inventory, Planning, Reports)
  "Merchandising Head": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Planning", paths: ["/factory/planning"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],
  "Merchandiser": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Orders", paths: ["/factory/orders"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Inventory", paths: ["/factory/inventory"] },
    { label: "Planning", paths: ["/factory/planning"] },
    { label: "Reports", paths: ["/factory/reports"] },
  ],

  // 4. Store Department (Only Store & Inventory)
  "Store Incharge": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Store & Inventory", paths: ["/factory/inventory"] },
  ],
  "Store Manager": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Store & Inventory", paths: ["/factory/inventory"] },
  ],

  // 5. Finishing Department (Finishing Floor & Pressing only)
  "Finishing Supervisor": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Finishing", paths: ["/factory/finishing"] },
  ],
  "Finishing Head": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Finishing", paths: ["/factory/finishing"] },
  ],

  // 6. Quality (QC) Department (Quality Assurance & Inspections only)
  "Quality Manager": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Quality", paths: ["/factory/quality"] },
  ],
  "Quality Auditor": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Quality", paths: ["/factory/quality"] },
  ],

  // 7. Packing & Dispatch Department (Carton Packing, Shipping & Gate Pass only)
  "Packing & Dispatch Lead": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Dispatch", paths: ["/factory/dispatch"] },
  ],
  "Dispatch Supervisor": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Packing", paths: ["/factory/packing"] },
    { label: "Dispatch", paths: ["/factory/dispatch"] },
  ],

  // 8. Stitching / Production Floor (Floor Lines & Cutting)
  "Floor Supervisor": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
    { label: "Stitching", paths: ["/factory/stitching"] },
  ],
  "Stitching Supervisor": [
    { label: "Dashboard", paths: ["/factory/dashboard"] },
    { label: "Production", paths: ["/factory/production"] },
    { label: "Stitching", paths: ["/factory/stitching"] },
    { label: "Cutting", paths: ["/factory/cutting"] },
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

  const normalized = path.replace(/\/$/, "");

  // Common utility pages accessible to all logged-in factory workers
  if (
    normalized === "/factory" ||
    normalized === "/factory/dashboard" ||
    normalized === "/factory/profile" ||
    normalized === "/factory/help" ||
    normalized === "/factory/notifications"
  ) {
    return true;
  }

  const checkAllowedList = (perms: ModulePermission[] | undefined): boolean => {
    if (!perms) return false;
    return perms.some(item =>
      item.paths.some(p => {
        const cleanP = p.replace(/\/$/, "");
        if (cleanP === "/factory") {
          return normalized === "/factory";
        }
        return normalized === cleanP || normalized.startsWith(cleanP + "/");
      })
    );
  };

  const direct = FACTORY_ROLE_PERMISSIONS[roleName];
  if (direct) {
    return checkAllowedList(direct);
  }

  // Check fallback by role keywords
  const lower = (roleName || "").toLowerCase();
  if (lower.includes("merchandis")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Merchandising Head"]);
  }
  if (lower.includes("store") || lower.includes("inventory")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Store Incharge"]);
  }
  if (lower.includes("quality") || lower.includes("qc") || lower.includes("inspect")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Quality Manager"]);
  }
  if (lower.includes("finish")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Finishing Supervisor"]);
  }
  if (lower.includes("pack") || lower.includes("dispatch") || lower.includes("logistic")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Packing & Dispatch Lead"]);
  }
  if (lower.includes("hr") || lower.includes("account") || lower.includes("finance") || lower.includes("billing")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Accounts & HR Executive"]);
  }
  if (lower.includes("floor") || lower.includes("stitch") || lower.includes("production")) {
    return checkAllowedList(FACTORY_ROLE_PERMISSIONS["Floor Supervisor"]);
  }

  return false;
}

/**
 * Returns default landing path for a given role:
 * - Owner/Executive: /owner/dashboard
 * - Factory staff: /factory/dashboard
 */
export function getRedirectForRole(roleName: string): string {
  return isOwnerRole(roleName) ? "/owner/dashboard" : "/factory/dashboard";
}

