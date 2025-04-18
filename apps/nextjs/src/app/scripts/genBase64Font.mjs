// genFontsBase64.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 Đường dẫn tới thư mục font
const fontFolder = path.resolve(__dirname, "../../../public/fonts/Roboto");

// 🔧 File output
const outputPath = path.resolve(__dirname, "fontsBase64.ts");

// Danh sách font
const fonts = [
  "Roboto-Regular.ttf",
  "Roboto-Bold.ttf",
  "Roboto-Italic.ttf",
  "Roboto-BoldItalic.ttf",
];

const lines = [
  "// Auto-generated base64 fonts\n",
  "// Do not edit manually. Run genFontsBase64.mjs to regenerate.\n\n",
];

// ✅ Không dùng base64 làm file name ❌
fonts.forEach((font) => {
  const fontPath = path.join(fontFolder, font); // ✅ Đây mới là path thật
  const fontData = fs.readFileSync(fontPath); // đọc file .ttf
  const base64 = fontData.toString("base64");

  const varName = font
    .replace(".ttf", "")
    .replace("Roboto-", "Roboto")
    .replace(/-/g, "");

  lines.push(
    `export const ${varName} = "data:font/truetype;charset=utf-8;base64,${base64}";\n\n`,
  );
});

// ✅ Ghi ra file duy nhất
fs.writeFileSync(outputPath, lines.join(""), "utf8");
