const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
// Enable standard CORS for the express health check
app.get('/', (req, res) => {
  res.send({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.1" });
});

const server = http.createServer(app);

// Enable Aggressive CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allows any domain to connect
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true // Support for older client versions
});

io.on('connection', (socket) => {
  console.log(`[Gate] Node Attempting Connection: ${socket.id}`);

  socket.on('register', (nodeId) => {
    socket.join(nodeId);
    console.log(`[Gate] Node registered successfully: ${nodeId}`);
  });

  socket.on('signal', (data) => {
    if (data.to && data.signal) {
      io.to(data.to).emit('signal', {
        from: socket.id,
        signal: data.signal
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Gate] Node disconnected: ${socket.id}`);
  });
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Echo-Gate-Relay active on port ${PORT}`);
});
