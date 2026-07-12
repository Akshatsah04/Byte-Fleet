import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { formatDistance, formatINR, formatWeight, getStatusBadgeStyles } from "../utils/helpers";
import {
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  Route,
  Wrench,
  AlertTriangle,
  Clock,
  Plus,
  FileDown,
  Calendar,
  MapPin,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const Dashboard = () => {
  const { vehicles, drivers, trips, maintenance, alerts, createTrip } = useData();
  const navigate = useNavigate();

  // Filters State
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Create Trip modal state
  const [createTripOpen, setCreateTripOpen] = useState(false);

  // Time based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = useMemo(() => {
    return new Date("2026-07-12").toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, []);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchRegion = regionFilter === "All" || v.region.includes(regionFilter);
      const matchType = typeFilter === "All" || v.type === typeFilter;
      const matchStatus = statusFilter === "All" || v.status === statusFilter;
      return matchRegion && matchType && matchStatus;
    });
  }, [vehicles, regionFilter, typeFilter, statusFilter]);

  // Calculations based on filtered/unfiltered vehicles
  const kpis = useMemo(() => {
    const total = filteredVehicles.length;
    const available = filteredVehicles.filter(v => v.status === "Available").length;
    const inShop = filteredVehicles.filter(v => v.status === "In Shop").length;
    const onTrip = filteredVehicles.filter(v => v.status === "On Trip").length;
    const retired = filteredVehicles.filter(v => v.status === "Retired").length;
    const activeVehiclesCount = total - retired;

    const utilization = activeVehiclesCount > 0 
      ? Math.round((onTrip / activeVehiclesCount) * 100) 
      : 0;

    // Drivers calculations (since drivers are linked to region via vehicles or standalone, let's count directly)
    const onDutyDrivers = drivers.filter(d => d.status === "Available" || d.status === "On Trip").length;

    const pendingTrips = trips.filter(t => t.status === "Draft").length;
    const activeTrips = trips.filter(t => t.status === "Dispatched").length;

    return {
      total,
      available,
      inShop,
      onTrip,
      activeTrips,
      pendingTrips,
      onDutyDrivers,
      utilization
    };
  }, [filteredVehicles, drivers, trips]);

  // Chart 1: Fleet Utilization Trend (Mocked 6-month historical data)
  const utilizationTrendData = [
    { month: "Feb", rate: 68, trips: 35 },
    { month: "Mar", rate: 72, trips: 42 },
    { month: "Apr", rate: 75, trips: 48 },
    { month: "May", rate: 78, trips: 52 },
    { month: "Jun", rate: 82, trips: 60 },
    { month: "Jul", rate: kpis.utilization, trips: trips.length }
  ];

  // Chart 2: Status distribution data
  const statusPieData = useMemo(() => {
    return [
      { name: "Available", value: kpis.available, color: "#16A34A" },
      { name: "On Trip", value: kpis.onTrip, color: "#2563EB" },
      { name: "In Shop", value: kpis.inShop, color: "#D97706" }
    ].filter(item => item.value > 0);
  }, [kpis]);

  const resetFilters = () => {
    setRegionFilter("All");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const handleExport = () => {
    alert("Exporting fleet operational report to CSV. Check downloads.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500">{greeting}, Administrator</p>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Fleet overview</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> {formattedDate}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-[#E2E8F0] shadow-sm transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => navigate("/trips")}
            className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Trip</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Quick Filters</span>
          </div>

          {/* Region Filter */}
          <div className="flex flex-col">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="text-xs py-1.5 bg-slate-50"
            >
              <option value="All">All Regions</option>
              <option value="North">North (Delhi)</option>
              <option value="South">South (Bengaluru/Chennai)</option>
              <option value="West">West (Mumbai/Ahmedabad)</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex flex-col">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs py-1.5 bg-slate-50"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Heavy Tipper">Heavy Tipper</option>
              <option value="Container Truck">Container Truck</option>
              <option value="Dumper">Dumper</option>
              <option value="Flatbed Trailer">Flatbed Trailer</option>
              <option value="Box Truck">Box Truck</option>
              <option value="Tanker">Tanker</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
            </select>
          </div>
        </div>

        {(regionFilter !== "All" || typeFilter !== "All" || statusFilter !== "All") && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 py-1.5 px-3 rounded-lg border border-red-100 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Total Vehicles */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Truck className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fleet</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.total}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total registered</p>
        </div>

        {/* Available Vehicles */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Available</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{kpis.available}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
            <span>Ready for trip</span>
          </div>
        </div>

        {/* In Maintenance */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <Wrench className="w-4 h-4" />
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">In Shop</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{kpis.inShop}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active maintenance</p>
        </div>

        {/* Active Trips */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-blue-500 mb-2">
            <Route className="w-4 h-4" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Active</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{kpis.activeTrips}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Trips dispatched</p>
        </div>

        {/* Pending Trips */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-700">{kpis.pendingTrips}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Draft/Scheduled</p>
        </div>

        {/* Drivers on duty */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Drivers</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.onDutyDrivers}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active on duty</p>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Utilization</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.utilization}%</p>
          <div className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-semibold mt-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>+3.2% vs MoM</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Utilization Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Fleet Utilization & Trips Trend</h3>
              <p className="text-xs text-slate-500">Historical performance for the past 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600" /> Utilization Rate (%)</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="utilizationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value) => [`${value}%`, "Utilization"]}
                />
                <Area type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#utilizationGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Pie */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Vehicle Status Distribution</h3>
            <p className="text-xs text-slate-500">Status share of active vehicles</p>
          </div>
          
          {statusPieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
              No vehicle data matches active filters.
            </div>
          ) : (
            <div className="flex flex-col items-center my-auto">
              <div className="h-44 w-full flex justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">{kpis.total - vehicles.filter(v => v.status === "Retired").length}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Active</span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-3 gap-4 w-full mt-4 border-t border-slate-100 pt-4">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex flex-col items-center">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-semibold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Alerts & Upcoming Maintenance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts Panel */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Critical Operational Alerts</h3>
              <p className="text-xs text-slate-500">Compliance & safety indicators requiring action</p>
            </div>
            <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded border border-red-100">
              {alerts.length} Action Needed
            </span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2.5 pr-2">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <span className="text-xs font-semibold text-slate-500">All fleet systems operating normally.</span>
              </div>
            ) : (
              alerts.map((alert) => {
                const isDanger = alert.type === "danger";
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors hover:bg-slate-50 cursor-pointer`}
                    onClick={() => navigate(alert.link)}
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                      isDanger ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {isDanger ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{alert.title}</h4>
                        <span className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Maintenance Panel */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Depot Maintenance Calendar</h3>
              <p className="text-xs text-slate-500">Upcoming vehicle services</p>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 space-y-3 pr-2">
            {maintenance
              .filter(m => m.status !== "Completed")
              .map((m) => {
                const vehicle = vehicles.find(v => v.id === m.vehicleId);
                const isActive = m.status === "Active";
                return (
                  <div key={m.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      isActive ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {vehicle ? vehicle.regNumber : m.vehicleId}
                        </span>
                        <span className={`text-[9px] font-bold py-0.5 px-1.5 rounded uppercase ${
                          isActive ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{m.serviceType} Service</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Provider: {m.serviceProvider}</p>
                      <div className="text-[9px] text-slate-500 mt-2 font-semibold flex items-center gap-1 bg-white p-1.5 rounded border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Est: {m.expectedCompletion}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {maintenance.filter(m => m.status !== "Completed").length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold py-12">
                No active or scheduled service records.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent Dispatched Trips</h3>
            <p className="text-xs text-slate-500">Live operational log of dispatches</p>
          </div>
          <button
            onClick={() => navigate("/trips")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage Trips &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Trip ID</th>
                <th className="py-2.5">Route</th>
                <th className="py-2.5">Vehicle</th>
                <th className="py-2.5">Driver</th>
                <th className="py-2.5">Cargo</th>
                <th className="py-2.5">Est. Arrival</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {trips.slice(0, 4).map((trip) => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);
                return (
                  <tr key={trip.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900">{trip.id}</td>
                    <td className="py-3 font-semibold">{trip.route}</td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{vehicle?.regNumber}</span>
                        <span className="text-[10px] text-slate-400">{vehicle?.name}</span>
                      </div>
                    </td>
                    <td className="py-3">{driver?.name || trip.driverId}</td>
                    <td className="py-3">{formatWeight(trip.cargoWeight)}</td>
                    <td className="py-3">{trip.estimatedArrival.replace("T", " ")}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeStyles(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {trips.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500 font-semibold">
                    No trips logged in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
