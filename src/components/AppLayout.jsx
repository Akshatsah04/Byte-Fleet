import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { hasAccess } from "./permissions";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Compass
} from "lucide-react";

export const AppLayout = ({ children }) => {
  const { currentUser, logout, changeRoleForDemo, alerts } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  // Close menus on click outside (simplified for mockup)
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
    setRoleSwitcherOpen(false);
  }, [location]);

  if (!currentUser) return <>{children}</>;

  const navigationItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard, section: "dashboard" },
    { name: "Fleet", path: "/fleet", icon: Truck, section: "fleet" },
    { name: "Drivers", path: "/drivers", icon: Users, section: "drivers" },
    { name: "Trips", path: "/trips", icon: Route, section: "trips" },
    { name: "Maintenance", path: "/maintenance", icon: Wrench, section: "maintenance" },
    { name: "Fuel & Expenses", path: "/expenses", icon: Fuel, section: "expenses" },
    { name: "Analytics", path: "/analytics", icon: analyticsSectionName() },
    { name: "Settings", path: "/settings", icon: Settings, section: "settings" }
  ];

  function analyticsSectionName() {
    return BarChart3;
  }

  // Determine active route basename
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === "/") return "dashboard";
    const section = path.split("/")[1];
    return section;
  };

  // Switch demo account helper
  const handleRoleChange = (role) => {
    changeRoleForDemo(role);
    setRoleSwitcherOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-[#0F172A]">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[248px] bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center space-x-2 text-white font-semibold text-lg">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <span className="tracking-tight text-xl font-bold">Transit<span className="text-[#2563EB]">Ops</span></span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Operations
            </p>
            {navigationItems.map((item) => {
              const secName = item.section || item.name.toLowerCase();
              const isVisible = hasAccess(currentUser.role, secName === "fuel & expenses" ? "expenses" : secName);
              if (!isVisible) return null;

              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-[#2563EB] text-white"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-800 bg-[#0c1221]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <img
                src={currentUser.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 object-cover"
              />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 hover:border-red-900/60 text-slate-300 py-2 px-3 rounded-lg text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-[248px] flex flex-col min-w-0 min-h-screen">
        {/* Sticky Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between shadow-sm">
          {/* Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500 font-medium">
              <span className="text-slate-400">TransitOps</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-950 font-semibold capitalize">
                {getActiveSection() === "dashboard" ? "Fleet Overview" : getActiveSection().replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Quick Search, Notifications, Demo Selector, Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search (Desktop only) */}
            <div className="hidden md:flex items-center space-x-2 bg-[#F1F5F9] border border-transparent hover:border-[#CBD5E1] rounded-lg px-3 py-1.5 w-64 transition-all">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search resources..."
                className="bg-transparent border-0 p-0 text-xs w-full focus:ring-0 focus:outline-none"
                readOnly
                onClick={() => alert("Search functionality is interactive in data tables below.")}
              />
              <span className="text-[10px] font-semibold text-slate-400 bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded shadow-sm">
                Ctrl K
              </span>
            </div>

            {/* DEMO ROLE SWITCHER dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleSwitcherOpen(!roleSwitcherOpen);
                  setNotificationsOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] font-semibold text-xs py-1.5 px-3 rounded-lg border border-[#DBEAFE] transition-all cursor-pointer"
              >
                <span className="hidden sm:inline">Role:</span>
                <span>{currentUser.role}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleSwitcherOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Demo Access Switcher</p>
                    </div>
                    {["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"].map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentUser.role === role ? "text-[#2563EB] bg-[#EFF6FF]/40 font-semibold" : "text-slate-700"
                        }`}
                      >
                        <span>{role}</span>
                        {currentUser.role === role && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setRoleSwitcherOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-[#F1F5F9] rounded-lg relative transition-all"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-2 z-20 max-h-[480px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-900">Operational Alerts</span>
                      <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                        {alerts.length} Urgent
                      </span>
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-[#E2E8F0]">
                      {alerts.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs font-medium">
                          No current operational alerts.
                        </div>
                      ) : (
                        alerts.map((alert) => {
                          const isDanger = alert.type === "danger";
                          return (
                            <div
                              key={alert.id}
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate(alert.link);
                              }}
                              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isDanger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                {isDanger ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="text-xs font-bold text-slate-900 truncate">{alert.title}</p>
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                    {alert.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                  setRoleSwitcherOpen(false);
                }}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-50"
                />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-950 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
