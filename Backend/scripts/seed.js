const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Initial mock data definitions directly inside seed for ESM/CommonJS safety
const initialUsers = [
  { name: "Karan Johar", email: "karan.manager@transitops.in", role: "FLEET_MANAGER" },
  { name: "Rohan Mehra", email: "rohan.dispatch@transitops.in", role: "DISPATCHER" },
  { name: "Sanya Malhotra", email: "sanya.safety@transitops.in", role: "SAFETY_OFFICER" },
  { name: "Anand Sen", email: "anand.analyst@transitops.in", role: "FINANCIAL_ANALYST" }
];

const initialVehicles = [
  { id: "V-101", name: "Tata Signa 4825.TK", regNumber: "MH-12-PQ-4567", type: "Heavy Tipper", capacity: 25000, odometer: 142050, acquisitionCost: 4500000, status: "AVAILABLE", lastService: "2026-06-15" },
  { id: "V-102", name: "Ashok Leyland Ecomet 1615", regNumber: "DL-01-AB-1234", type: "Container Truck", capacity: 10000, odometer: 85400, acquisitionCost: 2800000, status: "ON_TRIP", lastService: "2026-06-28" },
  { id: "V-103", name: "BharatBenz 2823C", regNumber: "KA-03-XY-8901", type: "Dumper", capacity: 16000, odometer: 112100, acquisitionCost: 3800000, status: "IN_SHOP", lastService: "2026-07-02" },
  { id: "V-104", name: "Mahindra Blazo X 35", regNumber: "HR-26-CZ-5678", type: "Flatbed Trailer", capacity: 35000, odometer: 198300, acquisitionCost: 5200000, status: "AVAILABLE", lastService: "2026-05-10" },
  { id: "V-105", name: "Eicher Pro 3015", regNumber: "GJ-01-LM-9012", type: "Box Truck", capacity: 9000, odometer: 62450, acquisitionCost: 2200000, status: "ON_TRIP", lastService: "2026-07-05" },
  { id: "V-106", name: "Tata Ultra T.7", regNumber: "TS-09-EF-3456", type: "Light Commercial Vehicle", capacity: 4000, odometer: 31200, acquisitionCost: 1500000, status: "RETIRED", lastService: "2026-01-20" },
  { id: "V-107", name: "Eicher Pro 6055", regNumber: "TN-01-JK-7890", type: "Tanker", capacity: 30000, odometer: 154000, acquisitionCost: 4800000, status: "AVAILABLE", lastService: "2026-06-20" }
];

