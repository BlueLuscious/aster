import type { TSvgPathInspection } from "../types/internal/svg-path-inspection.type.js";
import type { TSvgPathCommand } from "../types/internal/svg-path-command.type.js";
import type { TSvgPathSegment } from "../types/internal/svg-path-segment.type.js";
import { svgLexicalPatternSources } from "../constants/svg-lexical-pattern-sources.constant.js";
import { svgNumberPatternSource } from "../constants/svg-number-pattern-source.constant.js";
import { svgPathCommandParameterCounts } from "../constants/svg-path-command-parameter-counts.constant.js";
import { svgPathCommands } from "../constants/svg-path-commands.constant.js";

/**
 * @description Validates SVG path grammar and extracts immutable source command facts.
 */
export class SvgPathDataInspector {
  /**
   * @description Repeated command-or-number token grammar.
   */
  readonly #tokenPattern = new RegExp(`[A-Za-z]|${svgNumberPatternSource}`, "gu");

  /**
   * @description Complete SVG command-token grammar.
   */
  readonly #commandPattern = new RegExp(svgLexicalPatternSources.command, "u");

  /**
   * @description Optional SVG whitespace grammar.
   */
  readonly #whitespaceOnlyPattern = new RegExp(svgLexicalPatternSources.whitespaceOnly, "u");

  /**
   * @description Required SVG whitespace separator grammar.
   */
  readonly #requiredWhitespacePattern = new RegExp(svgLexicalPatternSources.requiredWhitespace, "u");

  /**
   * @description Comma separator with optional surrounding SVG whitespace.
   */
  readonly #commaSeparatorPattern = new RegExp(svgLexicalPatternSources.commaSeparator, "u");

  /**
   * @description Inspects one complete authored path-data value.
   * @param value - Exact authored `d` attribute value.
   * @returns Frozen technical inspection result.
   */
  inspect(value: string): TSvgPathInspection {
    const tokens = this.#tokenise(value);

    if (tokens === undefined || tokens.length === 0) {
      return this.#invalid();
    }

    const segments: {
      authoredCommand: string;
      command: TSvgPathCommand;
      values: number[];
    }[] = [];
    let current: (typeof segments)[number] | undefined;

    for (const token of tokens) {
      if (typeof token === "string") {
        const command = token.toLowerCase();

        if (!Object.hasOwn(svgPathCommandParameterCounts, command)) {
          return this.#invalid();
        }

        current = {
          authoredCommand: token,
          command: command as TSvgPathCommand,
          values: [],
        };
        segments.push(current);
      } else {
        if (current === undefined) {
          return this.#invalid();
        }

        current.values.push(token);
      }
    }

    if (segments[0]?.command !== svgPathCommands.move) {
      return this.#invalid();
    }

    let commandCount = 0;
    let contourStarted = false;
    let contourDrawn = false;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];

      if (segment === undefined) {
        return this.#invalid();
      }

      const parameterCount = this.#parameterCount(segment.command);

      if (
        (parameterCount === 0 && segment.values.length !== 0) ||
        (parameterCount > 0 &&
          (segment.values.length < parameterCount ||
            segment.values.length % parameterCount !== 0))
      ) {
        return this.#invalid();
      }

      if (
        segment.command === svgPathCommands.arc &&
        !this.#validArcParameters(segment.values)
      ) {
        return this.#invalid();
      }

      const operationCount =
        parameterCount === 0 ? 1 : segment.values.length / parameterCount;
      commandCount += operationCount;

