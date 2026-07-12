// Permission definitions for TransitOps RBAC

export const ROLE_PERMISSIONS = {
  "Fleet Manager": {
    dashboard: "Full access",
    fleet: "Full access",
    drivers: "View",
    trips: "No access",
    maintenance: "Full access",
    expenses: "No access",
    analytics: "View",
    settings: "Full access"
  },
  "Dispatcher": {
    dashboard: "View",
    fleet: "View",
    drivers: "View",
    trips: "Full access",
    maintenance: "No access",
    expenses: "No access",
    analytics: "No access",
    settings: "No access"
  },
  "Safety Officer": {
    dashboard: "View",
    fleet: "No access",
    drivers: "Full access",
    trips: "View",
    maintenance: "No access",
    expenses: "No access",
    analytics: "No access",
    settings: "No access"
  },
  "Financial Analyst": {
    dashboard: "View",
    fleet: "View",
    drivers: "No access",
    trips: "No access",
    maintenance: "No access",
    expenses: "Full access",
    analytics: "Full access",
    settings: "No access"
  }
};

export const hasAccess = (role, section) => {
  if (!role) return false;
  const perm = ROLE_PERMISSIONS[role]?.[section];
  return perm && perm !== "No access";
};

export const canEdit = (role, section) => {
  if (!role) return false;
  const perm = ROLE_PERMISSIONS[role]?.[section];
  return perm === "Full access";
};
