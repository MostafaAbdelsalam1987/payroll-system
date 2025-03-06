import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../../../../middleware/auth";
import { UserRole } from "@prisma/client"; // ✅ استيراد Enum الخاص بالأدوار

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const user = await verifyToken(req, res);

    // ✅ التأكد من أن المستخدم مسجل دخول
    if (!user) {
      return res.status(401).json({ message: "غير مصرح لك بالوصول" });
    }

    console.log("🔍 المستخدم الذي يحاول تعديل الصلاحيات:", user);

    // ✅ السماح فقط لمدير النظام بتعديل الصلاحيات (يدعم العربي والإنجليزي)
    const allowedRoles = ["مدير النظام", "Admin", "admin"];
    if (!allowedRoles.includes(user.role.trim())) {
      return res.status(403).json({ message: "غير مصرح لك بتعديل الصلاحيات" });
    }

    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "يجب إرسال بيانات صحيحة" });
    }

    // ✅ تحويل الدور إلى Enum UserRole
    const roleMapping: { [key: string]: UserRole } = {
      "موظف": UserRole.employee,
      "محاسب": UserRole.accountant,
      "مدير مالي": UserRole.finance_manager,
      "مدير الشركة": UserRole.company_manager,
      "مدير النظام": UserRole.admin,
      "employee": UserRole.employee,
      "accountant": UserRole.accountant,
      "finance_manager": UserRole.finance_manager,
      "company_manager": UserRole.company_manager,
      "admin": UserRole.admin,
    };

    const newRole = roleMapping[role];

    if (!newRole) {
      return res.status(400).json({ message: "الدور غير صالح" });
    }

    // ✅ تحديث صلاحيات المستخدم
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { role: newRole },
    });

    return res.status(200).json({ message: "تم تعديل الصلاحيات بنجاح", updatedUser });
  } catch (error) {
    console.error("❌ خطأ أثناء تعديل الصلاحيات:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تعديل الصلاحيات" });
  }
}
