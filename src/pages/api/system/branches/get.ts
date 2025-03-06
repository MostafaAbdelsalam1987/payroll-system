import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth"; // ✅ حماية الـ API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "الطريقة غير مسموحة" });
    }

    try {
        // ✅ التحقق من المستخدم
        const user = await verifyToken(req, res);
        if (!user) {
            return res.status(401).json({ message: "غير مصرح لك بالوصول" });
        }

        // ✅ جلب جميع الفروع
        const branches = await prisma.companyBranch.findMany({
            select: {
                id: true,
                nameAr: true,
                nameEn: true,
                location: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({ branches });
    } catch (error) {
        console.error("❌ خطأ أثناء جلب الفروع:", error);
        return res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
}
