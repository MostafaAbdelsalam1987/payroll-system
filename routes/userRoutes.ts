import express from "express";
import asyncHandler from "express-async-handler";
import { registerUser, loginUser, getMe } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// إنشاء مستخدم جديد
router.post("/register", asyncHandler(registerUser));

// تسجيل الدخول
router.post("/login", asyncHandler(loginUser));

// الحصول على بيانات المستخدم الحالي (يتطلب توكن)
router.get("/me", asyncHandler(protect), asyncHandler(getMe));

export default router;
