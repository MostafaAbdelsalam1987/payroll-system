import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// تعطيل bodyParser لدعم رفع الملفات
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  const user = await verifyToken(req, res);
  if (!user) {
    return res.status(401).json({ message: "غير مصرح" });
  }

  try {
    const form = formidable({ multiples: false, uploadDir: "public/uploads", keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: "خطأ أثناء رفع الملف" });
      }

      const payrollId = parseInt(fields.payrollId?.[0] || "0", 10);
      if (!payrollId) {
        return res.status(400).json({ message: "رقم كشف الرواتب مطلوب" });
      }

      // ✅ التأكد من أن الكشف موجود
      const payroll = await prisma.payroll.findUnique({
        where: { id: payrollId },
      });

      if (!payroll) {
        return res.status(404).json({ message: "كشف الرواتب غير موجود" });
      }

      // ✅ التأكد أن الموظف هو من أعاد الإرسال
      if (payroll.employeeId !== user.id) {
        return res.status(403).json({ message: "غير مسموح لك بإعادة إرسال هذا الكشف" });
      }

      // ✅ التأكد أن الكشف كان مرفوضًا
      if (payroll.status !== "مرفوض") {
        return res.status(400).json({ message: "لا يمكن إعادة إرسال هذا الكشف" });
      }

      // ✅ حذف الملف القديم إذا كان موجودًا
      if (payroll.filePath && fs.existsSync(`public${payroll.filePath}`)) {
        fs.unlinkSync(`public${payroll.filePath}`);
      }

      // ✅ حفظ الملف الجديد
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف جديد" });
      }

      const newFilePath = `/uploads/${file.newFilename}`;
      const newFileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${newFilePath}`;

      // ✅ تحديث الكشف في قاعدة البيانات
      await prisma.payroll.update({
        where: { id: payrollId },
        data: {
          filePath: newFilePath,
          fileUrl: newFileUrl,
          status: "قيد المراجعة", // ✅ إعادة الكشف للمراجعة
        },
      });

      return res.status(200).json({ message: "تم إعادة رفع الكشف بنجاح" });
    });
  } catch (error) {
    console.error("❌ خطأ أثناء إعادة إرسال الكشف:", error);
    return res.status(500).json({ message: "حدث خطأ غير متوقع" });
  }
}
