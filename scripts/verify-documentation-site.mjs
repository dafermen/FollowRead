import { access, readdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputRoot = join(repositoryRoot, "apps", "admin-web", "dist", "docs");

const requiredPages = [
  "index.html",
  "ARCHITECTURE.html",
  join("requirements", "PRODUCT_VISION.html"),
  join("project-management", "PROJECT_STATUS.html"),
  "404.html",
  "followread.svg",
];

for (const relativePath of requiredPages) {
  await access(join(outputRoot, relativePath));
}

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
    }),
  );
  return nestedFiles.flat();
};

const files = await collectFiles(outputRoot);
const JavaScriptFiles = files.filter((path) => path.endsWith(".js"));
const styleFiles = files.filter((path) => path.endsWith(".css"));

if (JavaScriptFiles.length === 0 || styleFiles.length === 0) {
  throw new Error("The documentation build must include executable JavaScript and CSS assets.");
}

for (const path of [...JavaScriptFiles, ...styleFiles]) {
  if ((await stat(path)).size === 0) {
    throw new Error(`Generated documentation asset is empty: ${path}`);
  }
}

const searchableFiles = files.filter((path) => /\.(?:html|js|css)$/u.test(path));
const builtContent = (
  await Promise.all(searchableFiles.map(async (path) => readFile(path, "utf8")))
).join("\n");

for (const requiredText of [
  "FollowRead Documentation",
  "Product vision",
  "Back to the application",
]) {
  if (!builtContent.includes(requiredText)) {
    throw new Error(`The generated documentation is missing: ${requiredText}`);
  }
}

if (builtContent.includes("/docs/docs/")) {
  throw new Error("The generated documentation contains a duplicated /docs/docs/ route.");
}

console.log(
  `Documentation site PASS (${String(requiredPages.length)} pages, ${String(JavaScriptFiles.length)} JavaScript assets, ${String(styleFiles.length)} CSS assets)`,
);
