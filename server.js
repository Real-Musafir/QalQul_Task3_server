const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('login', (user) => {
    if (!onlineUsers.some(u => u.email === user.email)) {
      onlineUsers.push({ ...user, active: true });
    } else {
      onlineUsers = onlineUsers.map(u => u.email === user.email ? { ...u, active: true } : u);
    }
    io.emit('update-users', onlineUsers);
  });

  socket.on('logout', (user) => {
    onlineUsers = onlineUsers.map(u => u.email === user.email ? { ...u, active: false } : u);
    io.emit('update-users', onlineUsers);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
