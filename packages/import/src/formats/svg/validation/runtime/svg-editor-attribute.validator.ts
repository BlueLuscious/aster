import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { ISvgSyntaxAttribute } from "../../parser/contracts/internal/svg-syntax-attribute.contract.js";
import { svgEditorAttributeSchema } from "../../shared/constants/svg-editor-attribute-schema.constant.js";
import { svgEditorAttributeValueKinds } from "../../shared/constants/svg-editor-attribute-value-kinds.constant.js";
import { SvgNumberParser } from "../../shared/runtime/svg-number.parser.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Validates the finite root editor attributes accepted for explicit discard.
 */
export class SvgEditorAttributeValidator {
  /**
   * @description Strict finite SVG number parser.
   */
  readonly #numberParser = new SvgNumberParser();

  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Determines whether one local name belongs to the finite editor schema.
   * @param localName - Namespace-free attribute name.
   * @returns Whether the attribute is explicitly reviewable and discardable.
   */
  supports(localName: string): boolean {
    return Object.hasOwn(svgEditorAttributeSchema, localName);
  }

  /**
   * @description Validates and reports one explicitly discarded root editor attribute.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param attribute - Located root editor attribute.
   * @returns One warning for safe discard or one blocking invalid-value diagnostic.
   */
  inspect(
    sourceId: string,
    attribute: ISvgSyntaxAttribute,
  ): readonly SourceDiagnostic[] {
    const kind = this.#kind(attribute.localName);

    if (kind === undefined) {
      return Object.freeze([]);
    }

    const number = this.#numberParser.parse(attribute.value);
    const valid =
      (kind === svgEditorAttributeValueKinds.text &&
        attribute.value.length > 0 &&
        !/[\u0000-\u001f\u007f-\u009f]/u.test(attribute.value)) ||
      (kind === svgEditorAttributeValueKinds.length && this.#validLength(attribute.value)) ||
      (kind === svgEditorAttributeValueKinds.positiveNumber && number !== undefined && number > 0) ||
      (kind === svgEditorAttributeValueKinds.background && this.#validBackground(attribute.value)) ||
      (kind === svgEditorAttributeValueKinds.space &&
        (attribute.value === "default" || attribute.value === "preserve"));

    return Object.freeze([
      this.#diagnosticFactory.create({
        kind: valid
          ? svgValidationIssueKinds.discardedEditorAttribute
          : svgValidationIssueKinds.invalidPresentation,
        sourceId,
        span: valid ? attribute.nameSpan : attribute.valueSpan,
      }),
    ]);
  }

  /**
   * @description Resolves one finite editor value family without widening schema types.
   * @param localName - Namespace-free root attribute name.
   * @returns Matching value family, or `undefined` when unsupported.
   */
  #kind(
    localName: string,
  ): (typeof svgEditorAttributeSchema)[keyof typeof svgEditorAttributeSchema] | undefined {
    if (!Object.hasOwn(svgEditorAttributeSchema, localName)) {
      return undefined;
    }

    return svgEditorAttributeSchema[
      localName as keyof typeof svgEditorAttributeSchema
    ];
  }

  /**
   * @description Validates Illustrator's inert root background rectangle declaration.
   * @param value - Authored `enable-background` value.
   * @returns Whether the value contains `new` and four finite numbers.
   */
  #validBackground(value: string): boolean {
    if (!value.startsWith("new ")) {
      return false;
    }

    const values = this.#numberParser.parseSequence(value.slice(4));
    return values !== undefined && values.length === 4;
  }

  /**
   * @description Validates a finite root position expressed as a number or pixel length.
   * @param value - Authored root position value.
   * @returns Whether the value is a finite number with an optional `px` suffix.
   */
  #validLength(value: string): boolean {
    const numeric = value.endsWith("px") ? value.slice(0, -2) : value;
    return numeric.length > 0 && this.#numberParser.parse(numeric) !== undefined;
  }
}
