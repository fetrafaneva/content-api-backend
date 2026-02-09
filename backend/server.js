import express from "express";
import "dotenv/config";
import connectDB from "./configs/db.js";
import router from "./user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
await connectDB();

app.use(express.json());

// routes declaration
app.use("/api/v1/users", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
