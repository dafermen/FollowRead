import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const requiredFiles = [
  "README.md",
  "AGENTS.md",
  "CURRENT_STATUS.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "THIRD_PARTY_LICENSES.md",
  ".env.example",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  "docs/ARCHITECTURE.md",
  "docs/API.md",
  "docs/DEVELOPMENT.md",
  "docs/TESTING.md",
  "docs/DEPLOYMENT.md",
  "docs/OPERATIONS.md",
  "docs/SECURITY.md",
  "docs/TROUBLESHOOTING.md",
  "docs/adr/README.md",
  "docs/testing/PRE_DEPLOYMENT_TESTS.md",
  "test/README.md",
  "test/fixtures/README.md",
];

const requiredTestCategories = [
  "Acceptance",
  "Unit",
  "Properties and invariants",
  "Mutation testing",
  "Fuzzing",
  "Integration",
  "Contract",
  "End-to-end",
  "Regression",
  "Security",
  "Concurrency and resilience",
  "Performance and resources",
  "Compatibility and deployment",
];

for (const relativePath of requiredFiles) {
  await access(join(repositoryRoot, relativePath));
  console.log(`PASS ${relativePath}`);
}

const preDeploymentPath = join(repositoryRoot, "docs/testing/PRE_DEPLOYMENT_TESTS.md");
const preDeployment = await readFile(preDeploymentPath, "utf8");
for (const category of requiredTestCategories) {
  if (!preDeployment.includes(category)) {
    throw new Error(`Missing pre-deployment test category: ${category}`);
  }
}

for (const status of ["PARTIAL", "NOT_IMPLEMENTED", "BLOCKED"]) {
  if (!preDeployment.includes(status)) {
    throw new Error(`The test matrix must expose incomplete work with status ${status}.`);
  }
}

const markdownFiles = requiredFiles.filter((path) => path.endsWith(".md"));
for (const relativePath of markdownFiles) {
  const absolutePath = join(repositoryRoot, relativePath);
  const content = await readFile(absolutePath, "utf8");
  const links = [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/gu)];
  for (const match of links) {
    const rawTarget = match[1]?.trim() ?? "";
    if (
      rawTarget.length === 0 ||
      rawTarget.startsWith("#") ||
      /^(?:https?:|mailto:)/u.test(rawTarget)
    ) {
      continue;
    }
    const pathWithoutFragment = rawTarget.split("#", 1)[0] ?? "";
    const decodedTarget = decodeURIComponent(pathWithoutFragment.replace(/^<|>$/gu, ""));
    await access(resolve(dirname(absolutePath), decodedTarget));
  }
}

console.log("Documentation structure and pre-deployment matrix PASS");
