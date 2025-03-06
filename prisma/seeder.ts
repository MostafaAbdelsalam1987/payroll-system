import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🚀 بدء حذف البيانات القديمة...");
  
  // ✅ حذف جميع المستخدمين قبل إدخال البيانات الجديدة
  await prisma.user.deleteMany();

  console.log("✅ تم حذف البيانات القديمة!");

  console.log("🚀 بدء إدخال البيانات التجريبية...");

  // ✅ تشفير كلمة المرور الافتراضية
  const hashedPassword = await bcrypt.hash("123456", 10);

  // ✅ إدخال مدير النظام
  await prisma.user.create({
    data: {
      nameAr: "مدير النظام",
      nameEn: "System Admin",
      username: "admin",
      email: "admin@example.com",
      phone: "0500000001",
      password: hashedPassword,
      role: "admin",
      isActivated: true,
    },
  });

  // ✅ إدخال مدير الشركة
  await prisma.user.create({
    data: {
      nameAr: "مدير الشركة",
      nameEn: "Company Manager",
      username: "company_manager",
      email: "company@example.com",
      phone: "0500000002",
      password: hashedPassword,
      role: "company_manager",
      isActivated: true,
    },
  });

  // ✅ إدخال المدير المالي
  await prisma.user.create({
    data: {
      nameAr: "مدير مالي",
      nameEn: "Finance Manager",
      username: "finance_manager",
      email: "finance@example.com",
      phone: "0500000003",
      password: hashedPassword,
      role: "finance_manager",
      isActivated: true,
    },
  });

  // ✅ إدخال المحاسب
  await prisma.user.create({
    data: {
      nameAr: "محاسب",
      nameEn: "Accountant",
      username: "accountant",
      email: "accountant@example.com",
      phone: "0500000004",
      password: hashedPassword,
      role: "accountant",
      isActivated: true,
    },
  });

  // ✅ إدخال موظف
  await prisma.user.create({
    data: {
      nameAr: "موظف",
      nameEn: "Employee",
      username: "employee",
      email: "employee@example.com",
      phone: "0500000005",
      password: hashedPassword,
      role: "employee",
      isActivated: true,
    },
  });

  console.log("✅ تمت إضافة البيانات التجريبية بنجاح!");
}

main()
  .catch((e) => {
    console.error("❌ خطأ أثناء إدخال البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