const initialDrivers = [
  { id: "D-201", name: "Rajesh Kumar", licenseNumber: "DL-1420180029345", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2028-11-14", contact: "+91 98765 43210", completedTrips: 142, safetyScore: 92, status: "AVAILABLE" },
  { id: "D-202", name: "Amit Patel", licenseNumber: "GJ-0120150098761", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2027-04-22", contact: "+91 98234 56789", completedTrips: 98, safetyScore: 88, status: "ON_TRIP" },
  { id: "D-203", name: "Vikram Singh", licenseNumber: "RJ-1420100012345", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2026-07-17", contact: "+91 94140 12345", completedTrips: 215, safetyScore: 95, status: "AVAILABLE" },
  { id: "D-204", name: "Suresh Nair", licenseNumber: "KL-0720050045678", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2026-05-10", contact: "+91 98450 98765", completedTrips: 310, safetyScore: 78, status: "OFF_DUTY" },
  { id: "D-205", name: "Harpreet Singh", licenseNumber: "PB-1020200054321", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2030-08-15", contact: "+91 99150 12345", completedTrips: 64, safetyScore: 84, status: "ON_TRIP" },
  { id: "D-206", name: "Ramesh Rao", licenseNumber: "KA-5120120067890", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2029-01-30", contact: "+91 98860 54321", completedTrips: 185, safetyScore: 55, status: "SUSPENDED" },
  { id: "D-207", name: "Sunil Sharma", licenseNumber: "HR-2620190011223", licenseCategory: "Heavy Motor Vehicle (HMV)", licenseExpiry: "2026-08-10", contact: "+91 98100 55667", completedTrips: 42, safetyScore: 89, status: "AVAILABLE" }
];

const initialTrips = [
  { id: "T-801", route: "Jaipur ➔ Delhi", vehicleId: "V-102", driverId: "D-202", cargoWeight: 8500, distance: 270, departure: "2026-07-11T09:00", estimatedArrival: "2026-07-12T16:00", actualArrival: null, revenue: 45000, cost: 18000, status: "DISPATCHED", notes: "Delivery of automotive parts. Fast transit requested." },
  { id: "T-802", route: "Ahmedabad ➔ Mumbai", vehicleId: "V-105", driverId: "D-205", cargoWeight: 7500, distance: 530, departure: "2026-07-12T05:00", estimatedArrival: "2026-07-13T01:00", actualArrival: null, revenue: 95000, cost: 42000, status: "DISPATCHED", notes: "Electronics cargo. Avoid routes with heavy rain warnings." },
  { id: "T-803", route: "Bengaluru ➔ Chennai", vehicleId: "V-104", driverId: "D-201", cargoWeight: 28000, distance: 350, departure: "2026-07-09T08:00", estimatedArrival: "2026-07-09T18:00", actualArrival: "2026-07-09T17:45", revenue: 72000, cost: 31000, status: "COMPLETED", notes: "Industrial machinery components delivery. Completed on time." },
  { id: "T-804", route: "Patna ➔ Purnia", vehicleId: "V-101", driverId: "D-203", cargoWeight: 22000, distance: 310, departure: "2026-07-08T07:00", estimatedArrival: "2026-07-08T17:00", actualArrival: "2026-07-08T18:15", revenue: 55000, cost: 24000, status: "COMPLETED", notes: "Agricultural grain sacks. Delayed due to highway construction." },
  { id: "T-805", route: "Delhi ➔ Chandigarh", vehicleId: "V-107", driverId: "D-207", cargoWeight: 15000, distance: 250, departure: "2026-07-13T06:00", estimatedArrival: "2026-07-13T12:00", actualArrival: null, revenue: 35000, cost: 15000, status: "DRAFT", notes: "Scheduled milk tanker transit." }
];

const initialMaintenance = [
  { id: "M-501", vehicleId: "V-103", serviceType: "Break down", startDate: "2026-07-10", expectedCompletion: "2026-07-14", serviceProvider: "BharatBenz Services, Bengaluru", cost: 45000, status: "ACTIVE", description: "Engine overheating issues and coolant leakage repair.", notes: "Replacement of coolant pump and hose pipes." },
  { id: "M-502", vehicleId: "V-101", serviceType: "Preventive", startDate: "2026-06-15", expectedCompletion: "2026-06-16", serviceProvider: "Tata Motors Authorized Hub", cost: 28000, status: "CLOSED", description: "1,40,000 km Scheduled Service", notes: "Engine oil change, air filter replacement, wheel alignment, brake lining checks." }
];

const initialFuelLogs = [
  { id: "F-601", vehicleId: "V-102", date: "2026-07-10", liters: 90, totalCost: 8550 },
  { id: "F-602", vehicleId: "V-104", date: "2026-07-09", liters: 120, totalCost: 11400 },
  { id: "F-603", vehicleId: "V-101", date: "2026-07-08", liters: 110, totalCost: 10450 }
];

const initialExpenses = [
  { id: "E-701", vehicleId: "V-104", tripId: "T-803", category: "Toll", amount: 3200, date: "2026-07-09", description: "NH-48 FASTag automatic toll deduction." },
  { id: "E-702", vehicleId: "V-101", tripId: "T-804", category: "Parking", amount: 800, date: "2026-07-08", description: "Warehouse overnight secure parking charges." },
  { id: "E-703", vehicleId: "V-103", tripId: null, category: "Repair", amount: 15000, date: "2026-07-11", description: "Payment advance for engine repair parts." }
];

async function main() {
  console.log("🧹 Cleaning database records...");
  await prisma.expense.deleteMany({});
  await prisma.fuelLog.deleteMany({});
  await prisma.maintenance.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👥 Seeding mock users...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  for (const u of initialUsers) {
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: hashedPassword,
        role: u.role
      }
    });
  }

  console.log("🚛 Seeding mock vehicles...");
  for (const v of initialVehicles) {
    await prisma.vehicle.create({
      data: {
        id: v.id,
        registrationNo: v.regNumber,
        name: v.name,
        type: v.type,
        maxLoadCapacity: v.capacity,
        odometer: v.odometer,
        acquisitionCost: v.acquisitionCost,
        status: v.status,
        lastService: new Date(v.lastService)
      }
    });
  }

  console.log("👨‍✈️ Seeding mock drivers...");
  for (const d of initialDrivers) {
    await prisma.driver.create({
      data: {
        id: d.id,
        name: d.name,
        licenseNumber: d.licenseNumber,
        licenseCategory: d.licenseCategory,
        licenseExpiryDate: new Date(d.licenseExpiry),
        contactNumber: d.contact,
        safetyScore: d.safetyScore,
        status: d.status
      }
    });
  }

  console.log("🗺️ Seeding mock trips...");
  for (const t of initialTrips) {
    const routeParts = t.route.split(" ➔ ");
    await prisma.trip.create({
      data: {
        id: t.id,
        source: routeParts[0] || "Unknown",
        destination: routeParts[1] || "Unknown",
        cargoWeight: t.cargoWeight,
        plannedDistance: t.distance,
        actualDistance: t.actualArrival ? t.distance : null,
        status: t.status,
        revenue: t.revenue || 0,
        cost: t.cost || 0,
        notes: t.notes || "",
        estimatedArrival: t.estimatedArrival ? new Date(t.estimatedArrival) : null,
        vehicleId: t.vehicleId,
        driverId: t.driverId,
        dispatchedAt: t.departure ? new Date(t.departure) : null,
        completedAt: t.actualArrival ? new Date(t.actualArrival) : null
      }
    });
  }

  console.log("🔧 Seeding maintenance logs...");
  for (const m of initialMaintenance) {
    await prisma.maintenance.create({
      data: {
        id: m.id,
        vehicleId: m.vehicleId,
        description: `${m.serviceType}: ${m.description}`,
        cost: m.cost,
        status: m.status,
        startedAt: new Date(m.startDate),
        closedAt: m.status === "CLOSED" ? new Date(m.expectedCompletion) : null
      }
    });
  }

  console.log("⛽ Seeding fuel logs...");
  for (const f of initialFuelLogs) {
    await prisma.fuelLog.create({
      data: {
        id: f.id,
        vehicleId: f.vehicleId,
        liters: f.liters,
        cost: f.totalCost,
        date: new Date(f.date)
      }
    });
  }

  console.log("🪙 Seeding expenses...");
  for (const e of initialExpenses) {
    await prisma.expense.create({
      data: {
        id: e.id,
        vehicleId: e.vehicleId,
        tripId: e.tripId,
        type: e.category,
        amount: e.amount,
        date: new Date(e.date)
      }
    });
  }

  console.log("✅ Database successfully seeded with 4 users, 7 vehicles, 7 drivers, 5 trips, 2 maintenance records, 3 fuel logs, and 3 expenses!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });