import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const binDir = path.join(ROOT, "bin");
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

function findExecutable(candidates, checkCmd) {
  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return `"${c}"`;
    }
  }
  try {
    const which = execSync(`where ${checkCmd}`, { encoding: "utf8" }).trim().split("\r\n")[0];
    if (which && fs.existsSync(which)) {
      return `"${which}"`;
    }
  } catch {}
  return checkCmd; // fallback to bare command on PATH
}

const gccBin = findExecutable(
  [
    process.env.GCC_PATH,
    "D:/Workspace/environment/mingw64/bin/gcc.exe",
    "C:/mingw64/bin/gcc.exe",
    "C:/ProgramData/chocolatey/bin/gcc.exe",
  ],
  "gcc"
);

console.log(`[build-native] Compiling win32_helper.c with GCC (${gccBin})...`);
const gccCmd = `${gccBin} -O2 src/native/win32_helper.c -o bin/win32_helper.exe -luser32 -limm32`;
execSync(gccCmd, { cwd: ROOT, stdio: "inherit" });

const cscBin = findExecutable(
  [
    process.env.CSC_PATH,
    "C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe",
    "C:/Windows/Microsoft.NET/Framework/v4.0.30319/csc.exe",
  ],
  "csc"
);

console.log(`[build-native] Compiling uia_helper.cs with CSC (${cscBin})...`);
const refs = [
  `"C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\WPF\\UIAutomationClient.dll"`,
  `"C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\WPF\\UIAutomationTypes.dll"`,
  `"C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\WPF\\WindowsBase.dll"`,
];
const cscCmd = `${cscBin} /nologo ${refs.map((r) => `/r:${r}`).join(" ")} /out:"bin\\uia_helper.exe" "src\\native\\uia_helper.cs"`;
execSync(cscCmd, { cwd: ROOT, stdio: "inherit" });

console.log("[build-native] Native helpers compiled successfully.");
