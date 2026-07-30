import { GeneratedFileBannerFactory } from "./generated-file-banner.factory.js";
import { TypeScriptValueSerialiser } from "./typescript-value.serialiser.js";

/**
 * @description Renders the host-independent compiler configuration for a generated collection.
 */
export class TypeScriptConfigurationTemplate {
  /**
   * @description Generated ownership banner authority.
   */
  readonly #bannerFactory = new GeneratedFileBannerFactory();

  /**
   * @description Deterministic JSON-compatible serialisation authority.
   */
  readonly #serialiser = new TypeScriptValueSerialiser();

  /**
   * @description Renders one LF-terminated generated `tsconfig.json`.
   * @param sourceIds - Complete canonical sources responsible for the package.
   * @returns Deterministic JSONC configuration extending the repository ES2022 baseline.
   */
  render(sourceIds: readonly string[]): string {
    const configuration = {
      extends: "../../tsconfig.base.json",
      compilerOptions: {
        rootDir: "src",
        outDir: "dist",
      },
      include: ["src/**/*.ts"],
    };

    return [
      this.#bannerFactory.create(sourceIds).trimEnd(),
      this.#serialiser.serialise(configuration),
      "",
    ].join("\n");
  }
}
