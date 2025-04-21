const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");

const usedPackages = new Set();
const packagesToCheck = ["apps", "packages"];

function findImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Match các loại import phổ biến
  const regexes = [
    /from\s+['"]([^\.\/][^'"]*)['"]/g, // import x from 'pkg'
    /import\s+['"]([^\.\/][^'"]*)['"]/g, // import 'pkg'
    /require\(['"]([^\.\/][^'"]*)['"]\)/g, // require('pkg')
  ];

  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const pkg = match[1].split("/")[0];
      usedPackages.add(pkg);
    }
  }
}

function checkUnusedDeps(packagePath) {
  const pkgJsonPath = path.join(packagePath, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return;

  const pkg = require(pkgJsonPath);
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const files = glob.sync(["**/*.{ts,tsx,js,jsx}"], {
    cwd: packagePath,
    ignore: ["node_modules/**", "dist/**", ".next/**", "out/**", "build/**"],
    absolute: true,
  });

  if (files.length === 0) {
    console.log(`⚠️ Không tìm thấy source file nào trong ${packagePath}`);
    return;
  }

  for (const file of files) {
    findImportsInFile(file);
  }

  const unused = Object.keys(deps).filter((pkg) => !usedPackages.has(pkg));
  if (unused.length > 0) {
    console.log(`\n📦 [${path.relative(process.cwd(), packagePath)}] Unused:`);
    console.log(unused.join(", "));
  } else {
    console.log(
      `✅ [${path.relative(process.cwd(), packagePath)}] Tất cả dependencies đều được dùng.`,
    );
  }
}

function main() {
  for (const dir of packagesToCheck) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;

    const subdirs = fs
      .readdirSync(dirPath)
      .filter((d) => fs.existsSync(path.join(dirPath, d, "package.json")));

    for (const sub of subdirs) {
      const pkgPath = path.join(dirPath, sub);
      checkUnusedDeps(pkgPath);
    }
  }
}

main();
