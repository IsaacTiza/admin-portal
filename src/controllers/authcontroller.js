import jwt from "jsonwebtoken";
import Student from "../models/student.js";
import Parent from "../models/parent.js";
import Staff from "../models/staff.js";

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role || "user");
  user.password = undefined;
  res.status(statusCode).json({ status: "success", token, data: user });
};

// ─── STUDENT ────────────────────────────────────────────────
export const registerStudent = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      password,
      passwordConfirm,
      dob,
      grade,
      address,
      previousSchool,
    } = req.body;
    if (password !== passwordConfirm)
      return res.status(400).json({ message: "Passwords do not match" });

    const student = await Student.create({
      fullname,
      email,
      phone,
      password,
      passwordConfirm,
      dob,
      grade,
      address,
      previousSchool,
    });
    sendToken(student, 201, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Provide email and password" });

    const student = await Student.findOne({ email }).select("+password");
    if (
      !student ||
      !(await student.correctPassword(password, student.password))
    )
      return res.status(401).json({ message: "Invalid credentials" });

    sendToken(student, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PARENT ─────────────────────────────────────────────────
export const registerParent = async (req, res) => {
  try {
    const { fullname, email, phone, password, passwordConfirm } = req.body;
    if (password !== passwordConfirm)
      return res.status(400).json({ message: "Passwords do not match" });

    const parent = await Parent.create({
      fullname,
      email,
      phone,
      password,
      passwordConfirm,
    });
    sendToken(parent, 201, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Provide email and password" });

    const parent = await Parent.findOne({ email }).select("+password");
    if (!parent || !(await parent.correctPassword(password, parent.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    sendToken(parent, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── STAFF ──────────────────────────────────────────────────
export const registerStaff = async (req, res) => {
  try {
    const { fullname, email, phone, password, passwordConfirm, role } =
      req.body;
    if (password !== passwordConfirm)
      return res.status(400).json({ message: "Passwords do not match" });

    // Prevent self-promotion: only an existing admin can register another admin
    if (role === "admin")
      return res.status(403).json({ message: "Cannot self-assign admin role" });

    const staff = await Staff.create({
      fullname,
      email,
      phone,
      password,
      passwordConfirm,
    });
    sendToken(staff, 201, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Provide email and password" });

    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff || !(await staff.correctPassword(password, staff.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    sendToken(staff, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkStatus = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Provide email" });
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({
      verified: student.isverified,
      fullname: student.fullname,
      grade: student.grade,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user =
      (await Staff.findById(decoded.id)) || (await Parent.findById(decoded.id));
    if (!user)
      return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    next();
  };
};

export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Provide user ID" });
    const student = await Student.findById(userId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    student.isverified = true;
    await student.save({ validateBeforeSave: false });
    res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({ status: "success", data: students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const linkStudentParent = async (req, res) => {
  try {
    const { studentEmail, parentEmail } = req.body;
    console.log(studentEmail, parentEmail);

    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const parent = await Parent.findOne({ email: parentEmail });
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    // Avoid duplicates
    if (!student.parents.includes(parent._id)) {
      student.parents.push(parent._id);
      await student.save({ validateBeforeSave: false });
    }
    if (!parent.students.includes(student._id)) {
      parent.students.push(student._id);
      await parent.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      message: "Linked successfully",
      student: student.fullname,
      parent: parent.fullname,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getParentStudents = async (req, res) => {
  try {
    const parent = await Parent.findById(req.user.id).populate(
      "students",
      "fullname grade email phone dob isverified createdAt",
    );
    console.log(parent.students);
    res.status(200).json({ data: parent.students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};