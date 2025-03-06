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

    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ message: "يجب إرسال رقم العميل" });
    }

    // ✅ جلب بيانات العميل مع جميع الفواتير (المدفوعة وغير المدفوعة)
    const client = await prisma.client.findUnique({
      where: { id: Number(clientId) },
      include: {
        branches: { select: { id: true, nameAr: true, nameEn: true } },
        invoices: { 
          select: { id: true, month: true, year: true, amount: true, isPaid: true } 
        }, // ✅ جلب كل الفواتير بدون شرط isPaid
      },
    });

    if (!client) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }

    return res.status(200).json({ client });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب بيانات العميل:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
}
