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

    // ✅ السماح فقط للمحاسب أو المدير المالي بتأكيد سداد الفاتورة
    if (!["accountant", "finance_manager", "مدير مالي", "محاسب"].includes(user.role)) {
      return res.status(403).json({ message: "غير مصرح لك بتأكيد سداد الفاتورة" });
    }

    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ message: "يجب إرسال معرف الفاتورة" });
    }

    // ✅ التحقق من وجود الفاتورة
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(invoiceId) },
    });

    if (!invoice) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }

    if (invoice.isPaid) {
      return res.status(400).json({ message: "الفاتورة مدفوعة بالفعل" });
    }

    // ✅ تحديث حالة الفاتورة إلى "مدفوعة"
    const updatedInvoice = await prisma.invoice.update({
      where: { id: Number(invoiceId) },
      data: { isPaid: true },
    });

    return res.status(200).json({ message: "تم تأكيد سداد الفاتورة بنجاح", invoice: updatedInvoice });

  } catch (error) {
    console.error("❌ خطأ أثناء تأكيد سداد الفاتورة:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تأكيد سداد الفاتورة" });
  }
}
