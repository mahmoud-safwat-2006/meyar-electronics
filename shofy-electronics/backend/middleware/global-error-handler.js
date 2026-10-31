const { secret } = require('../config/secret');
const ApiError = require('../errors/api-error');
const handleCastError = require('../errors/handle-cast-error');
const handleValidationError = require('../errors/handle-validation-error');

const globalErrorHandler = (error, req, res, next) => {
  // Prevent sending duplicate headers if response has already started
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = 500;
  let message = 'Something went wrong !';
  let errorMessages = [];

  // 1. Mongoose Validation Error
  if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // 2. Mongoose CastError (Invalid ObjectId)
  else if (error?.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // 3. MongoDB Duplicate Key Error (E11000)
  else if (error?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    const value = error.keyValue ? error.keyValue[field] : '';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists!`;
    errorMessages = [
      {
        path: field,
        message,
      },
    ];
  }
  // 4. JWT Authentication Errors
  else if (error?.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token, please log in again';
    errorMessages = [{ path: '', message }];
  } else if (error?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired, please log in again';
    errorMessages = [{ path: '', message }];
  }
  // 5. Multer File Upload Errors
  else if (error?.name === 'MulterError') {
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Maximum allowed size is 10MB.';
    } else {
      message = error.message;
    }
    errorMessages = [{ path: '', message }];
  }
  // 6. Custom ApiError
  else if (error instanceof ApiError) {
    statusCode = error?.statusCode || 500;
    message = error.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
  }
  // 7. General Error
  else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: secret?.env !== 'production' ? error?.stack : undefined,
  });
};

module.exports = globalErrorHandler;