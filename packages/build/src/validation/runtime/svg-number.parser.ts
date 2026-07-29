/**
 * @description Parses finite SVG numbers and number sequences without browser coercion.
 */
export class SvgNumberParser {
  /**
   * @description Complete accepted SVG number grammar.
   */
  readonly #completePattern =
    /^[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?$/u;

  /**
   * @description Repeated accepted SVG number grammar.
   */
  readonly #sequencePattern =
    /[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?/gu;

  /**
   * @description Parses one complete finite SVG number.
   * @param value - Exact authored attribute value.
   * @returns Parsed finite number, or `undefined` for malformed input.
   */
  parse(value: string): number | undefined {
    const trimmed = value.trim();

    if (!this.#completePattern.test(trimmed)) {
      return undefined;
    }

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed)) {
      return undefined;
    }

    return Object.is(parsed, -0) ? 0 : parsed;
  }

  /**
   * @description Parses a non-empty comma- or whitespace-separated finite SVG number sequence.
   * @param value - Exact authored sequence value.
   * @returns Frozen parsed sequence, or `undefined` for malformed input.
   */
  parseSequence(value: string): readonly number[] | undefined {
    if (value.trim().length === 0) {
      return undefined;
    }

    const numbers: number[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;
    this.#sequencePattern.lastIndex = 0;

    while ((match = this.#sequencePattern.exec(value)) !== null) {
      const gap = value.slice(cursor, match.index);

      if (!this.#validGap(gap, numbers.length === 0)) {
        return undefined;
      }

      const parsed = Number(match[0]);

      if (!Number.isFinite(parsed)) {
        return undefined;
      }

      numbers.push(Object.is(parsed, -0) ? 0 : parsed);
      cursor = match.index + match[0].length;
    }

    if (
      numbers.length === 0 ||
      !/^\s*$/u.test(value.slice(cursor))
    ) {
      return undefined;
    }

    return Object.freeze(numbers);
  }

  /**
   * @description Determines whether text between two number tokens is an accepted separator.
   * @param value - Exact text between tokens.
   * @param beforeFirst - Whether the gap precedes the first token.
   * @returns Whether the gap is accepted.
   */
  #validGap(value: string, beforeFirst: boolean): boolean {
    if (beforeFirst) {
      return /^\s*$/u.test(value);
    }

    return (
      value.length === 0 ||
      /^\s+$/u.test(value) ||
      /^\s*,\s*$/u.test(value)
    );
  }
}
