import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ استخدام الـ Middleware

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    // ✅ التحقق من المستخدم
    const user = await verifyToken(req, res);
    if (!user || user.role !== "company_manager") {
      return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
    }

    const { payrollId, action, amountTransferred, transferDate, notes } = req.body;

    if (!payrollId || !action) {
      return res.status(400).json({ message: "بيانات غير مكتملة" });
    }

    if (action === "close") {
      if (!amountTransferred || !transferDate) {
        return res.status(400).json({ message: "يجب إدخال مبلغ وتاريخ التحويل عند إغلاق الكشف" });
      }

      await prisma.payroll.update({
        where: { id: payrollId },
        data: {
          status: "تم التحويل",
          notes: `تم التحويل بمبلغ ${amountTransferred} بتاريخ ${transferDate}`,
        },
      });

      return res.status(200).json({ message: "تم إغلاق كشف الرواتب بنجاح" });
    }

    if (action === "reopen") {
      await prisma.payroll.update({
        where: { id: payrollId },
        data: { status: "قيد المراجعة", notes },
      });

      return res.status(200).json({ message: "تم إعادة الكشف للمراجعة بنجاح" });
    }

    return res.status(400).json({ message: "إجراء غير صالح" });
  } catch (error) {
    console.error("❌ خطأ أثناء تنفيذ العملية:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تنفيذ الإجراء" });
  }
}
