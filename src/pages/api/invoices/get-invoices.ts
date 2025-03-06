import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ حماية الـ API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    console.log("🔹 المستخدم الذي يحاول جلب الفواتير:", user);

    // ✅ السماح فقط للمحاسب والمدير المالي ومدير الشركة برؤية الفواتير
    const allowedRoles = ["accountant", "finance_manager", "company_manager", "محاسب", "مدير مالي", "مدير الشركة"];
    if (!allowedRoles.includes(user.role)) {
      console.error("❌ المستخدم ليس لديه الصلاحيات لرؤية الفواتير:", user.role);
      return res.status(403).json({ message: "غير مصرح لك بعرض الفواتير" });
    }

    const { clientId } = req.query;
    if (!clientId) {
      console.error("❌ لم يتم إرسال رقم العميل");
      return res.status(400).json({ message: "يجب إرسال رقم العميل" });
    }

    // ✅ جلب الفواتير المستحقة للعميل المحدد
    const invoices = await prisma.invoice.findMany({
      where: { clientId: Number(clientId), isPaid: false },
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

    console.log("✅ الفواتير المستحقة للعميل:", invoices);

    return res.status(200).json({ invoices });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الفواتير:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
}
