const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Admin User";

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i;
const SALT_ROUNDS = 10;

async function main() {
  if (!ADMIN_USERNAME) {
    console.error("Missing ADMIN_USERNAME in environment");
    process.exit(1);
  }

  if (!EMAIL_REGEX.test(ADMIN_USERNAME)) {
    console.error("ADMIN_USERNAME must be a valid email address");
    process.exit(1);
  }

  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters");
    process.exit(1);
  }

  const { connectDB } = await import("../src/lib/db.js");
  const { default: Admin } = await import("../src/models/Admin.js");

  await connectDB();

  const email = ADMIN_USERNAME.toLowerCase();
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.password = hashedPassword;
    existing.name = ADMIN_NAME;
    await existing.save();
    console.log(`Updated admin account for ${email}`);
    return;
  }

  await Admin.create({
    name: ADMIN_NAME,
    email,
    password: hashedPassword,
    role: "admin",
  });
  console.log(`Admin account created for ${email}`);
}

async function shutdown(code) {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error("Failed to close database connection:", error);
  } finally {
    process.exit(code);
  }
}

main()
  .then(() => shutdown(0))
  .catch((error) => {
    console.error("Failed to create admin user:", error);
    shutdown(1);
  });
