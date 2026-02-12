import express from "express";
import "dotenv/config";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // à restreindre plus tard
  },
});

// Database connection
await connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
