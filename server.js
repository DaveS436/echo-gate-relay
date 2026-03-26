const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 🟢 CRITICAL FIX: This tells the browser the Arbor Wallet is allowed to talk to us
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get('/', (req, res) => {
  res.send({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false // Changed to false to work better with origin: "*"
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'] // 🟢 Force both to bypass hotel/strict firewalls
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
