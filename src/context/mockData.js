// Mock data with realistic Indian logistics details

export const initialVehicles = [
  {
    id: "V-101",
    name: "Tata Signa 4825.TK",
    regNumber: "MH-12-PQ-4567",
    type: "Heavy Tipper",
    capacity: 25000, // 25 Tonnes
    odometer: 142050,
    acquisitionCost: 4500000, // INR 45 Lakhs
    region: "West (Mumbai)",
    status: "Available",
    lastService: "2026-06-15"
  },
  {
    id: "V-102",
    name: "Ashok Leyland Ecomet 1615",
    regNumber: "DL-01-AB-1234",
    type: "Container Truck",
    capacity: 10000, // 10 Tonnes
    odometer: 85400,
    acquisitionCost: 2800000, // INR 28 Lakhs
    region: "North (Delhi)",
    status: "On Trip",
    lastService: "2026-06-28"
  },
  {
    id: "V-103",
    name: "BharatBenz 2823C",
    regNumber: "KA-03-XY-8901",
    type: "Dumper",
    capacity: 16000, // 16 Tonnes
    odometer: 112100,
    acquisitionCost: 3800000, // INR 38 Lakhs
    region: "South (Bengaluru)",
    status: "In Shop",
    lastService: "2026-07-02"
  },
  {
    id: "V-104",
    name: "Mahindra Blazo X 35",
    regNumber: "HR-26-CZ-5678",
    type: "Flatbed Trailer",
    capacity: 35000, // 35 Tonnes
    odometer: 198300,
    acquisitionCost: 5200000, // INR 52 Lakhs
    region: "North (Delhi)",
    status: "Available",
    lastService: "2026-05-10"
  },
  {
    id: "V-105",
    name: "Eicher Pro 3015",
    regNumber: "GJ-01-LM-9012",
    type: "Box Truck",
    capacity: 9000, // 9 Tonnes
    odometer: 62450,
    acquisitionCost: 2200000, // INR 22 Lakhs
    region: "West (Ahmedabad)",
    status: "On Trip",
    lastService: "2026-07-05"
  },
  {
    id: "V-106",
    name: "Tata Ultra T.7",
    regNumber: "TS-09-EF-3456",
    type: "Light Commercial Vehicle",
    capacity: 4000, // 4 Tonnes
    odometer: 31200,
    acquisitionCost: 1500000, // INR 15 Lakhs
    region: "South (Hyderabad)",
    status: "Retired",
    lastService: "2026-01-20"
  },
  {
    id: "V-107",
    name: "Eicher Pro 6055",
    regNumber: "TN-01-JK-7890",
    type: "Tanker",
    capacity: 30000, // 30 Tonnes
    odometer: 154000,
    acquisitionCost: 4800000, // INR 48 Lakhs
    region: "South (Chennai)",
    status: "Available",
    lastService: "2026-06-20"
  }
];

