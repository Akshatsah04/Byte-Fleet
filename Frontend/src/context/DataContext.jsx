import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialVehicles,
  initialDrivers,
  initialTrips,
  initialMaintenance,
  initialFuelLogs,
  initialExpenses,
  initialUsers
} from "./mockData";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Robust parser wrappers to prevent corrupted/null localStorage crashes
  const loadArrayState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved || saved === "undefined" || saved === "null") return fallback;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      console.error(`Error loading state for key ${key}:`, e);
      return fallback;
    }
  };

  const loadUserState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved || saved === "undefined" || saved === "null") return fallback;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (e) {
      console.error(`Error loading user state for key ${key}:`, e);
      return fallback;
    }
  };

  const [vehicles, setVehicles] = useState(() => loadArrayState("transitops_vehicles", initialVehicles));
  const [drivers, setDrivers] = useState(() => loadArrayState("transitops_drivers", initialDrivers));
  const [trips, setTrips] = useState(() => loadArrayState("transitops_trips", initialTrips));
  const [maintenance, setMaintenance] = useState(() => loadArrayState("transitops_maintenance", initialMaintenance));
  const [fuelLogs, setFuelLogs] = useState(() => loadArrayState("transitops_fuelLogs", initialFuelLogs));
  const [expenses, setExpenses] = useState(() => loadArrayState("transitops_expenses", initialExpenses));
  const [currentUser, setCurrentUser] = useState(() => loadUserState("transitops_currentUser", null));
  const [alerts, setAlerts] = useState([]);

  const API_BASE = "https://byte-fleet-backend.vercel.app/api";

  // Mappers
  const mapBackendVehicleToFrontend = (v) => ({
    id: v.id,
    name: v.name,
    regNumber: v.registrationNo,
    type: v.type,
    capacity: v.maxLoadCapacity,
    odometer: v.odometer,
    acquisitionCost: v.acquisitionCost,
    status: v.status === "AVAILABLE" ? "Available" :
            v.status === "ON_TRIP" ? "On Trip" :
            v.status === "IN_SHOP" ? "In Shop" :
            v.status === "RETIRED" ? "Retired" : "Available",
    lastService: v.lastService ? v.lastService.split("T")[0] : null
  });

  const mapFrontendVehicleToBackend = (v) => ({
    registrationNo: v.regNumber,
    name: v.name,
    type: v.type,
    maxLoadCapacity: Number(v.capacity),
    odometer: Number(v.odometer),
    acquisitionCost: Number(v.acquisitionCost),
    status: v.status === "Available" ? "AVAILABLE" :
            v.status === "On Trip" ? "ON_TRIP" :
            v.status === "In Shop" ? "IN_SHOP" :
            v.status === "Retired" ? "RETIRED" : "AVAILABLE",
    lastService: v.lastService ? new Date(v.lastService).toISOString() : null
  });

  const mapBackendDriverToFrontend = (d) => ({
    id: d.id,
    name: d.name,
    licenseNumber: d.licenseNumber,
    licenseCategory: d.licenseCategory,
    licenseExpiry: d.licenseExpiryDate ? d.licenseExpiryDate.split("T")[0] : null,
    contact: d.contactNumber,
    completedTrips: d.trips ? d.trips.filter(t => t.status === "COMPLETED").length : 0,
    safetyScore: d.safetyScore,
    status: d.status === "AVAILABLE" ? "Available" :
            d.status === "ON_TRIP" ? "On Trip" :
            d.status === "OFF_DUTY" ? "Off Duty" :
            d.status === "SUSPENDED" ? "Suspended" : "Available",
    avatar: d.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  });

  const mapFrontendDriverToBackend = (d) => ({
    name: d.name,
    licenseNumber: d.licenseNumber,
    licenseCategory: d.licenseCategory,
    licenseExpiryDate: new Date(d.licenseExpiry).toISOString(),
    contactNumber: d.contact,
    safetyScore: Number(d.safetyScore || 90),
    status: d.status === "Available" ? "AVAILABLE" :
            d.status === "On Trip" ? "ON_TRIP" :
            d.status === "Off Duty" ? "OFF_DUTY" :
            d.status === "Suspended" ? "SUSPENDED" : "AVAILABLE"
  });

  const mapBackendTripToFrontend = (t) => ({
    id: t.id,
    route: `${t.source} ➔ ${t.destination}`,
    vehicleId: t.vehicleId,
    driverId: t.driverId,
    cargoWeight: t.cargoWeight,
    distance: t.plannedDistance,
    departure: t.dispatchedAt ? t.dispatchedAt.split(".")[0] : null,
    estimatedArrival: t.estimatedArrival || null,
    actualArrival: t.completedAt ? t.completedAt.split(".")[0] : null,
    revenue: t.revenue || 0,
    cost: t.cost || 0,
    status: t.status === "DRAFT" ? "Draft" :
            t.status === "DISPATCHED" ? "Dispatched" :
            t.status === "COMPLETED" ? "Completed" :
            t.status === "CANCELLED" ? "Cancelled" : "Draft",
    notes: t.notes || ""
  });

  const mapBackendRoleToFrontend = (role) => {
    switch (role) {
      case "FLEET_MANAGER": return "Fleet Manager";
      case "DISPATCHER": return "Dispatcher";
      case "SAFETY_OFFICER": return "Safety Officer";
      case "FINANCIAL_ANALYST": return "Financial Analyst";
      default: return role;
    }
  };

  // Sync data from Backend API on mount (hybrid resilience)
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
          fetch(`${API_BASE}/vehicles`),
          fetch(`${API_BASE}/drivers`),
          fetch(`${API_BASE}/trips`)
        ]);

        if (vehiclesRes.ok) {
          const vData = await vehiclesRes.json();
          setVehicles(vData.map(mapBackendVehicleToFrontend));
        }
        if (driversRes.ok) {
          const dData = await driversRes.json();
          setDrivers(dData.map(mapBackendDriverToFrontend));
        }
        if (tripsRes.ok) {
          const tData = await tripsRes.json();
          setTrips(tData.map(mapBackendTripToFrontend));
        }
      } catch (err) {
        console.warn("Backend API offline. Running in standalone mock mode.", err);
      }
    };
    fetchBackendData();
  }, []);

  // Persist state changes locally as secondary cache
  useEffect(() => {
    localStorage.setItem("transitops_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem("transitops_drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem("transitops_trips", JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem("transitops_maintenance", JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem("transitops_fuelLogs", JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem("transitops_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("transitops_currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("transitops_currentUser");
    }
  }, [currentUser]);

  // Generate dynamic operational alerts
  useEffect(() => {
    const newAlerts = [];
    const today = new Date("2026-07-12"); // Fixed reference current date for mock logic

    // Check expiring driver licenses
    (drivers || []).forEach(driver => {
      if (!driver || !driver.licenseExpiry) return;
      const expiry = new Date(driver.licenseExpiry);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        newAlerts.push({
          id: `alert-lic-exp-${driver.id}`,
          type: "danger",
          title: `License Expired: ${driver.name}`,
          message: `The license (${driver.licenseNumber}) expired on ${driver.licenseExpiry}. Driver suspended from dispatch.`,
          actionable: true,
          link: "/drivers",
          category: "Compliance"
        });
      } else if (diffDays <= 30) {
        newAlerts.push({
          id: `alert-lic-warn-${driver.id}`,
          type: "warning",
          title: `License Expiring Soon: ${driver.name}`,
          message: `Driver's license expires in ${diffDays} days (${driver.licenseExpiry}).`,
          actionable: true,
          link: "/drivers",
          category: "Compliance"
        });
      }
    });

    // Check overdue vehicle maintenance
    (vehicles || []).forEach(v => {
      if (!v || !v.lastService) return;
      if (v.status !== "In Shop" && v.status !== "Retired") {
        const lastServDate = new Date(v.lastService);
        const timeDiff = today - lastServDate;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff > 90) { // Maintenance cycle threshold of 90 days
          newAlerts.push({
            id: `alert-maint-overdue-${v.id}`,
            type: "warning",
            title: `Maintenance Overdue: ${v.regNumber}`,
            message: `Last service was ${daysDiff} days ago. Vehicle should be scheduled for preventive maintenance.`,
            actionable: true,
            link: "/maintenance",
            category: "Maintenance"
          });
        }
      }
    });

    // Check delayed trips
    (trips || []).forEach(t => {
      if (!t || !t.estimatedArrival) return;
      if (t.status === "Dispatched") {
        const estArrival = new Date(t.estimatedArrival);
        if (estArrival < today) {
          newAlerts.push({
            id: `alert-trip-delayed-${t.id}`,
            type: "danger",
            title: `Trip Delayed: ${t.id}`,
            message: `Trip ${t.id} (${t.route}) has exceeded its estimated arrival time of ${(t.estimatedArrival || "").replace("T", " ")}.`,
            actionable: true,
            link: "/trips",
            category: "Operations"
          });
        }
      }
    });

    // Check fuel efficiency drops
    (fuelLogs || []).forEach(f => {
      if (!f || f.fuelEfficiency === undefined) return;
      if (f.fuelEfficiency < 2.5) {
        const vehicle = (vehicles || []).find(v => v && v.id === f.vehicleId);
        newAlerts.push({
          id: `alert-fuel-drop-${f.id}`,
          type: "warning",
          title: `Low Fuel Efficiency: ${vehicle ? vehicle.regNumber : f.vehicleId}`,
          message: `Efficiency dropped to ${f.fuelEfficiency} km/l on ${f.date}. Inspect fuel injectors.`,
          actionable: true,
          link: "/analytics",
          category: "Efficiency"
        });
      }
    });

    setAlerts(newAlerts);
  }, [drivers, vehicles, trips, fuelLogs]);

  // Auth Operations
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      const mappedUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: mapBackendRoleToFrontend(data.user.role),
        status: "Active",
        lastActive: "Active now"
      };
      setCurrentUser(mappedUser);
      return mappedUser;
    } catch (err) {
      console.warn("Backend login failed, using local fallback...", err.message);
      const foundUser = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!foundUser) {
        throw new Error("Invalid credentials. Try our quick-access demo accounts or run the backend.");
      }
      setCurrentUser(foundUser);
      return foundUser;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const changeRoleForDemo = (roleName) => {
    const foundUser = initialUsers.find(u => u.role === roleName);
    if (foundUser) {
      setCurrentUser(foundUser);
    } else {
      setCurrentUser({
        id: `U-temp-${roleName.replace(" ", "")}`,
        name: `Demo ${roleName}`,
        email: `demo.${roleName.toLowerCase().replace(" ", "")}@transitops.in`,
        role: roleName,
        status: "Active",
        lastActive: "Active now"
      });
    }
  };

  // Vehicle Registry Operations
  const addVehicle = async (vehicle) => {
    const regExists = vehicles.some(v => v.regNumber.toUpperCase() === vehicle.regNumber.toUpperCase());
    if (regExists) {
      throw new Error(`Vehicle registration number ${vehicle.regNumber} already exists in the system.`);
    }

    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapFrontendVehicleToBackend(vehicle))
      });
      if (res.ok) {
        const newV = await res.json();
        const mapped = mapBackendVehicleToFrontend(newV);
        setVehicles(prev => [mapped, ...prev]);
        return mapped;
      }
    } catch (e) {
      console.warn("Backend addVehicle failed. Saving locally.", e);
    }

    const newVehicle = {
      ...vehicle,
      id: `V-${100 + vehicles.length + 1}`,
      odometer: Number(vehicle.odometer),
      capacity: Number(vehicle.capacity),
      acquisitionCost: Number(vehicle.acquisitionCost),
      status: vehicle.status || "Available",
      lastService: vehicle.lastService || new Date().toISOString().split("T")[0]
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  };

  // Driver Management Operations
  const addDriver = async (driver) => {
    try {
      const res = await fetch(`${API_BASE}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapFrontendDriverToBackend(driver))
      });
      if (res.ok) {
        const newD = await res.json();
        const mapped = mapBackendDriverToFrontend(newD);
        setDrivers(prev => [mapped, ...prev]);
        return mapped;
      }
    } catch (e) {
      console.warn("Backend addDriver failed. Saving locally.", e);
    }

    const newDriver = {
      ...driver,
      id: `D-${200 + drivers.length + 1}`,
      completedTrips: 0,
      safetyScore: 90,
      status: driver.status || "Available",
      avatar: driver.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    setDrivers(prev => [newDriver, ...prev]);
    return newDriver;
  };

  const updateDriverStatus = async (driverId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/drivers/${driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus === "Available" ? "AVAILABLE" :
                  newStatus === "On Trip" ? "ON_TRIP" :
                  newStatus === "Off Duty" ? "OFF_DUTY" :
                  newStatus === "Suspended" ? "SUSPENDED" : "AVAILABLE"
        })
      });
      if (res.ok) {
        const updatedD = await res.json();
        const mapped = mapBackendDriverToFrontend(updatedD);
        setDrivers(prev => prev.map(d => d.id === driverId ? mapped : d));
        return;
      }
    } catch (e) {
      console.warn("Backend updateDriverStatus failed.", e);
    }
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: newStatus } : d));
  };

  // Trip Management Operations
  const createTrip = async (tripData) => {
    const vehicle = vehicles.find(v => v.id === tripData.vehicleId);
    if (!vehicle) throw new Error("Selected vehicle not found.");
    if (Number(tripData.cargoWeight) > vehicle.capacity) {
      const diff = Number(tripData.cargoWeight) - vehicle.capacity;
      throw new Error(`Cargo exceeds this vehicle's maximum capacity by ${diff} kg.`);
    }

    const driver = drivers.find(d => d.id === tripData.driverId);
    if (!driver) throw new Error("Selected driver not found.");

    const routeParts = `${tripData.source} ➔ ${tripData.destination}`.split(" ➔ ");
    const payload = {
      source: routeParts[0] || "Unknown",
      destination: routeParts[1] || "Unknown",
      cargoWeight: Number(tripData.cargoWeight),
      plannedDistance: Number(tripData.distance),
      status: tripData.status === "Dispatched" ? "DISPATCHED" : "DRAFT",
      revenue: Number(tripData.revenue),
      cost: 0,
      notes: tripData.notes || "",
      vehicleId: tripData.vehicleId,
      driverId: tripData.driverId
    };

    try {
      const res = await fetch(`${API_BASE}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newTrip = await res.json();
        const mapped = mapBackendTripToFrontend(newTrip);

        if (mapped.status === "Dispatched") {
          setVehicles(prev => prev.map(v => v.id === tripData.vehicleId ? { ...v, status: "On Trip" } : v));
          setDrivers(prev => prev.map(d => d.id === tripData.driverId ? { ...d, status: "On Trip" } : d));
        }

        setTrips(prev => [mapped, ...prev]);
        return mapped;
      }
    } catch (e) {
      console.warn("Backend createTrip failed. Saving locally.", e);
    }

    const newTrip = {
      id: `T-${800 + trips.length + 1}`,
      route: `${tripData.source} ➔ ${tripData.destination}`,
      vehicleId: tripData.vehicleId,
      driverId: tripData.driverId,
      cargoWeight: Number(tripData.cargoWeight),
      distance: Number(tripData.distance),
      departure: tripData.departure,
      estimatedArrival: tripData.estimatedArrival,
      actualArrival: null,
      revenue: Number(tripData.revenue),
      cost: 0,
      status: tripData.status || "Draft",
      notes: tripData.notes || ""
    };

    if (newTrip.status === "Dispatched") {
      setVehicles(prev => prev.map(v => v.id === tripData.vehicleId ? { ...v, status: "On Trip" } : v));
      setDrivers(prev => prev.map(d => d.id === tripData.driverId ? { ...d, status: "On Trip" } : d));
    }

    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  };

  const dispatchTrip = async (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trip not found");

    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DISPATCHED",
          dispatchedAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        // Update vehicles and drivers statuses to ON_TRIP
        await fetch(`${API_BASE}/vehicles/${trip.vehicleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ON_TRIP" })
        }).catch(e => console.warn(e));

        await fetch(`${API_BASE}/drivers/${trip.driverId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ON_TRIP" })
        }).catch(e => console.warn(e));

        setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: "Dispatched", departure: new Date().toISOString().split(".")[0] } : t));
        setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: "On Trip" } : v));
        setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: "On Trip" } : d));
        return;
      }
    } catch (e) {
      console.warn("Backend dispatchTrip failed. Updating locally.", e);
    }

    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: "Dispatched", departure: new Date().toISOString().split(".")[0] } : t));
    setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: "On Trip" } : v));
    setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: "On Trip" } : d));
  };

  const completeTrip = (tripId, completionData) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trip not found.");

    const actualDist = Number(completionData.actualDistance);
    const fuelCons = Number(completionData.fuelConsumed);
    const fuelVal = Number(completionData.fuelCost);
    const finalOdo = Number(completionData.finalOdometer);
    const tripRev = Number(completionData.tripRevenue);
    const addExpVal = Number(completionData.additionalExpenses || 0);

    // Calculate fuel efficiency: distance / fuel consumed
    const efficiency = fuelCons > 0 ? parseFloat((actualDist / fuelCons).toFixed(2)) : 0;

    // Create fuel log
    const fuelLogEntry = {
      id: `F-${600 + fuelLogs.length + 1}`,
      vehicleId: trip.vehicleId,
      date: completionData.actualArrivalDate || new Date().toISOString().split("T")[0],
      liters: fuelCons,
      totalCost: fuelVal,
      odometer: finalOdo,
      distanceTravelled: actualDist,
      fuelEfficiency: efficiency
    };

    // Create additional expense log (if present)
    let newExpenseEntries = [];
    if (addExpVal > 0) {
      const expenseEntry = {
        id: `E-${700 + expenses.length + 1}`,
        vehicleId: trip.vehicleId,
        tripId: tripId,
        category: completionData.expenseCategory || "Toll",
        amount: addExpVal,
        date: completionData.actualArrivalDate || new Date().toISOString().split("T")[0],
        description: completionData.expenseDescription || "Trip expenses logged at completion.",
        receipt: "receipt_completed_trip.jpg"
      };
      newExpenseEntries.push(expenseEntry);
      setExpenses(prev => [expenseEntry, ...prev]);
    }

    // Update trip details
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: "Completed",
          actualArrival: `${completionData.actualArrivalDate}T${completionData.actualArrivalTime}`,
          revenue: tripRev,
          cost: fuelVal + addExpVal,
          notes: `${t.notes}\nCompletion Notes: ${completionData.completionNotes || ""}`
        };
      }
      return t;
    }));

    // Release Vehicle & update Odometer
    setVehicles(prev => prev.map(v => {
      if (v.id === trip.vehicleId) {
        return {
          ...v,
          status: "Available",
          odometer: finalOdo
        };
      }
      return v;
    }));

    // Release Driver & increment completed trips
    setDrivers(prev => prev.map(d => {
      if (d.id === trip.driverId) {
        return {
          ...d,
          status: "Available",
          completedTrips: d.completedTrips + 1
        };
      }
      return d;
    }));

    // Append fuel log
    setFuelLogs(prev => [fuelLogEntry, ...prev]);
  };

  const cancelTrip = (tripId, reason) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trip not found");

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: "Cancelled",
          notes: `${t.notes}\nCancellation Reason: ${reason}`
        };
      }
      return t;
    }));

    // Restore vehicle and driver to Available (only if they were on this trip)
    setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: "Available" } : v));
    setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: "Available" } : d));
  };

  // Maintenance Operations
  const scheduleMaintenance = (maintData) => {
    const newMaint = {
      id: `M-${500 + maintenance.length + 1}`,
      vehicleId: maintData.vehicleId,
      serviceType: maintData.serviceType,
      startDate: maintData.startDate,
      expectedCompletion: maintData.expectedCompletion,
      serviceProvider: maintData.serviceProvider,
      cost: Number(maintData.estimatedCost || 0),
      status: maintData.status || "Scheduled",
      priority: maintData.priority || "Medium",
      description: maintData.description || "",
      notes: maintData.notes || ""
    };

    // If starting maintenance immediately
    if (newMaint.status === "Active") {
      setVehicles(prev => prev.map(v => v.id === maintData.vehicleId ? { ...v, status: "In Shop" } : v));
    }

    setMaintenance(prev => [newMaint, ...prev]);
    return newMaint;
  };

  const closeMaintenance = (maintenanceId, closingData) => {
    const record = maintenance.find(m => m.id === maintenanceId);
    if (!record) throw new Error("Maintenance record not found.");

    setMaintenance(prev => prev.map(m => {
      if (m.id === maintenanceId) {
        return {
          ...m,
          status: "Completed",
          cost: Number(closingData.finalCost),
          notes: `${m.notes}\nClosed Service Notes: ${closingData.serviceNotes || ""}`,
          actualCompletionDate: closingData.completionDate
        };
      }
      return m;
    }));

    // Log the maintenance cost into expenses
    const newExpense = {
      id: `E-${700 + expenses.length + 1}`,
      vehicleId: record.vehicleId,
      tripId: null,
      category: "Maintenance",
      amount: Number(closingData.finalCost),
      date: closingData.completionDate,
      description: `Maintenance closure expense for ${record.serviceType}: ${closingData.serviceNotes || ""}`,
      receipt: "receipt_maintenance_close.jpg"
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Restore vehicle to Available, unless it was retired
    setVehicles(prev => prev.map(v => {
      if (v.id === record.vehicleId) {
        return {
          ...v,
          status: v.status === "Retired" ? "Retired" : "Available",
          lastService: closingData.completionDate
        };
      }
      return v;
    }));
  };

  const startScheduledMaintenance = (maintenanceId) => {
    const record = maintenance.find(m => m.id === maintenanceId);
    if (!record) throw new Error("Maintenance record not found.");

    setMaintenance(prev => prev.map(m => m.id === maintenanceId ? { ...m, status: "Active" } : m));
    setVehicles(prev => prev.map(v => v.id === record.vehicleId ? { ...v, status: "In Shop" } : v));
  };

  // Fuel Operations
  const addFuelLog = (fuelData) => {
    const vehicle = vehicles.find(v => v.id === fuelData.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found.");

    const odo = Number(fuelData.odometer);
    const liters = Number(fuelData.liters);
    const costVal = Number(fuelData.totalCost);

    // Calculate distance and efficiency since last odometer if possible
    let distanceTravelled = 0;
    let efficiency = 0;
    if (odo > vehicle.odometer) {
      distanceTravelled = odo - vehicle.odometer;
      efficiency = liters > 0 ? parseFloat((distanceTravelled / liters).toFixed(2)) : 0;
    }

    const newLog = {
      id: `F-${600 + fuelLogs.length + 1}`,
      vehicleId: fuelData.vehicleId,
      date: fuelData.date,
      liters,
      totalCost: costVal,
      odometer: odo,
      distanceTravelled,
      fuelEfficiency: efficiency
    };

    setFuelLogs(prev => [newLog, ...prev]);

    // Update vehicle odometer and create a fuel expense
    setVehicles(prev => prev.map(v => v.id === fuelData.vehicleId ? { ...v, odometer: odo } : v));
    
    // Automatically add as a Fuel expense
    const newFuelExpense = {
      id: `E-${700 + expenses.length + 1}`,
      vehicleId: fuelData.vehicleId,
      tripId: null,
      category: "Miscellaneous",
      amount: costVal,
      date: fuelData.date,
      description: `Fuel purchase: ${liters} Liters.`,
      receipt: "receipt_fuel_log.jpg"
    };
    setExpenses(prev => [newFuelExpense, ...prev]);

    return newLog;
  };

  // Generic Expense Operations
  const addGeneralExpense = (expenseData) => {
    const newExpense = {
      id: `E-${700 + expenses.length + 1}`,
      vehicleId: expenseData.vehicleId,
      tripId: expenseData.tripId || null,
      category: expenseData.category,
      amount: Number(expenseData.amount),
      date: expenseData.date,
      description: expenseData.description,
      receipt: "receipt_expense_added.jpg"
    };

    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  return (
    <DataContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenance,
        fuelLogs,
        expenses,
        currentUser,
        alerts,
        login,
        logout,
        changeRoleForDemo,
        addVehicle,
        addDriver,
        updateDriverStatus,
        createTrip,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        scheduleMaintenance,
        closeMaintenance,
        startScheduledMaintenance,
        addFuelLog,
        addGeneralExpense
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
