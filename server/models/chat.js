const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room: String,
  password: String, 
  messages: [
    {
      message: String,
      senderId: String,
      username: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
