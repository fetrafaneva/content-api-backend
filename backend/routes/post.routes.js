import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"; // middleware à créer pour JWT
import { createPost } from "../controllers/post.controller.js";

const router = express.Router();

// routes protégées
router.post("/", authMiddleware, createPost);

export default router;
