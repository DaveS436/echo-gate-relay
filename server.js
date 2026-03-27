const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// 1. The "Vortex" CORS Configuration
// This allows your Base44 dashboard to safely talk to this Railway server.
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // Allows all origins (essential for Base44 preview links)
    methods: ["GET", "POST"],
    credentials: true
  },
  // v2.2 Tuning: Optimized for mobile/PC mesh latency
  pingTimeout: 60000,
  pingInterval: 25000
});

// 2. The Dynamic Port Handshake
// Railway assigns a port automatically; we default to 3000 for local testing.
const PORT = process.env.PORT || 3000;

// 3. Network Events (The Heartbeat)
io.on("connection", (socket) => {
  console.log(`Node Connected: ${socket.id}`);

  // When your S25 sends a signal
  socket.on("node_signal", (data) => {
    // Broadcast the signal to your PC Dashboard
    io.emit("vortex_update", {
      nodeID: data.nodeID,
      trustScore: data.trustScore,
      latency: data.latency,
      status: "Laminar"
    });
  });

  socket.on("disconnect", () => {
    console.log(`Node Disconnected: ${socket.id}`);
  });
});

// Health Check for the Bridge
app.get("/", (req, res) => {
  res.send("🚀 Echo Gate Relay v2.2 is Online and Laminar.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vortex Relay active on Port ${PORT}`);
});
