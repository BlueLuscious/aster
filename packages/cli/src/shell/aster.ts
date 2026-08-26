#!/usr/bin/env node

import { createRequire } from "node:module";
import process from "node:process";
import { NodeShell } from "./runtime/node-shell.js";

/**
 * @description Package-local CommonJS bridge used only to acquire installed manifest metadata.
 */
const require = createRequire(import.meta.url);

/**
 * @description Installed package manifest containing the canonical executable version.
 */
const manifest = require("../../package.json") as Readonly<{ version: unknown }>;

if (typeof manifest.version !== "string" || manifest.version.length === 0) {
  throw new TypeError("Invalid installed Aster CLI package version");
}

/**
 * @description Standalone executable composition using installed product metadata.
 */
const shell = new NodeShell("Aster", manifest.version, process.cwd());

/**
 * @description Pure shell execution description produced from process arguments.
 */
const execution = await shell.execute(process.argv.slice(2));

if (execution.stdout.length > 0) {
  process.stdout.write(execution.stdout);
}

if (execution.stderr.length > 0) {
  process.stderr.write(execution.stderr);
}

process.exitCode = execution.exitCode;
