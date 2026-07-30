import type { IExistingGeneratedFile } from "../contracts/internal/existing-generated-file.contract.js";
import { generatedFileMarker } from "../constants/generated-file-marker.constant.js";
import { generatedPackageAuthority } from "../constants/generated-package-authority.constant.js";
import { generatorModulePaths } from "../constants/generator-module-paths.constant.js";

/**
 * @description Recognises explicit Aster ownership evidence across generated text formats.
 */
export class GeneratedFileOwnershipInspector {
  /**
   * @description Determines whether one existing file explicitly assigns ownership to Aster.
   * @param file - Existing generated-root-relative text file.
   * @returns Whether marker or package-manifest evidence proves Aster ownership.
   */
  isOwned(file: IExistingGeneratedFile): boolean {
    if (file.content.split(/\r?\n/u, 1)[0] === generatedFileMarker) {
      return true;
    }

    if (file.path !== generatorModulePaths.packageManifest) {
      return false;
    }

    try {
      const value: unknown = JSON.parse(file.content);

      if (
        typeof value !== "object" ||
        value === null ||
        Array.isArray(value)
      ) {
        return false;
      }

      const authority = (value as Record<string, unknown>)[
        generatedPackageAuthority.field
      ];

      return (
        typeof authority === "object" &&
        authority !== null &&
        !Array.isArray(authority) &&
        (authority as Record<string, unknown>).generatedBy ===
          generatedPackageAuthority.generatedBy &&
        (authority as Record<string, unknown>).schemaVersion ===
          generatedPackageAuthority.schemaVersion
      );
    } catch {
      return false;
    }
  }
}
