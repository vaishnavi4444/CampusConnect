import express from "express";
import { getProfile, updateProfile } from "../controllers/user.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:id", protect, getProfile);
router.put("/:id", protect, updateProfile);

export default router;