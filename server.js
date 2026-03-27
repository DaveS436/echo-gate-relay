const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Relaxed CORS for the new Proxy Shunt
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // Matches the new Base44 "relaxed" strategy
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log(`Node Connected: ${socket.id}`);
  socket.on("node_signal", (data) => {
    io.emit("vortex_update", data);
  });
});

app.get("/", (req, res) => {
  res.json({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

// Matches the Admin Bridge's new proxy route
app.get("/api/admin/status", (req, res) => {
  res.json({ status: "ONLINE", bridge: "SECURE" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vortex Relay active on Port ${PORT}`);
});
