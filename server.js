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

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`Client joined document ${documentId}`);
  });

  socket.on('send-changes', (newContent) => {
    const documentId = Object.keys(socket.rooms)[1];
    socket.to(documentId).emit('receive-changes', newContent);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