export const initialDrivers = [
  {
    id: "D-201",
    name: "Rajesh Kumar",
    licenseNumber: "DL-1420180029345",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2028-11-14",
    contact: "+91 98765 43210",
    completedTrips: 142,
    safetyScore: 92,
    status: "Available",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "D-202",
    name: "Amit Patel",
    licenseNumber: "GJ-0120150098761",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2027-04-22",
    contact: "+91 98234 56789",
    completedTrips: 98,
    safetyScore: 88,
    status: "On Trip",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "D-203",
    name: "Vikram Singh",
    licenseNumber: "RJ-1420100012345",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2026-07-17", // Expiring soon (5 days from July 12, 2026)
    contact: "+91 94140 12345",
    completedTrips: 215,
    safetyScore: 95,
    status: "Available",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "D-204",
    name: "Suresh Nair",
    licenseNumber: "KL-0720050045678",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2026-05-10", // Expired
    contact: "+91 98450 98765",
    completedTrips: 310,
    safetyScore: 78,
    status: "Off Duty",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "D-205",
    name: "Harpreet Singh",
    licenseNumber: "PB-1020200054321",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2030-08-15",
    contact: "+91 99150 12345",
    completedTrips: 64,
    safetyScore: 84,
    status: "On Trip",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "D-206",
    name: "Ramesh Rao",
    licenseNumber: "KA-5120120067890",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2029-01-30",
    contact: "+91 98860 54321",
    completedTrips: 185,
    safetyScore: 55, // Low safety score
    status: "Suspended",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: "D-207",
    name: "Sunil Sharma",
    licenseNumber: "HR-2620190011223",
    licenseCategory: "Heavy Motor Vehicle (HMV)",
    licenseExpiry: "2026-08-10", // Expiring soon (< 30 days)
    contact: "+91 98100 55667",
    completedTrips: 42,
    safetyScore: 89,
    status: "Available",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export const initialTrips = [
  {
    id: "T-801",
    route: "Jaipur ➔ Delhi",
    vehicleId: "V-102",
    driverId: "D-202",
    cargoWeight: 8500, // 8.5 Tonnes (Max load: 10000)
    distance: 270,
    departure: "2026-07-11T09:00",
    estimatedArrival: "2026-07-12T16:00",
    actualArrival: null,
    revenue: 45000,
    cost: 18000,
    status: "Dispatched",
    notes: "Delivery of automotive parts. Fast transit requested."
  },
  {
    id: "T-802",
    route: "Ahmedabad ➔ Mumbai",
    vehicleId: "V-105",
    driverId: "D-205",
    cargoWeight: 7500, // 7.5 Tonnes (Max load: 9000)
    distance: 530,
    departure: "2026-07-12T05:00",
    estimatedArrival: "2026-07-13T01:00",
    actualArrival: null,
    revenue: 95000,
    cost: 42000,
    status: "Dispatched",
    notes: "Electronics cargo. Avoid routes with heavy rain warnings."
  },
  {
    id: "T-803",
    route: "Bengaluru ➔ Chennai",
    vehicleId: "V-104",
    driverId: "D-201",
    cargoWeight: 28000, // 28 Tonnes (Max load: 35000)
    distance: 350,
    departure: "2026-07-09T08:00",
    estimatedArrival: "2026-07-09T18:00",
    actualArrival: "2026-07-09T17:45",
    revenue: 72000,
    cost: 31000,
    status: "Completed",
    notes: "Industrial machinery components delivery. Completed on time."
  },
  {
    id: "T-804",
    route: "Patna ➔ Purnia",
    vehicleId: "V-101",
    driverId: "D-203",
    cargoWeight: 22000, // 22 Tonnes (Max load: 25000)
    distance: 310,
    departure: "2026-07-08T07:00",
    estimatedArrival: "2026-07-08T17:00",
    actualArrival: "2026-07-08T18:15",
    revenue: 55000,
    cost: 24000,
    status: "Completed",
    notes: "Agricultural grain sacks. Delayed due to highway construction."
  },
  {
    id: "T-805",
    route: "Delhi ➔ Chandigarh",
    vehicleId: "V-107",
    driverId: "D-207",
    cargoWeight: 15000,
    distance: 250,
    departure: "2026-07-13T06:00",
    estimatedArrival: "2026-07-13T12:00",
    actualArrival: null,
    revenue: 35000,
    cost: 15000,
    status: "Draft",
    notes: "Scheduled milk tanker transit."
  }
];

export const initialMaintenance = [
  {
    id: "M-501",
    vehicleId: "V-103",
    serviceType: "Break down",
    startDate: "2026-07-10",
    expectedCompletion: "2026-07-14",
    serviceProvider: "BharatBenz Services, Bengaluru",
    cost: 45000,
    status: "Active",
    priority: "High",
    description: "Engine overheating issues and coolant leakage repair.",
    notes: "Replacement of coolant pump and hose pipes."
  },
  {
    id: "M-502",
    vehicleId: "V-101",
    serviceType: "Preventive",
    startDate: "2026-06-15",
    expectedCompletion: "2026-06-16",
    serviceProvider: "Tata Motors Authorized Hub",
    cost: 28000,
    status: "Completed",
    priority: "Medium",
    description: "1,40,000 km Scheduled Service",
    notes: "Engine oil change, air filter replacement, wheel alignment, brake lining checks."
  },
  {
    id: "M-503",
    vehicleId: "V-104",
    serviceType: "Inspection",
    startDate: "2026-07-15",
    expectedCompletion: "2026-07-15",
    serviceProvider: "TransitOps Internal Depot",
    cost: 2500,
    status: "Scheduled",
    priority: "Low",
    description: "Annual fitness and pollution checking certification.",
    notes: "Scheduled ahead of license validity checks."
  }
];

export const initialFuelLogs = [
  {
    id: "F-601",
    vehicleId: "V-102",
    date: "2026-07-10",
    liters: 90,
    totalCost: 8550, // ₹95/liter mock cost
    odometer: 85130,
    distanceTravelled: 360,
    fuelEfficiency: 4.0 // 4.0 km/l
  },
  {
    id: "F-602",
    vehicleId: "V-104",
    date: "2026-07-09",
    liters: 120,
    totalCost: 11400,
    odometer: 198300,
    distanceTravelled: 350,
    fuelEfficiency: 2.92 // Heavy vehicle loaded
  },
  {
    id: "F-603",
    vehicleId: "V-101",
    date: "2026-07-08",
    liters: 110,
    totalCost: 10450,
    odometer: 142050,
    distanceTravelled: 310,
    fuelEfficiency: 2.82
  }
];

export const initialExpenses = [
  {
    id: "E-701",
    vehicleId: "V-104",
    tripId: "T-803",
    category: "Toll",
    amount: 3200,
    date: "2026-07-09",
    description: "NH-48 FASTag automatic toll deduction.",
    receipt: "receipt_toll_t803.jpg"
  },
  {
    id: "E-702",
    vehicleId: "V-101",
    tripId: "T-804",
    category: "Parking",
    amount: 800,
    date: "2026-07-08",
    description: "Warehouse overnight secure parking charges.",
    receipt: "receipt_parking_t804.jpg"
  },
  {
    id: "E-703",
    vehicleId: "V-103",
    tripId: null,
    category: "Repair",
    amount: 15000,
    date: "2026-07-11",
    description: "Payment advance for engine repair parts.",
    receipt: "receipt_repair_v103.jpg"
  }
];

export const initialUsers = [
  {
    id: "U-301",
    name: "Karan Johar",
    email: "karan.manager@transitops.in",
    role: "Fleet Manager",
    status: "Active",
    lastActive: "Active now"
  },
  {
    id: "U-302",
    name: "Rohan Mehra",
    email: "rohan.dispatch@transitops.in",
    role: "Dispatcher",
    status: "Active",
    lastActive: "10 mins ago"
  },
  {
    id: "U-303",
    name: "Sanya Malhotra",
    email: "sanya.safety@transitops.in",
    role: "Safety Officer",
    status: "Active",
    lastActive: "2 hours ago"
  },
  {
    id: "U-304",
    name: "Anand Sen",
    email: "anand.analyst@transitops.in",
    role: "Financial Analyst",
    status: "Active",
    lastActive: "1 day ago"
  }
];
