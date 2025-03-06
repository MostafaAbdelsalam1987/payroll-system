import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // التحقق من التوكن واسترجاع بيانات المستخدم
    const decoded = verifyToken(req, res);

    if (!decoded || !decoded.role) {
      return res.status(401).json({ error: "Invalid or missing token" });
    }

    // السماح فقط لمدير النظام (Admin) بإجراء التعديلات
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "غير مسموح لك بتعديل بيانات المستخدم" });
    }

    const { userId, nameAr, nameEn, email, role } = req.body;

    // التأكد من أن البيانات الجديدة صحيحة
    if (!userId || (!nameAr && !nameEn && !email && !role)) {
      return res.status(400).json({ error: "يجب إدخال بيانات صحيحة لتعديل المستخدم" });
    }

    // تحديث بيانات المستخدم
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nameAr: nameAr || undefined,
        nameEn: nameEn || undefined,
        email: email || undefined,
        role: role || undefined,
      },
    });

    return res.status(200).json({ message: "تم تحديث بيانات المستخدم بنجاح", user: updatedUser });
  } catch (error) {
    console.error("خطأ أثناء تعديل المستخدم:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء تعديل بيانات المستخدم" });
  }
}
