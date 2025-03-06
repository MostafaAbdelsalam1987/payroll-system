import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    
    // ✅ السماح فقط لمدير النظام بإضافة الفروع
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بإضافة الفروع" });
    }

    const { nameAr, nameEn, location } = req.body;

    if (!nameAr || !nameEn || !location) {
      return res.status(400).json({ message: "يجب إدخال جميع البيانات المطلوبة" });
    }

    // ✅ إضافة الفرع
    const newBranch = await prisma.companyBranch.create({
      data: { nameAr, nameEn, location },
    });

    return res.status(201).json({ message: "تمت إضافة الفرع بنجاح", newBranch });
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة الفرع:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إضافة الفرع" });
  }
}
