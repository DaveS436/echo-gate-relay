const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// 1. Universal CORS Configuration
// This allows the browser on your high-end PC to safely talk to Railway
app.use(cors({
  origin: true, // Dynamically allows the Base44 preview origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allows the handshake from any origin to prevent pre-flight failures
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  // v2.2 Tuning for stability between your PC and S25
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true
});

const PORT = process.env.PORT || 3000;

// 2. Network Relay Events
io.on("connection", (socket) => {
  console.log(`Node Connected: ${socket.id}`);

  socket.on("node_signal", (data) => {
    // Relays the signal from your S25 to your PC Dashboard
    io.emit("vortex_update", {
      ...data,
      relayStatus: "Laminar",
      timestamp: Date.now()
    });
  });

  socket.on("disconnect", () => {
    console.log(`Node Disconnected: ${socket.id}`);
  });
});

// 3. Health Check Endpoints
// Base44 checks these to turn the bridge "Green"
app.get("/", (req, res) => {
  res.json({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

app.get("/api/admin/status", (req, res) => {
  res.json({ status: "ONLINE", bridge: "SECURE" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vortex Relay active on Port ${PORT}`);
});
