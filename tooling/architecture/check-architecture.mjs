import process from "node:process";
import { fileURLToPath } from "node:url";

import { NodeRepositoryFileSystem } from "../shared/runtime/node-repository-file-system.mjs";
import { RepositoryDirectoryReader } from "../shared/runtime/repository-directory.reader.mjs";
import { RepositoryFileWalker } from "../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";

/**
 * @description Node filesystem capability composed for architecture verification.
 */
const repositoryFileSystem = new NodeRepositoryFileSystem();

/**
 * @description Repository path capability composed for architecture verification.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Optional directory membership reader used by architecture discovery.
 */
const repositoryDirectories = new RepositoryDirectoryReader(repositoryFileSystem);

/**
 * @description Deterministic source file walker used by architecture inspection.
 */
const repositoryFiles = new RepositoryFileWalker(repositoryFileSystem, repositoryPaths);

/**
 * @description Strict JSON reader used for repository and package manifests.
 */
const repositoryJson = new RepositoryJsonReader(repositoryFileSystem);

/**
 * @description Absolute path to the repository root containing the architecture command.
 */
const defaultWorkspaceRoot = repositoryPaths.resolve(
  repositoryPaths.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/**
 * @description Dependency fields that may provide production package imports.
 */
const runtimeDependencyFields = Object.freeze([
  "dependencies",
  "peerDependencies",
  "optionalDependencies",
]);

/**
 * @description Canonical authored directories required for every real collection.
 */
const requiredCollectionDirectories = Object.freeze(["masters", "metadata", "svg"]);

/**
 * @description Generated directory names forbidden inside an authored collection boundary.
 */
const forbiddenCollectionDirectories = new Set([
  "contact-sheets",
  "dist",
  "generated",
  "normalised",
  "previews",
  "search-indexes",
]);

/**
 * @description Extracts statically recognisable module specifiers from source text.
 * @param {string} source - TypeScript or JavaScript module source.
 * @returns {string[]} Imported or re-exported module specifiers.
 */
function extractModuleSpecifiers(source) {
  const specifiers = [];
  const specifierPattern = /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu;

  for (const match of source.matchAll(specifierPattern)) {
    specifiers.push(match[1]);
  }

  return specifiers;
}

/**
 * @description Combines production dependency fields into one lookup.
 * @param {Record<string, unknown>} manifest - Package manifest to inspect.
 * @returns {Record<string, string>} Production dependency names and specifiers.
 */
function readRuntimeDependencies(manifest) {
  const dependencies = {};

  for (const field of runtimeDependencyFields) {
    Object.assign(dependencies, manifest[field] ?? {});
  }

  return dependencies;
}

/**
 * @description Extracts pnpm workspace member patterns from the repository YAML.
 * @param {string} source - pnpm workspace YAML source.
 * @returns {string[]} Sorted member patterns.
 */
function readPnpmWorkspacePatterns(source) {
  return source
    .split(/\r?\n/gu)
    .map((line) => /^\s*-\s*["']?([^"'#]+?)["']?\s*$/u.exec(line)?.[1]?.trim())
    .filter((pattern) => pattern !== undefined)
    .sort((left, right) => left.localeCompare(right));
}

/**
 * @description Verifies the host-independent ES2022 root compiler authority.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after the compiler baseline is inspected.
 */
async function validateCompilerBaseline(workspaceRoot, issues) {
  const configuration = await repositoryJson.read(repositoryPaths.resolve(workspaceRoot, "tsconfig.base.json"));
  const options = configuration.compilerOptions ?? {};
  const expectedOptions = {
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "Bundler",
    types: [],
    lib: ["ES2022"],
  };

  for (const [name, expected] of Object.entries(expectedOptions)) {
    if (JSON.stringify(options[name]) !== JSON.stringify(expected)) {
      issues.push(
        `tsconfig.base.json compilerOptions.${name} must be ${JSON.stringify(expected)}`,
      );
    }
  }

  if (options.verbatimModuleSyntax !== true) {
    issues.push("tsconfig.base.json must enable verbatimModuleSyntax");
  }
}

/**
 * @description Verifies equivalent root workspace membership authorities.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after both workspace manifests are compared.
 */
async function validateWorkspaceMetadata(workspaceRoot, issues) {
  const manifest = await repositoryJson.read(
    repositoryPaths.resolve(workspaceRoot, "package.json"),
  );
  const manifestPatterns = [...(manifest.workspaces ?? [])].sort((left, right) =>
    left.localeCompare(right),
  );
  const pnpmPatterns = readPnpmWorkspacePatterns(
    await repositoryFileSystem.readText(
      repositoryPaths.resolve(workspaceRoot, "pnpm-workspace.yaml"),
    ),
  );

  if (JSON.stringify(manifestPatterns) !== JSON.stringify(pnpmPatterns)) {
    issues.push("package.json and pnpm-workspace.yaml must declare equivalent workspace members");
  }
}

/**
 * @description Verifies compiler overrides for one host-independent production package.
 * @param {string} packageRoot - Absolute package directory.
 * @param {string} packageName - Package name used in deterministic issues.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after optional package compiler settings are inspected.
 */
async function validatePortableCompilerOptions(
  packageRoot,
  packageName,
  issues,
) {
  const configurationPath = repositoryPaths.resolve(packageRoot, "tsconfig.json");

  if (!(await repositoryFileSystem.exists(configurationPath))) {
    return;
  }

  const configuration = await repositoryJson.read(configurationPath);
  const options = configuration.compilerOptions ?? {};

  if (Array.isArray(options.lib) && options.lib.some((entry) => entry !== "ES2022")) {
    issues.push(`${packageName} cannot add host libraries to compilerOptions.lib`);
  }

  if (Array.isArray(options.types) && options.types.length > 0) {
    issues.push(`${packageName} cannot add ambient compilerOptions.types`);
  }
}

/**
 * @description Verifies the exact dependency-free public package boundary proven by portable Core.
 * @param {Record<string, unknown>} manifest - Parsed Core package manifest.
 * @param {Record<string, string>} dependencies - Combined production dependency fields.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {void} This validation mutates only the provided issue collection.
 */
function validateCorePackageBoundary(manifest, dependencies, issues) {
  const dependencyNames = Object.keys(dependencies);

  if (dependencyNames.length > 0) {
    issues.push(
      `@aster/core cannot declare production dependencies: ${dependencyNames.sort().join(", ")}`,
    );
  }

  if (manifest.sideEffects !== false) {
    issues.push("@aster/core must declare package.json#sideEffects as false");
  }

  const exports = manifest.exports;
  const exportKeys =
    typeof exports === "object" && exports !== null ? Object.keys(exports) : [];
  const rootExport =
    typeof exports === "object" && exports !== null ? exports["."] : undefined;

  if (JSON.stringify(exportKeys) !== JSON.stringify(["."])) {
    issues.push('@aster/core must expose only the root "." package export');
  }

  if (
    typeof rootExport !== "object" ||
    rootExport === null ||
    rootExport.import !== "./dist/index.js" ||
    rootExport.types !== "./dist/index.d.ts"
  ) {
    issues.push("@aster/core root export must provide the accepted ESM and declaration entries");
  }
}

/**
 * @description Verifies the private root-only Build package and its pinned parser dependency.
 * @param {Record<string, unknown>} manifest - Parsed Build package manifest.
 * @param {Record<string, string>} dependencies - Combined production dependency fields.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {void} This validation mutates only the provided issue collection.
 */
function validateBuildPackageBoundary(manifest, dependencies, issues) {
  const allowedDependencies = new Set(["@aster/core", "xmlsax-typescript"]);

  for (const name of Object.keys(dependencies)) {
    if (!allowedDependencies.has(name)) {
      issues.push(`@aster/build cannot declare unaccepted production dependency ${name}`);
    }
  }

  if (dependencies["xmlsax-typescript"] !== "1.0.0") {
    issues.push("@aster/build must pin the accepted xmlsax-typescript parser at 1.0.0");
  }

  if (manifest.sideEffects !== false) {
    issues.push("@aster/build must declare package.json#sideEffects as false");
  }

  const exports = manifest.exports;
  const exportKeys =
    typeof exports === "object" && exports !== null ? Object.keys(exports) : [];
  const rootExport =
    typeof exports === "object" && exports !== null ? exports["."] : undefined;

  if (JSON.stringify(exportKeys) !== JSON.stringify(["."])) {
    issues.push('@aster/build must expose only the root "." package export');
  }

  if (
    typeof rootExport !== "object" ||
    rootExport === null ||
    rootExport.import !== "./dist/index.js" ||
    rootExport.types !== "./dist/index.d.ts"
  ) {
    issues.push("@aster/build root export must provide the accepted ESM and declaration entries");
  }
}

/**
 * @description Verifies the public root-only CLI package and its accepted dependency direction.
 * @param {Record<string, unknown>} manifest - Parsed CLI package manifest.
 * @param {Record<string, string>} dependencies - Combined production dependency fields.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {void} This validation mutates only the provided issue collection.
 */
function validateCliPackageBoundary(manifest, dependencies, issues) {
  const allowedDependencies = new Set(["@aster/core", "@aster/icons"]);

  for (const name of Object.keys(dependencies)) {
    if (!allowedDependencies.has(name)) {
      issues.push(`@aster/cli cannot declare unaccepted production dependency ${name}`);
    }
  }

  if (manifest.private === true) {
    issues.push("@aster/cli must remain a public package");
  }

  if (manifest.sideEffects !== false) {
    issues.push("@aster/cli must declare package.json#sideEffects as false");
  }

  const exports = manifest.exports;
  const exportKeys =
    typeof exports === "object" && exports !== null ? Object.keys(exports) : [];
  const rootExport =
    typeof exports === "object" && exports !== null ? exports["."] : undefined;

  if (JSON.stringify(exportKeys) !== JSON.stringify(["."])) {
    issues.push('@aster/cli must expose only the root "." package export');
  }

  if (
    typeof rootExport !== "object" ||
    rootExport === null ||
    rootExport.import !== "./dist/index.js" ||
    rootExport.types !== "./dist/index.d.ts"
  ) {
    issues.push("@aster/cli root export must provide the accepted ESM and declaration entries");
  }
}

/**
 * @description Reports cyclic production dependencies between workspace packages.
 * @param {Map<string, Set<string>>} graph - Workspace production dependency graph.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {void} This validation mutates only the provided issue collection.
 */
function validateDependencyCycles(graph, issues) {
  const visited = new Set();
  const active = new Set();

  /**
   * @description Visits one workspace package and detects a dependency back edge.
   * @param {string} name - Workspace package name being visited.
   * @param {string[]} trail - Ordered dependency path leading to the package.
   * @returns {void} This traversal mutates validation state and issues.
   */
  function visit(name, trail) {
    if (active.has(name)) {
      issues.push(`Workspace production dependency cycle: ${[...trail, name].join(" -> ")}`);
      return;
    }

    if (visited.has(name)) {
      return;
    }

    active.add(name);

    for (const dependency of graph.get(name) ?? []) {
      visit(dependency, [...trail, name]);
    }

    active.delete(name);
    visited.add(name);
  }

  for (const name of graph.keys()) {
    visit(name, []);
  }
}

/**
 * @description Verifies package manifests, dependency declarations, and implementation imports.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after every real package is inspected.
 */
async function validatePackages(workspaceRoot, issues) {
  const packagesRoot = repositoryPaths.resolve(workspaceRoot, "packages");
  const packageDirectories = await repositoryDirectories.read(packagesRoot);
  const packages = [];
  const names = new Set();

  for (const directory of packageDirectories) {
    const packageRoot = repositoryPaths.resolve(packagesRoot, directory);
    const manifestPath = repositoryPaths.resolve(packageRoot, "package.json");

    if (!(await repositoryFileSystem.exists(manifestPath))) {
      issues.push(`packages/${directory} must contain package.json`);
      continue;
    }

    const manifest = await repositoryJson.read(manifestPath);

    if (typeof manifest.name !== "string" || manifest.name.length === 0) {
      issues.push(`packages/${directory}/package.json must declare a package name`);
      continue;
    }

    if (names.has(manifest.name)) {
      issues.push(`Duplicate workspace package name: ${manifest.name}`);
      continue;
    }

    if (manifest.type !== "module") {
      issues.push(`${manifest.name} must declare ESM through package.json#type`);
    }

    names.add(manifest.name);
    packages.push({ directory, manifest, packageRoot });
  }

  const graph = new Map();

  for (const packageRecord of packages) {
    const { manifest, packageRoot } = packageRecord;
    const dependencies = readRuntimeDependencies(manifest);
    const workspaceDependencies = new Set();

    for (const [name, specifier] of Object.entries(dependencies)) {
      if (!names.has(name)) {
        continue;
      }

      workspaceDependencies.add(name);

      if (typeof specifier !== "string" || !specifier.startsWith("workspace:")) {
        issues.push(`${manifest.name} must use the workspace protocol for ${name}`);
      }
    }

    graph.set(manifest.name, workspaceDependencies);

    if (manifest.name === "@aster/core") {
      if (workspaceDependencies.size > 0) {
        issues.push("@aster/core cannot depend on another workspace package");
      }

      for (const name of Object.keys(dependencies)) {
        if (/(?:^|[/@-])(?:lilium|lotus)(?:$|[/@-])/iu.test(name)) {
          issues.push(`@aster/core cannot depend on host ecosystem package ${name}`);
        }
      }

      validateCorePackageBoundary(manifest, dependencies, issues);
      await validatePortableCompilerOptions(packageRoot, manifest.name, issues);
    }

    if (manifest.name === "@aster/build") {
      if (manifest.private !== true) {
        issues.push("@aster/build must remain a private build-time package");
      }

      for (const name of workspaceDependencies) {
        if (name !== "@aster/core") {
          issues.push(`@aster/build cannot depend on workspace package ${name}`);
        }
      }

      for (const name of Object.keys(dependencies)) {
        if (/(?:^|[/@-])(?:lilium|lotus)(?:$|[/@-])/iu.test(name)) {
          issues.push(`@aster/build cannot depend on host ecosystem package ${name}`);
        }
      }

      validateBuildPackageBoundary(manifest, dependencies, issues);
      await validatePortableCompilerOptions(packageRoot, manifest.name, issues);
    }

    if (manifest.name === "@aster/cli") {
      for (const name of workspaceDependencies) {
        if (name !== "@aster/core" && name !== "@aster/icons") {
          issues.push(`@aster/cli cannot depend on workspace package ${name}`);
        }
      }

      validateCliPackageBoundary(manifest, dependencies, issues);
      await validatePortableCompilerOptions(packageRoot, manifest.name, issues);
    }

    const modules = await repositoryFiles.collect(
      repositoryPaths.resolve(packageRoot, "src"),
      (path) => /\.[cm]?[jt]sx?$/u.test(path),
    );

    for (const modulePath of modules) {
      const source = await repositoryFileSystem.readText(modulePath);

      for (const specifier of extractModuleSpecifiers(source)) {
        if (specifier.startsWith(".")) {
          const target = repositoryPaths.resolve(repositoryPaths.dirname(modulePath), specifier);

          if (repositoryPaths.contains(packagesRoot, target) && !repositoryPaths.contains(packageRoot, target)) {
            issues.push(
              `${repositoryPaths.relative(workspaceRoot, modulePath)} imports another package through a relative path`,
            );
          }

          if (
            manifest.name === "@aster/build" &&
            repositoryPaths.contains(repositoryPaths.resolve(workspaceRoot, "tooling"), target)
          ) {
            issues.push(
              `${repositoryPaths.relative(workspaceRoot, modulePath)} imports repository tooling into @aster/build`,
            );
          }

          if (
            manifest.name === "@aster/build" &&
            repositoryPaths.resolve(modulePath) === repositoryPaths.resolve(packageRoot, "src/index.ts") &&
            repositoryPaths.contains(repositoryPaths.resolve(packageRoot, "src/parser"), target)
          ) {
            issues.push(
              "@aster/build cannot expose its untrusted parser feature from the package root",
            );
          }

          if (
            manifest.name === "@aster/build" &&
            repositoryPaths.resolve(modulePath) === repositoryPaths.resolve(packageRoot, "src/index.ts") &&
            repositoryPaths.contains(repositoryPaths.resolve(packageRoot, "src/validation"), target)
          ) {
            issues.push(
              "@aster/build cannot expose its internal validation feature from the package root",
            );
          }

          if (
            manifest.name === "@aster/build" &&
            repositoryPaths.resolve(modulePath) === repositoryPaths.resolve(packageRoot, "src/index.ts") &&
            repositoryPaths.contains(repositoryPaths.resolve(packageRoot, "src/generator"), target)
          ) {
            issues.push(
              "@aster/build cannot expose its internal generator feature from the package root",
            );
          }

          if (
            manifest.name === "@aster/build" &&
            repositoryPaths.contains(repositoryPaths.resolve(packageRoot, "src/normalisation"), modulePath) &&
            repositoryPaths.contains(repositoryPaths.resolve(packageRoot, "src/validation/runtime"), target)
          ) {
            issues.push(
              `${repositoryPaths.relative(workspaceRoot, modulePath)} cannot import Validation runtime implementations`,
            );
          }

          continue;
        }

        if (manifest.name === "@aster/build" && specifier.startsWith("node:")) {
          issues.push(
            `${repositoryPaths.relative(workspaceRoot, modulePath)} imports a Node adapter into @aster/build`,
          );
        }

        if (
          manifest.name === "@aster/cli" &&
          specifier.startsWith("node:") &&
          !repositoryPaths.contains(repositoryPaths.resolve(packageRoot, "src/shell"), modulePath)
        ) {
          issues.push(
            `${repositoryPaths.relative(workspaceRoot, modulePath)} imports Node authority outside the CLI shell`,
          );
        }

        if (specifier === "xmlsax-typescript") {
          const implementationPath = repositoryPaths.resolve(
            packageRoot,
            "src/parser/runtime/svg.parser.ts",
          );

          if (
            manifest.name !== "@aster/build" ||
            repositoryPaths.resolve(modulePath) !== implementationPath
          ) {
            issues.push(
              `${repositoryPaths.relative(workspaceRoot, modulePath)} imports the XML parser outside its accepted private adapter`,
            );
          }
        }

        const workspaceDependency = [...names]
          .sort((left, right) => right.length - left.length)
          .find((name) => specifier === name || specifier.startsWith(`${name}/`));

        if (
          workspaceDependency !== undefined &&
          workspaceDependency !== manifest.name &&
          !workspaceDependencies.has(workspaceDependency)
        ) {
          issues.push(
            `${manifest.name} imports undeclared workspace dependency ${workspaceDependency}`,
          );
        }
      }
    }
  }

  validateDependencyCycles(graph, issues);
}

/**
 * @description Verifies canonical authored collection directory boundaries.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after every real collection is inspected.
 */
async function validateCollections(workspaceRoot, issues) {
  const collectionsRoot = repositoryPaths.resolve(workspaceRoot, "collections");
  const collections = await repositoryDirectories.read(collectionsRoot);

  for (const collection of collections) {
    const collectionRoot = repositoryPaths.resolve(collectionsRoot, collection);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(collection)) {
      issues.push(`Collection directory must use a canonical kebab-case slug: ${collection}`);
    }

    const directories = await repositoryDirectories.read(collectionRoot);

    for (const required of requiredCollectionDirectories) {
      if (!directories.includes(required)) {
        issues.push(`collections/${collection} is missing authored ${required}/ source`);
      }
    }

    for (const directory of directories) {
      if (forbiddenCollectionDirectories.has(directory)) {
        issues.push(
          `collections/${collection}/${directory}/ cannot be inside an authored collection`,
        );
      }
    }
  }
}

/**
 * @description Verifies accepted repository architecture for one explicit workspace.
 * @param {string} workspaceRoot - Absolute repository root to verify.
 * @returns {Promise<string[]>} Architecture issues found in deterministic validation order.
 */
export async function verifyArchitecture(workspaceRoot) {
  const issues = [];

  await validateCompilerBaseline(workspaceRoot, issues);
  await validateWorkspaceMetadata(workspaceRoot, issues);
  await validatePackages(workspaceRoot, issues);
  await validateCollections(workspaceRoot, issues);

  return issues;
}

/**
 * @description Adapts architecture verification to terminal output and process exit state.
 * @returns {Promise<void>} Completion after diagnostics are printed and exit state is set.
 */
async function main() {
  const issues = await verifyArchitecture(defaultWorkspaceRoot);

  if (issues.length > 0) {
    process.stderr.write(
      `Architecture verification failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write("Architecture verification passed.\n");
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
