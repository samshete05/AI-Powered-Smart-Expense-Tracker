import { env } from "../config/env.js";

export function attachAuthContext(req, _res, next) {
  req.auth = {
    clerkUserId: req.header("x-clerk-user-id") || req.header("x-user-id") || env.devClerkUserId,
    email: req.header("x-user-email") || env.devUserEmail,
    fullName: req.header("x-user-name") || env.devUserName
  };

  next();
}
