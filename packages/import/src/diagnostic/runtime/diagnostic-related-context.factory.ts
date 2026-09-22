import type { DiagnosticRelatedContext } from "../contracts/index.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { SourceIdNormaliser } from "../../source/runtime/source-id.normaliser.js";
import { DiagnosticMessageNormaliser } from "./diagnostic-message.normaliser.js";
import { SourceSpanFactory } from "./source-span.factory.js";

/**
 * @description Validates, canonicalises, and freezes related diagnostic source context.
 */
export class DiagnosticRelatedContextFactory {
  /**
   * @description Primitive Import value validator.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Logical source identifier normaliser.
   */
  readonly #sourceIdNormaliser = new SourceIdNormaliser();

  /**
   * @description Source span construction authority.
   */
  readonly #spanFactory = new SourceSpanFactory();

  /**
   * @description Stable context-message normaliser.
   */
  readonly #messageNormaliser = new DiagnosticMessageNormaliser();

  /**
   * @description Creates one immutable related context.
   * @param value - Unknown related context.
   * @param path - Logical related-context path.
   * @returns Deeply frozen canonical related context.
   */
  create(value: unknown, path: string): DiagnosticRelatedContext {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["message", "sourceId", "span"], path);
    const message = this.#messageNormaliser.normalise(
      record.message,
      `${path}.message`,
    );
    const sourceId = this.#sourceIdNormaliser.normalise(
      record.sourceId,
      `${path}.sourceId`,
    );
    const span =
      "span" in record
        ? this.#spanFactory.create(record.span, `${path}.span`)
        : undefined;

    return Object.freeze({
      message,
      sourceId,
      ...(span === undefined ? {} : { span }),
    });
  }

  /**
   * @description Creates a deterministically ordered duplicate-free related-context sequence.
   * @param value - Unknown related-context sequence.
   * @param path - Logical sequence path.
   * @returns Frozen canonical related-context sequence.
   */
  createSequence(
    value: unknown,
    path: string,
  ): readonly DiagnosticRelatedContext[] {
    const contexts = this.#validator
      .array(value, path)
      .map((context, index) => this.create(context, `${path}[${index}]`))
      .sort((left, right) => this.#compare(left, right));
    const unique = contexts.filter(
      (context, index) =>
        index === 0 ||
        JSON.stringify(context) !== JSON.stringify(contexts[index - 1]),
    );

    return Object.freeze(unique);
  }

  /**
   * @description Compares related contexts without locale-sensitive behaviour.
   * @param left - First related context.
   * @param right - Second related context.
   * @returns Negative, zero, or positive ordering value.
   */
  #compare(
    left: DiagnosticRelatedContext,
    right: DiagnosticRelatedContext,
  ): number {
    return (
      this.#compareText(left.sourceId, right.sourceId) ||
      this.#spanStart(left) - this.#spanStart(right) ||
      this.#spanEnd(left) - this.#spanEnd(right) ||
      this.#compareText(left.message, right.message)
    );
  }

  /**
   * @description Resolves a related context start offset for canonical sorting.
   * @param context - Related context to inspect.
   * @returns Start offset, or negative one for whole-source context.
   */
  #spanStart(context: DiagnosticRelatedContext): number {
    return context.span?.start.offset ?? -1;
  }

  /**
   * @description Resolves a related context end offset for canonical sorting.
   * @param context - Related context to inspect.
   * @returns End offset, or negative one for whole-source context.
   */
  #spanEnd(context: DiagnosticRelatedContext): number {
    return context.span?.end.offset ?? -1;
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text.
   * @param right - Second text.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
