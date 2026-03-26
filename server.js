const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 🟢 THIS IS THE MISSING KEY:
// It tells the browser that the Arbor Wallet is a trusted friend.
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"]
}));

app.get('/', (req, res) => {
  res.send({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.2" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'] 
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
