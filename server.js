const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 1. Explicitly allow ALL origins for the Express Handshake
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get('/', (req, res) => {
  res.send({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

const server = http.createServer(app);

// 2. Explicitly configure the Socket.io CORS
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: false // Setting to false often helps with "origin: *"
  },
  transports: ['websocket', 'polling'] // Force both methods
});

io.on('connection', (socket) => {
  console.log(`[Gate] Node Handshake: ${socket.id}`);

  socket.on('register', (nodeId) => {
    socket.join(nodeId);
    console.log(`[Gate] Node Registered: ${nodeId}`);
  });

  socket.on('signal', (data) => {
    if (data.to && data.signal) {
      io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Echo-Gate-Relay v2.2 active on port ${PORT}`);
});
