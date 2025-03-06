import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    const { email, password } = req.body;

    // 🔹 البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "المستخدم غير موجود" });
    }

    // 🔹 مقارنة كلمة المرور المدخلة بالمحفوظة (المشفرة)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    // 🔹 إنشاء التوكن
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        branchId: user.companyBranchId,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.nameAr,
        email: user.email,
        role: user.role,
        branchId: user.companyBranchId,
      },
    });
  } catch (error) {
    console.error("❌ خطأ أثناء تسجيل الدخول:", error);
    return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
  }
}
