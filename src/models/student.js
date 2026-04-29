import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password and Password confirm don't match"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "passwords don't match",
      },
    },
    dob: { type: Date, required: true },
    grade: { type: String, required: true },
    address: { type: String, required: true },
    previousSchool: { type: String, default: "" },
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Parent" }],
    isverified:{type:Boolean, default:false},
  },
  { timestamps: true },
);

studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const saltRound = 12;
  this.password = await bcrypt.hash(this.password, saltRound);
  this.passwordConfirm = undefined;
  // In your pre-save hook or wherever passwordChangedAt is assigned
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

studentSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

export default mongoose.model("Student", studentSchema);
