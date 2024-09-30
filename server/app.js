const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require('path');

app.use(cors());

const dbConnect = require('./config/db');
dbConnect();

const Room = require('./models/chat');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: `http://localhost:5173`,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", function (socket) {
  socket.on("join-room", async ({ room, username, password }) => {
    try {
      const roomData = await Room.findOne({ room });
      if (roomData) {
        if (roomData.password === password) {
          socket.join(room);
          socket.emit("previous-messages", roomData.messages);
        } else {
          socket.emit("join-error", "Incorrect password");
        }
      } else {
        const newRoom = await Room.create({ room, password, messages: [] });
        socket.join(newRoom.room);
        socket.emit("previous-messages", []);
      }
    } catch (error) {
      socket.emit("join-error", "An error occurred while joining the room");
    }
  });

  socket.on("message", async ({ room, message, senderId, username }) => {
    const roomData = await Room.findOne({ room });
    if (roomData) {
      roomData.messages.push({ message, senderId, username });
      await roomData.save();
    } else {
      await Room.create({ room, messages: [{ message, senderId, username }] });
    }

    io.to(room).emit("receive-message", { message, senderId, username });
  });

  socket.on("clearChat", async function (room) {
    await Room.deleteMany({ room });
  });
});

const __dirname1 = path.resolve(__dirname, '..');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname1, "client", "dist")));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
} else {
  app.get("/", function (req, res) {
    res.send("hello");
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
