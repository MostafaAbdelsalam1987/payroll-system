import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ حماية الـ API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    // ✅ السماح فقط للمحاسب، المدير المالي، ومدير الشركة بتعديل بيانات العميل
    if (!["accountant", "finance_manager", "company_manager"].includes(user.role)) {
      return res.status(403).json({ message: "غير مصرح لك بتعديل بيانات العميل" });
    }

    const { clientId, nameAr, nameEn, address, city, contractDate, commercialRegistration, taxNumber, isActive, dueAmount, guardCount, additionalNotes } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: "يجب إرسال معرف العميل" });
    }

    // ✅ التحقق من وجود العميل
    const client = await prisma.client.findUnique({ where: { id: Number(clientId) } });
    if (!client) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }

    // ✅ تحديث بيانات العميل
    const updatedClient = await prisma.client.update({
      where: { id: Number(clientId) },
      data: {
        nameAr: nameAr || client.nameAr,
        nameEn: nameEn || client.nameEn,
        address: address || client.address,
        city: city || client.city,
        contractDate: contractDate ? new Date(contractDate) : client.contractDate,
        commercialRegistration: commercialRegistration || client.commercialRegistration,
        taxNumber: taxNumber || client.taxNumber,
        isActive: isActive !== undefined ? Boolean(isActive) : client.isActive,
        dueAmount: dueAmount !== undefined ? Number(dueAmount) : client.dueAmount,
        guardCount: guardCount !== undefined ? Number(guardCount) : client.guardCount,
        additionalNotes: additionalNotes || client.additionalNotes,
      },
    });

    return res.status(200).json({ message: "تم تحديث بيانات العميل بنجاح", client: updatedClient });

  } catch (error) {
    console.error("❌ خطأ أثناء تحديث بيانات العميل:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث البيانات" });
  }
}
