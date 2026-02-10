import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"; // middleware à créer pour JWT
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  updatePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// routes publiques
router.get("/", getPosts);

// routes protégées
router.post("/", authMiddleware, createPost);
router.delete("/:id", authMiddleware, deletePost);
router.put("/:id", authMiddleware, updatePost);
router.get("/:id", getPostById);

export default router;
