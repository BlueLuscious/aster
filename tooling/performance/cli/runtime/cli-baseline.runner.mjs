import { Icon } from "@aster/core";
import { Svg } from "@aster/svg";
import { CommandLineParser } from "../../../../packages/cli/dist/shell/parsing/runtime/command-line.parser.js";
import { CommandOutputPresenter } from "../../../../packages/cli/dist/shell/presentation/runtime/command-output.presenter.js";
import { cliBaseline } from "../constants/cli-baseline.constant.mjs";

/**
 * @description Coordinates CLI operation, cold-start, and distribution baseline evidence.
 */
export class CliBaselineRunner {
  /** @description Generic deterministic runner configured for synchronous scenarios. */
  #benchmarkRunner;

  /** @description Generic deterministic runner configured for asynchronous scenarios. */
  #asynchronousBenchmarkRunner;

  /** @description Fresh-process CLI measurement authority. */
  #coldStartRunner;

  /** @description Emitted package shape inspector. */
  #distributionInspector;

  /** @description Measurement host providing environment identity. */
  #host;

  /** @description Prepared public CLI inputs. */
  #fixtures;

  /** @description Deterministic standalone argument parser. */
  #parser = new CommandLineParser();

  /** @description Deterministic standalone result presenter. */
  #presenter = new CommandOutputPresenter();

  /** @description Absolute built executable path. */
  #executablePath;

  /**
   * @description Creates one CLI baseline composition.
   * @param {{ measure(scenario: object): Promise<object>, methodology(): object }} benchmarkRunner - Measurement authority configured for synchronous scenarios.
   * @param {{ measure(scenario: object): Promise<object>, methodology(): object }} asynchronousBenchmarkRunner - Measurement authority configured for asynchronous scenarios.
   * @param {{ measure(scenario: object): object }} coldStartRunner - Fresh-process measurement authority.
   * @param {{ inspect(packagePath: string): Promise<object> }} distributionInspector - Package distribution authority.
   * @param {{ environment(): object }} host - Runtime environment authority.
   * @param {import("../contracts/internal/cli-baseline-fixtures.contract.mjs").ICliBaselineFixtures} fixtures - Prepared CLI inputs.
   * @param {string} executablePath - Absolute built executable path.
   */
  constructor(
    benchmarkRunner,
    asynchronousBenchmarkRunner,
    coldStartRunner,
    distributionInspector,
    host,
    fixtures,
    executablePath,
  ) {
    this.#benchmarkRunner = benchmarkRunner;
    this.#asynchronousBenchmarkRunner = asynchronousBenchmarkRunner;
    this.#coldStartRunner = coldStartRunner;
    this.#distributionInspector = distributionInspector;
    this.#host = host;
    this.#fixtures = fixtures;
    this.#executablePath = executablePath;
  }

