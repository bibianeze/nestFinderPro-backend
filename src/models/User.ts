import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ============================================================
// USER MODEL
// Handles both regular users and admin (role field)
// ============================================================

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  emailVerifyToken: string | undefined;
  emailVerifyExpire: Date | undefined;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  createdAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never return password in queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  emailVerifyToken: {
  type: String,
},
emailVerifyExpire: {
  type: Date,
},
resetPasswordToken: {
  type: String,
},
resetPasswordExpire: {
  type: Date,
},
  },
  {
    timestamps: true,
  }
);

// ============================================================
// HASH PASSWORD before saving to database
// Only runs when password is new or changed
// ============================================================
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============================================================
// COMPARE PASSWORD — used during login
// ============================================================
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;