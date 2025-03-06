import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // التحقق من التوكن

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ message: "الطريقة غير مسموحة" });
    }

    try {
        const user = await verifyToken(req, res);
        if (!user) {
            return res.status(401).json({ message: "غير مصرح لك بالوصول" });
        }

        const { notificationId } = req.query;
        if (!notificationId) {
            return res.status(400).json({ message: "يجب إرسال معرف الإشعار" });
        }

        await prisma.notification.delete({
            where: { id: Number(notificationId) },
        });

        return res.status(200).json({ message: "تم حذف الإشعار بنجاح" });
    } catch (error) {
        console.error("❌ خطأ أثناء حذف الإشعار:", error);
        return res.status(500).json({ message: "حدث خطأ أثناء حذف الإشعار" });
    }
}
