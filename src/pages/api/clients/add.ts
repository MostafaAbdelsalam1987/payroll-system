import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const { nameAr, nameEn, phone, activity, commercialRegistration, taxNumber, email } = req.body;

    // ✅ التحقق من أن جميع الحقول موجودة
    if (!nameAr || !nameEn || !phone || !activity || !commercialRegistration || !taxNumber) {
      return res.status(400).json({ message: "يجب ملء جميع الحقول المطلوبة" });
    }

    // ✅ التحقق من أن رقم الهاتف فريد
    const existingClient = await prisma.client.findUnique({
      where: { phone },
    });

    if (existingClient) {
      return res.status(400).json({ message: "رقم الهاتف مستخدم بالفعل" });
    }

    // ✅ إنشاء العميل الجديد في قاعدة البيانات
    const newClient = await prisma.client.create({
      data: {
        nameAr,
        nameEn,
        phone,
        activity,
        commercialRegistration,
        taxNumber,
        email: email || null, // يمكن أن يكون البريد الإلكتروني اختياريًا
      },
    });

    return res.status(201).json({ message: "تمت إضافة العميل بنجاح", client: newClient });

  } catch (error) {
    console.error("خطأ أثناء إضافة العميل:", error);
    return res.status(500).json({ message: "حدث خطأ غير متوقع" });
  }
}
