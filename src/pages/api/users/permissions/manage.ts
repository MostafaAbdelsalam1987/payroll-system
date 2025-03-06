import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth"; 
import { UserRole } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);

    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    // ✅ السماح فقط لمدير النظام بتعديل الصلاحيات
    if (user.role !== UserRole.admin) {
      return res.status(403).json({ message: "غير مصرح لك بإدارة الصلاحيات" });
    }
    


    const { userId, permissions } = req.body;

    if (!userId || typeof userId !== "number" || typeof permissions !== "object") {
      return res.status(400).json({ message: "بيانات غير صحيحة" });
    }

    // ✅ تحديث الصلاحيات
    const updatedPermissions = await prisma.userPermission.upsert({
      where: { userId },
      update: { ...permissions },
      create: { userId, ...permissions },
    });

    return res.status(200).json({ message: "تم تعديل الصلاحيات بنجاح", updatedPermissions });
  } catch (error) {
    console.error("❌ خطأ أثناء تعديل الصلاحيات:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تعديل الصلاحيات" });
  }
}
