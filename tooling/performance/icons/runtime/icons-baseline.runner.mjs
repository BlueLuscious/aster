import { iconsBaseline } from "../constants/icons-baseline.constant.mjs";

/**
 * @description Coordinates Icons import-evaluation and distribution baseline evidence.
 */
export class IconsBaselineRunner {
  /** @description Fresh public module import authority. */
  #moduleImportRunner;

  /** @description Emitted package shape inspector. */
  #distributionInspector;

  /** @description Measurement host providing environment identity. */
  #host;

  /** @description Absolute measured package root supplied to probe processes. */
  #packagePath;

  /**
   * @description Creates one Icons distribution baseline composition.
   * @param {{ measure(scenario: { name: string, specifier: string, packagePath: string }): object }} moduleImportRunner - Fresh import measurement authority.
   * @param {{ inspect(packagePath: string): Promise<object> }} distributionInspector - Package distribution authority.
   * @param {{ environment(): object }} host - Runtime environment authority.
   * @param {string} packagePath - Absolute measured package root.
   */
  constructor(moduleImportRunner, distributionInspector, host, packagePath) {
    this.#moduleImportRunner = moduleImportRunner;
    this.#distributionInspector = distributionInspector;
    this.#host = host;
    this.#packagePath = packagePath;
  }

  /**
   * @description Runs the current Icons public import and emitted-distribution comparison.
   * @returns {Promise<object>} Immutable serialisable Icons baseline report.
   */
  async run() {
    const imports = Object.values(iconsBaseline.scenarios).map((scenario) =>
      this.#moduleImportRunner.measure(
        Object.freeze({ ...scenario, packagePath: this.#packagePath }),
      ),
    );

    return Object.freeze({
      schemaVersion: iconsBaseline.schemaVersion,
      package: iconsBaseline.packageName,
      environment: this.#host.environment(),
      methodology: Object.freeze({
        imports: `${iconsBaseline.sampleCount} fresh direct Node processes per public specifier`,
        evaluation:
          "probe-only instrumentation of executed package distribution modules",
        distribution: "unminified emitted JavaScript and declaration files",
      }),
      distribution: await this.#distributionInspector.inspect(
        iconsBaseline.packagePath,
      ),
      imports: Object.freeze(imports),
    });
  }
}
