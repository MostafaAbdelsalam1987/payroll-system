import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);

    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "يجب إرسال معرف المستخدم" });
    }

    // ✅ استرجاع الصلاحيات
    const permissions = await prisma.userPermission.findUnique({
      where: { userId: Number(userId) },
    });

    if (!permissions) {
      return res.status(404).json({ message: "لم يتم العثور على صلاحيات لهذا المستخدم" });
    }

    return res.status(200).json({ permissions });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الصلاحيات:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
}
