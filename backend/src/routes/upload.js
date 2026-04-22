import express from "express";
import { uploadFile } from "../controllers/upload.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, uploadFile);

export default router;