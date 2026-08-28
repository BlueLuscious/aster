import { IconImport } from "@aster/import";
import { importBaseline } from "../constants/import-baseline.constant.mjs";

/**
 * @description Coordinates Import-only operation and distribution baseline evidence.
 */
export class ImportBaselineRunner {
  /** @description Generic deterministic scenario runner. */
  #benchmarkRunner;

  /** @description Emitted package shape inspector. */
  #distributionInspector;

  /** @description Measurement host providing environment identity. */
  #host;

  /**
   * @description Prepared public Import inputs.
   * @type {import("../contracts/internal/import-baseline-fixtures.contract.mjs").IImportBaselineFixtures}
   */
  #fixtures;

  /**
   * @description Creates one Import baseline composition.
   * @param {{ measure(scenario: { name: string, operationsPerSample: number, execute(iterations: number): number | PromiseLike<number> }): Promise<object>, methodology(): object }} benchmarkRunner - Generic measurement authority.
   * @param {{ inspect(packagePath: string): Promise<object> }} distributionInspector - Package distribution authority.
   * @param {{ environment(): object }} host - Runtime environment authority.
   * @param {import("../contracts/internal/import-baseline-fixtures.contract.mjs").IImportBaselineFixtures} fixtures - Prepared public Import scenario inputs.
   */
  constructor(benchmarkRunner, distributionInspector, host, fixtures) {
    this.#benchmarkRunner = benchmarkRunner;
    this.#distributionInspector = distributionInspector;
    this.#host = host;
    this.#fixtures = fixtures;
  }

  /**
   * @description Runs representative inspection, definition, emission and adoption comparisons.
   * @returns {Promise<object>} Immutable serialisable Import baseline report.
   */
  async run() {
    const scenarios = [
      this.#scenario(importBaseline.scenarios.inspectMinimal, () =>
        IconImport.inspect(this.#fixtures.minimalSource),
      ),
      this.#scenario(importBaseline.scenarios.inspectEditor, () =>
        IconImport.inspect(this.#fixtures.editorSource),
      ),
      this.#scenario(importBaseline.scenarios.inspectRejected, () =>
        IconImport.inspect(this.#fixtures.rejectedSource),
      ),
      this.#scenario(importBaseline.scenarios.define, () =>
        IconImport.define(this.#fixtures.definitionRequest),
      ),
      this.#scenario(importBaseline.scenarios.emit, () =>
        IconImport.emit(this.#fixtures.emissionRequest),
      ),
      this.#scenario(importBaseline.scenarios.adopt, () =>
        IconImport.adopt(this.#fixtures.adoptionRequest),
      ),
      this.#scenario(importBaseline.scenarios.adoptBatch, () =>
        IconImport.adoptMany(this.#fixtures.batchRequests),
      ),
    ];
    const results = [];

    for (const scenario of scenarios) {
      results.push(await this.#benchmarkRunner.measure(scenario));
    }

    return Object.freeze({
      schemaVersion: importBaseline.schemaVersion,
      package: importBaseline.packageName,
      environment: this.#host.environment(),
      methodology: this.#benchmarkRunner.methodology(),
      fixtures: this.#fixtures.sizes,
      distribution: await this.#distributionInspector.inspect(
        importBaseline.packagePath,
      ),
      scenarios: Object.freeze(results),
    });
  }

  /**
   * @description Adapts one public Import operation to the generic repeated-scenario contract.
   * @param {{ readonly name: string, readonly operationsPerSample: number }} configuration - Stable scenario identity and operation count.
   * @param {() => import("@aster/import").DiagnosticResultType<unknown>} operation - Public Import operation under measurement.
   * @returns {{ readonly name: string, readonly operationsPerSample: number, execute(iterations: number): number }} Repeated benchmark scenario.
   */
  #scenario(configuration, operation) {
    return Object.freeze({
      ...configuration,
      execute: (iterations) => {
        let checksum = 0;

        for (let index = 0; index < iterations; index += 1) {
          const result = operation();
          checksum = (
            checksum +
            result.diagnostics.length +
            (result.successful ? this.#valueWeight(result.value) : 1)
          ) >>> 0;
        }

        return checksum;
      },
    });
  }

  /**
   * @description Derives stable observable weight from one successful public operation value.
   * @param {unknown} value - Successful public Import output.
   * @returns {number} Positive checksum contribution.
   */
  #valueWeight(value) {
    if (typeof value !== "object" || value === null) {
      return 1;
    }

    if ("entries" in value && Array.isArray(value.entries)) {
      return value.entries.length + 1;
    }

    if ("content" in value && typeof value.content === "string") {
      return value.content.length + 1;
    }

    if ("module" in value && typeof value.module === "object" && value.module !== null) {
      return this.#valueWeight(value.module);
    }

    if ("nodes" in value && Array.isArray(value.nodes)) {
      return value.nodes.length + 1;
    }

    return 1;
  }
}
