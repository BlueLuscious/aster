import { ImportBaselineFactory } from "./runtime/import-baseline.factory.mjs";

/**
 * @description Complete development-only Import comparison composition.
 */
const importBaselineRunner = new ImportBaselineFactory().create();

process.stdout.write(`${JSON.stringify(await importBaselineRunner.run(), null, 2)}\n`);
