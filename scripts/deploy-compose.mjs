import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const composeFile = join(repositoryRoot, "infrastructure", "docker", "compose.yaml");
const argumentsMap = parseArguments(process.argv.slice(2));
const environment = argumentsMap.get("environment") ?? "local";
const rollbackVersion = argumentsMap.get("rollback");
const envFileArgument =
  argumentsMap.get("env-file") ??
  join(repositoryRoot, "infrastructure", "deployment", `${environment}.env`);
const envFile = isAbsolute(envFileArgument) ? envFileArgument : resolve(envFileArgument);

if (!["local", "development", "staging", "production"].includes(environment)) {
  throw new Error("Environment must be local, development, staging or production.");
}
if (!existsSync(envFile)) {
  throw new Error(
    `Deployment environment file not found: ${envFile}. Copy the matching .example.env outside Git.`,
  );
}
if (
  ["staging", "production"].includes(environment) &&
  process.env["FOLLOWREAD_DEPLOY_APPROVED"] !== "YES"
) {
  throw new Error(`${environment} deployment requires FOLLOWREAD_DEPLOY_APPROVED=YES.`);
}
if (rollbackVersion !== undefined && !/^v\d+\.\d+\.\d+$/u.test(rollbackVersion)) {
  throw new Error("Rollback version must be a SemVer tag such as v1.2.3.");
}

runDocker(["version"]);
const common = ["compose", "--env-file", envFile, "--file", composeFile];
runDocker([...common, "config", "--quiet"]);

const childEnvironment = { ...process.env };
if (rollbackVersion !== undefined) {
  childEnvironment["FOLLOWREAD_IMAGE_VERSION"] = rollbackVersion;
  runDocker([...common, "pull", "api", "admin", "reader"], childEnvironment);
  runDocker(
    [...common, "up", "--detach", "--no-build", "--no-deps", "api", "admin", "reader"],
    childEnvironment,
  );
  console.log(
    `Rollback deployed ${rollbackVersion}. Database migrations were not downgraded; run smoke tests.`,
  );
} else {
  runDocker([...common, "up", "--detach", "--build", "--wait"]);
  console.log(`FollowRead ${environment} deployment is healthy.`);
}

function runDocker(args, environmentVariables = process.env) {
  const executable = process.platform === "win32" ? "docker.exe" : "docker";
  const result = spawnSync(executable, args, {
    cwd: repositoryRoot,
    env: environmentVariables,
    stdio: "inherit",
    shell: false,
  });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function parseArguments(args) {
  const parsed = new Map();
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === undefined || !key.startsWith("--")) {
      throw new Error(`Unexpected deployment argument: ${key ?? ""}`);
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${key}.`);
    }
    parsed.set(key.slice(2), value);
    index += 1;
  }
  return parsed;
}
