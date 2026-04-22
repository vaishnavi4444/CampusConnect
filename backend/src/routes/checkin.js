import express from "express";
import { validateQR, confirmCheckin } from "../controllers/checkin.js";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/role.js";

const router = express.Router();

router.post("/", protect, authorize("ORGANIZER", "ADMIN"), validateQR);
router.post("/confirm", protect, authorize("ORGANIZER", "ADMIN"), confirmCheckin);

export default router;