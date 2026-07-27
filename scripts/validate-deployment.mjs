import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredFiles = [
  ".dockerignore",
  "infrastructure/docker/api.Dockerfile",
  "infrastructure/docker/admin.Dockerfile",
  "infrastructure/docker/reader.Dockerfile",
  "infrastructure/docker/nginx.conf",
  "infrastructure/docker/compose.yaml",
  "infrastructure/deployment/local.example.env",
  "infrastructure/deployment/production.example.env",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
];
const contents = new Map();

for (const relativePath of requiredFiles) {
  const content = await readFile(join(repositoryRoot, relativePath), "utf8");
  contents.set(relativePath, content);
  console.log(`PASS ${relativePath}`);
}

for (const dockerfile of [
  "infrastructure/docker/api.Dockerfile",
  "infrastructure/docker/admin.Dockerfile",
  "infrastructure/docker/reader.Dockerfile",
]) {
  const content = requiredContent(dockerfile);
  const baseImages = [...content.matchAll(/^FROM\s+([^\s]+)/gmu)].map((match) => match[1] ?? "");
  if (
    baseImages.length < 2 ||
    baseImages.some((image) => !/:\d/u.test(image) || image.endsWith(":latest"))
  ) {
    throw new Error(`${dockerfile} must use explicit versioned base images.`);
  }
  if (!content.includes("HEALTHCHECK")) {
    throw new Error(`${dockerfile} is missing a health check.`);
  }
}

const compose = requiredContent("infrastructure/docker/compose.yaml");
for (const fragment of [
  "condition: service_completed_successfully",
  "read_only: true",
  "cap_drop:",
  "FOLLOWREAD_IMAGE_VERSION",
  "followread-data:/data",
]) {
  if (!compose.includes(fragment)) {
    throw new Error(`compose.yaml is missing required control: ${fragment}`);
  }
}
if (/privileged:\s*true/u.test(compose) || /password|secret|token/iu.test(compose)) {
  throw new Error("compose.yaml contains a privileged service or a secret-like field.");
}

const productionExample = requiredContent("infrastructure/deployment/production.example.env");
if (
  !productionExample.includes("example.invalid") ||
  /=[A-Za-z0-9/+]{24,}/u.test(productionExample)
) {
  throw new Error("Production example must contain placeholders and no secret-like values.");
}

const releaseWorkflow = requiredContent(".github/workflows/release.yml");
for (const fragment of [
  "tags:",
  "pnpm security:audit",
  "docker build",
  "docker push",
  "gh release create",
]) {
  if (!releaseWorkflow.includes(fragment)) {
    throw new Error(`Release workflow is missing: ${fragment}`);
  }
}

console.log("Deployment static validation PASS");

function requiredContent(relativePath) {
  const content = contents.get(relativePath);
  if (content === undefined) {
    throw new Error(`Required deployment file was not loaded: ${relativePath}`);
  }
  return content;
}
