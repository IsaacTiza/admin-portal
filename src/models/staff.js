import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const staffSchema = new mongoose.Schema(
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
    role: { type: String, enum: ["staff", "admin"], default: "staff" },
  },
  { timestamps: true },
);


staffSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const saltRound = 12;
  this.password = await bcrypt.hash(this.password, saltRound);
  this.passwordConfirm = undefined;
  // In your pre-save hook or wherever passwordChangedAt is assigned
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

staffSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

export default mongoose.model("Staff", staffSchema);
