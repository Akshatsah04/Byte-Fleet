import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { formatINR, formatDistance, formatWeight, getStatusBadgeStyles } from "../utils/helpers";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  BarChart3,
  FileDown,
  Calendar,
  Filter,
  Info,
  TrendingUp,
  Percent,
  Fuel,
  Coins,
  Compass,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

export const Analytics = () => {
  const { vehicles, trips, fuelLogs, expenses, maintenance } = useData();

  // Filters State
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Jul"); // default July 2026

  // Calculation metrics
  const metrics = useMemo(() => {
    // Filtered vehicles
    const filteredV = vehicles.filter(v => {
      const matchRegion = regionFilter === "All" || v.region.includes(regionFilter);
      const matchType = typeFilter === "All" || v.type === typeFilter;
      return matchRegion && matchType;
    });
    
    const vIds = filteredV.map(v => v.id);

    // Filter fuel logs for these vehicles
    const vFuel = fuelLogs.filter(f => vIds.includes(f.vehicleId));
    const totalFuelCost = vFuel.reduce((sum, f) => sum + f.totalCost, 0);
    const totalLiters = vFuel.reduce((sum, f) => sum + f.liters, 0);
    const totalDistance = vFuel.reduce((sum, f) => sum + (f.distanceTravelled || 0), 0);

    // Filter expenses
    const vExpenses = expenses.filter(e => vIds.includes(e.vehicleId));
    const maintenanceCost = vExpenses
      .filter(e => e.category === "Maintenance" || e.category === "Repair")
      .reduce((sum, e) => sum + e.amount, 0);
    const miscellaneousCost = vExpenses
      .filter(e => e.category !== "Maintenance" && e.category !== "Repair")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalOpsCost = totalFuelCost + maintenanceCost + miscellaneousCost;

    // Filter trips and revenue
    const vTrips = trips.filter(t => vIds.includes(t.vehicleId));
    const totalRevenue = vTrips
      .filter(t => t.status === "Completed" || t.status === "Dispatched")
      .reduce((sum, t) => sum + t.revenue, 0);

    // Fleet average fuel efficiency
    const avgEfficiency = totalLiters > 0 ? parseFloat((totalDistance / totalLiters).toFixed(2)) : 4.2;

    // Fleet utilization: active non-retired vehicles on trip
    const activeVehicles = filteredV.filter(v => v.status !== "Retired");
    const onTripCount = activeVehicles.filter(v => v.status === "On Trip").length;
    const utilizationRate = activeVehicles.length > 0 
      ? Math.round((onTripCount / activeVehicles.length) * 100) 
      : 72;

    // Acquisition costs for ROI
    const totalAcquisition = filteredV.reduce((sum, v) => sum + v.acquisitionCost, 0);
    
    // Fleet ROI = (Revenue - Fuel - Maintenance) / Acquisition * 100
    const netRevenue = totalRevenue - totalOpsCost;
    const fleetROI = totalAcquisition > 0 
      ? parseFloat(((netRevenue / totalAcquisition) * 100).toFixed(2)) 
      : 0.85;

    return {
      avgEfficiency,
      utilizationRate,
      totalOpsCost,
      totalRevenue,
      fleetROI,
      filteredV,
      vIds,
      totalFuelCost,
      maintenanceCost,
      miscellaneousCost
    };
  }, [vehicles, trips, fuelLogs, expenses, regionFilter, typeFilter]);

  // Chart 1: Revenue vs Cost Comparison (MoM)
  const monthlyRevenueCostData = [
    { name: "Feb", Revenue: 180000, Costs: 85000 },
    { name: "Mar", Revenue: 220000, Costs: 110000 },
    { name: "Apr", Revenue: 210000, Costs: 105000 },
    { name: "May", Revenue: 240000, Costs: 115000 },
    { name: "Jun", Revenue: 290000, Costs: 130000 },
    { name: "Jul", Revenue: metrics.totalRevenue || 310000, Costs: metrics.totalOpsCost || 148000 }
  ];

  // Chart 2: Fuel consumption trend (Mocked)
  const fuelConsumptionTrendData = [
    { week: "Wk 24", Liters: 450, Cost: 42750 },
    { week: "Wk 25", Liters: 480, Cost: 45600 },
    { week: "Wk 26", Liters: 520, Cost: 49400 },
    { week: "Wk 27", Liters: 490, Cost: 46550 },
    { week: "Wk 28", Liters: 560, Cost: 53200 }
  ];

  // Chart 3: Expense Categories Pie Chart
  const expenseBreakdownData = useMemo(() => {
    return [
      { name: "Fuel Costs", value: metrics.totalFuelCost || 85000, color: "#2563EB" },
      { name: "Maintenance", value: metrics.maintenanceCost || 45000, color: "#D97706" },
      { name: "Tolls & Permits", value: metrics.miscellaneousCost || 18000, color: "#16A34A" }
    ];
  }, [metrics]);

  // Detailed Vehicle ROI Performance Table
  const vehiclePerformanceTable = useMemo(() => {
    return metrics.filteredV.map(v => {
      // Fuel cost
      const vFuelCost = fuelLogs
        .filter(f => f.vehicleId === v.id)
        .reduce((sum, f) => sum + f.totalCost, 0);

      // Maintenance cost
      const vMaintCost = expenses
        .filter(e => e.vehicleId === v.id && (e.category === "Maintenance" || e.category === "Repair"))
        .reduce((sum, e) => sum + e.amount, 0);

      // Other costs
      const vOtherCost = expenses
        .filter(e => e.vehicleId === v.id && e.category !== "Maintenance" && e.category !== "Repair")
        .reduce((sum, e) => sum + e.amount, 0);

      const totalCosts = vFuelCost + vMaintCost + vOtherCost;

      // Revenue
      const totalRev = trips
        .filter(t => t.vehicleId === v.id && (t.status === "Completed" || t.status === "Dispatched"))
        .reduce((sum, t) => sum + t.revenue, 0);

      // ROI = (Revenue - Fuel - Maintenance) / Acquisition * 100
      const net = totalRev - vFuelCost - vMaintCost;
      const roi = v.acquisitionCost > 0 
        ? parseFloat(((net / v.acquisitionCost) * 100).toFixed(2)) 
        : 0;

      // Efficiency average
      const vLogs = fuelLogs.filter(f => f.vehicleId === v.id);
      const vDist = vLogs.reduce((sum, f) => sum + (f.distanceTravelled || 0), 0);
      const vLit = vLogs.reduce((sum, f) => sum + f.liters, 0);
      const eff = vLit > 0 ? parseFloat((vDist / vLit).toFixed(2)) : 0;

      return {
        regNumber: v.regNumber,
        name: v.name,
        revenue: totalRev,
        fuel: vFuelCost,
        maintenance: vMaintCost,
        totalCost: totalCosts,
        efficiency: eff,
        roi
      };
    }).sort((a, b) => b.roi - a.roi);
  }, [metrics.filteredV, fuelLogs, expenses, trips]);

  const handleExport = (format) => {
    alert(`Exporting operational reports dashboard as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Financial performance indicators, vehicle ROI models, operational costs audit, and efficiency graphs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-[#E2E8F0] shadow-sm cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-[#E2E8F0] shadow-sm cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Analytics Filters</span>
          </div>

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

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="Jul">Current Month (Jul 2026)</option>
            <option value="Quarter">Q2 FY 2026</option>
            <option value="Year">Full Year 2026</option>
          </select>
        </div>

        {(regionFilter !== "All" || typeFilter !== "All" || timeFilter !== "Jul") && (
          <button
            onClick={() => {
              setRegionFilter("All");
              setTypeFilter("All");
              setTimeFilter("Jul");
            }}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <div className="flex justify-center text-[#2563EB] mb-1.5">
            <Coins className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Revenue</p>
          <p className="text-xl font-bold text-slate-900">{formatINR(metrics.totalRevenue)}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <div className="flex justify-center text-slate-400 mb-1.5">
            <Coins className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Operating Cost</p>
          <p className="text-xl font-bold text-slate-900">{formatINR(metrics.totalOpsCost)}</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <div className="flex justify-center text-emerald-500 mb-1.5">
            <Fuel className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Avg Fuel Efficiency</p>
          <p className="text-xl font-bold text-emerald-600">{metrics.avgEfficiency} km/L</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <div className="flex justify-center text-slate-400 mb-1.5">
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Fleet Utilization</p>
          <p className="text-xl font-bold text-slate-900">{metrics.utilizationRate}%</p>
        </div>

        <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-xl shadow-sm text-center relative overflow-hidden">
          <div className="flex justify-center text-[#2563EB] mb-1.5">
            <Percent className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">Average Fleet ROI</p>
          <p className="text-xl font-bold text-[#2563EB]">{metrics.fleetROI}%</p>
        </div>
      </div>

      {/* ROI Formulas Information Panel */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-600">
          <p className="font-bold text-slate-800">Return on Investment (ROI) Metric Formula:</p>
          <p className="font-mono bg-white p-2 rounded border border-slate-100 mt-1 inline-block">
            Vehicle ROI = (Revenue - Fuel Cost - Maintenance Cost) &divide; Acquisition Cost &times; 100
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">ROI evaluates specific vehicle efficiency relative to its original purchase price, deducting operational fuel and garage service expenditures.</p>
        </div>
      </div>

      {/* Recharts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost vs Revenue MoM Comparison */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Monthly Revenue vs Operational-Cost Comparison</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueCostData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Costs" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category breakdown Pie */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Expense Breakdown by Category</h3>
            <p className="text-xs text-slate-500">Distribution of operational costs logged</p>
          </div>

          <div className="h-44 w-full flex justify-center relative my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-slate-900">{formatINR(metrics.totalOpsCost)}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Total Logged</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            {expenseBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-semibold">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel fill-up consumption trend */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Weekly Fuel Consumption Trend</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelConsumptionTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="Liters" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Costliest vs Efficient summaries */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Vehicle Operational Cost Leaderboard</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider mb-2">Costliest Vehicles (Operational Charges)</p>
              <div className="space-y-2">
                {vehiclePerformanceTable.slice(0, 3).map((item) => (
                  <div key={item.regNumber} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-bold text-slate-900">{item.regNumber} ({item.name})</span>
                    <span className="font-extrabold text-red-600">{formatINR(item.totalCost)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider mb-2">Most Efficient Vehicles (Fuel Efficiency)</p>
              <div className="space-y-2">
                {vehiclePerformanceTable
                  .filter(v => v.efficiency > 0)
                  .sort((a, b) => b.efficiency - a.efficiency)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.regNumber} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-bold text-slate-900">{item.regNumber}</span>
                      <span className="font-extrabold text-emerald-600">{item.efficiency} km/L</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle performance detail table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-1 border-b border-slate-100 pb-3">Individual Vehicle Performance Metrics</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Vehicle</th>
                <th className="py-2.5">Total Revenue</th>
                <th className="py-2.5">Fuel Expenditures</th>
                <th className="py-2.5">Maintenance Costs</th>
                <th className="py-2.5">Cumulative Cost</th>
                <th className="py-2.5">Average Efficiency</th>
                <th className="py-2.5 text-center">Calculated ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {vehiclePerformanceTable.map((item) => (
                <tr key={item.regNumber} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900">
                    <div className="flex flex-col">
                      <span>{item.regNumber}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-slate-900">{formatINR(item.revenue)}</td>
                  <td className="py-3">{formatINR(item.fuel)}</td>
                  <td className="py-3">{formatINR(item.maintenance)}</td>
                  <td className="py-3 font-bold">{formatINR(item.totalCost)}</td>
                  <td className="py-3 text-emerald-600 font-bold">{item.efficiency > 0 ? `${item.efficiency} km/L` : "-"}</td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.roi >= 1.5 ? "bg-emerald-100 text-emerald-800" :
                      item.roi > 0 ? "bg-blue-100 text-blue-800" :
                      item.roi === 0 ? "bg-slate-100 text-slate-700" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.roi}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
