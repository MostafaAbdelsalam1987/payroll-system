import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ التحقق من المستخدم

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    // ✅ السماح فقط للمحاسب، المدير المالي، ومدير الشركة برؤية الفواتير
    if (!["accountant", "finance_manager", "company_manager", "محاسب", "مدير مالي", "مدير الشركة"].includes(user.role)) {
      return res.status(403).json({ message: "غير مصرح لك بعرض الفواتير" });
    }

    const { clientId, isPaid } = req.query;
    if (!clientId) {
      return res.status(400).json({ message: "يجب إرسال رقم العميل" });
    }

    // ✅ تجهيز شروط البحث
    const whereClause: any = { clientId: Number(clientId) };
    if (isPaid !== undefined) {
      whereClause.isPaid = isPaid === "true"; // تحويل النص إلى Boolean
    }

    // ✅ جلب الفواتير
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      select: {
        id: true,
        month: true,
        year: true,
        amount: true,
        isPaid: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ invoices });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الفواتير:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
}
