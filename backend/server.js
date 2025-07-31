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

app.use(cors());
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
