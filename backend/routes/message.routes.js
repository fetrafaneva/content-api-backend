import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getConversation,
  getInbox,
  markMessageAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();

// toutes les routes sont protégées
router.post("/", authMiddleware, sendMessage);
router.get("/inbox", authMiddleware, getInbox);
router.get("/conversation/:userId", authMiddleware, getConversation);

// marquer comme lu
router.patch("/:id/read", authMiddleware, markMessageAsRead);

export default router;
