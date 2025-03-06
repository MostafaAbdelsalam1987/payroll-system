import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    // ✅ جلب الإشعارات الخاصة بالمستخدم الحالي فقط
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الإشعارات:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب الإشعارات" });
  }
}
