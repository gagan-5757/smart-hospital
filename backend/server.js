const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
  },
});

app.use(cors());
app.use(express.json());

/* =====================================================
   DEMO DATA
===================================================== */

const hospitals = [
  {
    id: "H001",
    name: "Bengaluru Central",
    city: "Bengaluru",
    beds: 124,
    totalBeds: 180,
    bloodUnits: 87,
    emergencyCapacity: 72,
  },
  {
    id: "H002",
    name: "Mysuru General",
    city: "Mysuru",
    beds: 86,
    totalBeds: 140,
    bloodUnits: 54,
    emergencyCapacity: 61,
  },
  {
    id: "H003",
    name: "Mangaluru Medical",
    city: "Mangaluru",
    beds: 102,
    totalBeds: 160,
    bloodUnits: 91,
    emergencyCapacity: 48,
  },
];

let resources = [
  {
    id: "R001",
    hospitalId: "H001",
    name: "ICU Beds",
    type: "BED",
    available: 8,
    total: 40,
    status: "CRITICAL",
  },
  {
    id: "R002",
    hospitalId: "H001",
    name: "General Beds",
    type: "BED",
    available: 116,
    total: 140,
    status: "AVAILABLE",
  },
  {
    id: "R003",
    hospitalId: "H001",
    name: "O- Blood",
    type: "BLOOD",
    available: 12,
    total: 25,
    status: "LOW",
  },
  {
    id: "R004",
    hospitalId: "H002",
    name: "ICU Beds",
    type: "BED",
    available: 24,
    total: 40,
    status: "AVAILABLE",
  },
  {
    id: "R005",
    hospitalId: "H002",
    name: "O- Blood",
    type: "BLOOD",
    available: 22,
    total: 30,
    status: "AVAILABLE",
  },
];

let emergencyRequests = [
  {
    id: "REQ001",
    hospital: "Bengaluru Central",
    resource: "O- Blood",
    quantity: 5,
    urgency: "CRITICAL",
    status: "PENDING",
  },
  {
    id: "REQ002",
    hospital: "Mysuru General",
    resource: "ICU Beds",
    quantity: 3,
    urgency: "HIGH",
    status: "MATCHED",
  },
];

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "NexusCare API",
    status: "ONLINE",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   HOSPITALS
===================================================== */

app.get("/api/hospitals", (req, res) => {
  res.json({
    success: true,
    count: hospitals.length,
    data: hospitals,
  });
});

/* =====================================================
   RESOURCES
===================================================== */

app.get("/api/resources", (req, res) => {
  res.json({
    success: true,
    count: resources.length,
    data: resources,
  });
});

/* =====================================================
   EMERGENCY REQUESTS
===================================================== */

app.get("/api/requests", (req, res) => {
  res.json({
    success: true,
    count: emergencyRequests.length,
    data: emergencyRequests,
  });
});

/* =====================================================
   CREATE EMERGENCY REQUEST
===================================================== */

app.post("/api/requests", (req, res) => {
  const { hospital, resource, quantity, urgency } = req.body;

  if (!hospital || !resource || !quantity) {
    return res.status(400).json({
      success: false,
      message: "hospital, resource and quantity are required",
    });
  }

  const request = {
    id: `REQ${String(emergencyRequests.length + 1).padStart(3, "0")}`,
    hospital,
    resource,
    quantity,
    urgency: urgency || "MEDIUM",
    status: "PENDING",
  };

  emergencyRequests.unshift(request);

  io.emit("emergency-request-created", request);

  res.status(201).json({
    success: true,
    message: "Emergency request created",
    data: request,
  });
});

/* =====================================================
   SMART MATCH
===================================================== */

app.post("/api/smart-match", (req, res) => {
  const { resource, quantity } = req.body;

  const candidates = resources.filter(
    (item) =>
      item.name.toLowerCase() === resource?.toLowerCase() &&
      item.available >= Number(quantity)
  );

  if (candidates.length === 0) {
    return res.json({
      success: true,
      matched: false,
      message: "No hospital currently has sufficient surplus inventory",
    });
  }

  const match = candidates[0];

  const hospital = hospitals.find(
    (item) => item.id === match.hospitalId
  );

  res.json({
    success: true,
    matched: true,
    message: "Smart Match found a suitable source hospital",
    match: {
      hospital: hospital?.name,
      resource: match.name,
      available: match.available,
      requested: Number(quantity),
      surplus: match.available - Number(quantity),
    },
  });
});

/* =====================================================
   PREDICTIVE CAPACITY
===================================================== */

app.get("/api/prediction/:resourceId", (req, res) => {
  const resource = resources.find(
    (item) => item.id === req.params.resourceId
  );

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  // Mock burn-rate calculation
  const burnRatePerHour = 2.5;

  const hoursRemaining =
    resource.available / burnRatePerHour;

  const critical =
    hoursRemaining <= 4;

  res.json({
    success: true,
    resource: resource.name,
    available: resource.available,
    burnRatePerHour,
    predictedHoursRemaining: Number(hoursRemaining.toFixed(1)),
    alert: critical ? "CRITICAL" : "STABLE",
  });
});

/* =====================================================
   REAL-TIME SOCKET.IO
===================================================== */

io.on("connection", (socket) => {
  console.log(`Coordinator connected: ${socket.id}`);

  socket.emit("system-status", {
    message: "Connected to NexusCare real-time network",
    timestamp: new Date().toISOString(),
  });

  socket.on("resource-update", (data) => {
    console.log("Resource update:", data);

    io.emit("resource-updated", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`Coordinator disconnected: ${socket.id}`);
  });
});

/* =====================================================
   SERVER
===================================================== */

const PORT = 5000;

server.listen(PORT, () => {
  console.log("========================================");
  console.log("      NEXUSCARE BACKEND ONLINE");
  console.log("========================================");
  console.log(`API: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log("Socket.io: ENABLED");
  console.log("========================================");
});