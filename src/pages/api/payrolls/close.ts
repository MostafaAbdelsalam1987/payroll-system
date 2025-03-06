import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ التحقق من المستخدم

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    // ✅ التحقق من التوكن وصلاحيات المستخدم
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    // ✅ السماح فقط لمدير الشركة بإغلاق الكشف
    if (user.role !== "company_manager") {
      return res.status(403).json({ message: "غير مصرح لك بإغلاق الكشوف" });
    }

    const { payrollId, transferAmount, transferDate } = req.body;

    // ✅ التحقق من وجود الكشف
    const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
    if (!payroll) {
      return res.status(404).json({ message: "كشف الرواتب غير موجود" });
    }

    // ✅ تحديث حالة الكشف إلى "مغلق"
    const updatedPayroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: "مغلق",
        transferAmount: parseFloat(transferAmount), // تأكد من أن القيمة رقمية
        transferDate: new Date(transferDate),
      },
    });

    return res.status(200).json({
      message: "تم إغلاق الكشف بنجاح",
      payroll: updatedPayroll,
    });
  } catch (error) {
    console.error("❌ خطأ أثناء إغلاق الكشف:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إغلاق الكشف" });
  }
}
