import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getMyNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authMiddleware, getMyNotifications);

export default router;
