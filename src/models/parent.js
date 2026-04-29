import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const parentSchema = new mongoose.Schema(
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
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true },
);

// parentSchema.virtual("passwordConfirm").set(function (val) {
//   this._passwordConfirm = val;
// });

// parentSchema.pre("save", function (next) {
//   if (this.isModified("password")) {
//     if (this.password !== this._passwordConfirm) {
//       return next(new Error("Passwords do not match"));
//     }
//   }
//   next();
// });


parentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const saltRound = 12;
  this.password = await bcrypt.hash(this.password, saltRound);
  this.passwordConfirm = undefined;
  // In your pre-save hook or wherever passwordChangedAt is assigned
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

parentSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

export default mongoose.model("Parent", parentSchema);
