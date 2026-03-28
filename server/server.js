const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketio = require("socket.io");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://localhost:27017/socialapp";

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Socket.io for chat
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("sendMessage", (message) => {
    // Broadcast message to all connected clients
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
