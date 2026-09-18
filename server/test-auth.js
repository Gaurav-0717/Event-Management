/**
 * EventWise Phase 2 — Authentication API test suite.
 * Run with:  node test-auth.js   (server must be running on :5000)
 */
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/User");

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;

const results = [];
const record = (test, pass, detail) => {
  results.push({ test, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${test} :: ${detail}`);
};

const call = async (method, path, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON */
  }
  return { status: res.status, text, json };
};

const run = async () => {
  const rand = Math.floor(Math.random() * 900000) + 100000;
  const email = `user${rand}@example.com`;
  const password = "Password123";
  let token = null;

  // 1. Register a new user
  let r = await call("POST", "/auth/register", {
    name: "Test User",
    email,
    password,
  });
  token = r.json?.token;
  record(
    "1. Register a new user",
    r.status === 201 && r.json?.success === true && !!token && r.json?.user?.id,
    `HTTP ${r.status}; id=${r.json?.user?.id}; role=${r.json?.user?.role}`,
  );

  // 3. Password must NOT be returned by the API
  const leaksPassword =
    r.text.includes('"password"') || /\$2[aby]\$/.test(r.text);
  record(
    "3. Password NOT returned by register API",
    !leaksPassword,
    "no password key / hash in response",
  );

  // 2. Verify password is hashed in MongoDB
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/eventwise",
  );
  const stored = await User.findOne({ email }).select("+password");
  const isHashed =
    stored && stored.password.startsWith("$2") && stored.password !== password;
  record(
    "2. Password is hashed (bcrypt) in MongoDB",
    !!isHashed,
    `stored starts with "$2...": ${isHashed}`,
  );

  // 4. Login with correct credentials
  r = await call("POST", "/auth/login", { email, password });
  token = r.json?.token;
  record(
    "4. Login with correct credentials",
    r.status === 200 && !!token && r.json?.user?.email === email,
    `HTTP ${r.status}; token issued`,
  );

  // 5. Login with incorrect password
  r = await call("POST", "/auth/login", {
    email,
    password: "WrongPassword999",
  });
  record(
    "5. Login with incorrect password",
    r.status === 401 && r.json?.message === "Invalid email or password",
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 6. Login with non-existing email (generic message, no user enumeration)
  r = await call("POST", "/auth/login", {
    email: `nobody${rand}@example.com`,
    password,
  });
  record(
    "6. Login with non-existing email",
    r.status === 401 && r.json?.message === "Invalid email or password",
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 7. /auth/me with valid token
  r = await call("GET", "/auth/me", null, token);
  const me = r.json?.user;
  record(
    "7. GET /auth/me with valid token",
    r.status === 200 &&
      me?.id &&
      me?.name &&
      me?.email &&
      me?.role &&
      !r.text.includes('"password"'),
    `HTTP ${r.status}; name=${me?.name}; role=${me?.role}; no password`,
  );

  // 8. /auth/me without token
  r = await call("GET", "/auth/me");
  record(
    "8. GET /auth/me without token",
    r.status === 401,
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 9. /auth/me with invalid token
  r = await call("GET", "/auth/me", null, "this.is.not.a.valid.jwt");
  record(
    "9. GET /auth/me with invalid token",
    r.status === 401,
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 10. /auth/me with expired token
  const expired = jwt.sign({ id: "000" }, process.env.JWT_SECRET, {
    expiresIn: "-10s",
  });
  r = await call("GET", "/auth/me", null, expired);
  record(
    "10. GET /auth/me with expired token",
    r.status === 401 && /expired/i.test(r.json?.message || ""),
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 11. Token signed for a non-existent user (deleted account)
  const ghost = jwt.sign(
    { id: new mongoose.Types.ObjectId().toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  r = await call("GET", "/auth/me", null, ghost);
  record(
    "11. Valid JWT for missing user rejected",
    r.status === 401,
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 12. Duplicate email blocked
  r = await call("POST", "/auth/register", {
    name: "Test User",
    email,
    password,
  });
  record(
    "12. Duplicate email blocked",
    r.status === 409,
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 13. Validation: bad name/email/short password
  r = await call("POST", "/auth/register", {
    name: "",
    email: "bad-email",
    password: "short",
  });
  record(
    "13. Registration validation rejects bad input",
    r.status === 400,
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 14. Weak / common password rejected
  r = await call("POST", "/auth/register", {
    name: "Weak Pass",
    email: `weak${rand}@example.com`,
    password: "password123",
  });
  record(
    "14. Weak/common password rejected",
    r.status === 400,
    `HTTP ${r.status}; msg="${r.json?.message}"`,
  );

  // 15. Role is NOT trusted from the frontend — extra role in payload is ignored
  r = await call("POST", "/auth/register", {
    name: "Sneaky User",
    email: `sneaky${rand}@example.com`,
    password,
    role: "admin",
  });
  record(
    "15. Client-supplied role is ignored (defaults to user)",
    r.status === 201 && r.json?.user?.role === "user",
    `HTTP ${r.status}; assigned role=${r.json?.user?.role}`,
  );

  // 16. Existing /api/health still works
  r = await call("GET", "/health");
  record(
    "16. Existing /api/health still works",
    r.status === 200 && r.json?.status === "ok",
    `HTTP ${r.status}; db=${r.json?.services?.database}`,
  );

  // 17. Unknown route still returns 404
  r = await call("GET", "/does-not-exist");
  record("17. Unknown route returns 404", r.status === 404, `HTTP ${r.status}`);

  console.log("\n================ SUMMARY ================");
  const passed = results.filter((x) => x.pass).length;
  const failed = results.length - passed;
  console.log(`TOTAL: ${results.length}  PASS: ${passed}  FAIL: ${failed}`);
  if (failed > 0) {
    console.log("--- FAILURES ---");
    results
      .filter((x) => !x.pass)
      .forEach((x) => console.log(`  ${x.test} :: ${x.detail}`));
  }

  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (err) => {
  console.error("Test suite crashed:", err);
  try {
    await mongoose.connection.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
