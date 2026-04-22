import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import eventRoutes from "./routes/events.js";
import checkinRoutes from "./routes/checkin.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import cron from "node-cron";
import { sendEventReminders } from "./jobs/eventReminderJob.js";

cron.schedule("* * * * *", async () => {
  await sendEventReminders();
});


const app = express();
app.use(cors({
  origin: true,   
  credentials: true
}));

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/checkin", checkinRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", uploadRoutes);

export default app;