import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma"; // ✅ استدعاء قاعدة البيانات

export const verifyToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "يجب تسجيل الدخول" });
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: string;
    };

    // ✅ جلب بيانات المستخدم من قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        companyBranchId: true, // ✅ جلب `branchId`
      },
    });

    if (!user) {
      res.status(401).json({ message: "المستخدم غير موجود" });
      return null;
    }

    return {
      id: user.id,
      role: user.role,
      branchId: user.companyBranchId ?? null, // ✅ إرجاع `branchId`
    };
  } catch (error) {
    res.status(403).json({ message: "توكن غير صالح" });
    return null;
  }
};
