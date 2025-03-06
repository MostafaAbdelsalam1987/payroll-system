import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";  // استيراد مكتبة jwt

const prisma = new PrismaClient();

const verifyToken = (token: string) => {
  try {
    // فك التشفير والتحقق من التوكن
    return jwt.verify(token, process.env.JWT_SECRET as string); // تأكد من أن JWT_SECRET موجود في ملف .env
  } catch (error) {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId } = req.body;

  // استخراج التوكن من الـ Authorization header
  const token = req.headers.authorization?.split(" ")[1]; // التوكن بعد كلمة "Bearer"

  if (!token) {
    return res.status(401).json({ error: "يجب إرسال التوكن" });
  }

  const decoded = verifyToken(token);

  if (!decoded || (decoded as any).role !== "admin") {
    return res.status(403).json({ error: "غير مسموح لك بتفعيل الحساب" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActivated: true },
    });

    return res.status(200).json({ message: "تم تفعيل الحساب بنجاح", user });
  } catch (error) {
    return res.status(500).json({ error: "حدث خطأ أثناء تفعيل الحساب" });
  }
}
