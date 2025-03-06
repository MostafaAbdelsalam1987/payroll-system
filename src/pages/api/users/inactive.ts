import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../../../utils/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId } = req.body;

  // التحقق من أن المستخدم الذي يطلب التفعيل أو التعطيل هو Admin
  const decoded = verifyToken(req, res); // استخدام الدالة بعد تعديلها

  if (!decoded || decoded.role !== "admin") {
    return res.status(403).json({ error: "غير مسموح لك بتعطيل الحساب" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActivated: false },
    });

    return res.status(200).json({ message: "تم تعطيل الحساب بنجاح", user });
  } catch (error) {
    return res.status(500).json({ error: "حدث خطأ أثناء تعطيل الحساب" });
  }
}
