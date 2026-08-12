import { Collection, Icon } from "@aster/core";
import { AsterCollection } from "@aster/icons";

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
   * @description Creates one Core baseline composition.
   * @param {{ measure(scenario: { name: string, operationsPerSample: number, execute(iterations: number): number }): object, methodology(): object }} benchmarkRunner - Generic measurement authority.
   * @param {{ inspect(packagePath: string): Promise<object> }} distributionInspector - Package distribution authority.
   * @param {{ environment(): object }} host - Runtime environment authority.
   */
  constructor(benchmarkRunner, distributionInspector, host) {
    this.#benchmarkRunner = benchmarkRunner;
    this.#distributionInspector = distributionInspector;
    this.#host = host;
  }

  /**
   * @description Runs representative icon and collection construction comparisons.
   * @returns {Promise<object>} Immutable serialisable Core baseline report.
   */
  async run() {
    const scenarios = [
      Object.freeze({
        name: "core.icon.define",
        operationsPerSample: 2_000,
        execute: (iterations) => this.#defineIcons(iterations),
      }),
      Object.freeze({
        name: "core.collection.define",
        operationsPerSample: 250,
        execute: (iterations) => this.#defineCollections(iterations),
      }),
    ];

    return Object.freeze({
      schemaVersion: 1,
      package: "@aster/core",
      environment: this.#host.environment(),
      methodology: this.#benchmarkRunner.methodology(),
      distribution: await this.#distributionInspector.inspect("packages/core"),
      scenarios: Object.freeze(
        scenarios.map((scenario) => this.#benchmarkRunner.measure(scenario)),
      ),
    });
  }

  /**
   * @description Reconstructs canonical icons from the representative collection.
   * @param {number} iterations - Number of public API operations to execute.
   * @returns {number} Deterministic checksum preventing discarded scenario results.
   */
  #defineIcons(iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const source = AsterCollection.icons[index % AsterCollection.icons.length];
      const definition = Icon.define(source);
      checksum = (checksum + definition.nodes.length) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Reconstructs the complete representative collection through the public API.
   * @param {number} iterations - Number of public API operations to execute.
   * @returns {number} Deterministic checksum preventing discarded scenario results.
   */
  #defineCollections(iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const collection = Collection.define(AsterCollection);
      checksum = (checksum + collection.icons.length) >>> 0;
    }

    return checksum;
  }
}
