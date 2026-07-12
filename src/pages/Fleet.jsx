import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { canEdit } from "../components/permissions";
import { formatINR, formatDistance, formatWeight, getStatusBadgeStyles, formatDate } from "../utils/helpers";
import {
  Search,
  Filter,
  Plus,
  FileDown,
  ChevronRight,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronDown,
  Info,
  Wrench,
  Fuel,
  TrendingUp,
  MapPin,
  Scale,
  Gauge,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

export const Fleet = () => {
  const { vehicles, addVehicle, maintenance, fuelLogs, currentUser } = useData();

  const isEditable = canEdit(currentUser?.role, "fleet");

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Selection & Pagination
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals & Drawers State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Detail drawer

  // Add Vehicle Form State
  const [newRegNumber, setNewRegNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Container Truck");
  const [newCapacity, setNewCapacity] = useState("");
  const [newOdometer, setNewOdometer] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newRegion, setNewRegion] = useState("North (Delhi)");
  const [newStatus, setNewStatus] = useState("Available");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Statistics Summary
  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === "Available").length,
      onTrip: vehicles.filter(v => v.status === "On Trip").length,
      inShop: vehicles.filter(v => v.status === "In Shop").length,
      retired: vehicles.filter(v => v.status === "Retired").length
    };
  }, [vehicles]);

  // Handle Search, Filters, and Sorting
  const processedVehicles = useMemo(() => {
    let result = [...vehicles];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        v =>
          v.regNumber.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q)
      );
    }

    // Filter status
    if (statusFilter !== "All") {
      result = result.filter(v => v.status === statusFilter);
    }

    // Filter type
    if (typeFilter !== "All") {
      result = result.filter(v => v.type === typeFilter);
    }

    // Filter region
    if (regionFilter !== "All") {
      result = result.filter(v => v.region.includes(regionFilter));
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, search, statusFilter, typeFilter, regionFilter, sortField, sortOrder]);

  // Paginated List
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [processedVehicles, currentPage]);

  const totalPages = Math.ceil(processedVehicles.length / itemsPerPage);

  // Form Submit
  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newRegNumber || !newName || !newCapacity || !newOdometer || !newCost) {
      setFormError("All fields are required.");
      return;
    }

    // Validation: Reg number format check (basic)
    const indRegRegex = /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/i;
    if (!indRegRegex.test(newRegNumber)) {
      setFormError("Registration number must follow Indian standard format (e.g. MH-12-PQ-4567).");
      return;
    }

    try {
      addVehicle({
        regNumber: newRegNumber.toUpperCase(),
        name: newName,
        type: newType,
        capacity: Number(newCapacity),
        odometer: Number(newOdometer),
        acquisitionCost: Number(newCost),
        region: newRegion,
        status: newStatus
      });

      setFormSuccess("Vehicle added successfully!");
      // Reset form
      setNewRegNumber("");
      setNewName("");
      setNewCapacity("");
      setNewOdometer("");
      setNewCost("");
      
      // Close modal after brief success window
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess("");
      }, 1000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Row selection toggle
  const toggleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedVehicles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedVehicles.map(v => v.id));
    }
  };

  const handleExport = () => {
    alert("Exporting CSV report for current fleet list...");
  };

  // Drawer Stats Helper
  const vehicleStats = useMemo(() => {
    if (!selectedVehicle) return null;
    const vId = selectedVehicle.id;

    // Filter maintenance records
    const vMaint = maintenance.filter(m => m.vehicleId === vId);
    const totalMaintCost = vMaint.reduce((acc, m) => acc + m.cost, 0);

    // Filter fuel logs
    const vFuel = fuelLogs.filter(f => f.vehicleId === vId);
    const totalFuelLiters = vFuel.reduce((acc, f) => acc + f.liters, 0);
    const totalFuelCost = vFuel.reduce((acc, f) => acc + f.totalCost, 0);

    return {
      maintenanceHistory: vMaint,
      fuelHistory: vFuel,
      totalMaintCost,
      totalFuelLiters,
      totalFuelCost
    };
  }, [selectedVehicle, maintenance, fuelLogs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fleet Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Manage corporate vehicle catalog, status checks, specifications, and service history.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-lg border border-[#E2E8F0] shadow-sm transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
          
          {isEditable && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Vehicles</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">On Trip</p>
          <p className="text-2xl font-bold text-blue-600">{stats.onTrip}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">In Shop</p>
          <p className="text-2xl font-bold text-amber-600">{stats.inShop}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Retired</p>
          <p className="text-2xl font-bold text-red-600">{stats.retired}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by registration, model, or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">All Types</option>
            <option value="Heavy Tipper">Heavy Tipper</option>
            <option value="Container Truck">Container Truck</option>
            <option value="Dumper">Dumper</option>
            <option value="Flatbed Trailer">Flatbed Trailer</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Tanker">Tanker</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="West">West</option>
          </select>

          {/* Sort Controller */}
          <div className="flex bg-slate-50 rounded-lg border border-slate-200">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="text-xs border-0 py-1 bg-transparent pr-8 focus:ring-0 focus:shadow-none"
            >
              <option value="id">Sort ID</option>
              <option value="odometer">Odometer</option>
              <option value="acquisitionCost">Cost</option>
              <option value="name">Model Name</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="px-2 border-l border-slate-200 hover:bg-slate-100 rounded-r-lg text-slate-500 font-bold"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {(search || statusFilter !== "All" || typeFilter !== "All" || regionFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setTypeFilter("All");
                setRegionFilter("All");
                setCurrentPage(1);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === paginatedVehicles.length}
                    onChange={toggleSelectAll}
                    className="h-4.5 w-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Reg. Number</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Max Load</th>
                <th className="py-3 px-3">Odometer</th>
                <th className="py-3 px-3">Cost (INR)</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Last Service</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedVehicles.map((vehicle) => {
                const isSelected = selectedIds.includes(vehicle.id);
                return (
                  <tr
                    key={vehicle.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isSelected ? "bg-[#EFF6FF]/40" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(vehicle.id)}
                        className="h-4.5 w-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{vehicle.name}</span>
                        <span className="text-[10px] text-slate-400">ID: {vehicle.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{vehicle.regNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{vehicle.type}</td>
                    <td className="py-3 px-3 text-slate-600">{formatWeight(vehicle.capacity)}</td>
                    <td className="py-3 px-3 font-semibold">{formatDistance(vehicle.odometer)}</td>
                    <td className="py-3 px-3 font-semibold">{formatINR(vehicle.acquisitionCost)}</td>
                    <td className="py-3 px-3 text-slate-500">{vehicle.region}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeStyles(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(vehicle.lastService)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/60 p-1.5 rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Empty & No results State */}
              {processedVehicles.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center py-16 text-slate-500 font-semibold bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="w-10 h-10 text-slate-400 mb-2" />
                      <p className="text-sm">No vehicles matched your search query or filters.</p>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold underline mt-2"
                      >
                        Reset search filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {processedVehicles.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="text-slate-500 text-xs">
              Showing <span className="font-semibold text-slate-800">{Math.min(processedVehicles.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
              <span className="font-semibold text-slate-800">{Math.min(processedVehicles.length, currentPage * itemsPerPage)}</span> of{" "}
              <span className="font-semibold text-slate-800">{processedVehicles.length}</span> vehicles
            </div>
            
            {/* Bulk actions check */}
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                <span className="text-[11px] font-bold text-blue-700">{selectedIds.length} Selected</span>
                <button
                  onClick={() => { alert(`Bulk action simulation for IDs: ${selectedIds.join(", ")}`); setSelectedIds([]); }}
                  className="text-[10px] bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                >
                  Bulk Retire
                </button>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1 rounded border border-[#E2E8F0] hover:bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                    currentPage === i + 1
                      ? "bg-[#2563EB] border-[#2563EB] text-white"
                      : "bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1 rounded border border-[#E2E8F0] hover:bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD VEHICLE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Register New Fleet Vehicle</h3>
            <p className="text-xs text-slate-400 mb-6">Input administrative, technical specifications, and initial region assignments.</p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold leading-relaxed">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-xs font-semibold leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-PQ-4567"
                    value={newRegNumber}
                    onChange={(e) => setNewRegNumber(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Indian Standard Format: XX-99-XX-9999</span>
                </div>
                
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Signa 4825.TK"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full"
                  >
                    <option value="Container Truck">Container Truck</option>
                    <option value="Heavy Tipper">Heavy Tipper</option>
                    <option value="Dumper">Dumper</option>
                    <option value="Flatbed Trailer">Flatbed Trailer</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Tanker">Tanker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 85000"
                    value={newOdometer}
                    onChange={(e) => setNewOdometer(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Acquisition Cost (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3500000"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Region Hub</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full"
                  >
                    <option value="North (Delhi)">North (Delhi)</option>
                    <option value="South (Bengaluru)">South (Bengaluru)</option>
                    <option value="South (Chennai)">South (Chennai)</option>
                    <option value="West (Mumbai)">West (Mumbai)</option>
                    <option value="West (Ahmedabad)">West (Ahmedabad)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full"
                  >
                    <option value="Available">Available</option>
                    <option value="In Shop">In Shop</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VEHICLE DETAILS DRAWER (Side sheet) */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedVehicle(null)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedVehicle.name}</h4>
                  <span className="text-xs text-slate-500 font-mono">{selectedVehicle.regNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {/* Status Banner */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-3.5 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedVehicle.status}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.75 rounded-full ${getStatusBadgeStyles(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
              </div>

              {/* Specifications Card */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-400" /> Specifications
                </h5>
                <div className="grid grid-cols-2 gap-3 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Maximum Load Capacity</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      {formatWeight(selectedVehicle.capacity)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Odometer Reading</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      {formatDistance(selectedVehicle.odometer)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-semibold block mb-0.5">Acquisition Cost</span>
                    <span className="font-bold text-slate-900">{formatINR(selectedVehicle.acquisitionCost)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 font-semibold block mb-0.5">Region Hub</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedVehicle.region}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-slate-400" /> Maintenance History
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {vehicleStats?.maintenanceHistory.map((m) => (
                    <div key={m.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{m.serviceType} Service</p>
                        <p className="text-[10px] text-slate-400">Date: {m.startDate} | Provider: {m.serviceProvider}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-950 block">{formatINR(m.cost)}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          m.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {vehicleStats?.maintenanceHistory.length === 0 && (
                    <p className="text-slate-400 text-xs italic">No maintenance history available.</p>
                  )}
                </div>
              </div>

              {/* Fuel logs and efficiency */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-slate-400" /> Fuel History & Efficiency
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {vehicleStats?.fuelHistory.map((f) => (
                    <div key={f.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{f.liters} Liters fill-up</p>
                        <p className="text-[10px] text-slate-400">Date: {f.date} | Odometer: {formatDistance(f.odometer)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-950 block">{formatINR(f.totalCost)}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">{f.fuelEfficiency} km/L</span>
                      </div>
                    </div>
                  ))}
                  {vehicleStats?.fuelHistory.length === 0 && (
                    <p className="text-slate-400 text-xs italic">No fuel log logs found.</p>
                  )}
                </div>
              </div>

              {/* ROI and Financial Stats */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-slate-400" /> Operational Performance Statistics
                </h5>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Total Maintenance</span>
                    <span className="font-bold text-slate-900 text-xs">{formatINR(vehicleStats?.totalMaintCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Total Fuel Cost</span>
                    <span className="font-bold text-slate-900 text-xs">{formatINR(vehicleStats?.totalFuelCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Active Odometer</span>
                    <span className="font-bold text-slate-900 text-xs">{formatDistance(selectedVehicle.odometer)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
