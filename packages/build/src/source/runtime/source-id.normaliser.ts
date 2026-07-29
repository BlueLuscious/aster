import { BuildContractError } from "../../shared/runtime/build-contract.error.js";

/**
 * @description Validates repository-relative logical source identifiers.
 */
export class SourceIdNormaliser {
  /**
   * @description Produces one canonical slash-separated source identifier.
   * @param value - Unknown logical source identifier.
   * @param path - Logical value path.
   * @returns Accepted source identifier without modification.
   */
  normalise(value: unknown, path: string): string {
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      value !== value.trim()
    ) {
      throw new BuildContractError(path, "expected canonical non-empty text");
    }

    if (
      value.includes("\\") ||
      value.startsWith("/") ||
      /^[A-Za-z]:/u.test(value)
    ) {
      throw new BuildContractError(
        path,
        "expected a repository-relative path using forward slashes",
      );
    }

    const segments = value.split("/");

    if (
      segments.some(
        (segment) =>
          segment.length === 0 ||
          segment === "." ||
          segment === ".." ||
          segment.includes("\0"),
      )
    ) {
      throw new BuildContractError(path, "expected canonical path segments");
    }

    return value;
  }
}
