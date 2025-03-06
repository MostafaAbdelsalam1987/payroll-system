import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import formidable, { File } from "formidable";
import path from "path";
import fs from "fs";

// تعطيل الـ bodyParser لاستخدام formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: "حدث خطأ أثناء رفع الملف" });
      }

      const payrollId = parseInt(fields.payrollId?.[0] || "0", 10);
      if (!payrollId) {
        return res.status(400).json({ message: "يجب توفير معرف كشف الرواتب" });
      }

      // البحث عن كشف الرواتب
      const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
      if (!payroll) {
        return res.status(404).json({ message: "كشف الرواتب غير موجود" });
      }

      let filePath = payroll.filePath;
      let fileUrl = payroll.fileUrl;

      // ✅ التأكد من أن `files.file` ليس مصفوفة قبل التعامل معه
      const uploadedFile = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : null;

      // إذا تم رفع ملف جديد، نقوم بحذف الملف القديم وتحديث المسار
      if (uploadedFile) {
        const newFilePath = `/uploads/${uploadedFile.newFilename}`;
        const newFileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${newFilePath}`;

        // حذف الملف القديم إذا كان موجودًا
        const oldFilePath = path.join(process.cwd(), "public", payroll.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }

        filePath = newFilePath;
        fileUrl = newFileUrl;
      }

      // استخراج البيانات الجديدة
      const clientBranchId = parseInt(fields.clientBranchId?.[0] || `${payroll.clientBranchId}`, 10);
      const periodFrom = new Date(fields.periodFrom?.[0] || payroll.periodFrom);
      const periodTo = new Date(fields.periodTo?.[0] || payroll.periodTo);
      const clientPaid = fields.clientPaid ? fields.clientPaid[0] === "true" : payroll.clientPaid;
      const notes = fields.notes?.[0] || payroll.notes;

      // تحديث البيانات في قاعدة البيانات
      const updatedPayroll = await prisma.payroll.update({
        where: { id: payrollId },
        data: {
          clientBranch: { connect: { id: clientBranchId } },
          periodFrom,
          periodTo,
          clientPaid,
          filePath, // ✅ تحديث مسار الملف
          fileUrl, // ✅ تحديث رابط التحميل
          notes,
        },
      });

      return res.status(200).json({ message: "تم تعديل الكشف بنجاح!", payroll: updatedPayroll });
    });
  } catch (error) {
    console.error("خطأ:", error);
    return res.status(500).json({ message: "حدث خطأ غير متوقع" });
  }
}
