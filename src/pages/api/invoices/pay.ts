import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ حماية الـ API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    console.log("🔹 المستخدم الذي يحاول تأكيد الدفع:", user);

    // ✅ السماح فقط للمحاسب والمدير المالي بتأكيد الدفع
    const allowedRoles = ["accountant", "finance_manager", "محاسب", "مدير مالي"];
    if (!allowedRoles.includes(user.role)) {
      console.error("❌ المستخدم ليس لديه الصلاحيات لتأكيد الدفع:", user.role);
      return res.status(403).json({ message: "غير مصرح لك بتأكيد الدفع" });
    }

    const { invoiceId } = req.body;
    if (!invoiceId) {
      console.error("❌ لم يتم إرسال رقم الفاتورة");
      return res.status(400).json({ message: "يجب إرسال رقم الفاتورة" });
    }

    // ✅ التحقق من وجود الفاتورة
    const invoice = await prisma.invoice.findUnique({ where: { id: Number(invoiceId) } });
    if (!invoice) {
      console.error("❌ الفاتورة غير موجودة:", invoiceId);
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    // ✅ تحديث حالة الفاتورة إلى "مدفوعة"
    await prisma.invoice.update({
      where: { id: Number(invoiceId) },
      data: { isPaid: true },
    });

    console.log("✅ تم تأكيد دفع الفاتورة:", invoiceId);

    return res.status(200).json({ message: "تم تأكيد دفع الفاتورة بنجاح" });
  } catch (error) {
    console.error("❌ خطأ أثناء تأكيد دفع الفاتورة:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تأكيد الدفع" });
  }
}
