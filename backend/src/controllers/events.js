import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { successResponse, errorResponse } from "../utils/response.js";
import { generateQR } from "../utils/qr.js";

const prisma = new PrismaClient();

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, capacity, category } = req.body;
    // console.log("Event: ", req.body)
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        venue,
        capacity,
        organizerId: req.user.id,
        category: category
      }
    });
    console.log(event)
    successResponse(res, event);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getAllEvents = async (req, res) => {
  const userId = req.user?.id;
  // const { category, search } = req.body;
  // console.log(req.query.search, req.query.category)
  console.log(req.user)
  try {
    const whereClause = {};
    if (req.user?.role != "ADMIN") {
      whereClause.status = 'PUBLISHED'
    }


    if (req.query.category) {
      whereClause.category = req.query.category;
    }

    if (req.query.search) {
      whereClause.description = {
        contains: req.query.search,
        // mode: 'insensitive',
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: { id: true, name: true },
        },
        registrations: {
          select: { userId: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const enriched = events.map(({ registrations, ...event }) => ({
      ...event,
      registeredCount: registrations.length,
      isRegistered: userId
        ? registrations.some((r) => r.userId === userId)
        : false,
    }));

    return res.status(200).json({ data: enriched });
  } catch (error) {
    console.error('getAllEvents error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEventDetails = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        registrations: {
          select: {
            userId: true,

          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log(event, req.user)

    const registeredCount = event.registrations.length;
    const isRegistered = userId
      ? event.registrations.some((r) => r.userId === userId)
      : false;

    const { registrations, ...eventData } = event;

    return res.status(200).json({
      data: {
        ...eventData,
        registeredCount,

        isRegistered,

      },
    });
  } catch (error) {
    console.error('getEventById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || event.organizerId !== req.user.id) {
      return errorResponse(res, "Not authorized", 403);
    }
    const { title, description, date, venue, capacity } = req.body;
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { title, description, date: new Date(date), venue, capacity }
    });
    successResponse(res, updatedEvent);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || event.organizerId !== req.user.id) {
      return errorResponse(res, "Not authorized", 403);
    }
    if (event.status == "PUBLISHED") {
      errorResponse(res, "Publishd Event cannot be deleted!");
    }
    await prisma.event.delete({ where: { id } });
    successResponse(res, { message: "Event deleted" });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || event.organizerId !== req.user.id) {
      return errorResponse(res, "Not authorized", 403);
    }
    if (event.status !== "PUBLISHED") {
      return errorResponse(res, "Event must be approved before publishing", 400);
    }
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: "PUBLISHED" }
    });
    successResponse(res, updatedEvent);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return errorResponse(res, "Event not found", 404);
    }
    if (event.status !== "PUBLISHED") {
      return errorResponse(res, "Registration is only allowed for published events", 400);
    }

    const existingRegistration = await prisma.registration.findFirst({
      where: { userId: req.user.id, eventId: id }
    });
    if (existingRegistration) {
      return errorResponse(res, "You are already registered for this event", 400);
    }

    if (event.capacity) {
      const registrationsCount = await prisma.registration.count({ where: { eventId: id } });
      if (registrationsCount >= event.capacity) {
        return errorResponse(res, "Event capacity has been reached", 400);
      }
    }

    const ticketId = randomUUID();
    const qrCode = await generateQR(ticketId);
    const registration = await prisma.registration.create({
      data: {
        userId: req.user.id,
        eventId: id,
        ticketId,
        qrCode
      }
    });
    successResponse(res, { ticket_id: registration.ticketId, qr_code: qrCode });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.registration.deleteMany({
      where: { userId: req.user.id, eventId: id }
    });
    successResponse(res, { message: "Registration cancelled" });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: { event: true }
    });
    successResponse(res, registrations);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getMyRegistration = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  console.log("requested")
  const registration = await prisma.registration.findFirst({
    where: { eventId, userId },
    select: { ticketId: true, qrCode: true, checkedIn: true },
  });

  if (!registration) return res.status(404).json({ message: 'Not registered' });
  return res.status(200).json({ data: registration });
};

export const getMyEnrolledEvents = async (req, res) => {
  console.log("eve: ", req.user.id)
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            organizer: { select: { name: true } }
          }
        }
      }
    });
    console.log(registrations)
    const events = registrations.map(registration => ({
      ...registration.event,
      registration: {
        id: registration.id,
        ticketId: registration.ticketId,
        qrCode: registration.qrCode,
        checkedIn: registration.checkedIn,
        registeredAt: registration.createdAt
      }
    }));

    successResponse(res, events);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id: ", id)
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return errorResponse(res, "Event not found", 404);
    }
    if (event.organizerId !== req.user.id && req.user.role !== "ADMIN") {
      return errorResponse(res, "Not authorized", 403);
    }

    const participants = await prisma.registration.findMany({
      where: { eventId: id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    successResponse(res, participants);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getOrganizerEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.id },
      include: {
        registrations: {
          select: { id: true }
        }
      }
    });

    const formattedEvents = events.map(event => ({
      ...event,
      registrationCount: event.registrations.length
    }));
    console.log("event :", formattedEvents)
    successResponse(res, formattedEvents);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { organizer: { select: { name: true } } }
    });
    if (!event) {
      return errorResponse(res, "Event not found", 404);
    }
    if (event.organizerId !== req.user.id && req.user.role !== "ADMIN") {
      return errorResponse(res, "Not authorized", 403);
    }

    const registrations = await prisma.registration.count({ where: { eventId: id } });
    const checkins = await prisma.registration.count({ where: { eventId: id, checkedIn: true } });
    const noShows = registrations - checkins;
    const capacityUsed = event.capacity ? registrations : null;
    const availableSeats = event.capacity ? Math.max(event.capacity - registrations, 0) : null;

    successResponse(res, {
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        date: event.date,
        status: event.status,
        capacity: event.capacity,
        organizer: event.organizer.name
      },
      metrics: {
        registrations,
        checkins,
        no_shows: noShows,
        capacity_used: capacityUsed,
        available_seats: availableSeats
      }
    });
  } catch (error) {
    errorResponse(res, error.message);
  }
};