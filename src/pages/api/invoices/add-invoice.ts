import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    console.log("🔹 المستخدم الذي يحاول إضافة الفاتورة:", user);

    // ✅ السماح فقط للمحاسب والمدير المالي بإضافة الفواتير
    const allowedRoles = ["محاسب", "مدير مالي", "accountant", "finance_manager"];
    if (!allowedRoles.includes(user.role)) {
      console.error("❌ المستخدم ليس لديه الصلاحيات المطلوبة:", user.role);
      return res.status(403).json({ message: "غير مصرح لك بإضافة الفواتير" });
    }

    const { clientId, month, year, amount } = req.body;

    // ✅ التحقق من القيم المرسلة
    if (!clientId || !month || !year || !amount) {
      console.error("❌ بيانات غير مكتملة:", { clientId, month, year, amount });
      return res.status(400).json({ message: "يجب إدخال جميع البيانات المطلوبة" });
    }

    // ✅ التحقق من أن العميل موجود
    const client = await prisma.client.findUnique({ where: { id: Number(clientId) } });
    if (!client) {
      console.error("❌ العميل غير موجود:", clientId);
      return res.status(404).json({ message: "العميل غير موجود" });
    }

    // ✅ إنشاء الفاتورة
    const invoice = await prisma.invoice.create({
      data: {
        clientId: Number(clientId),
        month: Number(month),
        year: Number(year),
        amount: Number(amount),
        isPaid: false, // ✅ الفاتورة تبدأ كغير مدفوعة
      },
    });

    console.log("✅ تمت إضافة الفاتورة بنجاح:", invoice);

    // ✅ إرسال إشعار للمحاسب
    await prisma.notification.create({
      data: {
        userId: user.id, // المحاسب الذي أضاف الفاتورة
        messageAr: `تمت إضافة فاتورة جديدة للعميل ${client.nameAr} بمبلغ ${amount} ريال.`,
        messageEn: `A new invoice has been added for client ${client.nameEn} with an amount of ${amount} SAR.`,
        isRead: false,
      },
    });

    return res.status(201).json({ message: "تمت إضافة الفاتورة وإرسال إشعار بنجاح", invoice });
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة الفاتورة:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء إضافة الفاتورة" });
  }
}
