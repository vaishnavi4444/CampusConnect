import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/response.js";

const prisma = new PrismaClient();

export const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type = "DEFAULT" } = req.body;

    if (!userId || !title) {
      return errorResponse(res, "userId and title are required", 400);
    }

    const notification = await prisma.notification.create({
      data: { userId, title, message, type, read: false },
    });

    successResponse(res, notification);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    successResponse(res, notifications);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return errorResponse(res, "Notification not found", 404);
    if (notification.userId !== req.user.id) return errorResponse(res, "Forbidden", 403);

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    successResponse(res, updated);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    successResponse(res, { message: "All notifications marked as read" });
  } catch (error) {
    errorResponse(res, error.message);
  }
};