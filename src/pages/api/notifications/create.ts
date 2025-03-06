import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // التحقق من التوكن

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "الطريقة غير مسموحة" });
    }

    try {
        const user = await verifyToken(req, res);
        if (!user) {
            return res.status(401).json({ message: "غير مصرح لك بالوصول" });
        }

        const { userId, messageAr, messageEn } = req.body;

        if (!userId || !messageAr || !messageEn) {
            return res.status(400).json({ message: "يجب إدخال جميع البيانات المطلوبة" });
        }

        // ✅ التحقق من أن المستخدم موجود
        const existingUser = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!existingUser) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        // ✅ إنشاء الإشعار
        const notification = await prisma.notification.create({
            data: {
                userId: Number(userId),
                messageAr,
                messageEn,
                isRead: false,
                createdAt: new Date(),
            },
        });

        return res.status(201).json({ message: "تم إرسال الإشعار بنجاح", notification });
    } catch (error) {
        console.error("❌ خطأ أثناء إرسال الإشعار:", error);
        return res.status(500).json({ message: "حدث خطأ أثناء إرسال الإشعار" });
    }
}
