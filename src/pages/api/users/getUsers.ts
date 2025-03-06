import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // جلب المستخدمين غير المحذوفين فقط
    const users = await prisma.user.findMany({
        where: { isDeleted: false }, // إحضار المستخدمين غير المحذوفين فقط
        select: { id: true, nameAr: true, nameEn: true, email: true, role: true },
      });      

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
