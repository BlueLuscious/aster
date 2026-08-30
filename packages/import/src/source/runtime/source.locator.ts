import type { ICanonicalTextSource } from "../contracts/internal/index.js";
import type { SourcePosition, SourceSpan } from "../../diagnostic/contracts/index.js";
import { IconImportError } from "../../error/index.js";

/**
 * @description Resolves exact UTF-16 offsets into deterministic display positions.
 */
export class SourceLocator {
  /**
   * @description Lazily indexed line starts retained only while their canonical sources remain reachable.
   */
  readonly #lineStartsBySource = new WeakMap<
    ICanonicalTextSource,
    readonly number[]
  >();

  /**
   * @description Resolves one zero-based UTF-16 offset.
   * @param source - Canonical textual source.
   * @param offset - Offset at a UTF-16 code-unit boundary.
   * @returns Frozen one-based line and column position.
   */
  positionAt(source: ICanonicalTextSource, offset: number): SourcePosition {
    this.#assertOffset(source.content, offset, "offset");
    const lineStarts = this.#lineStarts(source);
    const lineIndex = this.#lineIndex(lineStarts, offset);
    const lineStart = lineStarts[lineIndex];

    if (lineStart === undefined) {
      throw new IconImportError(
        "source",
        "could not resolve an indexed source position",
      );
    }

    return Object.freeze({
      offset,
      line: lineIndex + 1,
      column: offset - lineStart + 1,
    });
  }

  /**
   * @description Resolves one exclusive source span from exact offsets.
   * @param source - Canonical textual source.
   * @param startOffset - Inclusive zero-based UTF-16 start offset.
   * @param endOffset - Exclusive zero-based UTF-16 end offset.
   * @returns Frozen span with deterministic display positions.
   */
  span(
    source: ICanonicalTextSource,
    startOffset: number,
    endOffset: number,
  ): SourceSpan {
    this.#assertOffset(source.content, startOffset, "startOffset");
    this.#assertOffset(source.content, endOffset, "endOffset");

    if (endOffset < startOffset) {
      throw new IconImportError(
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
      throw new IconImportError(
        path,
        "expected an offset within the exact source content",
      );
    }
  }

  /**
   * @description Resolves or creates canonical line starts for one exact source object.
   * @param source - Canonical textual source retained weakly as the cache key.
   * @returns Frozen zero-based UTF-16 line-start offsets.
   */
  #lineStarts(source: ICanonicalTextSource): readonly number[] {
    const cached = this.#lineStartsBySource.get(source);

    if (cached !== undefined) {
      return cached;
    }

    const lineStarts = [0];

    for (let index = 0; index < source.content.length; index += 1) {
      const unit = source.content[index];

      if (unit === "\r") {
        lineStarts.push(
          source.content[index + 1] === "\n" ? index + 2 : index + 1,
        );
      } else if (unit === "\n") {
        if (source.content[index - 1] !== "\r") {
          lineStarts.push(index + 1);
        }
      }
    }

    const indexed = Object.freeze(lineStarts);
    this.#lineStartsBySource.set(source, indexed);
    return indexed;
  }

  /**
   * @description Finds the greatest indexed line start not exceeding one valid source offset.
   * @param lineStarts - Canonical ascending line-start offsets.
   * @param offset - Valid zero-based UTF-16 source offset.
   * @returns Zero-based containing line index.
   */
  #lineIndex(lineStarts: readonly number[], offset: number): number {
    let lower = 0;
    let upper = lineStarts.length - 1;

    while (lower <= upper) {
      const middle = Math.floor((lower + upper) / 2);
      const lineStart = lineStarts[middle];

      if (lineStart === undefined || lineStart > offset) {
        upper = middle - 1;
      } else {
        lower = middle + 1;
      }
    }

    return upper;
  }
}