      if (segment.command === svgPathCommands.move) {
        if (contourStarted && !contourDrawn) {
          return this.#invalid();
        }

        contourStarted = true;
        contourDrawn = operationCount > 1;
      } else if (segment.command === svgPathCommands.close) {
        if (!contourStarted || !contourDrawn) {
          return this.#invalid();
        }

        contourStarted = false;
        contourDrawn = false;
      } else {
        if (!contourStarted) {
          return this.#invalid();
        }

        contourDrawn = true;
      }
    }

    if (contourStarted && !contourDrawn) {
      return this.#invalid();
    }

    const acceptedSegments = Object.freeze(
      segments.map((segment) =>
        Object.freeze({
          authoredCommand: segment.authoredCommand,
          command: segment.command,
          values: Object.freeze(segment.values),
        }),
      ),
    );

    return Object.freeze({
      valid: true,
      commandCount,
      hasDrawingOperation: true,
      segments: acceptedSegments satisfies readonly TSvgPathSegment[],
    });
  }

  /**
   * @description Resolves the accepted repeated parameter-group arity for one path command.
   * @param command - Lowercase SVG path command.
   * @returns Accepted repeated parameter-group arity.
   */
  #parameterCount(command: TSvgPathCommand): number {
    return svgPathCommandParameterCounts[command];
  }

  /**
   * @description Tokenises path data while rejecting unsupported characters and comma placement.
   * @param value - Exact authored path value.
   * @returns Command and finite-number tokens, or `undefined` for malformed text.
   */
  #tokenise(value: string): readonly (string | number)[] | undefined {
    const tokens: (string | number)[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;
    this.#tokenPattern.lastIndex = 0;

    while ((match = this.#tokenPattern.exec(value)) !== null) {
      const raw = match[0];
      const token =
        this.#commandPattern.test(raw)
          ? raw
          : Number(raw);
      const gap = value.slice(cursor, match.index);
      const previous = tokens[tokens.length - 1];

      if (
        !this.#validGap(
          gap,
          tokens.length === 0,
          typeof previous === "number",
          typeof token === "number",
        ) ||
        (typeof token === "number" && !Number.isFinite(token))
      ) {
        return undefined;
      }

      tokens.push(
        typeof token === "number" && Object.is(token, -0) ? 0 : token,
      );
      cursor = match.index + raw.length;
    }

    if (!this.#whitespaceOnlyPattern.test(value.slice(cursor))) {
      return undefined;
    }

    return Object.freeze(tokens);
  }

  /**
   * @description Determines whether one token gap follows accepted path separator rules.
   * @param value - Exact text between tokens.
   * @param beforeFirst - Whether the gap precedes the first token.
   * @param afterNumber - Whether the previous token is numeric.
   * @param beforeNumber - Whether the next token is numeric.
   * @returns Whether the gap is accepted.
   */
  #validGap(
    value: string,
    beforeFirst: boolean,
    afterNumber: boolean,
    beforeNumber: boolean,
  ): boolean {
    if (beforeFirst) {
      return this.#whitespaceOnlyPattern.test(value);
    }

    if (value.includes(",")) {
      return (
        afterNumber &&
        beforeNumber &&
        this.#commaSeparatorPattern.test(value)
      );
    }

    return (
      value.length === 0 ||
      this.#requiredWhitespacePattern.test(value)
    );
  }

  /**
   * @description Validates radii and binary flags for repeated arc parameter groups.
   * @param values - Complete repeated arc parameter values.
   * @returns Whether every arc group is valid.
   */
  #validArcParameters(values: readonly number[]): boolean {
    for (let index = 0; index < values.length; index += 7) {
      const radiusX = values[index];
      const radiusY = values[index + 1];
      const largeArc = values[index + 3];
      const sweep = values[index + 4];

      if (
        radiusX === undefined ||
        radiusY === undefined ||
        radiusX < 0 ||
        radiusY < 0 ||
        ![0, 1].includes(largeArc ?? -1) ||
        ![0, 1].includes(sweep ?? -1)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * @description Creates the canonical malformed path inspection result.
   * @returns Frozen invalid inspection with no retained source segments.
   */
  #invalid(): TSvgPathInspection {
    return Object.freeze({
      valid: false,
      commandCount: 0,
      hasDrawingOperation: false,
    });
  }
}
