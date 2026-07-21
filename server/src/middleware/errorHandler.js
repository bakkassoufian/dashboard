export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error(err.stack);
  }
  // 401 / 403 volontairement non loggés en stack (évite le spam après seed ou token périmé)
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
