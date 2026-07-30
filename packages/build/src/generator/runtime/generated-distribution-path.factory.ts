import type { TGeneratedDistributionPath } from "../types/internal/generated-distribution-path.type.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";

/**
 * @description Derives published ESM and declaration paths from generated TypeScript source paths.
 */
export class GeneratedDistributionPathFactory {
  /**
   * @description Creates one immutable distribution-path pair.
   * @param sourcePath - Generated TypeScript source path beneath `src/`.
   * @returns Package-relative implementation and declaration paths beneath `dist/`.
   */
  create(sourcePath: string): TGeneratedDistributionPath {
    if (!sourcePath.startsWith("src/") || !sourcePath.endsWith(".ts")) {
      throw new BuildContractError(
        "sourcePath",
        "expected a generated TypeScript module beneath src",
      );
    }

    const basePath = sourcePath.slice(4, -3);

    return Object.freeze({
      import: `./dist/${basePath}.js`,
      types: `./dist/${basePath}.d.ts`,
    });
  }
}
