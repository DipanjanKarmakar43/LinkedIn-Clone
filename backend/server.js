import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
});

// Updated CORS configuration to allow both localhost and production
const allowedOrigins = [
  'http://localhost:3000',
  'https://linkedin-ebmh.onrender.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static("uploads"));

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    server.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

startServer();