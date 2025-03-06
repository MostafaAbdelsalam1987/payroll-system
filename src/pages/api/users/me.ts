import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ تأكد أن المسار صحيح

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" });
  }

  try {
    // ✅ التحقق من التوكن
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ error: "غير مصرح لك بالوصول" });
    }

    // ✅ جلب بيانات المستخدم من قاعدة البيانات
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        email: true,
        role: true,
        companyBranchId: true,
      },
    });

    if (!foundUser) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    return res.status(200).json({ user: foundUser });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب بيانات المستخدم:", error);
    return res.status(500).json({ error: "حدث خطأ داخلي في السيرفر" });
  }
}
