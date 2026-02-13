import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getConversation,
  getInbox,
  markMessageAsRead,
  countUnreadMessages,
  deleteMessage,
  updateMessage,
  getConversations,
  markConversationAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();

// toutes les routes sont protégées
router.post(
  "/",
  authMiddleware,
  uploadMessageFiles.array("files", 5),
  sendMessage
);
router.get("/inbox", authMiddleware, getInbox);
router.get("/unread/count", authMiddleware, countUnreadMessages); // comptage des messages non lus
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversation/:userId", authMiddleware, getConversation);
router.patch(
  "/conversations/:userId/read",
  authMiddleware,
  markConversationAsRead
);

router.patch("/:id/read", authMiddleware, markMessageAsRead); // marquer comme lu
router.put("/:id", authMiddleware, updateMessage);
router.delete("/:id", authMiddleware, deleteMessage);

export default router;
