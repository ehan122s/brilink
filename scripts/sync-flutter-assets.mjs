import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "dist");
const targetDir = path.join(projectRoot, "flutter_wrapper", "assets", "web");

if (!fs.existsSync(sourceDir)) {
  console.error("Folder dist belum ada. Jalankan npm run build terlebih dahulu.");
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`Web assets berhasil disalin ke ${targetDir}`);
