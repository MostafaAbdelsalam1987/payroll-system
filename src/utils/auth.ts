import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const verifyToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token is required" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.isDeleted) {
      res.status(403).json({ error: "Invalid token or user deleted" });
      return null;
    }

    return user; // يحتوي الآن على role كـ string
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
    return null;
  }
};
