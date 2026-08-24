import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Too many requests",
    code: "RATE_LIMIT_EXCEEDED",
    details: {},
  },
  standardHeaders: true,
  legacyHeaders: false,
});