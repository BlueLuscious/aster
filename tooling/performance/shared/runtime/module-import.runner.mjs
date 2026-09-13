/**
 * @description Measures one public import through fresh processes and verifies stable evaluation
 * evidence.
 */
export class ModuleImportRunner {
  /** @description Fresh Node process capability. */
  #processHost;

  /** @description Numeric sample aggregation authority. */
  #statistics;

  /** @description Absolute executable probe path. */
  #probePath;

  /** @description Number of retained fresh-process samples. */
  #sampleCount;

  /**
   * @description Creates one isolated module import runner.
   * @param {import("../contracts/internal/process-host.contract.mjs").IProcessHost} processHost - Fresh Node process capability.
   * @param {import("./numeric-sample.statistics.mjs").NumericSampleStatistics} statistics - Numeric sample aggregation authority.
   * @param {string} probePath - Absolute executable probe path.
   * @param {number} [sampleCount] - Number of retained process samples.
   */
  constructor(processHost, statistics, probePath, sampleCount = 7) {
    if (!Number.isSafeInteger(sampleCount) || sampleCount <= 0) {
      throw new TypeError("sampleCount must be a positive safe integer.");
    }

    this.#processHost = processHost;
    this.#statistics = statistics;
    this.#probePath = probePath;
    this.#sampleCount = sampleCount;
  }

  /**
   * @description Measures one public import and rejects unstable process or module evidence.
   * @param {{ name: string, specifier: string, packagePath: string }} scenario - Complete public import scenario.
   * @returns {{ name: string, specifier: string, samples: number, medianProcessNanoseconds: number, minimumProcessNanoseconds: number, maximumProcessNanoseconds: number, medianImportNanoseconds: number, minimumImportNanoseconds: number, maximumImportNanoseconds: number, evaluatedModuleCount: number, evaluatedModules: readonly string[], exports: readonly string[] }} Stable fresh-import evidence.
   */
  measure(scenario) {
    const processTimings = [];
    const importTimings = [];
    let reference;

    for (let index = 0; index < this.#sampleCount; index += 1) {
      const result = this.#processHost.execute({
        executablePath: this.#probePath,
        arguments: Object.freeze([scenario.specifier, scenario.packagePath]),
      });

      if (result.status !== 0 || result.stderr !== "") {
        throw new Error(
          `Import scenario ${scenario.name} changed its process contract.`,
        );
      }

      const evidence = this.#parse(result.stdout, scenario);

      if (
        reference !== undefined
        && (
          JSON.stringify(evidence.exports) !== JSON.stringify(reference.exports)
          || JSON.stringify(evidence.evaluatedModules)
            !== JSON.stringify(reference.evaluatedModules)
        )
      ) {
        throw new Error(
          `Import scenario ${scenario.name} produced unstable module evidence.`,
        );
      }

      reference ??= evidence;
      processTimings.push(result.elapsedNanoseconds);
      importTimings.push(evidence.importNanoseconds);
    }

    const processTiming = this.#statistics.summarise(processTimings);
    const importTiming = this.#statistics.summarise(importTimings);

    return Object.freeze({
      name: scenario.name,
      specifier: scenario.specifier,
      samples: this.#sampleCount,
      medianProcessNanoseconds: Math.round(processTiming.median),
      minimumProcessNanoseconds: Math.round(processTiming.minimum),
      maximumProcessNanoseconds: Math.round(processTiming.maximum),
      medianImportNanoseconds: Math.round(importTiming.median),
      minimumImportNanoseconds: Math.round(importTiming.minimum),
      maximumImportNanoseconds: Math.round(importTiming.maximum),
      evaluatedModuleCount: reference.evaluatedModules.length,
      evaluatedModules: reference.evaluatedModules,
      exports: reference.exports,
    });
  }

  /**
   * @description Parses and validates one serialised probe response.
   * @param {string} output - Complete probe standard output.
   * @param {{ name: string, specifier: string }} scenario - Expected scenario identity.
   * @returns {{ specifier: string, exports: readonly string[], evaluatedModules: readonly string[], importNanoseconds: number }} Validated probe evidence.
   */
  #parse(output, scenario) {
    let evidence;

    try {
      evidence = JSON.parse(output);
    } catch {
      throw new Error(`Import scenario ${scenario.name} returned invalid JSON.`);
    }

    if (
      evidence === null
      || typeof evidence !== "object"
      || evidence.specifier !== scenario.specifier
      || !Array.isArray(evidence.exports)
      || !evidence.exports.every((value) => typeof value === "string")
      || !Array.isArray(evidence.evaluatedModules)
      || !evidence.evaluatedModules.every((value) => typeof value === "string")
      || !Number.isSafeInteger(evidence.importNanoseconds)
      || evidence.importNanoseconds < 0
    ) {
      throw new Error(`Import scenario ${scenario.name} returned invalid evidence.`);
    }

    return Object.freeze({
      specifier: evidence.specifier,
      exports: Object.freeze([...evidence.exports]),
      evaluatedModules: Object.freeze([...evidence.evaluatedModules]),
      importNanoseconds: evidence.importNanoseconds,
    });
  }
}
