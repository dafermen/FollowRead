import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

const options = parseArguments(process.argv.slice(2));
const version = options.get("version");
const output = options.get("output");
if (version === undefined || !/^v\d+\.\d+\.\d+$/u.test(version)) {
  throw new Error("Release version must be a SemVer tag such as v1.2.3.");
}

const previousTag = git(["describe", "--tags", "--abbrev=0", "--match", "v*", "HEAD^"], true);
const range = previousTag === "" ? "HEAD" : `${previousTag}..HEAD`;
const commits = git(["log", "--pretty=format:%s", range]).split(/\r?\n/u).filter(Boolean);
const notes = [
  `# FollowRead ${version}`,
  "",
  `Cambios desde ${previousTag === "" ? "el inicio del historial" : previousTag}:`,
  "",
  ...(commits.length === 0
    ? ["- Sin cambios registrados."]
    : commits.map((message) => `- ${message}`)),
  "",
  "## Validación requerida",
  "",
  "- `pnpm quality:regression`",
  "- smoke tests de API, Admin y Reader",
  "- backup SQLite antes de migraciones",
  "- aprobación del entorno antes de producción",
  "",
].join("\n");

if (output === undefined) {
  process.stdout.write(notes);
} else {
  await writeFile(output, notes, "utf8");
  console.log(`Release notes written to ${output}`);
}

function git(args, allowFailure = false) {
  const result = spawnSync("git", args, { encoding: "utf8", shell: false });
  if (result.status !== 0) {
    if (allowFailure) {
      return "";
    }
    throw new Error(result.stderr.trim() || "Git command failed.");
  }
  return result.stdout.trim();
}

function parseArguments(args) {
  const parsed = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (key === undefined || value === undefined || !key.startsWith("--")) {
      throw new Error("Release arguments must use --name value pairs.");
    }
    parsed.set(key.slice(2), value);
  }
  return parsed;
}
