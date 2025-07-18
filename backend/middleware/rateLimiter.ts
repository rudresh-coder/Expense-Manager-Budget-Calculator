import rateLimit from "express-rate-limit";

// Limit to 5 requests per hour per IP for password reset endpoints
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many password reset requests from this IP, please try again after an hour." },
  standardHeaders: true, 
  legacyHeaders: false, 
});