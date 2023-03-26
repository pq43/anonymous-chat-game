const app = require("express")();
const cors = require("cors");
app.use(cors());
const httpServer = require("http").createServer(app);
const options = { 
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
};
const io = require("socket.io")(httpServer, options);

const gameRooms = {};
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('createRoom', (roomName) => {
    console.log(`Creating room ${roomName}`);
    const roomId = Math.random().toString(36).substring(7);
    socket.join(roomId);
    gameRooms[roomId] = {
      name: roomName,
      host: socket.id,
      players: [socket.id],
      started: false,
    };
    socket.emit('roomCreated', roomId);
  });

  socket.on('inviteToRoom', (roomId, userId) => {
    console.log(`Inviting ${userId} to room ${roomId}`);
    io.to(userId).emit('roomInvited', roomId);
  });

  socket.on('chatMessage', (roomId, message) => {
    console.log(`Received chat message "${message}" in room ${roomId}`);
    io.to(roomId).emit('chatMessage', socket.id, message);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});