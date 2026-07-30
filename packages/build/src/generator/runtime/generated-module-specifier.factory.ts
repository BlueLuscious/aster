import { BuildContractError } from "../../shared/runtime/build-contract.error.js";

/**
 * @description Converts generated source paths into relative ESM specifiers.
 */
export class GeneratedModuleSpecifierFactory {
  /**
   * @description Creates a root-source-relative ESM specifier for one generated module.
   * @param sourcePath - Generated TypeScript source path beneath `src/`.
   * @returns Relative `.js` ESM specifier consumed by generated TypeScript.
   */
  create(sourcePath: string): string {
    if (!sourcePath.startsWith("src/") || !sourcePath.endsWith(".ts")) {
      throw new BuildContractError(
        "sourcePath",
        "expected a generated TypeScript module beneath src",
      );
    }

    return `./${sourcePath.slice(4, -3)}.js`;
  }
}
