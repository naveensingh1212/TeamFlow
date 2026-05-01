/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for repeated try-catch blocks
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
