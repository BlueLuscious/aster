import type { CanonicalTextSource } from "../contracts/index.js";
import type { SourcePosition, SourceSpan } from "../../diagnostic/contracts/index.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";

/**
 * @description Resolves exact UTF-16 offsets into deterministic display positions.
 */
export class SourceLocator {
  /**
   * @description Resolves one zero-based UTF-16 offset.
   * @param source - Canonical textual source.
   * @param offset - Offset at a UTF-16 code-unit boundary.
   * @returns Frozen one-based line and column position.
   */
  positionAt(source: CanonicalTextSource, offset: number): SourcePosition {
    this.#assertOffset(source.content, offset, "offset");
    let line = 1;
    let column = 1;

    for (let index = 0; index < offset; index += 1) {
      const unit = source.content[index];

      if (unit === "\r") {
        line += 1;
        column = 1;
      } else if (unit === "\n") {
        if (source.content[index - 1] !== "\r") {
          line += 1;
          column = 1;
        }
      } else {
        column += 1;
      }
    }

    return Object.freeze({ offset, line, column });
  }

  /**
   * @description Resolves one exclusive source span from exact offsets.
   * @param source - Canonical textual source.
   * @param startOffset - Inclusive zero-based UTF-16 start offset.
   * @param endOffset - Exclusive zero-based UTF-16 end offset.
   * @returns Frozen span with deterministic display positions.
   */
  span(
    source: CanonicalTextSource,
    startOffset: number,
    endOffset: number,
  ): SourceSpan {
    this.#assertOffset(source.content, startOffset, "startOffset");
    this.#assertOffset(source.content, endOffset, "endOffset");

    if (endOffset < startOffset) {
      throw new BuildContractError(
        "endOffset",
        "cannot precede the start offset",
      );
    }

    return Object.freeze({
      start: this.positionAt(source, startOffset),
      end: this.positionAt(source, endOffset),
    });
  }

  /**
   * @description Asserts that an offset addresses the supplied exact source content.
   * @param content - Exact decoded source content.
   * @param offset - Unknown candidate offset.
   * @param path - Logical offset path.
   * @returns Nothing.
   */
  #assertOffset(content: string, offset: number, path: string): void {
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset > content.length
    ) {
      throw new BuildContractError(
        path,
        "expected an offset within the exact source content",
      );
    }
  }
}
