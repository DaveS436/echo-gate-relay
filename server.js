const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable standard Express CORS
app.use(cors());

const io = new Server(server, {
  cors: {
    // This is the "Master Key" fix
    origin: (origin, callback) => {
      // Allow all origins to prevent Base44 preview blocks
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true // Support for older socket versions if needed
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log(`Node Active: ${socket.id}`);
  
  socket.on("node_signal", (data) => {
    io.emit("vortex_update", data);
  });
});

app.get("/", (req, res) => {
  res.json({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vortex Relay active on Port ${PORT}`);
});
