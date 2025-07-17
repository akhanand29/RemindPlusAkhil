const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const notificationService = require('./utils/pushNotifications');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Cron job for checking task reminders
cron.schedule('* * * * *', async () => {
  try {
    await notificationService.checkAndSendReminders(io);
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

module.exports = { app, server, io };