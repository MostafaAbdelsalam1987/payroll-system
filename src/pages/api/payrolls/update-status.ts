import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const { payrollId, status, notes } = req.body;

    // ✅ التحقق من صحة البيانات
    if (!payrollId || !status) {
      return res.status(400).json({ message: "البيانات غير مكتملة" });
    }

    // ✅ التأكد أن الحالة صحيحة
    const validStatuses = ["approved", "modified", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "حالة غير صحيحة" });
    }

    // ✅ التحقق من وجود كشف الرواتب
    const payroll = await prisma.payroll.findUnique({ where: { id: Number(payrollId) } });
    if (!payroll) {
      return res.status(404).json({ message: "كشف الرواتب غير موجود" });
    }

    // ✅ تحديث الحالة
    const updatedPayroll = await prisma.payroll.update({
      where: { id: Number(payrollId) },
      data: { status, notes },
    });

    return res.status(200).json({ message: "تم تحديث الحالة بنجاح", payroll: updatedPayroll });
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث الحالة:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تحديث البيانات" });
  }
}
