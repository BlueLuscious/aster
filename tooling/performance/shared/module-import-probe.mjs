import process from "node:process";

import { ModuleImportProbe } from "./runtime/module-import.probe.mjs";

/** @description Public package specifier received by the disposable probe process. */
const specifier = process.argv[2] ?? "";

/** @description Package root received by the disposable probe process. */
const packagePath = process.argv[3] ?? "";

/** @description Complete development-only module import probe composition. */
const moduleImportProbe = new ModuleImportProbe();

process.stdout.write(
  `${JSON.stringify(await moduleImportProbe.inspect(specifier, packagePath))}\n`,
);
