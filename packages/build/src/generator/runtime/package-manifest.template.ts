import type { IGeneratedPackageMetadata } from "../contracts/internal/generated-package-metadata.contract.js";
import type { IPlannedPackageExport } from "../contracts/internal/planned-package-export.contract.js";
import { generatedPackageAuthority } from "../constants/generated-package-authority.constant.js";
import { GeneratedDistributionPathFactory } from "./generated-distribution-path.factory.js";
import { TypeScriptValueSerialiser } from "./typescript-value.serialiser.js";

/**
 * @description Renders the exact generated collection package manifest.
 */
export class PackageManifestTemplate {
  /**
   * @description Generated source-to-distribution path authority.
   */
  readonly #distributionPathFactory = new GeneratedDistributionPathFactory();

  /**
   * @description Deterministic JSON-compatible serialisation authority.
   */
  readonly #serialiser = new TypeScriptValueSerialiser();

  /**
   * @description Renders one LF-terminated generated `package.json`.
   * @param metadata - Canonical generated package publication metadata.
   * @param exports - Complete canonically ordered public package export plan.
   * @param sourceIds - Complete canonical sources responsible for the package.
   * @returns Deterministic package manifest with explicit ownership evidence.
   */
  render(
    metadata: IGeneratedPackageMetadata,
    exports: readonly IPlannedPackageExport[],
    sourceIds: readonly string[],
  ): string {
    const exportMap = Object.fromEntries(
      exports.map((plannedExport) => [
        plannedExport.subpath,
        this.#distributionPathFactory.create(plannedExport.sourcePath),
      ]),
    );
    const rootDistribution = this.#distributionPathFactory.create(
      exports.find((plannedExport) => plannedExport.subpath === ".")
        ?.sourcePath ?? "",
    );
    const canonicalSourceIds = [...new Set(sourceIds)].sort((left, right) =>
      this.#compareText(left, right),
    );
    const manifest = {
      name: metadata.name,
      version: metadata.version,
      description: metadata.description,
      type: "module",
      license: metadata.licence,
      main: rootDistribution.import,
      types: rootDistribution.types,
      sideEffects: false,
      exports: exportMap,
      publishConfig: {
        access: "public",
      },
      files: ["dist"],
      scripts: {
        build: "pnpm run clean && tsc -p tsconfig.json",
        "check:types": "tsc -p tsconfig.json --noEmit",
        clean:
          "node ../../tooling/workspace/clean-package-output.mjs dist",
      },
      dependencies: {
        [generatedPackageAuthority.coreDependency]:
          generatedPackageAuthority.coreDependencyVersion,
      },
      [generatedPackageAuthority.field]: {
        generatedBy: generatedPackageAuthority.generatedBy,
        schemaVersion: generatedPackageAuthority.schemaVersion,
        sources: canonicalSourceIds,
        rebuild: generatedPackageAuthority.rebuildCommand,
        editingPolicy: generatedPackageAuthority.editingPolicy,
      },
    };

    return `${this.#serialiser.serialise(manifest)}\n`;
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text value.
   * @param right - Second text value.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
