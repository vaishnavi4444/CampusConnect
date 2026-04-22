import { successResponse, errorResponse } from "../utils/response.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No file uploaded", 400);
    }
    successResponse(res, { fileUrl: req.file.path });
  } catch (error) {
    errorResponse(res, error.message);
  }
};