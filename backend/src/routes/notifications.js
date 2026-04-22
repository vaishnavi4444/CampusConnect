import express from "express";
import {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllRead,
} from "../controllers/notifications.js";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/role.js";

const router = express.Router();

router.post("/", protect, authorize("ORGANIZER", "ADMIN"), sendNotification);
router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllRead);  
router.put("/:id/read", protect, markAsRead);

export default router;