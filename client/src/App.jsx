import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import './App.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // New state for password
  const [socketId, setSocketId] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [joinError, setJoinError] = useState(""); // To handle join errors
 

  const socket = useMemo(() => io("http://localhost:3000"), []);

  useEffect(() => {
    socket.on("connect", function () {
      setSocketId(socket.id);
      console.log("connected", socket.id);
    });

    socket.on("receive-message", function (data) {
      setAllMessages((prev) => [...prev, data]);
    });

    socket.on("previous-messages", function (messages) {
      setAllMessages(messages);
      setHasJoinedRoom(true); // Set hasJoinedRoom to true when previous messages are received
    });

    socket.on("join-error", (error) => {
      setJoinError(error); // Handle join error if room ID/password are incorrect
      toast.error(error)
      setHasJoinedRoom(false);
    });

    socket.on("error", (error) => {
      setJoinError(error);
      toast.error(error)
      setHasJoinedRoom(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const handleClearChat = () => {
    if (room) {
      socket.emit('clearChat', room);
      toast.success("Chat Cleared Sucessfull")
      setAllMessages([]);
      setHasJoinedRoom(false);
      setRoom("");
      setUsername("");
      setPassword("");
    }
  };

  const handleJoinRoom = () => {
    if (room && username && password) {
      socket.emit("join-room", { room, username, password });
      toast.success("joined Sucessfull")
    } else {
      toast.error("Please fill in all fields.")
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { room, message, senderId: socketId, username });
    setMessage("");
  };

  return (
    <div className="app">
      <div className="background-image-container">
        <div className={`chat-container ${hasJoinedRoom ? 'joined' : ''}`}>
          <div className="chat-header">
            TempChat
          </div>

          {!hasJoinedRoom ? (
            <div className="join-room-section">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter Room ID"
                className="input-field"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Your Name"
                className="input-field"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="input-field" // New password field
              />
              {joinError && <div className="error-message">{joinError}</div>}
              <button onClick={handleJoinRoom} className="join-button">
                Join Room
              </button>
            </div>
          ) : (
            <div className="chat-section">
              <button className="clear_chat" onClick={handleClearChat}>Clear Chat</button>
              <div className="chat-box">
                {allMessages.map((msg, index) => (
                  <div key={index} className="message-container">
                    <div className="message">
                      <span className="username-span">{msg.username}:</span>
                      <span className="message-span"> {msg.message}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="message-form">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message"
                  className="input-field"
                />
                <button type="submit" className="send-button">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
