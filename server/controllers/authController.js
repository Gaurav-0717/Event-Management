const validator = require("validator");
const User = require("../models/User");
const { generateToken } = require("../utils/auth");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 60;

/**
 * Obvious invalid / weak password values that should never be accepted.
 * Comparisons are case-insensitive. The project's sample password "Password123"
 * is intentionally NOT listed here — its mixed case makes it a reasonable
 * college-project credential, and the requirements use it as a valid password.
 */
const WEAK_PASSWORDS = [
  "password",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyui",
  "qwerty123",
  "letmein123",
  "iloveyou",
  "changeme",
];

/**
 * Validate the registration payload.
 * Returns an array of human-readable validation error messages.
 */
const validateRegistrationInput = ({ name, email, password }) => {
  const errors = [];

  // Name
  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Name is required");
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${MAX_NAME_LENGTH} characters`);
    }
  }

  // Email
  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  } else if (!validator.isEmail(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  // Password
  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else {
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.push(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      errors.push(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
    }
    if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
      errors.push("Password is too common, please choose a stronger password");
    }
    // Reject passwords made of a single repeated character (e.g. "aaaaaaaa")
    if (/^(.)\1+$/.test(password)) {
      errors.push(
        "Password is too predictable, please choose a stronger password",
      );
    }
    if (/\s/.test(password)) {
      errors.push("Password cannot contain spaces");
    }
  }

  return errors;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  const { name, email, password } = req.body || {};

  const validationErrors = validateRegistrationInput({ name, email, password });
  if (validationErrors.length > 0) {
    res.status(400);
    return next(new Error(validationErrors[0]));
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409);
      return next(new Error("An account with this email already exists"));
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    // Handle duplicate key race condition from the unique index
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("An account with this email already exists"));
    }
    return next(error);
  }
};

/**
 * @desc    Authenticate a user and return a JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== "string" || !email.trim()) {
    res.status(400);
    return next(new Error("Email is required"));
  }

  if (!password || typeof password !== "string") {
    res.status(400);
    return next(new Error("Password is required"));
  }

  try {
    // Explicitly select the password field (select: false by default)
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Use a single generic message so we never reveal whether the email exists
    const invalidCredentialsError = () => {
      res.status(401);
      return next(new Error("Invalid email or password"));
    };

    if (!user) {
      return invalidCredentialsError();
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return invalidCredentialsError();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = (req, res) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
};
