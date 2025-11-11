// Read .env file and generate environment variables for .env.example by replacing values with placeholders
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const envPath = path.resolve(__dirname, "..", ".env");
const exampleEnvPath = path.resolve(__dirname, "..", ".env.example");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) =>
  new Promise((res) => rl.question(q, (a) => res(a.trim().toLowerCase())));

const placeholder = (k) => `YOUR_${k.toUpperCase()}`;

async function run() {
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env file does not exist.");
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split(/\r?\n/);

  const exampleLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const eq = line.indexOf("=");
    if (eq === -1) return line;
    const key = line.substring(0, eq).trim();
    return `${key} = ${placeholder(key)}`;
  });

  const exampleContent = exampleLines.join("\n") + "\n";

  if (fs.existsSync(exampleEnvPath)) {
    console.log(".env.example already exists.");
    const ans = await ask("Do you want to overwrite it? (y/n): ");
    if (!["yes", "y"].includes(ans)) {
      console.log("Operation cancelled.");
      rl.close();
      process.exit(0);
    }
  }

  try {
    fs.writeFileSync(exampleEnvPath, exampleContent, "utf-8");
    console.log(".env.example has been generated successfully.");
  } catch (e) {
    console.error("Error writing file:", e.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

run().catch((e) => {
  console.error("Unexpected error:", e);
  rl.close();
  process.exit(1);
});
