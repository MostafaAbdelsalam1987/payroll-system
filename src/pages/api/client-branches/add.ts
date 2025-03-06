import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const { clientId, nameAr, nameEn, location } = req.body;

    // التحقق من القيم المطلوبة
    if (!clientId || !nameAr || !nameEn || !location) {
      return res.status(400).json({ message: "يجب إدخال جميع البيانات المطلوبة" });
    }

    // التأكد من أن العميل موجود
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }

    // إنشاء الفرع الجديد
    const newBranch = await prisma.clientBranch.create({
      data: {
        nameAr,
        nameEn,
        location,
        client: { connect: { id: clientId } }, // ربط الفرع بالعميل
      },
    });

    return res.status(201).json({ message: "تمت إضافة الفرع بنجاح!", branch: newBranch });
  } catch (error) {
    console.error("خطأ أثناء إضافة الفرع:", error);
    return res.status(500).json({ message: "حدث خطأ غير متوقع" });
  }
}
