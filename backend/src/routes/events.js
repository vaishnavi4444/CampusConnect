import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventDetails,
  updateEvent,
  deleteEvent,
  publishEvent,
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getMyEnrolledEvents,
  getOrganizerEvents,
  getParticipants,
  getEventStats,
  getMyRegistration
} from "../controllers/events.js";
import { protect } from "../middlewares/auth.js";
import { authorize } from "../middlewares/role.js";

const router = express.Router();

router.post("/", protect, authorize("ORGANIZER"), createEvent);
router.get("/", protect, getAllEvents);

router.get("/my", protect, authorize("ORGANIZER"), getOrganizerEvents);
router.get("/enrolled", protect, authorize("STUDENT"), getMyEnrolledEvents);
router.get("/registrations/me", protect, authorize("STUDENT"), getMyRegistrations);
router.get("/registrations/:eventId", protect, authorize("STUDENT"), getMyRegistration)

router.get("/:id", protect, getEventDetails);

router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.put("/:id/publish", protect, publishEvent);

router.post("/:id/register", protect, authorize("STUDENT"), registerForEvent);
router.delete("/:id/register", protect, authorize("STUDENT"), cancelRegistration);
router.get("/:id/participants", protect, authorize("ORGANIZER", "ADMIN"), getParticipants);

router.get("/:id/stats", protect, authorize("ORGANIZER", "ADMIN"), getEventStats);
export default router;