import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../middleware/authMiddleware"; // ✅ تأكد من تصدير النوع

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

// ✅ تسجيل مستخدم جديد
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { nameAr, nameEn, username, email, phone, password, role } = req.body;

  // التحقق من عدم تكرار البريد أو اسم المستخدم
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existingUser) {
    res.status(400).json({ error: "اسم المستخدم أو البريد الإلكتروني مسجل بالفعل" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { nameAr, nameEn, username, email, phone, password: hashedPassword, role },
  });

  res.status(201).json(newUser);
});

// ✅ تسجيل الدخول
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: "7d" });

  res.json({ token, user });
});

// ✅ الحصول على بيانات المستخدم الحالي
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      username: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }

  res.json(user);
});
