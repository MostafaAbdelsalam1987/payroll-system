import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);

    // ✅ السماح فقط لمدير النظام بحذف الفروع
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح لك بحذف الفروع" });
    }

    const { branchId } = req.body;

    if (!branchId) {
      return res.status(400).json({ message: "يجب إرسال رقم الفرع" });
    }

    // ✅ التحقق من وجود الفرع
    const existingBranch = await prisma.companyBranch.findUnique({
      where: { id: Number(branchId) },
    });

    if (!existingBranch) {
      return res.status(404).json({ message: "الفرع غير موجود" });
    }

    // ✅ تنفيذ Soft Delete بإخفاء الفرع بدلاً من حذفه نهائيًا
    await prisma.companyBranch.update({
      where: { id: Number(branchId) },
      data: { isDeleted: true },
    });

    return res.status(200).json({ message: "تم حذف الفرع بنجاح" });
  } catch (error) {
    console.error("❌ خطأ أثناء حذف الفرع:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء حذف الفرع" });
  }
}
