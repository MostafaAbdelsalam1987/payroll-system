import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import path from "path";
import fs from "fs";

// ✅ تعطيل `bodyParser` حتى نستقبل الملفات
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    // 🔹 تجهيز مجلد رفع الملفات
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error("❌ خطأ أثناء رفع الملف:", err);
          return res.status(500).json({ message: "حدث خطأ أثناء رفع الملف" });
        }

        console.log("✅ البيانات المستلمة:", { fields, files });

        // ✅ التأكد من وجود الملف
        if (!files.file) {
          console.error("❌ لم يتم رفع أي ملف");
          return res.status(400).json({ message: "لم يتم رفع أي ملف" });
        }

        // ✅ التأكد من أن `file` ليس مصفوفة
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        const file = fileArray[0]; // 🔹 استخدام أول ملف فقط
        if (!file) {
          console.error("❌ الملف غير موجود بعد المعالجة");
          return res.status(400).json({ message: "حدث خطأ أثناء معالجة الملف" });
        }

        // 🔹 استخراج مسار الملف
        const filePath = `/uploads/${file.newFilename}`;
        const fileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${filePath}`;

        // 🔹 تنظيف الحقول قبل استخدامها
        const cleanFields = Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [key.trim(), value?.[0]?.trim()])
        );

        // 🔹 استخراج البيانات بعد التنظيف
        const clientBranchId = parseInt(cleanFields.clientBranchId || "0", 10);
        const employeeId = parseInt(cleanFields.employeeId || "0", 10);
        const periodFrom = cleanFields.periodFrom ? new Date(cleanFields.periodFrom) : null;
        const periodTo = cleanFields.periodTo ? new Date(cleanFields.periodTo) : null;
        const clientPaid = cleanFields.clientPaid === "true";
        const notes = cleanFields.notes || null;

        // ✅ طباعة القيم بعد المعالجة
        console.log("🔹 بعد التنظيف:", { clientBranchId, employeeId, periodFrom, periodTo });

        // ✅ التحقق من صحة البيانات
        if (!clientBranchId || !employeeId || !periodFrom || !periodTo || isNaN(periodFrom.getTime()) || isNaN(periodTo.getTime())) {
          console.error("❌ بيانات غير مكتملة أو غير صحيحة:", { clientBranchId, employeeId, periodFrom, periodTo });
          return res.status(400).json({ message: "بيانات غير مكتملة أو غير صحيحة" });
        }

        // ✅ التحقق من أن `clientBranchId` و `employeeId` موجودان في قاعدة البيانات
        const [clientBranch, employee] = await Promise.all([
          prisma.clientBranch.findUnique({ where: { id: clientBranchId } }),
          prisma.user.findUnique({ where: { id: employeeId } }),
        ]);

        if (!clientBranch) {
          console.error(`❌ الفرع غير موجود: ID = ${clientBranchId}`);
          return res.status(400).json({ message: `الفرع برقم ${clientBranchId} غير موجود في قاعدة البيانات` });
        }

        if (!employee) {
          console.error(`❌ الموظف غير موجود: ID = ${employeeId}`);
          return res.status(400).json({ message: `الموظف برقم ${employeeId} غير موجود في قاعدة البيانات` });
        }

        // ✅ حفظ البيانات في قاعدة البيانات
        const payroll = await prisma.payroll.create({
          data: {
            clientBranch: { connect: { id: clientBranchId } },
            employee: { connect: { id: employeeId } },
            periodFrom,
            periodTo,
            clientPaid,
            filePath,
            fileUrl,
            notes,
            status: "قيد المراجعة",
          },
        });

        console.log("✅ تم حفظ كشف الرواتب بنجاح:", payroll);

        // ✅ إرسال إشعار للمحاسب، المدير المالي، ومدير الشركة
        const accountants = await prisma.user.findMany({
          where: { role: { in: ["accountant"] }, companyBranchId: clientBranchId }
        });

        const financeManagers = await prisma.user.findMany({
          where: { role: { in: [ "finance_manager"] } }
        });

        const companyManagers = await prisma.user.findMany({
          where: { role: { in: ["company_manager"] } }
        });

        const recipients = [...accountants, ...financeManagers, ...companyManagers];

        for (const recipient of recipients) {
          await prisma.notification.create({
            data: {
              userId: recipient.id,
              messageAr: `📢 تم رفع كشف رواتب جديد للفترة من ${payroll.periodFrom.toLocaleDateString()} إلى ${payroll.periodTo.toLocaleDateString()}`,
              messageEn: `📢 A new payroll has been uploaded for the period from ${payroll.periodFrom.toLocaleDateString()} to ${payroll.periodTo.toLocaleDateString()}`,
              isRead: false,
            },
          });
        }

        return res.status(201).json({ message: "تم رفع الملف بنجاح وإرسال الإشعارات!", payroll });

      } catch (error) {
        console.error("❌ خطأ أثناء معالجة الطلب:", error);
        return res.status(500).json({ message: "حدث خطأ غير متوقع أثناء معالجة البيانات" });
      }
    });

  } catch (error) {
    console.error("❌ خطأ عام:", error);
    return res.status(500).json({ message: "حدث خطأ غير متوقع" });
  }
}
