import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { canEdit } from "../components/permissions";
import { formatINR, formatDistance, formatWeight, getStatusBadgeStyles, formatDate } from "../utils/helpers";
import {
  Route,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Info,
  Clock,
  X,
  Gauge,
  Fuel,
  TrendingUp,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const Trips = () => {
  const {
    trips,
    vehicles,
    drivers,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    currentUser
  } = useData();

  const isEditable = canEdit(currentUser?.role, "trips");

  // Tab Filtering
  const [activeTab, setActiveTab] = useState("All");

  // Success Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Create Trip form Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [plannedDeparture, setPlannedDeparture] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [expectedRevenue, setExpectedRevenue] = useState("");
  const [tripNotes, setTripNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Complete Trip Modal state
  const [selectedTripForComplete, setSelectedTripForComplete] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState("");
  const [actualDistance, setActualDistance] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [actualArrivalDate, setActualArrivalDate] = useState("");
  const [actualArrivalTime, setActualArrivalTime] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionRevenue, setCompletionRevenue] = useState("");
  const [additionalExpenses, setAdditionalExpenses] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Toll");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [completeError, setCompleteError] = useState("");

  // Cancel Trip Modal state
  const [selectedTripForCancel, setSelectedTripForCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Trigger Toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Get available vehicles for new trip
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === "Available");
  }, [vehicles]);

  // Get eligible drivers (not on trip, not suspended, license not expired, not off duty)
  const eligibleDrivers = useMemo(() => {
    const today = new Date("2026-07-12");
    return drivers.filter(d => {
      const isAvailable = d.status === "Available";
      const isSuspended = d.status === "Suspended";
      const isOffDuty = d.status === "Off Duty";
      const isLicenseValid = new Date(d.licenseExpiry) >= today;
      return isAvailable && !isSuspended && !isOffDuty && isLicenseValid;
    });
  }, [drivers]);

  // Selected vehicle details for validation
  const selectedVehicleObj = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId);
  }, [selectedVehicleId, vehicles]);

  // Cargo validation
  const cargoValidation = useMemo(() => {
    if (!selectedVehicleObj || !cargoWeight) return null;
    const weight = Number(cargoWeight);
    const capacity = selectedVehicleObj.capacity;
    if (weight > capacity) {
      return {
        valid: false,
        diff: weight - capacity,
        message: `Cargo exceeds this vehicle's maximum capacity by ${weight - capacity} kg.`
      };
    }
    return { valid: true };
  }, [selectedVehicleObj, cargoWeight]);

  // Handle Create Trip Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !source ||
      !destination ||
      !selectedVehicleId ||
      !selectedDriverId ||
      !cargoWeight ||
      !plannedDistance ||
      !plannedDeparture ||
      !estimatedArrival ||
      !expectedRevenue
    ) {
      setFormError("Please fill out all required fields.");
      return;
    }

    if (cargoValidation && !cargoValidation.valid) {
      setFormError(cargoValidation.message);
      return;
    }

    try {
      createTrip({
        source,
        destination,
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        cargoWeight,
        distance: plannedDistance,
        departure: plannedDeparture,
        estimatedArrival,
        revenue: expectedRevenue,
        notes: tripNotes,
        status: "Draft" // Default to Draft first
      });

      triggerToast("Trip created successfully in Draft state.");
      setIsCreateOpen(false);
      // Reset form
      setSource("");
      setDestination("");
      setSelectedVehicleId("");
      setSelectedDriverId("");
      setCargoWeight("");
      setPlannedDistance("");
      setPlannedDeparture("");
      setEstimatedArrival("");
      setExpectedRevenue("");
      setTripNotes("");
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Handle Dispatch Trip
  const handleDispatch = (tripId) => {
    try {
      dispatchTrip(tripId);
      triggerToast("Trip dispatched. The selected vehicle and driver are now marked as On Trip.");
    } catch (err) {
      alert(err.message);
    }
  };

  // Pre-fill completion modal
  const openCompleteModal = (trip) => {
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    setSelectedTripForComplete(trip);
    setFinalOdometer(vehicle ? vehicle.odometer + trip.distance : "");
    setActualDistance(trip.distance);
    setFuelConsumed(Math.round(trip.distance / 3.5)); // mock assumption
    setFuelCost(Math.round((trip.distance / 3.5) * 95)); // mock assumption (95/l)
    setActualArrivalDate(new Date().toISOString().split("T")[0]);
    setActualArrivalTime("17:00");
    setCompletionRevenue(trip.revenue);
    setAdditionalExpenses("0");
    setExpenseCategory("Toll");
    setExpenseDescription("");
    setCompleteError("");
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    setCompleteError("");

    if (!finalOdometer || !actualDistance || !fuelConsumed || !fuelCost || !actualArrivalDate || !actualArrivalTime || !completionRevenue) {
      setCompleteError("Please fill out all required fields.");
      return;
    }

    const tripVehicle = vehicles.find(v => v.id === selectedTripForComplete.vehicleId);
    if (Number(finalOdometer) <= tripVehicle.odometer) {
      setCompleteError(`Final odometer must be higher than starting odometer (${formatDistance(tripVehicle.odometer)}).`);
      return;
    }

    try {
      completeTrip(selectedTripForComplete.id, {
        finalOdometer,
        actualDistance,
        fuelConsumed,
        fuelCost,
        actualArrivalDate,
        actualArrivalTime,
        tripRevenue: completionRevenue,
        additionalExpenses,
        expenseCategory,
        expenseDescription,
        completionNotes
      });

      triggerToast(`Trip ${selectedTripForComplete.id} completed. Vehicle and driver marked as Available.`);
      setSelectedTripForComplete(null);
    } catch (err) {
      setCompleteError(err.message);
    }
  };

  // Cancel Submit
  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!cancellationReason) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    try {
      cancelTrip(selectedTripForCancel.id, cancellationReason);
      triggerToast(`Trip ${selectedTripForCancel.id} cancelled. Resources released to Available.`);
      setSelectedTripForCancel(null);
      setCancellationReason("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Processed trips
  const filteredTrips = useMemo(() => {
    if (activeTab === "All") return trips;
    return trips.filter(t => t.status === activeTab);
  }, [trips, activeTab]);

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#DCFCE7] border border-[#16A34A] text-[#16A34A] p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-bold leading-normal">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trip Dispatch Center</h1>
          <p className="text-xs text-slate-500 mt-1">Plan, dispatch, audit, and log operational cargo routes across India.</p>
        </div>
        {isEditable && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Trip</span>
          </button>
        )}
      </div>

      {/* Tab Selectors */}
      <div className="border-b border-[#E2E8F0] flex items-center justify-between">
        <div className="flex space-x-1.5 pb-px">
          {["All", "Draft", "Dispatched", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 px-3 text-xs font-bold transition-all relative border-b-2 ${
                activeTab === tab
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full border border-slate-200">
                {tab === "All" ? trips.length : trips.filter(t => t.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trips Registry Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Trip Details</th>
                <th className="py-3 px-3">Route Path</th>
                <th className="py-3 px-3">Assigned Vehicle</th>
                <th className="py-3 px-3">Assigned Operator</th>
                <th className="py-3 px-3">Cargo Details</th>
                <th className="py-3 px-3">Est. Distance</th>
                <th className="py-3 px-3">Schedule Dates</th>
                <th className="py-3 px-3 text-center">Status Stepper</th>
                <th className="py-3 px-4 text-center">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTrips.map((trip) => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);

                return (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-all align-middle">
                    {/* Trip ID & date */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900 text-sm">{trip.id}</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">ESTREV: {formatINR(trip.revenue)}</span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-4 px-3">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                        <span>{trip.route}</span>
                      </div>
                    </td>

                    {/* Vehicle details */}
                    <td className="py-4 px-3">
                      {vehicle ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{vehicle.regNumber}</span>
                          <span className="text-[10px] text-slate-400">{vehicle.name}</span>
                        </div>
                      ) : (
                        <span className="text-red-500 font-semibold">N/A</span>
                      )}
                    </td>

                    {/* Driver details */}
                    <td className="py-4 px-3">
                      {driver ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={driver.avatar}
                            alt={driver.name}
                            className="w-6.5 h-6.5 rounded-full object-cover bg-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{driver.name}</p>
                            <p className="text-[9px] text-slate-400">Score: {driver.safetyScore}/100</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-500 font-semibold">N/A</span>
                      )}
                    </td>

                    {/* Cargo */}
                    <td className="py-4 px-3 font-semibold text-slate-900">{formatWeight(trip.cargoWeight)}</td>

                    {/* Distance */}
                    <td className="py-4 px-3 font-semibold text-slate-900">{formatDistance(trip.distance)}</td>

                    {/* Dates */}
                    <td className="py-4 px-3 text-[10px] text-slate-500 space-y-0.5 font-semibold">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">DEP:</span>
                        <span>{trip.departure.replace("T", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">ARR:</span>
                        <span>{trip.estimatedArrival.replace("T", " ")}</span>
                      </div>
                    </td>

                    {/* Stepper Status representation */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${getStatusBadgeStyles(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>
                        {/* Inline progress stepper indicator */}
                        {trip.status !== "Cancelled" && (
                          <div className="flex items-center w-28 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${
                                trip.status === "Draft" ? "w-1/3 bg-slate-400" :
                                trip.status === "Dispatched" ? "w-2/3 bg-blue-500" : "w-full bg-emerald-500"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {trip.status === "Draft" && isEditable && (
                          <button
                            onClick={() => handleDispatch(trip.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold p-1.5 rounded-lg border border-blue-100 flex items-center gap-1 transition-colors"
                            title="Dispatch Trip"
                          >
                            <Play className="w-3.5 h-3.5 fill-blue-600/10" />
                            <span className="text-[10px]">Dispatch</span>
                          </button>
                        )}

                        {trip.status === "Dispatched" && isEditable && (
                          <button
                            onClick={() => openCompleteModal(trip)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold p-1.5 rounded-lg border border-emerald-100 flex items-center gap-1 transition-colors"
                            title="Log Arrival Completion"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px]">Complete</span>
                          </button>
                        )}

                        {trip.status === "Dispatched" && isEditable && (
                          <button
                            onClick={() => setSelectedTripForCancel(trip)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-1.5 rounded-lg border border-red-100 flex items-center gap-1 transition-colors"
                            title="Cancel Dispatched Trip"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-[10px]">Cancel</span>
                          </button>
                        )}

                        {trip.status === "Completed" && (
                          <span className="text-slate-400 text-[10px] font-semibold">Closed operational log</span>
                        )}

                        {trip.status === "Cancelled" && (
                          <span className="text-red-400 text-[10px] font-semibold" title={trip.notes}>Cancelled terminal state</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400 font-semibold bg-slate-50/20">
                    No trips logged under the "{activeTab}" filter category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW TRIP MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Cargo Shipment Trip</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Select eligible resources and confirm cargo requirements.</p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold leading-relaxed">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Source Location (City)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination Location (City)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Available Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full"
                    required
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.regNumber} ({v.name}) - Cap: {v.capacity} kg
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Only available vehicles are listed.</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Eligible Operator</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full"
                    required
                  >
                    <option value="">-- Choose Operator --</option>
                    {eligibleDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} - Score: {d.safetyScore}/100
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Only available drivers with valid licenses.</span>
                </div>
              </div>

              {/* REAL-TIME CARGO VALIDATION */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 8000"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full"
                  />
                  
                  {cargoValidation && !cargoValidation.valid && (
                    <div className="mt-1.5 p-2 bg-red-50 border border-red-200 rounded text-red-600 font-semibold text-[10px] leading-relaxed flex items-start gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{cargoValidation.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Distance (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Planned Departure Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={plannedDeparture}
                    onChange={(e) => setPlannedDeparture(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Arrival Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expected Revenue (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  value={expectedRevenue}
                  onChange={(e) => setExpectedRevenue(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shipment Notes</label>
                <textarea
                  placeholder="e.g. fragile goods container, fragile transit directions, route details..."
                  rows="2"
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cargoValidation && !cargoValidation.valid}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Draft Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {selectedTripForComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTripForComplete(null)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Shipment Trip Log: {selectedTripForComplete.id}</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Record final operational details including distance, fuel, and trip costs.</p>

            {completeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold leading-relaxed">
                {completeError}
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Final Odometer Reading (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 142320"
                    value={finalOdometer}
                    onChange={(e) => setFinalOdometer(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Starting Odometer: {formatDistance(vehicles.find(v => v.id === selectedTripForComplete.vehicleId)?.odometer)}</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Actual Distance Travelled (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 270"
                    value={actualDistance}
                    onChange={(e) => setActualDistance(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 80"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fuel Cost (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7600"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={actualArrivalDate}
                    onChange={(e) => setActualArrivalDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Arrival Time</label>
                  <input
                    type="time"
                    required
                    value={actualArrivalTime}
                    onChange={(e) => setActualArrivalTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Trip Revenue (INR)</label>
                  <input
                    type="number"
                    required
                    value={completionRevenue}
                    onChange={(e) => setCompletionRevenue(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Additional Expenses (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={additionalExpenses}
                    onChange={(e) => setAdditionalExpenses(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {Number(additionalExpenses) > 0 && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full bg-white"
                    >
                      <option value="Toll">Toll</option>
                      <option value="Parking">Parking</option>
                      <option value="Permit">Permit</option>
                      <option value="Repair">Repair</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Expense Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Expressway Toll tax"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="w-full bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Trip Completion / Audit Notes</label>
                <textarea
                  placeholder="e.g. delivered safely, check fuel efficiency details, slight delay due to fog..."
                  rows="2"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full border rounded-lg p-2 bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedTripForComplete(null)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#16A34A] hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Complete Trip Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL TRIP CONFIRMATION MODAL */}
      {selectedTripForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTripForCancel(null)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Confirm Trip Cancellation
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-medium">Are you sure you want to cancel dispatch trip {selectedTripForCancel.id}? Resources will be immediately returned to Available.</p>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Cancellation</label>
                <select
                  required
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full mb-2"
                >
                  <option value="">-- Choose Reason --</option>
                  <option value="Customer request cancelled">Customer request cancelled</option>
                  <option value="Vehicle breakdown pre-dispatch">Vehicle breakdown pre-dispatch</option>
                  <option value="Operator sick/unavailable">Operator sick/unavailable</option>
                  <option value="Weather alerts along route">Weather alerts along route</option>
                  <option value="Cargo load delay">Cargo load delay</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedTripForCancel(null)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="bg-[#DC2626] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel Shipment Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
