import type { TJsonCursor } from "../types/internal/json-cursor.type.js";
import type { TJsonInspection } from "../types/internal/json-inspection.type.js";
import { metadataSchema } from "../constants/metadata-schema.constant.js";

/**
 * @description Validates bounded strict JSON and locates duplicate decoded object keys.
 */
export class JsonSyntaxInspector {
  /**
   * @description Inspects one exact metadata JSON source.
   * @param content - Exact decoded metadata text.
   * @returns Parsed value or stable syntax, resource, or duplicate-key evidence.
   */
  inspect(content: string): TJsonInspection {
    if (content.length > metadataSchema.maximumContentLength) {
      return Object.freeze({
        accepted: false,
        reason: "resource",
      });
    }

    let value: unknown;

    try {
      value = JSON.parse(content);
    } catch {
      return Object.freeze({
        accepted: false,
        reason: "syntax",
      });
    }

    const cursor: TJsonCursor = { content, offset: 0 };
    const structureIssue = this.#parseValue(cursor, 0);

    return structureIssue ?? Object.freeze({
      accepted: true,
      value,
    });
  }

  /**
   * @description Inspects one JSON value and its nested object key sets.
   * @param cursor - Mutable bounded JSON cursor.
   * @param depth - Current structural nesting depth.
   * @returns First duplicate or resource issue, or `undefined`.
   */
  #parseValue(
    cursor: TJsonCursor,
    depth: number,
  ): Exclude<TJsonInspection, { readonly accepted: true }> | undefined {
    if (depth > metadataSchema.maximumDepth) {
      return Object.freeze({
        accepted: false,
        reason: "resource",
      });
    }

    this.#skipWhitespace(cursor);

    switch (cursor.content[cursor.offset]) {
      case "{":
        return this.#parseObject(cursor, depth + 1);
      case "[":
        return this.#parseArray(cursor, depth + 1);
      case '"':
        this.#parseString(cursor);
        return undefined;
      default:
        this.#skipPrimitive(cursor);
        return undefined;
    }
  }

  /**
   * @description Inspects one valid JSON object while tracking decoded keys locally.
   * @param cursor - Mutable bounded JSON cursor positioned at `{`.
   * @param depth - Nested value depth.
   * @returns First duplicate or resource issue, or `undefined`.
   */
  #parseObject(
    cursor: TJsonCursor,
    depth: number,
  ): Exclude<TJsonInspection, { readonly accepted: true }> | undefined {
    cursor.offset += 1;
    this.#skipWhitespace(cursor);

    if (cursor.content[cursor.offset] === "}") {
      cursor.offset += 1;
      return undefined;
    }

    const keys = new Set<string>();

    while (cursor.offset < cursor.content.length) {
      this.#skipWhitespace(cursor);
      const startOffset = cursor.offset;
      const key = this.#parseString(cursor);
      const endOffset = cursor.offset;

      if (keys.has(key)) {
        return Object.freeze({
          accepted: false,
          duplicateKey: key,
          startOffset,
          endOffset,
        });
      }

      keys.add(key);
      this.#skipWhitespace(cursor);
      cursor.offset += 1;

      const issue = this.#parseValue(cursor, depth);

      if (issue !== undefined) {
        return issue;
      }

      this.#skipWhitespace(cursor);

      if (cursor.content[cursor.offset] === "}") {
        cursor.offset += 1;
        return undefined;
      }

      cursor.offset += 1;
    }

    return undefined;
  }

  /**
   * @description Inspects every nested value in one valid JSON array.
   * @param cursor - Mutable bounded JSON cursor positioned at `[`.
   * @param depth - Nested value depth.
   * @returns First duplicate or resource issue, or `undefined`.
   */
  #parseArray(
    cursor: TJsonCursor,
    depth: number,
  ): Exclude<TJsonInspection, { readonly accepted: true }> | undefined {
    cursor.offset += 1;
    this.#skipWhitespace(cursor);

    if (cursor.content[cursor.offset] === "]") {
      cursor.offset += 1;
      return undefined;
    }

    while (cursor.offset < cursor.content.length) {
      const issue = this.#parseValue(cursor, depth);

      if (issue !== undefined) {
        return issue;
      }

      this.#skipWhitespace(cursor);

      if (cursor.content[cursor.offset] === "]") {
        cursor.offset += 1;
        return undefined;
      }

      cursor.offset += 1;
    }

    return undefined;
  }

  /**
   * @description Advances across one valid JSON string and returns its decoded value.
   * @param cursor - Mutable bounded JSON cursor positioned at `"`.
   * @returns Decoded JSON string.
   */
  #parseString(cursor: TJsonCursor): string {
    const startOffset = cursor.offset;
    cursor.offset += 1;

    while (cursor.offset < cursor.content.length) {
      const character = cursor.content[cursor.offset];

      if (character === "\\") {
        cursor.offset += 2;
      } else {
        cursor.offset += 1;

        if (character === '"') {
          return JSON.parse(
            cursor.content.slice(startOffset, cursor.offset),
          ) as string;
        }
      }
    }

    return "";
  }

  /**
   * @description Advances across one valid non-container JSON primitive.
   * @param cursor - Mutable bounded JSON cursor.
   * @returns Nothing.
   */
  #skipPrimitive(cursor: TJsonCursor): void {
    while (
      cursor.offset < cursor.content.length &&
      !/[\s,\]}]/u.test(cursor.content[cursor.offset] ?? "")
    ) {
      cursor.offset += 1;
    }
  }

  /**
   * @description Advances across JSON whitespace.
   * @param cursor - Mutable bounded JSON cursor.
   * @returns Nothing.
   */
  #skipWhitespace(cursor: TJsonCursor): void {
    while (
      cursor.offset < cursor.content.length &&
      /\s/u.test(cursor.content[cursor.offset] ?? "")
    ) {
      cursor.offset += 1;
    }
  }
}
