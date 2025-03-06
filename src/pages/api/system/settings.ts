import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { UserRole } from "@prisma/client"; // ✅ استيراد Enum الأدوار

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const settings = await prisma.systemSettings.findFirst();

      if (!settings) {
        return res.status(404).json({ message: "لم يتم العثور على إعدادات النظام" });
      }

      return res.status(200).json({ settings });
    }

    if (req.method === "PUT") {
      // ✅ التحقق من صلاحية المستخدم باستخدام Enum
      const user = await verifyToken(req, res);
      if (!user || user.role !== UserRole.admin) {
        return res.status(403).json({ message: "غير مصرح لك بتعديل إعدادات النظام" });
      }

      const { companyNameAr, companyNameEn, logoUrl, defaultLanguage } = req.body;

      if (!companyNameAr || !companyNameEn || !defaultLanguage) {
        return res.status(400).json({ message: "يجب إدخال جميع الحقول المطلوبة" });
      }

      const updatedSettings = await prisma.systemSettings.updateMany({
        data: { companyNameAr, companyNameEn, logoUrl, defaultLanguage },
      });

      return res.status(200).json({ message: "تم تحديث إعدادات النظام بنجاح", updatedSettings });
    }

    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  } catch (error) {
    console.error("❌ خطأ أثناء التعامل مع إعدادات النظام:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تنفيذ العملية" });
  }
}