  /**
   * @description Runs representative CLI attribution and distribution comparisons.
   * @returns {Promise<object>} Immutable serialisable CLI baseline report.
   */
  async run() {
    const presentationResult = await this.#fixtures.commands.execute(
      this.#fixtures.invocations.listIcons,
      this.#fixtures.context,
    );
    const synchronousScenarios = [
      Object.freeze({
        ...cliBaseline.scenarios.coreRevalidation,
        execute: (iterations) => this.#revalidate(iterations),
      }),
      Object.freeze({
        ...cliBaseline.scenarios.svgRender,
        execute: (iterations) => this.#render(iterations),
      }),
      Object.freeze({
        ...cliBaseline.scenarios.parseHelp,
        execute: (iterations) =>
          this.#parse(this.#fixtures.arguments.help, iterations),
      }),
      Object.freeze({
        ...cliBaseline.scenarios.parseCollectionExport,
        execute: (iterations) =>
          this.#parse(this.#fixtures.arguments.collectionExport, iterations),
      }),
      Object.freeze({
        ...cliBaseline.scenarios.presentJson,
        execute: (iterations) =>
          this.#present(presentationResult, iterations),
      }),
    ];
    const asynchronousScenarios = [
      Object.freeze({
        ...cliBaseline.asyncScenarios.help,
        execute: (iterations) =>
          this.#execute(
            this.#fixtures.invocations.help,
            this.#fixtures.context,
            iterations,
          ),
      }),
      Object.freeze({
        ...cliBaseline.asyncScenarios.version,
        execute: (iterations) =>
          this.#execute(
            this.#fixtures.invocations.version,
            this.#fixtures.context,
            iterations,
          ),
      }),
      Object.freeze({
        ...cliBaseline.asyncScenarios.providerLoad,
        execute: (iterations) => this.#loadProvider(iterations),
      }),
      Object.freeze({
        ...cliBaseline.asyncScenarios.listIcons,
        execute: (iterations) =>
          this.#execute(
            this.#fixtures.invocations.listIcons,
            this.#fixtures.context,
            iterations,
          ),
      }),
      Object.freeze({
        ...cliBaseline.asyncScenarios.exportIcon,
        execute: (iterations) =>
          this.#execute(
            this.#fixtures.invocations.exportIcon,
            this.#fixtures.context,
            iterations,
          ),
      }),
      Object.freeze({
        ...cliBaseline.asyncScenarios.exportCollection,
        execute: (iterations) =>
          this.#execute(
            this.#fixtures.invocations.exportCollection,
            this.#fixtures.context,
            iterations,
          ),
      }),
    ];
    const coldScenarios = [
      cliBaseline.coldScenarios.nodeControl,
      cliBaseline.coldScenarios.rootImport,
      Object.freeze({
        ...cliBaseline.coldScenarios.executableVersion,
        executablePath: this.#executablePath,
      }),
    ];
    const synchronousResults = [];
    const asynchronousResults = [];

    for (const scenario of synchronousScenarios) {
      synchronousResults.push(await this.#benchmarkRunner.measure(scenario));
    }

    for (const scenario of asynchronousScenarios) {
      asynchronousResults.push(
        await this.#asynchronousBenchmarkRunner.measure(scenario),
      );
    }

    return Object.freeze({
      schemaVersion: cliBaseline.schemaVersion,
      package: cliBaseline.packageName,
      environment: this.#host.environment(),
      methodology: Object.freeze({
        synchronous: this.#benchmarkRunner.methodology(),
        asynchronous: this.#asynchronousBenchmarkRunner.methodology(),
        coldStart: "fresh direct Node processes without package-manager bootstrap",
      }),
      distribution: await this.#distributionInspector.inspect(
        cliBaseline.packagePath,
      ),
      scenarios: Object.freeze(synchronousResults),
      asyncScenarios: Object.freeze(asynchronousResults),
      coldScenarios: Object.freeze(
        coldScenarios.map((scenario) => this.#coldStartRunner.measure(scenario)),
      ),
    });
  }

  /**
   * @description Measures public Core reconstruction attributable beneath CLI boundaries.
   * @param {number} iterations - Number of operations to execute.
   * @returns {number} Deterministic checksum over reconstructed node counts.
   */
  #revalidate(iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      checksum = (checksum + Icon.define(this.#fixtures.icon).nodes.length) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Measures public SVG rendering attributable beneath export planning.
   * @param {number} iterations - Number of operations to execute.
   * @returns {number} Deterministic checksum over complete markup lengths.
   */
  #render(iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      checksum = (checksum + Svg.render(this.#fixtures.icon).length) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Measures standalone parsing without process acquisition.
   * @param {readonly string[]} arguments_ - Prepared argv sequence.
   * @param {number} iterations - Number of operations to execute.
   * @returns {number} Deterministic checksum over parsed command identities.
   */
  #parse(arguments_, iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const parsed = this.#parser.parse(arguments_);
      checksum = (checksum + parsed.invocation.command.length + Number(parsed.json)) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Measures JSON presentation without process writes.
   * @param {object} result - Prepared immutable command result.
   * @param {number} iterations - Number of operations to execute.
   * @returns {number} Deterministic checksum over complete stream bytes and status.
   */
  #present(result, iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const execution = this.#presenter.present(result, true);
      checksum = (
        checksum
        + execution.stdout.length
        + execution.stderr.length
        + execution.exitCode
      ) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Measures one public programmatic command with explicit context.
   * @param {object} invocation - Prepared structured invocation.
   * @param {object} context - Prepared explicit command context.
   * @param {number} iterations - Number of operations to execute.
   * @returns {Promise<number>} Deterministic checksum over complete results.
   */
  async #execute(invocation, context, iterations) {
    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const result = await this.#fixtures.commands.execute(invocation, context);
      checksum = (checksum + this.#resultChecksum(result)) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Measures explicit built-in provider acquisition independently from queries.
   * @param {number} iterations - Number of provider loads to execute.
   * @returns {Promise<number>} Deterministic checksum over acquired snapshot cardinality.
   */
  async #loadProvider(iterations) {
    const provider = this.#fixtures.builtInContext.catalogues[0];

    if (provider === undefined) {
      throw new TypeError("The CLI baseline requires the built-in catalogue provider.");
    }

    let checksum = 0;

    for (let index = 0; index < iterations; index += 1) {
      const snapshot = await provider.load();
      checksum = (checksum + snapshot.icons.length + snapshot.collections.length) >>> 0;
    }

    return checksum;
  }

  /**
   * @description Consumes one complete command result without serialisation overhead.
   * @param {object} result - Structured command result.
   * @returns {number} Stable result-shape checksum.
   */
  #resultChecksum(result) {
    if (!result.ok) {
      return result.diagnostic.code.length;
    }

    const payload = result.payload;

    if ("plan" in payload) {
      return payload.kind.length + payload.plan.artefacts.reduce(
        (total, artefact) => total + artefact.path.length + artefact.content.length,
        0,
      );
    }

    for (const key of ["catalogues", "collections", "icons", "results", "descriptors"]) {
      if (key in payload && Array.isArray(payload[key])) {
        return payload.kind.length + payload[key].length;
      }
    }

    return payload.kind.length;
  }
}
