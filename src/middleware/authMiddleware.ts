import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ============================================================
// EXTEND EXPRESS REQUEST
// Adds user data to req object after token is verified
// ============================================================
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ============================================================
// PROTECT MIDDLEWARE — verifies JWT token
// Add to any route that needs a logged in user
// ============================================================
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Token comes in header as: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set");

    // Verify the token
    const decoded = jwt.verify(token, secret) as {
      id: string;
      role: string;
    };

    // Attach user info to the request
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized — invalid or expired token",
    });
  }
};

// ============================================================
// ADMIN MIDDLEWARE — restricts route to admin only
// Always use AFTER protect: protect, adminOnly
// ============================================================
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied — admin only",
    });
    return;
  }
  next();
};