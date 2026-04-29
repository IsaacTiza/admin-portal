import mongoose from "mongoose";
import Staff from "./models/staff.js";

await mongoose.connect("mongodb://localhost:27017/admin-portal");

await Staff.create({
  fullname: "Super Admin Isaac",
  email: "i2493053@gmail.com",
  phone: "08012345678",
  password: "admin123",
  passwordConfirm: "admin123",
  role: "admin",
});

console.log("Admin created");
await mongoose.disconnect();
