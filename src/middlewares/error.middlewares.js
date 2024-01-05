
export const errorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Set the response status code and message
  const statusCode =  err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message: message,
    },
  });
};
