import { CoreBaselineFactory } from "./runtime/core-baseline.factory.mjs";

/**
 * @description Complete development-only Core comparison composition.
 */
const coreBaselineRunner = new CoreBaselineFactory().create();

process.stdout.write(`${JSON.stringify(await coreBaselineRunner.run(), null, 2)}\n`);
