-- ✅ إدراج بيانات الفروع
INSERT INTO CompanyBranch (id, nameAr, nameEn, location, createdAt) VALUES
(1, 'فرع الباحة', 'Riyadh Branch', 'الباحة', NOW()),
(2, 'فرع الدمام', 'Jeddah Branch', 'الدمام', NOW());

-- ✅ إدراج بيانات المستخدمين (موظف - محاسب - مدير مالي - مدير شركة - مدير نظام)
INSERT INTO User (id, nameAr, nameEn, username, email, phone, password, role, isActivated, isDeleted, createdAt, companyBranchId) VALUES
(1, 'محمد علي', 'Mohammed Ali', 'mohammed', 'mohammed@example.com', '0500000001', '$2b$10$EXAMPLEHASH', 'موظف', 1, 0, NOW(), 1),
(2, 'أحمد خالد', 'Ahmed Khaled', 'ahmed', 'ahmed@example.com', '0500000002', '$2b$10$EXAMPLEHASH', 'محاسب', 1, 0, NOW(), 1),
(3, 'سالم ناصر', 'Salem Nasser', 'salem', 'salem@example.com', '0500000003', '$2b$10$EXAMPLEHASH', 'مدير مالي', 1, 0, NOW(), NULL),
(4, 'خالد فهد', 'Khaled Fahad', 'khaled', 'khaled@example.com', '0500000004', '$2b$10$EXAMPLEHASH', 'مدير الشركة', 1, 0, NOW(), NULL),
(5, 'مدير النظام', 'Admin User', 'admin', 'admin@example.com', '0500000005', '$2b$10$EXAMPLEHASH', 'مدير النظام', 1, 0, NOW(), NULL);

-- ✅ إدراج بيانات العملاء
INSERT INTO Client (id, nameAr, nameEn, phone, activity, commercialRegistration, taxNumber, email, address, city, contractDate, isActive, dueAmount, guardCount, additionalNotes, createdAt) VALUES
(1, 'شركة الأمان', 'Al Aman Security', '0551234567', 'حراسات أمنية', '123456789', '987654321', 'client1@example.com', 'شارع الملك فهد', 'الرياض', '2023-01-01', 1, 50000.00, 20, 'عميل مهم', NOW()),
(2, 'شركة الدرع', 'Al Der3 Security', '0559876543', 'حراسات أمنية', '223344556', '667788990', 'client2@example.com', 'طريق الملك عبدالله', 'جدة', '2022-06-15', 1, 75000.00, 30, 'متعاقد جديد', NOW());

-- ✅ إدراج بيانات الفواتير
INSERT INTO Invoice (id, clientId, month, year, amount, isPaid, createdAt) VALUES
(1, 1, 2, 2024, 25000.00, 0, NOW()),
(2, 1, 3, 2024, 25000.00, 0, NOW()),
(3, 2, 2, 2024, 37500.00, 1, NOW()),
(4, 2, 3, 2024, 37500.00, 0, NOW());

-- ✅ إدراج بيانات كشوف الرواتب
INSERT INTO Payroll (id, employeeId, filePath, fileUrl, clientBranchId, periodFrom, periodTo, clientPaid, notes, status, createdAt) VALUES
(1, 1, '/uploads/payroll1.xlsx', 'http://example.com/uploads/payroll1.xlsx', 1, '2024-02-01', '2024-02-28', 1, 'تمت المراجعة', 'مقبول', NOW()),
(2, 1, '/uploads/payroll2.xlsx', 'http://example.com/uploads/payroll2.xlsx', 1, '2024-03-01', '2024-03-31', 0, 'بانتظار الدفع', 'قيد المراجعة', NOW());
