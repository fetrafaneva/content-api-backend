import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js"; // middleware a ajoute pour JWT
import {
  addComment,
  createPost,
  deletePost,
  deleteReply,
  getPostById,
  getPosts,
  replyToComment,
  toggleLikePost,
  updatePost,
  updateReply,
} from "../controllers/post.controller.js";

const router = express.Router();

// routes publiques
router.get("/", getPosts);

// routes protégées
router.post("/", authMiddleware, createPost);
router.delete("/:id", authMiddleware, deletePost);
router.put("/:id", authMiddleware, updatePost);
router.get("/:id", getPostById);
router.patch("/:id/like", authMiddleware, toggleLikePost);
router.post("/:id/comment", authMiddleware, addComment);
router.post(
  "/:postId/comment/:commentId/reply",
  authMiddleware,
  replyToComment
);
router.patch(
  "/:postId/comment/:commentId/reply/:replyId",
  authMiddleware,
  updateReply
);
router.delete(
  "/:postId/comment/:commentId/reply/:replyId",
  authMiddleware,
  deleteReply
);
export default router;
