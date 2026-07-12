// Utility helper functions for TransitOps

// Format number in Indian currency style (e.g., ₹12,34,567.00)
export const formatINR = (value) => {
  if (value === undefined || value === null) return "₹0";
  
  const num = Number(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

// Format distance in km (e.g., 1,42,050 km)
export const formatDistance = (value) => {
  if (value === undefined || value === null) return "0 km";
  const num = Number(value);
  return `${new Intl.NumberFormat("en-IN").format(num)} km`;
};

// Format weight in kg / tonnes (e.g., 25,000 kg / 25.0T)
export const formatWeight = (value) => {
  if (value === undefined || value === null) return "0 kg";
  const num = Number(value);
  if (num >= 1000) {
    const tonnes = (num / 1000).toFixed(1);
    return `${new Intl.NumberFormat("en-IN").format(num)} kg (${tonnes}T)`;
  }
  return `${new Intl.NumberFormat("en-IN").format(num)} kg`;
};

// Format date (e.g. 12 Jul 2026)
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-IN", options);
};

// Get semantic status styles
export const getStatusBadgeStyles = (status) => {
  switch (status?.toLowerCase()) {
    // Vehicles
    case "available":
      return "bg-[#DCFCE7] text-[#16A34A] border border-[#DCFCE7]";
    case "on trip":
      return "bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE]";
    case "in shop":
      return "bg-[#FEF3C7] text-[#D97706] border border-[#FEF3C7]";
    case "retired":
      return "bg-[#FEE2E2] text-[#DC2626] border border-[#FEE2E2]";
      
    // Drivers
    case "off duty":
      return "bg-[#F1F5F9] text-[#64748B] border border-[#F1F5F9]";
    case "suspended":
      return "bg-[#FEE2E2] text-[#DC2626] border border-[#FEE2E2]";
      
    // Trips
    case "draft":
      return "bg-[#F1F5F9] text-[#64748B] border border-[#F1F5F9]";
    case "dispatched":
      return "bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE]";
    case "completed":
      return "bg-[#DCFCE7] text-[#16A34A] border border-[#DCFCE7]";
    case "cancelled":
      return "bg-[#FEE2E2] text-[#DC2626] border border-[#FEE2E2]";
      
    // Maintenance
    case "active":
      return "bg-[#FEF3C7] text-[#D97706] border border-[#FEF3C7]";
    case "scheduled":
      return "bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE]";
      
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};
