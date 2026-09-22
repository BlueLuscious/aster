import { SvgBaselineFactory } from "./runtime/svg-baseline.factory.mjs";

/**
 * @description Complete development-only SVG comparison composition.
 */
const svgBaselineRunner = new SvgBaselineFactory().create();

process.stdout.write(`${JSON.stringify(await svgBaselineRunner.run(), null, 2)}\n`);
