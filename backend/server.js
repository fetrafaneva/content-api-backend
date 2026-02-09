import express from "express";
import "dotenv/config";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/auth.routes.js"; // router pour auth
import postRoutes from "./routes/post.routes.js"; // router pour posts
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
await connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
