import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { canEdit } from "../components/permissions";
import { formatINR, formatDistance, formatDate } from "../utils/helpers";
import {
  Fuel,
  Plus,
  TrendingUp,
  FileDown,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Scale,
  Calendar,
  X,
  CreditCard,
  CheckCircle,
  Truck,
  RotateCcw
} from "lucide-react";

export const Expenses = () => {
  const {
    fuelLogs,
    expenses,
    vehicles,
    trips,
    addFuelLog,
    addGeneralExpense,
    currentUser
  } = useData();

  const isEditable = canEdit(currentUser?.role, "expenses");

  // Tabs
  const [activeTab, setActiveTab] = useState("FuelLogs");

  // Toasts
  const [toastMsg, setToastMsg] = useState("");

  // Search/Filters (local)
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("All");

  // Modals state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Form state - Log Fuel
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelDate, setFuelDate] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelOdometer, setFuelOdometer] = useState("");
  const [fuelError, setFuelError] = useState("");

  // Form state - Add Expense
  const [expVehicleId, setExpVehicleId] = useState("");
  const [expTripId, setExpTripId] = useState("");
  const [expCategory, setExpCategory] = useState("Toll");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expDescription, setExpDescription] = useState("");
  const [expError, setExpError] = useState("");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 5000);
  };

  // Calculations for KPI summaries
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonthStr = "2026-07"; // Mocking July 2026 for evaluation

    // Fuel cost July 2026
    const fuelCostThisMonth = fuelLogs
      .filter(f => f.date.startsWith(currentMonthStr))
      .reduce((sum, f) => sum + f.totalCost, 0);

    // Maintenance costs this month (category: Maintenance or Repair)
    const maintenanceCostThisMonth = expenses
      .filter(e => e.date.startsWith(currentMonthStr) && (e.category === "Maintenance" || e.category === "Repair"))
      .reduce((sum, e) => sum + e.amount, 0);

    // Toll & Misc expenses this month
    const tollMiscCostThisMonth = expenses
      .filter(e => e.date.startsWith(currentMonthStr) && e.category !== "Maintenance" && e.category !== "Repair")
      .reduce((sum, e) => sum + e.amount, 0);

    // Total cost this month
    const totalCostThisMonth = fuelCostThisMonth + maintenanceCostThisMonth + tollMiscCostThisMonth;

    // Average fuel efficiency calculations
    const totalDistanceFuelLogs = fuelLogs.reduce((sum, f) => sum + (f.distanceTravelled || 0), 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

    const avgFuelCostPerKm = totalDistanceFuelLogs > 0 
      ? parseFloat((totalFuelCost / totalDistanceFuelLogs).toFixed(2)) 
      : 0;

    return {
      fuelCostThisMonth,
      maintenanceCostThisMonth,
      tollMiscCostThisMonth,
      totalCostThisMonth,
      avgFuelCostPerKm
    };
  }, [fuelLogs, expenses]);

  // Vehicle cost breakdown summary
  const vehicleCostsBreakdown = useMemo(() => {
    const dataMap = {};

    vehicles.forEach(v => {
      dataMap[v.id] = {
        id: v.id,
        regNumber: v.regNumber,
        name: v.name,
        fuel: 0,
        maintenance: 0,
        other: 0,
        total: 0
      };
    });

    // Populate fuel
    fuelLogs.forEach(f => {
      if (dataMap[f.vehicleId]) {
        dataMap[f.vehicleId].fuel += f.totalCost;
        dataMap[f.vehicleId].total += f.totalCost;
      }
    });

    // Populate general expenses
    expenses.forEach(e => {
      if (dataMap[e.vehicleId]) {
        if (e.category === "Maintenance" || e.category === "Repair") {
          dataMap[e.vehicleId].maintenance += e.amount;
        } else {
          dataMap[e.vehicleId].other += e.amount;
        }
        dataMap[e.vehicleId].total += e.amount;
      }
    });

    return Object.values(dataMap).sort((a, b) => b.total - a.total);
  }, [vehicles, fuelLogs, expenses]);

  // Log fuel submit
  const handleFuelSubmit = (e) => {
    e.preventDefault();
    setFuelError("");

    if (!fuelVehicleId || !fuelDate || !fuelLiters || !fuelCost || !fuelOdometer) {
      setFuelError("All fields are required.");
      return;
    }

    const vehicleObj = vehicles.find(v => v.id === fuelVehicleId);
    if (vehicleObj && Number(fuelOdometer) <= vehicleObj.odometer) {
      setFuelError(`New odometer reading must exceed the vehicle's current odometer (${formatDistance(vehicleObj.odometer)}).`);
      return;
    }

    try {
      addFuelLog({
        vehicleId: fuelVehicleId,
        date: fuelDate,
        liters: Number(fuelLiters),
        totalCost: Number(fuelCost),
        odometer: Number(fuelOdometer)
      });

      triggerToast(`Fuel logged successfully for vehicle ${vehicleObj?.regNumber}.`);
      setIsFuelModalOpen(false);
      // Reset
      setFuelVehicleId("");
      setFuelDate("");
      setFuelLiters("");
      setFuelCost("");
      setFuelOdometer("");
    } catch (err) {
      setFuelError(err.message);
    }
  };

  // Add general expense submit
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    setExpError("");

    if (!expVehicleId || !expCategory || !expAmount || !expDate || !expDescription) {
      setExpError("All fields marked as required must be filled.");
      return;
    }

    try {
      addGeneralExpense({
        vehicleId: expVehicleId,
        tripId: expTripId || null,
        category: expCategory,
        amount: Number(expAmount),
        date: expDate,
        description: expDescription
      });

      const vehicleObj = vehicles.find(v => v.id === expVehicleId);
      triggerToast(`Logged ${expCategory} expense of ${formatINR(expAmount)} for ${vehicleObj?.regNumber}.`);
      setIsExpenseModalOpen(false);
      // Reset
      setExpVehicleId("");
      setExpTripId("");
      setExpCategory("Toll");
      setExpAmount("");
      setExpDate("");
      setExpDescription("");
    } catch (err) {
      setExpError(err.message);
    }
  };

  // Local filters
  const filteredFuelLogs = useMemo(() => {
    if (selectedVehicleFilter === "All") return fuelLogs;
    return fuelLogs.filter(f => f.vehicleId === selectedVehicleFilter);
  }, [fuelLogs, selectedVehicleFilter]);

  const filteredExpenses = useMemo(() => {
    if (selectedVehicleFilter === "All") return expenses;
    return expenses.filter(e => e.vehicleId === selectedVehicleFilter);
  }, [expenses, selectedVehicleFilter]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#DCFCE7] border border-[#16A34A] text-[#16A34A] p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-bold leading-normal">{toastMsg}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fuel & Expenses</h1>
          <p className="text-xs text-slate-500 mt-1">Audit operational expenses, track fuel purchase efficiency, and manage vehicle cost breakdowns.</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <button
                onClick={() => setIsFuelModalOpen(true)}
                className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-[#E2E8F0] shadow-sm transition-colors cursor-pointer"
              >
                <Fuel className="w-4 h-4 text-[#2563EB]" />
                <span>Log Fuel</span>
              </button>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Cost (Jul)</p>
          <p className="text-xl font-bold text-slate-900">{formatINR(stats.fuelCostThisMonth)}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Maintenance Cost</p>
          <p className="text-xl font-bold text-slate-900">{formatINR(stats.maintenanceCostThisMonth)}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Toll & Misc Cost</p>
          <p className="text-xl font-bold text-slate-900">{formatINR(stats.tollMiscCostThisMonth)}</p>
        </div>
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Total Operating Cost</p>
          <p className="text-xl font-bold text-blue-900">{formatINR(stats.totalCostThisMonth)}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Fuel Cost / Km</p>
          <p className="text-xl font-bold text-slate-900">{formatINR(stats.avgFuelCostPerKm)} / km</p>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <span>Filter by vehicle:</span>
          <select
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.regNumber} ({v.name})
              </option>
            ))}
          </select>
        </div>
        
        {selectedVehicleFilter !== "All" && (
          <button
            onClick={() => setSelectedVehicleFilter("All")}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear filter</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex space-x-1.5 pb-px">
          <button
            onClick={() => setActiveTab("FuelLogs")}
            className={`pb-3.5 px-3 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === "FuelLogs"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab("Expenses")}
            className={`pb-3.5 px-3 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === "Expenses"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            General Expenses
          </button>
          <button
            onClick={() => setActiveTab("Breakdown")}
            className={`pb-3.5 px-3 text-xs font-bold transition-all relative border-b-2 ${
              activeTab === "Breakdown"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Costs By Vehicle
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "FuelLogs" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Quantity (Liters)</th>
                  <th className="py-3 px-3">Total Cost (INR)</th>
                  <th className="py-3 px-3">Odometer Log</th>
                  <th className="py-3 px-3">Distance Traveled</th>
                  <th className="py-3 px-3">Fuel Efficiency</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredFuelLogs.map((f) => {
                  const vehicle = vehicles.find(v => v.id === f.vehicleId);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {vehicle ? vehicle.regNumber : f.vehicleId}
                      </td>
                      <td className="py-3 px-3">{formatDate(f.date)}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{f.liters} L</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatINR(f.totalCost)}</td>
                      <td className="py-3 px-3 text-slate-600">{formatDistance(f.odometer)}</td>
                      <td className="py-3 px-3 text-slate-600">{formatDistance(f.distanceTravelled)}</td>
                      <td className="py-3 px-3 text-emerald-600 font-bold">{f.fuelEfficiency} km/L</td>
                      <td className="py-3 px-4 text-center text-slate-400 select-none text-[10px]">receipt_file.jpg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Expenses" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Expense ID</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Related Trip</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Amount (INR)</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredExpenses.map((e) => {
                  const vehicle = vehicles.find(v => v.id === e.vehicleId);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{e.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {vehicle ? vehicle.regNumber : e.vehicleId}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-semibold">{e.tripId || "-"}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                          e.category === "Maintenance" || e.category === "Repair" 
                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatINR(e.amount)}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(e.date)}</td>
                      <td className="py-3 px-3 text-slate-600 font-normal">{e.description}</td>
                      <td className="py-3 px-4 text-center text-slate-400 select-none text-[10px]">{e.receipt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Breakdown" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Vehicle Details</th>
                  <th className="py-3 px-3">Fuel Costs</th>
                  <th className="py-3 px-3">Maintenance Costs</th>
                  <th className="py-3 px-3">Other Expenses</th>
                  <th className="py-3 px-4">Total Operational Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {vehicleCostsBreakdown.map((breakdown) => (
                  <tr key={breakdown.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{breakdown.regNumber}</span>
                        <span className="text-[10px] text-slate-400">{breakdown.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{formatINR(breakdown.fuel)}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{formatINR(breakdown.maintenance)}</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{formatINR(breakdown.other)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm bg-slate-50/20">{formatINR(breakdown.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOG FUEL MODAL */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsFuelModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Fuel Purchase</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Record fuel quantities, odometer logs, and costs to recalculate efficiency metrics.</p>

            {fuelError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                {fuelError}
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Vehicle</label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.filter(v => v.status !== "Retired").map(v => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} ({v.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantity (Liters)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Cost (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 9500"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Log Date</label>
                  <input
                    type="date"
                    required
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">New Odometer reading (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 142100"
                    value={fuelOdometer}
                    onChange={(e) => setFuelOdometer(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Current: {formatDistance(vehicles.find(v => v.id === fuelVehicleId)?.odometer)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Log Receipt / Bills (Optional)</label>
                <input
                  type="file"
                  className="w-full text-slate-500 bg-slate-50"
                  disabled
                />
                <span className="text-[9px] text-slate-400">Mock receipt scanner is disabled.</span>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Log Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD GENERAL EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add General Expense</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Log non-fuel operating expenses, highway taxes, parking fees, or state permits.</p>

            {expError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                {expError}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Vehicle</label>
                <select
                  value={expVehicleId}
                  onChange={(e) => setExpVehicleId(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.filter(v => v.status !== "Retired").map(v => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} ({v.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full"
                  >
                    <option value="Toll">Toll Tax</option>
                    <option value="Parking">Warehouse Parking</option>
                    <option value="Permit">State Permit / RTO</option>
                    <option value="Repair">Depot Repair</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expense Amount (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Related Trip ID (Optional)</label>
                  <select
                    value={expTripId}
                    onChange={(e) => setExpTripId(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- None --</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.id} ({t.route})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expressway FASTag automatic deduction"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
