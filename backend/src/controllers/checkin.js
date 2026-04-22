import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/response.js";

const prisma = new PrismaClient();

export const validateQR = async (req, res) => {
  try {
    const { eventId, qrData } = req.body;

    if (!eventId || !qrData) {
      return errorResponse(res, "eventId and qrData are required", 400);
    }

    const registration = await prisma.registration.findFirst({
      where: {
        ticketId: qrData,
        eventId: eventId,
      },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, venue: true, date: true } },
      },
    });

    if (!registration) {
      return errorResponse(res, "Invalid ticket for this event", 400);
    }

    return successResponse(res, {
      isValid: true,
      alreadyCheckedIn: registration.checkedIn,
      attendee: {
        name: registration.user.name,
        email: registration.user.email,
      },
      event: {
        id: registration.eventId,
        title: registration.event.title,
        venue: registration.event.venue,
        date: registration.event.date,
      },
      ticketId: registration.ticketId,
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const confirmCheckin = async (req, res) => {
  try {
    const { ticketId } = req.body;
    console.log(req.body)
    if (!ticketId) {
      return errorResponse(res, "ticketId are required", 400);
    }

    const registration = await prisma.registration.findFirst({
      where: {
        ticketId: ticketId,
      },
    });

    if (!registration) {
      return errorResponse(res, "Registration not found", 400);
    }

    if (registration.checkedIn) {
      return errorResponse(res, "Already checked in", 400);
    }

    await prisma.registration.update({
      where: {
        ticketId: registration.ticketId, 
      },
      data: {
        checkedIn: true,
      },
    });

    return successResponse(res, {
      message: "Check-in confirmed",
    });
  } catch (error) {
    return errorResponse(res, error.message);
  }
};