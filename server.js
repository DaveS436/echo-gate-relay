const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS for your Base44 app
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.send({ status: "LAMINAR", system: "Echo-Gate-Relay", version: "2.0" });
});

io.on('connection', (socket) => {
  console.log(`[Gate] New connection: ${socket.id}`);

  // Registration for permanent Node IDs (e.g., 'S25_Alpha')
  socket.on('register', (nodeId) => {
    socket.join(nodeId);
    console.log(`[Gate] Node registered as: ${nodeId}`);
  });

  // Signal Relay Logic
  socket.on('signal', (data) => {
    if (!data.to || !data.signal) {
      socket.emit('error', 'Invalid signal data');
      return;
    }
    io.to(data.to).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Gate] Node disconnected: ${socket.id}`);
  });
});

// Graceful Shutdown for Railway
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Echo-Gate-Relay active on port ${PORT}`);
});