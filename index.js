#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");

const VERSION = require("./package.json").version;
const SEVEN_ZIP = "./7-Zip/7z.exe";

// ---------- Utils ----------

function normalize(p) {
  if (!p || typeof p !== "string") return null;
  return path.resolve(p.replace(/["']/g, ""));
}

function die(msg) {
  console.error("❌", msg);
  process.exit(1);
}

function exists(p, name = "Path") {
  if (!fs.existsSync(p)) die(`${name} not found: ${p}`);
}

function validSize(size) {
  return /^[0-9]+(k|m|g)$/i.test(size);
}

// ---------- UI ----------

function showHelp() {
  console.log(`
UZip CLI v${VERSION}

Parameters:
  --compress || -c   Show help
  --restore  || -v   Show version
  <input>            Input folder
  <output>           Output folder
  <size>             Split size

Options:
  --help  || -h       Show help
  --version  || -v    Show version

Examples:
  UZip compress "MyFolder" backup 2g
  UZip restore backup
`);
}

function showVersion() {
  console.log(`UZip v${VERSION}`);
}

function renderBar(percent) {
  const width = 20;
  const filled = Math.round((percent / 100) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  process.stdout.write(`\r[${bar}] ${percent}%`);
}

// ---------- 7-Zip Runner ----------

function run7z(args, onProgress, onDone) {
  if (!fs.existsSync(SEVEN_ZIP)) {
    die(`7-Zip not found: ${SEVEN_ZIP}`);
  }

  const proc = spawn(SEVEN_ZIP, args, { shell: false });

  proc.stdout.on("data", (data) => {
    const text = data.toString();
    const match = text.match(/(\d+)%/);
    if (match && onProgress) {
      renderBar(parseInt(match[1]));
    }
  });

  proc.stderr.on("data", () => { });

  proc.on("error", () => die("Failed to launch 7-Zip"));

  proc.on("close", (code) => {
    process.stdout.write("\n");
    if (code !== 0) die("7-Zip failed.");
    onDone && onDone();
  });
}

// ---------- Compress ----------

function compress(input, outputDir, splitSize) {
  input = normalize(input);
  outputDir = normalize(outputDir);

  if (!input || !outputDir || !splitSize) die("Missing arguments.");
  exists(input, "Input folder");

  if (!validSize(splitSize)) {
    die("Invalid split size. Use formats like: 500m, 2g, 100k");
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const baseName = path.basename(input);
  const archiveBase = path.join(outputDir, baseName);

  console.log("🗜 Compressing...");

  const args = [
    "a",
    "-t7z",
    "-mx=9",
    "-m0=lzma2",
    "-md=512m",
    "-ms=on",
    "-bsp1",
    "-bb3",
    `-v${splitSize}`,
    `${archiveBase}.7z`,
    input,
  ];

  run7z(args, true, () => {
    const parts = fs
      .readdirSync(outputDir)
      .filter((f) => f.includes(".7z."))
      .sort();

    if (!parts.length) die("No split parts were created.");

    const index = {
      originalName: baseName,
      createdAt: new Date().toISOString(),
      splitSize,
      parts,
    };

    fs.writeFileSync(
      path.join(outputDir, "index.json"),
      JSON.stringify(index, null, 2)
    );

    console.log("✅ Compression complete");
  });
}

// ---------- Restore ----------

function ask(question, cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(question, (ans) => {
    rl.close();
    cb(ans.trim().toLowerCase());
  });
}

function restore(folder) {
  folder = normalize(folder);
  if (!folder) die("Missing folder argument.");

  const indexPath = path.join(folder, "index.json");
  exists(indexPath, "index.json");

  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  if (!index.parts || !index.parts.length) die("No parts found.");

  const parts = index.parts.sort();
  const firstPart = path.join(folder, parts[0]);
  exists(firstPart, "First archive part");

  console.log("♻ Restoring...");

  run7z(["x", firstPart, "-bsp1", "-bb3"], true, () => {
    console.log("✅ Restore complete");

    ask("Delete split parts? (y/n): ", (ans) => {
      if (ans === "y" || ans === "yes") {
        for (const p of parts) {
          const full = path.join(folder, p);
          if (fs.existsSync(full)) fs.unlinkSync(full);
        }
        fs.unlinkSync(indexPath);
        console.log("🧹 Parts deleted");
      } else {
        console.log("📦 Parts kept");
      }
    });
  });
}

// ---------- CLI ----------

const args = process.argv.slice(2);

if (!args.length || args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  showVersion();
  process.exit(0);
}

const cmd = args[0];

if (cmd === "-compress" || cmd === "-c") {
  compress(args[1], args[2], args[3]);
} else if (cmd === "-restore" || cmd === "-r") {
  restore(args[1]);
} else {
  die("Unknown command");
}
