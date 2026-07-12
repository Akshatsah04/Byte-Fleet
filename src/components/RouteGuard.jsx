import React from "react";
import { Navigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { hasAccess } from "./permissions";
import { ShieldAlert } from "lucide-react";

export const RouteGuard = ({ children, section }) => {
  const { currentUser } = useData();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Dashboard has access for all roles, settings has access for Fleet Manager only (or customizable)
  if (section && !hasAccess(currentUser.role, section)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="p-4 bg-red-50 rounded-full text-red-600 mb-4">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 max-w-md mb-6">
          Your current role (<span className="font-semibold text-slate-800">{currentUser.role}</span>) does not have permission to view the <span className="font-semibold text-slate-800">{section.charAt(0).toUpperCase() + section.slice(1)}</span> module.
        </p>
        <div className="text-sm text-slate-500">
          Please contact your administrator if you require access to this section.
        </div>
      </div>
    );
  }

  return children;
};
