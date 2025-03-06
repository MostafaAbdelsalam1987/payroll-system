import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    const { notificationId } = req.body;

    // ✅ التحقق من صحة معرف الإشعار
    if (!notificationId || isNaN(Number(notificationId))) {
      return res.status(400).json({ message: "يجب إرسال معرف الإشعار بشكل صحيح" });
    }

    // ✅ التحقق من أن الإشعار موجود ومملوك للمستخدم
    const notification = await prisma.notification.findUnique({
      where: { id: Number(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ message: "الإشعار غير موجود" });
    }

    if (notification.userId !== user.id) {
      return res.status(403).json({ message: "غير مصرح لك بتحديث هذا الإشعار" });
    }

    // ✅ تحديث حالة الإشعار إلى "مقروء"
    await prisma.notification.update({
      where: { id: Number(notificationId) },
      data: { isRead: true },
    });

    return res.status(200).json({ message: "تم تحديث حالة الإشعار إلى مقروء" });
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث حالة الإشعار:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث حالة الإشعار" });
  }
}
