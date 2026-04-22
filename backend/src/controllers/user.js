import { PrismaClient } from "@prisma/client";
import { successResponse, errorResponse } from "../utils/response.js";

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true }
    });
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, error.message);
  }
};