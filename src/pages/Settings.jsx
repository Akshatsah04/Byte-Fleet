import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { ROLE_PERMISSIONS } from "../components/permissions";
import {
  Settings as SettingsIcon,
  Shield,
  Building,
  Bell,
  Palette,
  Users as UsersIcon,
  CheckCircle,
  Clock,
  Info,
  Check
} from "lucide-react";

export const Settings = () => {
  const { currentUser } = useData();

  // Tabs state
  const [activeTab, setActiveTab] = useState("RBAC");

  // General settings state
  const [orgName, setOrgName] = useState("TransitOps Logistics Pvt. Ltd.");
  const [currency, setCurrency] = useState("INR (₹)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometres (km)");
  const [weightUnit, setWeightUnit] = useState("Kilograms / Tonnes");
  const [timeZone, setTimeZone] = useState("IST (UTC+05:30)");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [isSaved, setIsSaved] = useState(false);

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Mock list of organizational users
  const usersList = [
    { name: "Karan Johar", email: "karan.manager@transitops.in", role: "Fleet Manager", status: "Active", lastActive: "Active now" },
    { name: "Rohan Mehra", email: "rohan.dispatch@transitops.in", role: "Dispatcher", status: "Active", lastActive: "10 mins ago" },
    { name: "Sanya Malhotra", email: "sanya.safety@transitops.in", role: "Safety Officer", status: "Active", lastActive: "2 hours ago" },
    { name: "Anand Sen", email: "anand.analyst@transitops.in", role: "Financial Analyst", status: "Active", lastActive: "1 day ago" }
  ];

  // RBAC Permission Grid headers
  const columns = [
    "Dashboard",
    "Fleet",
    "Drivers",
    "Trips",
    "Maintenance",
    "Fuel & Expenses",
    "Analytics",
    "Settings"
  ];

  // Map columns to perm properties
  const getPermValue = (role, column) => {
    const key = column.toLowerCase().replace(" & ", "").replace("fuel expenses", "expenses");
    return ROLE_PERMISSIONS[role]?.[key] || "No access";
  };

  // Class for permissions cell badges
  const getPermissionBadgeClass = (permVal) => {
    switch (permVal) {
      case "Full access":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold";
      case "View":
        return "bg-blue-50 text-blue-700 border border-blue-100 font-semibold";
      case "No access":
      default:
        return "bg-red-50 text-red-700 border border-red-100 font-semibold";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">Configure global preferences, organizational operators, and edit role-based access controls.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex space-x-1.5 pb-px">
          {[
            { label: "General Setup", id: "General", icon: SettingsIcon },
            { label: "Organization", id: "Org", icon: Building },
            { label: "User Profiles", id: "Users", icon: UsersIcon },
            { label: "Roles & Permissions (RBAC)", id: "RBAC", icon: Shield },
            { label: "Notifications", id: "Notifications", icon: Bell },
            { label: "Appearance", id: "Appearance", icon: Palette }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 relative border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* General Settings Content */}
      {activeTab === "General" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm max-w-2xl animate-in fade-in duration-200 text-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Global System Preferences</h3>
          <p className="text-slate-400 mb-6 font-medium">Define localization defaults, weight metrics, and numbering formats used throughout dispatch tables.</p>

          {isSaved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>General preferences saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleGeneralSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company / Organization name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Base Currency Format</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full"
                >
                  <option value="INR (₹)">Indian Rupee (₹ - INR)</option>
                  <option value="USD ($)">US Dollar ($ - USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Distance Metric</label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-full"
                >
                  <option value="Kilometres (km)">Kilometres (km)</option>
                  <option value="Miles (mi)">Miles (mi)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Weight Capacity Metric</label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-full"
                >
                  <option value="Kilograms / Tonnes">Kilograms (kg) / Tonnes (T)</option>
                  <option value="Pounds (lbs)">Pounds (lbs)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date Format Preference</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 12/07/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-07-12)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Time Zone localization</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full"
              >
                <option value="IST (UTC+05:30)">Indian Standard Time (IST - UTC+05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organization Setup */}
      {activeTab === "Org" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm max-w-2xl animate-in fade-in duration-200 text-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Organization Structure</h3>
          <p className="text-slate-400 mb-6 font-medium">Review corporate details, hubs, branches, and regional configurations.</p>
          
          <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-3 font-semibold text-slate-700">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-semibold">HQ Registered Address</span>
              <span className="text-slate-900 text-right">Bandrakurla Complex (BKC), Mumbai, MH 400051</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 font-semibold">Active Operational Hubs</span>
              <span className="text-slate-900 text-right">Delhi NCR, Bengaluru, Chennai, Mumbai, Ahmedabad</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Corporate License</span>
              <span className="text-slate-900 text-right font-mono">T-OPS-IN-2026-9481</span>
            </div>
          </div>
        </div>
      )}

      {/* User Profiles */}
      {activeTab === "Users" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200 text-xs">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-bold text-slate-900">Registered System Operators</h3>
            <p className="text-slate-400 font-medium">Authorized administrative accounts with log activities.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Assigned RBAC Role</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {usersList.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-bold text-slate-900">{user.name}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-500">{user.email}</td>
                    <td className="py-3 px-3">
                      <span className="bg-[#EFF6FF] text-[#2563EB] font-bold py-0.5 px-2.5 rounded text-[10px]">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-500 font-semibold">{user.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RBAC Access Matrix - MAIN REQUEST */}
      {activeTab === "RBAC" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200 text-xs">
          <div className="px-6 py-5 border-b border-[#E2E8F0] bg-slate-50/50 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Permissions Matrix</h3>
              <p className="text-slate-500 font-medium leading-relaxed mt-0.5">
                The permissions matrix matches roles against system modules. Unauthorized route navigation attempts are automatically intercepted and rejected.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] tracking-wide">
                  <th className="py-3.5 px-6 text-left w-48 select-none">System Roles</th>
                  {columns.map(col => (
                    <th key={col} className="py-3.5 px-3 select-none">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"].map((role) => {
                  const isActive = currentUser?.role === role;
                  return (
                    <tr
                      key={role}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isActive ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {/* Role Label */}
                      <td className="py-4 px-6 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{role}</span>
                          {isActive && (
                            <span className="bg-blue-100 text-blue-700 text-[8px] font-extrabold px-1.5 py-0.25 rounded uppercase">
                              Active Demo Session
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Matrix cells */}
                      {columns.map((col) => {
                        const permVal = getPermValue(role, col);
                        return (
                          <td key={col} className="py-4 px-3">
                            <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[10px] w-24 select-none ${getPermissionBadgeClass(permVal)}`}>
                              {permVal}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Explanation notes for demo audit */}
          <div className="p-6 border-t border-slate-100 bg-[#F8FAFC]/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800">Demo Simulation Rule Notes:</h5>
              <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium leading-relaxed pl-1">
                <li>Toggle between these 4 roles using the selector in the **sticky topbar** to audit changes instantly.</li>
                <li>Inaccessible sidebar links will be hidden dynamically based on the selected role's view status.</li>
                <li>Direct link entries in the address bar to unauthorized sections will render a custom **Access Denied** message.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800">Operational Access Scopes:</h5>
              <p className="text-slate-600 leading-relaxed font-medium">
                <strong>Dispatchers</strong> hold write access to Trips to create and dispatch loads, but can only view Driver compliance. <br />
                <strong>Safety Officers</strong> hold full compliance authorization for Drivers (toggling suspensions/off-duty state) but cannot view financial Analytics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "Notifications" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm max-w-2xl animate-in fade-in duration-200 text-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Notification & Alarm Rules</h3>
          <p className="text-slate-400 mb-6 font-medium">Select criteria that triggers operational warnings in the top alert bell.</p>
          
          <div className="space-y-3 font-semibold text-slate-700">
            <div className="flex items-center">
              <input type="checkbox" id="check-lic" defaultChecked className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="check-lic" className="ml-2 font-medium select-none cursor-pointer">Warn if Driver License is within 30 days of expiration</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="check-maint" defaultChecked className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="check-maint" className="ml-2 font-medium select-none cursor-pointer">Warn if Odometer exceeds scheduled vehicle service interval</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="check-fuel" defaultChecked className="h-4.5 w-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="check-fuel" className="ml-2 font-medium select-none cursor-pointer">Alert on sudden drops in logged fuel efficiency (&lt; 2.5 km/L)</label>
            </div>
          </div>
        </div>
      )}

      {/* Appearance */}
      {activeTab === "Appearance" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm max-w-2xl animate-in fade-in duration-200 text-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Interface Customization</h3>
          <p className="text-slate-400 mb-6 font-medium">Choose colors, theme modes, and card styling parameters.</p>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">Current Theme: TransitOps Premium Light</p>
            <p className="text-[11px] text-slate-400 mt-1">Light theme configured with Deep Navy slate side panels, primary Blue accents, and semantic alerts. Dark mode toggles are locked for demo compliance.</p>
          </div>
        </div>
      )}
    </div>
  );
};
