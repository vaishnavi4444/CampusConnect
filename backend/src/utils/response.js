export const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
};

export const errorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    data: null,
    error: message
  });
};