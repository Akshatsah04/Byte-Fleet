const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// GET all trips
router.get("/", async (req, res) => {
  const trips = await prisma.trip.findMany({
    include: {
      vehicle: true,
      driver: true,
    },
  });

  res.json(trips);
});

// GET one trip
router.get("/:id", async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  res.json(trip);
});

// CREATE trip
router.post("/", async (req, res) => {
  const trip = await prisma.trip.create({
    data: req.body,
  });

  res.status(201).json(trip);
});

// UPDATE trip
router.put("/:id", async (req, res) => {
  const trip = await prisma.trip.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });

  res.json(trip);
});

// DELETE trip
router.delete("/:id", async (req, res) => {
  await prisma.trip.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Trip deleted",
  });
});

module.exports = router;