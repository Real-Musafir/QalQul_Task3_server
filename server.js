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
let documents = [
  { id: 1, title: 'Document 1' },
  { id: 2, title: 'Document 2' },
];

io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit current documents to the connected client
  socket.emit('update-documents', documents);

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

  socket.on('add-document', (doc) => {
    documents.push(doc);
    io.emit('update-documents', documents);
  });

  socket.on('update-document', (updatedDoc) => {
    documents = documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
    io.emit('update-documents', documents);
  });

  socket.on('delete-document', (docId) => {
    documents = documents.filter(doc => doc.id !== docId);
    io.emit('update-documents', documents);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
