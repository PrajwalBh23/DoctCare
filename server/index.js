const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
require('./db/connection.js');
const auth = require("./routes/auth.js");
const routes = require("./routes/rooms.js");
const socketIo = require("socket.io");

dotenv.config({ path: './config.env' });

const bodyParser = require('body-parser');
const app = express();

// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the size as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); 

app.use(express.json());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set('io', io);

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Running');
});

app.use('/auth', auth);
app.use('/routes', routes);

const rooms = {};

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  
  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("roomCall", ({ roomID, signalData, from, name }) => {
    if (!rooms[roomID]) {
      // Initialize the room with the roomID as the first element
      rooms[roomID] = [roomID];
    }

    // Check if the room has space
    if (rooms[roomID].length < 6) {
      // Add the current socket ID to the list
      rooms[roomID].push(socket.id);

      // Emit to all users in the room about the incoming call
      socket.to(roomID).emit("roomCall", { from, signal: signalData, name });

      // Notify all users in the room about the new user
      rooms[roomID].forEach(user => {
        if (user !== socket.id) {
          io.to(user).emit("newUser", { from: socket.id, signal: signalData });
        }
      });

      // Update all users in the room with the list of participants
      io.to(roomID).emit("updateParticipants", rooms[roomID]);
    } else {
      // Notify the current user if the room is full
      socket.emit("roomFull");
    }
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  });

  socket.on('send-message', ({ roomId, message }) => {
    io.emit('receive-message', message);
  });

  socket.on('send-file', (data) => {
    io.emit('receive-file', data);
  });

});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));