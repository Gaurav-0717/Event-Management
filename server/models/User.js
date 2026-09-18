const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/**
 * EventWise User Schema
 * Passwords are never stored in plain text — they are hashed with bcrypt
 * in the pre-save hook below. The password field is `select: false` so it is
 * excluded from query results unless explicitly requested.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either user or admin",
      },
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Hash the password before persisting whenever it has been modified.
 * Never store plain-text passwords.
 */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Compare a candidate plain-text password against the stored hash.
 * Must be used on a document fetched with `.select('+password')`.
 */
userSchema.methods.matchPassword = async function matchPassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Serialize the user without any password information.
 */
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
