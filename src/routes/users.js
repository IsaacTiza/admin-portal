import express from "express";
import {
  registerStudent,
  loginStudent,
  registerParent,
  loginParent,
  registerStaff,
  loginStaff,
  checkStatus,
  restrict,
  verifyUser,
  getAllStudents,
  protect,
  linkStudentParent,
  getParentStudents,
} from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);

router.post("/parent/register", registerParent);
router.post("/parent/login", loginParent);

router.post("/staff/register", registerStaff);
router.post("/staff/login", loginStaff);

router.post("/check-status", checkStatus)
router.post("/verify-user",protect, restrict('admin'), verifyUser)
router.get("/students", protect, restrict('admin'), getAllStudents)

router.post("/link", protect, linkStudentParent);
router.get("/parent/students", protect, getParentStudents);
export default router;
