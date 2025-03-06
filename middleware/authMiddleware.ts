import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

// ✅ تعريف نوع الطلب المصادق عليه
export interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

// ✅ ميدل وير لحماية المسارات والتحقق من التوكن
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401);
      return next(new Error("غير مصرح، لا يوجد توكن"));
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401);
      return next(new Error("المستخدم غير موجود"));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(401);
    return next(new Error("توكن غير صالح"));
  }
};
