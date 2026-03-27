const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// 1. Force Express to allow everything
app.use(cors());

// 2. The Socket.io "Master Key"
const io = new Server(server, {
  cors: {
    // This function automatically reflects the Base44 origin
    origin: (origin, callback) => {
      callback(null, true); 
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  // v2.2 Tuning for Mobile-to-PC stability
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log(`Arborist Active: ${socket.id}`);

  socket.on("node_signal", (data) => {
    // Relay the S25 data to the PC Dashboard
    io.emit("vortex_update", data);
  });

  socket.on("disconnect", () => {
    console.log(`Node Dormant: ${socket.id}`);
  });
});

// Health Check URL
app.get("/", (req, res) => {
  res.json({ 
    status: "LAMINAR", 
    system: "Echo-Gate-Relay", 
    version: "2.2",
    bridge: "Active"
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vortex Relay active on Port ${PORT}`);
});
