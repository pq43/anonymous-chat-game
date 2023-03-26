// Import necessary libraries and modules
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Create a new instance of the Express app and the HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io and attach it to the server instance
const io = socketIO(server);

// Create an object to store connected clients
const clients = {};

// Define a function to generate a random username
function generateUsername() {
  const adjectives = ['fancy', 'funny', 'happy', 'mysterious', 'silly', 'smart', 'spooky'];
  const animals = ['cat', 'dog', 'elephant', 'giraffe', 'koala', 'lion', 'panda', 'tiger'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomAdjective}-${randomAnimal}-${Date.now()}`;
}

// Define a function to handle incoming connections
io.on('connection', (socket) => {
  // Generate a random username for the new client
  const username = generateUsername();
  
  // Add the client to the object of connected clients
  clients[socket.id] = {
    username,
    socket,
    guessedIdentities: [],
  };
  
  // Send the new client their username
  socket.emit('username', username);
  
  // Broadcast a message to all other clients that a new user has joined
  socket.broadcast.emit('user-joined', username);
  
  // Listen for incoming chat messages
  socket.on('chat-message', (message) => {
    // Broadcast the message to all other clients
    socket.broadcast.emit('chat-message', { username, message });
  });
  
  // Listen for incoming guesses
  socket.on('guess', (guessedIdentity) => {
    // Add the guessed identity to the client's list of guesses
    clients[socket.id].guessedIdentities.push(guessedIdentity);
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    // Broadcast a message to all other clients that a user has left
    socket.broadcast.emit('user-left', username);
    
    // Remove the client from the object of connected clients
    delete clients[socket.id];
  });
});

// Start the server and listen for incoming connections
server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
