// src/pages/api/users/register.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// تعريف نوع مخصص للخطأ ليشمل خاصية `code`
interface CustomError extends Error {
  code?: string;
}

// دالة تسجيل مستخدم جديد
const registerUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log("بيانات التسجيل:", req.body);

    const { nameAr, nameEn, username, email, phone, password, role } = req.body;

    // التحقق من وجود اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف في قاعدة البيانات
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          { phone }, // التحقق من وجود رقم الهاتف أيضًا
        ],
      },
    });

    console.log("هل يوجد مستخدم موجود؟", existingUser);

    if (existingUser) {
      return res.status(400).json({ error: "اسم المستخدم، البريد الإلكتروني أو رقم الهاتف مسجل بالفعل" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("كلمة المرور المشفرة:", hashedPassword);

    const newUser = await prisma.user.create({
      data: { nameAr, nameEn, username, email, phone, password: hashedPassword, role },
    });

    console.log("المستخدم الجديد:", newUser);

    res.status(201).json(newUser);
  } catch (error: unknown) {
    console.error("حدث خطأ أثناء التسجيل:", error);

    // التحقق من نوع الخطأ
    if (error instanceof Error) {
      const e = error as CustomError; // تحويل الخطأ إلى النوع المخصص

      if (e.code === 'P2002') {
        return res.status(400).json({ error: "رقم الهاتف أو البريد الإلكتروني أو اسم المستخدم مسجل بالفعل" });
      }
      return res.status(500).json({ error: "حدث خطأ أثناء التسجيل" });
    }

    // في حالة إذا كان الخطأ ليس من نوع Error
    res.status(500).json({ error: "حدث خطأ غير معروف" });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    await registerUser(req, res);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
