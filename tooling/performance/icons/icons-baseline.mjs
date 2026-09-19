import { IconsBaselineFactory } from "./runtime/icons-baseline.factory.mjs";

/**
 * @description Complete development-only Icons distribution comparison composition.
 */
const iconsBaselineRunner = new IconsBaselineFactory().create();

process.stdout.write(`${JSON.stringify(await iconsBaselineRunner.run(), null, 2)}\n`);
