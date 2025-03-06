import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../utils/auth";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const user = await verifyToken(req, res);
  if (!user) return;

  if (user.role !== "Admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
