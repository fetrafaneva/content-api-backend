import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { socketHandler } from "./socket.js";

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes REST
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/uploads", express.static("uploads"));

// server HTTP (OBLIGATOIRE pour socket.io)
const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// brancher socket.io
socketHandler(io);

await connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
