import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { CatalogueIconRemovalCommand } from "./runtime/catalogue-icon-removal.command.mjs";
import { CatalogueIconRemovalPlanner } from "./runtime/catalogue-icon-removal.planner.mjs";

/** @description Explicit workspace boundary relative to this private command. */
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await new CatalogueIconRemovalCommand(new CatalogueIconRemovalPlanner(workspaceRoot), process).run();
}
