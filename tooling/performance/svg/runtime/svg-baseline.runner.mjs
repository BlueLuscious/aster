import { Icon } from "@aster/core";
import { Svg } from "@aster/svg";
import { svgBaseline } from "../constants/svg-baseline.constant.mjs";

/**
 * @description Coordinates SVG-only rendering and distribution baseline evidence.
 */
export class SvgBaselineRunner {
  /** @description Generic deterministic scenario runner. */
  #benchmarkRunner;

  /** @description Emitted package shape inspector. */
  #distributionInspector;

  /** @description Measurement host providing environment identity. */
  #host;

  /**
   * @description Prepared public SVG inputs.
   * @type {import("../contracts/internal/svg-baseline-fixtures.contract.mjs").ISvgBaselineFixtures}
   */
  #fixtures;

  /**
   * @description Creates one SVG baseline composition.
   * @param {{ measure(scenario: { name: string, operationsPerSample: number, execute(iterations: number): number | PromiseLike<number> }): Promise<object>, methodology(): object }} benchmarkRunner - Generic measurement authority.
   * @param {{ inspect(packagePath: string): Promise<object> }} distributionInspector - Package distribution authority.
   * @param {{ environment(): object }} host - Runtime environment authority.
   * @param {import("../contracts/internal/svg-baseline-fixtures.contract.mjs").ISvgBaselineFixtures} fixtures - Prepared public SVG scenario inputs.
   */
  constructor(benchmarkRunner, distributionInspector, host, fixtures) {
    this.#benchmarkRunner = benchmarkRunner;
    this.#distributionInspector = distributionInspector;
    this.#host = host;
    this.#fixtures = fixtures;
  }

  /**
   * @description Runs representative public SVG rendering comparisons.
   * @returns {Promise<object>} Immutable serialisable SVG baseline report.
   */
  async run() {
    const scenarios = [
      Object.freeze({
        ...svgBaseline.scenarios.coreRevalidation,
        execute: (iterations) => this.#revalidate(iterations),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.minimal,
        execute: (iterations) =>
          this.#render([this.#fixtures.minimalDefinition], undefined, iterations),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.primitives,
        execute: (iterations) =>
          this.#render([this.#fixtures.primitivesDefinition], undefined, iterations),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.corpus,
        execute: (iterations) =>
          this.#render(this.#fixtures.corpusDefinitions, undefined, iterations),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.semantic,
        execute: (iterations) =>
          this.#render(
            [this.#fixtures.minimalDefinition],
            this.#fixtures.semanticOptions,
            iterations,
          ),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.overrides,
        execute: (iterations) =>
          this.#render(
            [this.#fixtures.overrideDefinition],
            this.#fixtures.overrideOptions,
            iterations,
          ),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.rtlMirror,
        execute: (iterations) =>
          this.#render(
            [this.#fixtures.rtlDefinition],
            this.#fixtures.rtlOptions,
            iterations,
          ),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.escaping,
        execute: (iterations) =>
          this.#render(
            [this.#fixtures.escapingDefinition],
            this.#fixtures.escapingOptions,
            iterations,
          ),
      }),
      Object.freeze({
        ...svgBaseline.scenarios.pointSequence,
        execute: (iterations) =>
          this.#render(
            [this.#fixtures.pointSequenceDefinition],
            undefined,
            iterations,
          ),
      }),
    ];

    const results = [];

    for (const scenario of scenarios) {
      results.push(await this.#benchmarkRunner.measure(scenario));
    }

    return Object.freeze({
      schemaVersion: svgBaseline.schemaVersion,
      package: svgBaseline.packageName,
      environment: this.#host.environment(),
      methodology: this.#benchmarkRunner.methodology(),
      distribution: await this.#distributionInspector.inspect(
        svgBaseline.packagePath,
      ),
      scenarios: Object.freeze(results),
    });
  }

  /**
   * @description Measures the public Core reconstruction necessarily performed by SVG rendering.
   * @param {number} iterations - Number of public API operations to execute.
   * @returns {number} Deterministic checksum consuming reconstructed definitions.
   */
  #revalidate(iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const definition = Icon.define(this.#fixtures.minimalDefinition);
      checksum = (checksum + definition.nodes.length) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Renders prepared definitions and consumes every complete markup result.
   * @param {readonly import("@aster/core").IconDefinition[]} definitions - Prepared canonical definitions selected in round-robin order.
   * @param {import("@aster/core").IconRenderOptions | undefined} options - Prepared optional render value.
   * @param {number} iterations - Number of public SVG operations to execute.
   * @returns {number} Deterministic checksum over complete markup bytes.
   */
  #render(definitions, options, iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const definition = definitions[index % definitions.length];

      if (definition === undefined) {
        throw new TypeError("The SVG scenario requires prepared definitions.");
      }

      const markup = Svg.render(definition, options);
      checksum = this.#checksum(checksum, markup);
    }

    return checksum;
  }

  /**
   * @description Folds every UTF-16 code unit into one deterministic unsigned checksum.
   * @param {number} seed - Previous unsigned checksum state.
   * @param {string} value - Complete markup result to consume.
   * @returns {number} Updated unsigned checksum.
   */
  #checksum(seed, value) {
    let checksum = seed;

    for (let index = 0; index < value.length; index += 1) {
      checksum = (Math.imul(checksum, 31) + value.charCodeAt(index)) >>> 0;
    }

    return checksum;
  }
}
