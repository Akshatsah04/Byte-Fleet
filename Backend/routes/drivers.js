const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

// GET all drivers
router.get("/", async (req, res) => {
  const drivers = await prisma.driver.findMany();
  res.json(drivers);
});

// GET one driver
router.get("/:id", async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!driver) {
    return res.status(404).json({
      message: "Driver not found",
    });
  }

  res.json(driver);
});

// CREATE driver
router.post("/", async (req, res) => {
  const driver = await prisma.driver.create({
    data: req.body,
  });

  res.status(201).json(driver);
});

// UPDATE driver
router.put("/:id", async (req, res) => {
  const driver = await prisma.driver.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });

  res.json(driver);
});

// DELETE driver
router.delete("/:id", async (req, res) => {
  await prisma.driver.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Driver deleted",
  });
});

module.exports = router;