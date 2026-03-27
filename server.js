const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// 1. The "Aggressive" CORS Policy
// This tells the browser to stop blocking requests from the Base44 preview URL.
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"]
}));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins for the WebRTC/Socket handshake
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log(`Node Connected: ${socket.id}`);
  socket.on("node_signal", (data) => {
    io.emit("vortex_update", data);
  });
});

// 2. The "Handshake" Endpoints
// Added specifically to satisfy the Admin Panel's fetch requests.
app.get("/", (req, res) => {
  res.json({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

app.get("/api/admin/status", (req, res) => {
  res.json({ status: "ONLINE", bridge: "SECURE" });
});

// 3. Pre-flight satisfy (Critical for your specific rig setup)
app.options('*', cors()); 

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vortex Relay active on Port ${PORT}`);
});
