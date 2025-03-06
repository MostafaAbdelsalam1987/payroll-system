import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth";

// ✅ دالة إرسال الإشعارات
async function sendNotification(userId: number, messageAr: string, messageEn: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        messageAr,
        messageEn,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("❌ خطأ أثناء إرسال الإشعار:", error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const { payrollId, status, comments, fileUrl } = req.body;

    // ✅ التحقق من صحة payrollId
    if (!payrollId || isNaN(Number(payrollId))) {
      return res.status(400).json({ message: "يجب إرسال معرف كشف الرواتب بشكل صحيح" });
    }

    // ✅ التحقق من وجود كشف الرواتب وجلب بيانات الموظف المرتبط به
    const payroll = await prisma.payroll.findUnique({
      where: { id: Number(payrollId) },
      include: { employee: true },
    });

    if (!payroll) {
      return res.status(404).json({ message: "كشف الرواتب غير موجود" });
    }

    // ✅ التحقق من صلاحيات المراجع (يدعم العربية والإنجليزية)
    const allowedRoles = ["محاسب", "مدير مالي", "accountant", "finance_manager"];
    if (!allowedRoles.includes(user.role.trim())) {
      return res.status(403).json({ message: "غير مسموح لك بمراجعة كشوف الرواتب" });
    }

    // ✅ حفظ مراجعة الكشف
    await prisma.payrollReview.create({
      data: {
        payrollId: Number(payrollId),
        reviewerId: user.id,
        role: user.role,
        status,
        comments,
        fileUrl,
      },
    });

    // ✅ تحديث حالة الكشف
    await prisma.payroll.update({
      where: { id: Number(payrollId) },
      data: { status },
    });

    // ✅ إرسال إشعار للموظف صاحب الكشف
    await sendNotification(
      payroll.employee.id,
      `📢 تم تحديث حالة كشف الرواتب الخاص بك إلى: ${status}`,
      `📢 Your payroll status has been updated to: ${status}`
    );

    return res.status(200).json({ message: "تمت مراجعة الكشف بنجاح" });
  } catch (error) {
    console.error("❌ خطأ أثناء مراجعة الكشف:", error);
    return res.status(500).json({ message: "حدث خطأ غير متوقع" });
  }
}
