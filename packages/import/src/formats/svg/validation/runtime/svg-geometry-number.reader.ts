import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgNumericDomains } from "../../shared/constants/svg-numeric-domains.constant.js";
import { SvgNumberParser } from "../../shared/runtime/svg-number.parser.js";
import type { TSvgGeometryNumericDomain } from "../types/internal/svg-geometry-numeric-domain.type.js";
import type { TLocatedNumber } from "../types/internal/located-number.type.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Reads optional and required geometry numbers through one technical domain policy.
 */
export class SvgGeometryNumberReader {
  /**
   * @description Strict finite SVG number parser.
   */
  readonly #numberParser = new SvgNumberParser();

  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Reads one numeric geometry attribute and records valid authored grid evidence.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located supported geometry element.
   * @param name - Namespace-free attribute name.
   * @param domain - Accepted numeric domain.
   * @param required - Whether absence violates the geometry contract.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @param gridValues - Shared valid authored-value accumulator.
   * @returns Located valid authored number, or `undefined` when absent or invalid.
   */
  read(
    sourceId: string,
    element: ISvgSyntaxElement,
    name: string,
    domain: TSvgGeometryNumericDomain,
    required: boolean,
    diagnostics: SourceDiagnostic[],
    gridValues: TLocatedNumber[],
  ): TLocatedNumber | undefined {
    const attribute = element.attributes.find(
      (candidate) => candidate.localName === name,
    );

    if (attribute === undefined) {
      if (required) {
        diagnostics.push(
          this.#invalid(sourceId, element.nameSpan),
        );
      }

      return undefined;
    }

    const value = this.#numberParser.parse(attribute.value);
    const valid =
      value !== undefined &&
      (domain === svgNumericDomains.finite ||
        (domain === svgNumericDomains.positive && value > 0) ||
        (domain === svgNumericDomains.nonNegative && value >= 0));

    if (!valid || value === undefined) {
      diagnostics.push(this.#invalid(sourceId, attribute.valueSpan));
      return undefined;
    }

    const located = { value, span: attribute.valueSpan };
    gridValues.push(located);
    return located;
  }

  /**
   * @description Creates one malformed geometry diagnostic.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param span - Exact source evidence.
   * @returns Immutable blocking diagnostic.
   */
  #invalid(
    sourceId: string,
    span: ISvgSyntaxElement["span"],
  ): SourceDiagnostic {
    return this.#diagnosticFactory.create({
      kind: svgValidationIssueKinds.invalidGeometry,
      sourceId,
      span,
    });
  }
}
