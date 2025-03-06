import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../middleware/auth"; // ✅ التحقق من المستخدم

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    // ✅ التحقق من التوكن والصلاحيات
    const user = await verifyToken(req, res);
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    const { branchId, employeeId, status } = req.query;

    // ✅ تجهيز شروط البحث بناءً على دور المستخدم
    const whereClause: any = {};
    if (status) whereClause.status = String(status);
    if (employeeId) whereClause.employeeId = Number(employeeId);

    // 🔹 الموظف يرى فقط الكشوف الخاصة بفروعه (إذا كان له فرع محدد)
    if (user.role === "employee" && user.branchId !== null) {
      whereClause.clientBranchId = user.branchId;
    }

    // 🔹 المحاسب، المدير المالي، ومدير الشركة يرون جميع الكشوف
    if (["accountant", "finance_manager", "company_manager"].includes(user.role)) {
      if (branchId) whereClause.clientBranchId = Number(branchId); // دعم التصفية حسب الفرع
    }

    // ✅ جلب الكشوف مع المراجعات
    const payrolls = await prisma.payroll.findMany({
      where: whereClause,
      include: {
        employee: { select: { id: true, nameAr: true, nameEn: true } },
        clientBranch: { select: { id: true, nameAr: true, nameEn: true } },
        reviews: {
          select: {
            id: true,
            status: true,
            comments: true,
            createdAt: true,
            reviewer: { select: { id: true, nameAr: true, nameEn: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ payrolls });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الكشوف:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
}
