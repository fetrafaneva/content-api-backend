import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"; // middleware à créer pour JWT
import {
  createPost,
  deletePost,
  getPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

// routes publiques
router.get("/", getPosts);

// routes protégées
router.post("/", authMiddleware, createPost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
