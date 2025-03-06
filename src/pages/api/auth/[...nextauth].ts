import { NextAuthOptions, User as NextAuthUser, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// ✅ تعريف `CustomUser` ليشمل `id`, `role`, و `branchId`
interface CustomUser extends NextAuthUser {
  id: string;
  role: string;
  branchId: number | null;
}

// ✅ تعديل نوع `session.user` ليشمل `id`, `role`, و `branchId`
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      branchId: number | null;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("يجب إدخال البريد الإلكتروني وكلمة المرور");
        }

        // ✅ البحث عن المستخدم في قاعدة البيانات
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("المستخدم غير موجود");

        // ✅ مقارنة كلمة المرور بعد فك تشفيرها
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) throw new Error("كلمة المرور غير صحيحة");

        if (!user.isActivated) throw new Error("الحساب غير مفعل، يرجى التواصل مع الإدارة");

        return {
          id: user.id.toString(), // ✅ تأكد من تحويل `id` إلى string
          name: user.nameAr,
          email: user.email,
          role: user.role, // ✅ التأكد من إضافة الدور
          branchId: user.companyBranchId ?? null, // ✅ التعامل مع الفرع بشكل صحيح
        } as CustomUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser; // ✅ تحويل `user` إلى `CustomUser`
        token.id = customUser.id;
        token.role = customUser.role;
        token.branchId = customUser.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user || {}),
        id: token.id as string,
        role: token.role as string,
        branchId: token.branchId as number | null,
      };
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
