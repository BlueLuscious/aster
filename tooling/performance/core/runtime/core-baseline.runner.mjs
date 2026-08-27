import { Collection, Icon } from "@aster/core";
import { coreBaseline } from "../constants/core-baseline.constant.mjs";

/**
 * @description Coordinates Core-only construction and distribution baseline evidence.
 */
export class CoreBaselineRunner {
  /**
   * @description Generic deterministic scenario runner.
   */
  #benchmarkRunner;

  /**
   * @description Emitted package shape inspector.
   */
  #distributionInspector;

  /**
   * @description Measurement host providing environment identity.
   */
  #host;

  /**
   * @description Prepared mutable and canonical public Core inputs.
   * @type {import("../contracts/internal/core-baseline-fixtures.contract.mjs").ICoreBaselineFixtures}
   */
  #fixtures;

  /**
   * @description Creates one Core baseline composition.
   * @param {{ measure(scenario: { name: string, operationsPerSample: number, execute(iterations: number): number | PromiseLike<number> }): Promise<object>, methodology(): object }} benchmarkRunner - Generic measurement authority.
   * @param {{ inspect(packagePath: string): Promise<object> }} distributionInspector - Package distribution authority.
   * @param {{ environment(): object }} host - Runtime environment authority.
   * @param {import("../contracts/internal/core-baseline-fixtures.contract.mjs").ICoreBaselineFixtures} fixtures - Prepared public Core scenario inputs.
   */
  constructor(benchmarkRunner, distributionInspector, host, fixtures) {
    this.#benchmarkRunner = benchmarkRunner;
    this.#distributionInspector = distributionInspector;
    this.#host = host;
    this.#fixtures = fixtures;
  }

  /**
   * @description Runs representative icon and collection construction comparisons.
   * @returns {Promise<object>} Immutable serialisable Core baseline report.
   */
  async run() {
    const scenarios = [
      Object.freeze({
        ...coreBaseline.scenarios.iconMutable,
        execute: (iterations) =>
          this.#defineIcons(this.#fixtures.mutableIcons, iterations),
      }),
      Object.freeze({
        ...coreBaseline.scenarios.iconCanonical,
        execute: (iterations) =>
          this.#defineIcons(this.#fixtures.canonicalIcons, iterations),
      }),
      Object.freeze({
        ...coreBaseline.scenarios.collectionEmpty,
        execute: (iterations) =>
          this.#defineCollection(this.#fixtures.emptyCollection, iterations),
      }),
      Object.freeze({
        ...coreBaseline.scenarios.collectionSingleCanonical,
        execute: (iterations) =>
          this.#defineCollection(
            this.#fixtures.singleCanonicalCollection,
            iterations,
          ),
      }),
      Object.freeze({
        ...coreBaseline.scenarios.collectionCompleteMutable,
        execute: (iterations) =>
          this.#defineCollection(
            this.#fixtures.mutableCollection,
            iterations,
          ),
      }),
      Object.freeze({
        ...coreBaseline.scenarios.collectionCompleteCanonical,
        execute: (iterations) =>
          this.#defineCollection(
            this.#fixtures.canonicalCollection,
            iterations,
          ),
      }),
    ];

    const results = [];

    for (const scenario of scenarios) {
      results.push(await this.#benchmarkRunner.measure(scenario));
    }

    return Object.freeze({
      schemaVersion: coreBaseline.schemaVersion,
      package: coreBaseline.packageName,
      environment: this.#host.environment(),
      methodology: this.#benchmarkRunner.methodology(),
      distribution: await this.#distributionInspector.inspect(
        coreBaseline.packagePath,
      ),
      scenarios: Object.freeze(results),
    });
  }

  /**
   * @description Reconstructs canonical icons from the representative collection.
   * @param {readonly import("@aster/core").IconDefinition[]} definitions - Prepared equivalent icon inputs.
   * @param {number} iterations - Number of public API operations to execute.
   * @returns {number} Deterministic checksum preventing discarded scenario results.
   */
  #defineIcons(definitions, iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const source = definitions[index % definitions.length];

      if (source === undefined) {
        throw new TypeError("The Core icon scenario requires prepared definitions.");
      }

      const definition = Icon.define(source);
      checksum = (checksum + definition.nodes.length) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Reconstructs one prepared collection repeatedly through the public API.
   * @param {import("@aster/core").CollectionDefinition} source - Prepared collection input.
   * @param {number} iterations - Number of public API operations to execute.
   * @returns {number} Deterministic checksum preventing discarded scenario results.
   */
  #defineCollection(source, iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const collection = Collection.define(source);
      checksum = (
        checksum +
        collection.icons.length +
        collection.identity.name.length
      ) >>> 0;
    }

    return checksum;
  }
}
