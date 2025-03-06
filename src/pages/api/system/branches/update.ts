import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);

    // ✅ السماح فقط لمدير النظام بتعديل الفروع
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بتعديل الفروع" });
    }

    const { branchId, nameAr, nameEn, location } = req.body;

    if (!branchId || !nameAr || !nameEn || !location) {
      return res.status(400).json({ message: "يجب إدخال جميع البيانات المطلوبة" });
    }

    // ✅ التحقق من وجود الفرع
    const existingBranch = await prisma.companyBranch.findUnique({
      where: { id: Number(branchId) },
    });

    if (!existingBranch) {
      return res.status(404).json({ message: "الفرع غير موجود" });
    }

    // ✅ تحديث بيانات الفرع
    const updatedBranch = await prisma.companyBranch.update({
      where: { id: Number(branchId) },
      data: { nameAr, nameEn, location },
    });

    return res.status(200).json({ message: "تم تعديل بيانات الفرع بنجاح", updatedBranch });
  } catch (error) {
    console.error("❌ خطأ أثناء تعديل بيانات الفرع:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تعديل بيانات الفرع" });
  }
}
