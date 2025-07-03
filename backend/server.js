import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.routes.js";
dotenv.config();

const app = express();

app.use(cors());

app.use(postRoutes);

app.use(express.json());

const startServer = async () => {
  const connectDB = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app.listen(5000, () => {
    console.log("Server is running on port 5000");
  });
};

startServer();
