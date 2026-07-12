import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { canEdit } from "../components/permissions";
import { getStatusBadgeStyles, formatDate } from "../utils/helpers";
import {
  Search,
  Plus,
  FileDown,
  ChevronRight,
  X,
  Shield,
  Phone,
  Calendar,
  AlertTriangle,
  Award,
  CircleDot,
  CheckCircle,
  Clock,
  Ban,
  RotateCcw
} from "lucide-react";

export const Drivers = () => {
  const { drivers, addDriver, updateDriverStatus, trips, currentUser } = useData();

  const isEditable = canEdit(currentUser?.role, "drivers");

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [validityFilter, setValidityFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Drawer / Modals State
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Driver Form State
  const [newName, setNewName] = useState("");
  const [newLicenseNum, setNewLicenseNum] = useState("");
  const [newCategory, setNewCategory] = useState("Heavy Motor Vehicle (HMV)");
  const [newExpiry, setNewExpiry] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const today = useMemo(() => new Date("2026-07-12"), []);

  // Summary statistics
  const stats = useMemo(() => {
    let expiringSoonCount = 0;
    const safeDrivers = drivers || [];
    safeDrivers.forEach(d => {
      if (!d || !d.licenseExpiry) return;
      const expiry = new Date(d.licenseExpiry);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 30) {
        expiringSoonCount++;
      }
    });

    return {
      total: safeDrivers.filter(Boolean).length,
      available: safeDrivers.filter(d => d && d.status === "Available").length,
      onTrip: safeDrivers.filter(d => d && d.status === "On Trip").length,
      offDuty: safeDrivers.filter(d => d && d.status === "Off Duty").length,
      suspended: safeDrivers.filter(d => d && d.status === "Suspended").length,
      expiringSoon: expiringSoonCount
    };
  }, [drivers, today]);

  // Handle Search & Filter logic
  const processedDrivers = useMemo(() => {
    let result = (drivers || []).filter(Boolean);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        d =>
          (d.name && d.name.toLowerCase().includes(q)) ||
          (d.licenseNumber && d.licenseNumber.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(d => d.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "All") {
      result = result.filter(d => d.licenseCategory === categoryFilter);
    }

    // Validity filter (Expired, Expiring Soon, Valid)
    if (validityFilter !== "All") {
      result = result.filter(d => {
        if (!d.licenseExpiry) return false;
        const expiry = new Date(d.licenseExpiry);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (validityFilter === "Expired") {
          return diffDays < 0;
        } else if (validityFilter === "Expiring Soon") {
          return diffDays >= 0 && diffDays <= 30;
        } else if (validityFilter === "Valid") {
          return diffDays > 30;
        }
        return true;
      });
    }

    // Safety Score Filter
    if (scoreFilter !== "All") {
      result = result.filter(d => {
        const score = d.safetyScore || 0;
        if (scoreFilter === "Excellent (90+)") return score >= 90;
        if (scoreFilter === "Good (80-89)") return score >= 80 && score < 90;
        if (scoreFilter === "Fair (70-79)") return score >= 70 && score < 80;
        if (scoreFilter === "Critical (<70)") return score < 70;
        return true;
      });
    }

    return result;
  }, [drivers, search, statusFilter, categoryFilter, validityFilter, scoreFilter, today]);

  // Paginated Drivers
  const paginatedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedDrivers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedDrivers, currentPage]);

  const totalPages = Math.ceil(processedDrivers.length / itemsPerPage);

  // License Expiry styling helpers
  const getLicenseValidityDetails = (expiryDateStr) => {
    const expiry = new Date(expiryDateStr);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Expired",
        style: "bg-red-50 text-red-600 border border-red-100",
        message: `Expired on ${expiryDateStr}`
      };
    } else if (diffDays <= 30) {
      return {
        label: "Expiring Soon",
        style: "bg-amber-50 text-amber-600 border border-amber-100",
        message: `Expires in ${diffDays} days`
      };
    } else {
      return {
        label: "Valid",
        style: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        message: `Valid until ${expiryDateStr}`
      };
    }
  };

  // Safety Score progress bar colors
  const getSafetyScoreColor = (score) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  // Add Driver submit
  const handleAddDriverSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newName || !newLicenseNum || !newExpiry || !newContact) {
      setFormError("Please fill out all required fields.");
      return;
    }

    // License standard validation
    const dlRegex = /^[A-Z]{2}-\d{13}$/i;
    const basicDlRegex = /^[A-Z0-9-]{8,16}$/i; // Acceptable fallback
    if (!basicDlRegex.test(newLicenseNum)) {
      setFormError("License format is invalid. Ensure it contains correct state prefix.");
      return;
    }

    try {
      addDriver({
        name: newName,
        licenseNumber: newLicenseNum.toUpperCase(),
        licenseCategory: newCategory,
        licenseExpiry: newExpiry,
        contact: newContact,
        avatar: newAvatar || null
      });

      setFormSuccess("Driver profile registered successfully!");
      setNewName("");
      setNewLicenseNum("");
      setNewExpiry("");
      setNewContact("");
      setNewAvatar("");

      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess("");
      }, 1000);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleStatusToggle = (driverId, newStatus) => {
    try {
      updateDriverStatus(driverId, newStatus);
      // Update drawer if opened
      if (selectedDriver && selectedDriver.id === driverId) {
        setSelectedDriver(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Driver Trip log statistics
  const driverTripsCount = useMemo(() => {
    if (!selectedDriver) return 0;
    return trips.filter(t => t.driverId === selectedDriver.id).length;
  }, [selectedDriver, trips]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Driver Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage transport operators registry, license verification, safety metrics, and availability logs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Downloading driver compliance records CSV...")}
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
              <span>Add Driver</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Operators</p>
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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Off Duty</p>
          <p className="text-2xl font-bold text-slate-500">{stats.offDuty}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
        </div>
        <div className="bg-[#FEF3C7] border border-amber-200 p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Expiry &lt; 30d</p>
          <p className="text-2xl font-bold text-amber-700">{stats.expiringSoon}</p>
        </div>
      </div>

      {/* Toolbar Search & Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by driver name or license key..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9"
          />
        </div>

        {/* Dropdowns Filters */}
        <div className="flex flex-wrap gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">All Categories</option>
            <option value="Heavy Motor Vehicle (HMV)">Heavy Motor Vehicle (HMV)</option>
            <option value="Medium Cargo Carriage">Medium Cargo Carriage</option>
            <option value="Light Motor Vehicle (LMV)">Light Motor Vehicle (LMV)</option>
          </select>

          <select
            value={validityFilter}
            onChange={(e) => { setValidityFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">License Validity</option>
            <option value="Valid">Valid (&gt; 30 days)</option>
            <option value="Expiring Soon">Expiring Soon (&lt; 30 days)</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => { setScoreFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-1.5 bg-slate-50"
          >
            <option value="All">Safety Score</option>
            <option value="Excellent (90+)">Excellent (90+)</option>
            <option value="Good (80-89)">Good (80-89)</option>
            <option value="Fair (70-79)">Fair (70-79)</option>
            <option value="Critical (<70)">Critical (&lt; 70)</option>
          </select>

          {(search || statusFilter !== "All" || categoryFilter !== "All" || validityFilter !== "All" || scoreFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setCategoryFilter("All");
                setValidityFilter("All");
                setScoreFilter("All");
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

      {/* Drivers Data Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="py-3 px-4">Operator Profile</th>
                <th className="py-3 px-3">License Number</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">License Expiry</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-center">Completed Trips</th>
                <th className="py-3 px-3">Safety Score</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedDrivers.map((driver) => {
                const licenseDetails = getLicenseValidityDetails(driver.licenseExpiry);
                const isExpired = licenseDetails.label === "Expired";
                const isExpiringSoon = licenseDetails.label === "Expiring Soon";

                return (
                  <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={driver.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                          alt={driver.name}
                          className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{driver.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {driver.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900">{driver.licenseNumber}</td>
                    <td className="py-3 px-3 text-slate-500">{driver.licenseCategory}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex flex-col px-2 py-0.5 rounded text-[10px] font-semibold ${licenseDetails.style}`}>
                        <span>{formatDate(driver.licenseExpiry)}</span>
                        <span className="text-[8px] font-bold uppercase mt-0.5 opacity-90">{licenseDetails.message}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{driver.contact}</td>
                    <td className="py-3 px-3 text-center text-slate-900 font-bold">{driver.completedTrips}</td>
                    <td className="py-3 px-3 w-32">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getSafetyScoreColor(driver.safetyScore)}`}
                            style={{ width: `${driver.safetyScore || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 w-5 text-right">{driver.safetyScore || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeStyles(driver.status)}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedDriver(driver)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/60 p-1.5 rounded transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {processedDrivers.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-slate-500 font-semibold bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="w-10 h-10 text-slate-400 mb-2" />
                      <p className="text-sm">No drivers found matching current search queries or filters.</p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
                          setCategoryFilter("All");
                          setValidityFilter("All");
                          setScoreFilter("All");
                          setCurrentPage(1);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold underline mt-2"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {processedDrivers.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="text-slate-500 text-xs">
              Showing <span className="font-semibold text-slate-800">{Math.min(processedDrivers.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
              <span className="font-semibold text-slate-800">{Math.min(processedDrivers.length, currentPage * itemsPerPage)}</span> of{" "}
              <span className="font-semibold text-slate-800">{processedDrivers.length}</span> operators
            </div>
            
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

      {/* REGISTER NEW DRIVER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Register New Driver Profile</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Verify driver heavy license documentation, validity, and contact details beforehand.</p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddDriverSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Nair"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-1420180029345"
                    value={newLicenseNum}
                    onChange={(e) => setNewLicenseNum(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Format: ST-13DigitNumber</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">License Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full"
                  >
                    <option value="Heavy Motor Vehicle (HMV)">Heavy Motor Vehicle (HMV)</option>
                    <option value="Medium Cargo Carriage">Medium Cargo Carriage</option>
                    <option value="Light Motor Vehicle (LMV)">Light Motor Vehicle (LMV)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (or leave blank for placeholder)"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="w-full"
                />
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
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER PROFILE DETAILS DRAWER */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDriver(null)}
          />

          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedDriver.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt={selectedDriver.name}
                  className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedDriver.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">Driver ID: {selectedDriver.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {/* Business Rule Warning Alert */}
              {selectedDriver.status === "Suspended" && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-2.5">
                  <Ban className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-900">Driver Account Suspended</h5>
                    <p className="text-[11px] mt-0.5 leading-relaxed">This driver is suspended from trip assignments due to safety compliance alerts. Dispatch action is blocked.</p>
                  </div>
                </div>
              )}

              {new Date(selectedDriver.licenseExpiry) < today && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-900">Expired Operator License</h5>
                    <p className="text-[11px] mt-0.5 leading-relaxed">Driver's heavy commercial vehicle license expired on {selectedDriver.licenseExpiry}. Dispatch operations are automatically blocked by the compliance check.</p>
                  </div>
                </div>
              )}

              {/* General details and status toggle */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Availability Status</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDriver.status}</p>
                </div>
                
                {/* Allow status changes manually if they are not active on a trip */}
                {selectedDriver.status !== "On Trip" && isEditable ? (
                  <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                    {["Available", "Off Duty", "Suspended"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusToggle(selectedDriver.id, st)}
                        className={`px-2.5 py-1.5 text-[10px] font-semibold border-r last:border-r-0 border-slate-200 hover:bg-slate-50 transition-colors ${
                          selectedDriver.status === st ? "bg-[#EFF6FF] text-[#2563EB] font-bold" : "text-slate-600"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className={`text-[10px] font-bold px-2.5 py-0.75 rounded-full ${getStatusBadgeStyles(selectedDriver.status)}`}>
                    {selectedDriver.status}
                  </span>
                )}
              </div>

              {/* License Information */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-400" /> Compliance & Licensing
                </h5>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-2.5">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">License Number</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{selectedDriver.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Category Type</span>
                    <span className="font-bold text-slate-900">{selectedDriver.licenseCategory}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">License Expiration</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getLicenseValidityDetails(selectedDriver.licenseExpiry).style}`}>
                      {formatDate(selectedDriver.licenseExpiry)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" /> Contact Details
                </h5>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Phone Contact</span>
                    <span className="font-bold text-slate-900">{selectedDriver.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Assigned Email</span>
                    <span className="font-bold text-slate-900">{selectedDriver.name.toLowerCase().replace(" ", ".")}@transitops.in</span>
                  </div>
                </div>
              </div>

              {/* Safety Score Metric */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-400" /> Safety & Operator Scoring
                </h5>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-xs space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Safety Score Rating</span>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      <Award className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500/20" />
                      {selectedDriver.safetyScore || 0} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getSafetyScoreColor(selectedDriver.safetyScore)}`}
                      style={{ width: `${selectedDriver.safetyScore || 0}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Completed Trips</span>
                      <span className="font-bold text-slate-900 text-base">{selectedDriver.completedTrips}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Total Logged (Local)</span>
                      <span className="font-bold text-slate-900 text-base">{driverTripsCount} Trips</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incident History Timeline */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> Incident & Compliance Logs
                </h5>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    <div>
                      <p className="font-bold text-slate-900">Safety Check Passed (Vite Route Audit)</p>
                      <p className="text-[10px] text-slate-400">10 Jul 2026</p>
                    </div>
                  </div>
                  {selectedDriver.safetyScore < 70 && (
                    <div className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                      <div>
                        <p className="font-bold text-red-900">Speeding Event Detected (Over 90km/h)</p>
                        <p className="text-[10px] text-red-400 font-semibold">05 Jun 2026 | Route Jaipur ➔ Delhi</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                    <div>
                      <p className="font-bold text-slate-700">Driver onboarding verification completed.</p>
                      <p className="text-[10px] text-slate-400">12 Jan 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
