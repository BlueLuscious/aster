/**
 * @description Measures stable fresh-process module evaluation for real built-in CLI workflows.
 */
export class CliCommandEvaluationRunner {
  /** @description Fresh Node process capability. */
  #processHost;

  /** @description Numeric sample aggregation authority. */
  #statistics;

  /** @description Absolute executable probe path. */
  #probePath;

  /** @description Number of retained fresh-process samples. */
  #sampleCount;

  /**
   * @description Creates one CLI command-evaluation runner.
   * @param {import("../../shared/contracts/internal/process-host.contract.mjs").IProcessHost} processHost - Fresh Node process capability.
   * @param {import("../../shared/runtime/numeric-sample.statistics.mjs").NumericSampleStatistics} statistics - Numeric sample aggregation authority.
   * @param {string} probePath - Absolute executable probe path.
   * @param {number} sampleCount - Number of retained process samples.
   */
  constructor(processHost, statistics, probePath, sampleCount) {
    if (!Number.isSafeInteger(sampleCount) || sampleCount <= 0) {
      throw new TypeError("sampleCount must be a positive safe integer.");
    }

    this.#processHost = processHost;
    this.#statistics = statistics;
    this.#probePath = probePath;
    this.#sampleCount = sampleCount;
  }

  /**
   * @description Measures one configured workflow and rejects unstable result or module evidence.
   * @param {string} scenarioKey - Closed configured workflow key passed to the probe.
   * @param {{ name: string }} scenario - Expected stable scenario identity.
   * @returns {{ name: string, result: string, samples: number, medianProcessNanoseconds: number, minimumProcessNanoseconds: number, maximumProcessNanoseconds: number, medianScenarioNanoseconds: number, minimumScenarioNanoseconds: number, maximumScenarioNanoseconds: number, evaluatedModuleCounts: Readonly<{ cli: number, icons: number }>, evaluatedModules: Readonly<{ cli: readonly string[], icons: readonly string[] }> }} Stable fresh-process command evidence.
   */
  measure(scenarioKey, scenario) {
    const processTimings = [];
    const scenarioTimings = [];
    /** @type {{ name: string, result: string, scenarioNanoseconds: number, evaluatedModules: Readonly<{ cli: readonly string[], icons: readonly string[] }> } | undefined} */
    let reference;

    for (let index = 0; index < this.#sampleCount; index += 1) {
      const result = this.#processHost.execute({
        executablePath: this.#probePath,
        arguments: Object.freeze([scenarioKey]),
      });

      if (result.status !== 0 || result.stderr !== "") {
        throw new Error(
          `CLI evaluation scenario ${scenario.name} changed its process contract.`,
        );
      }

      const evidence = this.#parse(result.stdout, scenario);

      if (
        reference !== undefined
        && (
          evidence.result !== reference.result
          || JSON.stringify(evidence.evaluatedModules)
            !== JSON.stringify(reference.evaluatedModules)
        )
      ) {
        throw new Error(
          `CLI evaluation scenario ${scenario.name} produced unstable evidence.`,
        );
      }

      reference ??= evidence;
      processTimings.push(result.elapsedNanoseconds);
      scenarioTimings.push(evidence.scenarioNanoseconds);
    }

    const processTiming = this.#statistics.summarise(processTimings);
    const scenarioTiming = this.#statistics.summarise(scenarioTimings);

    if (reference === undefined) {
      throw new Error(`CLI evaluation scenario ${scenario.name} produced no evidence.`);
    }

    return Object.freeze({
      name: scenario.name,
      result: reference.result,
      samples: this.#sampleCount,
      medianProcessNanoseconds: Math.round(processTiming.median),
      minimumProcessNanoseconds: Math.round(processTiming.minimum),
      maximumProcessNanoseconds: Math.round(processTiming.maximum),
      medianScenarioNanoseconds: Math.round(scenarioTiming.median),
      minimumScenarioNanoseconds: Math.round(scenarioTiming.minimum),
      maximumScenarioNanoseconds: Math.round(scenarioTiming.maximum),
      evaluatedModuleCounts: Object.freeze({
        cli: reference.evaluatedModules.cli.length,
        icons: reference.evaluatedModules.icons.length,
      }),
      evaluatedModules: reference.evaluatedModules,
    });
  }

  /**
   * @description Parses and validates one serialised command probe response.
   * @param {string} output - Complete probe standard output.
   * @param {{ name: string }} scenario - Expected scenario identity.
   * @returns {{ name: string, result: string, scenarioNanoseconds: number, evaluatedModules: Readonly<{ cli: readonly string[], icons: readonly string[] }> }} Validated probe evidence.
   */
  #parse(output, scenario) {
    let evidence;

    try {
      evidence = JSON.parse(output);
    } catch {
      throw new Error(`CLI evaluation scenario ${scenario.name} returned invalid JSON.`);
    }

    if (
      evidence === null
      || typeof evidence !== "object"
      || evidence.name !== scenario.name
      || typeof evidence.result !== "string"
      || !Number.isSafeInteger(evidence.scenarioNanoseconds)
      || evidence.scenarioNanoseconds < 0
      || evidence.evaluatedModules === null
      || typeof evidence.evaluatedModules !== "object"
      || !Array.isArray(evidence.evaluatedModules.cli)
      || !evidence.evaluatedModules.cli.every(
        /** @param {unknown} value */ (value) => typeof value === "string",
      )
      || !Array.isArray(evidence.evaluatedModules.icons)
      || !evidence.evaluatedModules.icons.every(
        /** @param {unknown} value */ (value) => typeof value === "string",
      )
    ) {
      throw new Error(`CLI evaluation scenario ${scenario.name} returned invalid evidence.`);
    }

    return Object.freeze({
      name: evidence.name,
      result: evidence.result,
      scenarioNanoseconds: evidence.scenarioNanoseconds,
      evaluatedModules: Object.freeze({
        cli: Object.freeze([...evidence.evaluatedModules.cli]),
        icons: Object.freeze([...evidence.evaluatedModules.icons]),
      }),
    });
  }
}
