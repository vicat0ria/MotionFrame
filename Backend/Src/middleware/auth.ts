import { Request, Response, NextFunction } from "express";
import { IUser } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
