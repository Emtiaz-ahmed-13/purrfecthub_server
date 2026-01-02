import express from "express";
import auth from "../../middleware/auth";
import { ChatControllers } from "./chat.controllers";

const router = express.Router();

// All routes require authentication
router.post("/conversations", auth(), ChatControllers.startConversation);
router.get("/conversations", auth(), ChatControllers.getMyConversations);
router.get("/conversations/:id/messages", auth(), ChatControllers.getConversationMessages);
router.get("/unread-count", auth(), ChatControllers.getUnreadCount);

export const ChatRoutes = router;
