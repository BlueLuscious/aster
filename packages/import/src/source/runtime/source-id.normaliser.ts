import { IconImportError } from "../../error/index.js";

/**
 * @description Validates host-supplied slash-separated logical source identifiers.
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
      throw new IconImportError(path, "expected canonical non-empty text");
    }

    if (
      value.includes("\\") ||
      value.startsWith("/") ||
      /^[A-Za-z]:/u.test(value) ||
      /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(value)
    ) {
      throw new IconImportError(
        path,
        "expected a safe logical source identifier using forward slashes",
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
      throw new IconImportError(path, "expected canonical path segments");
    }

    return value;
  }
}
