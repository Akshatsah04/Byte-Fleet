const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// GET all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// GET one vehicle
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// CREATE vehicle
router.post("/", async (req, res) => {
  try {
    const {
      registrationNo,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
    } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNo,
        name,
        type,
        maxLoadCapacity,
        odometer,
        acquisitionCost,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to create vehicle",
    });
  }
});

// UPDATE vehicle
router.put("/:id", async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
    });
  }
});

// DELETE vehicle
router.delete("/:id", async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      message: "Vehicle deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
});

module.exports = router;