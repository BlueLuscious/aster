import type { ISvgValidationEntry } from "../contracts/internal/svg-validation-entry.contract.js";
import type { TSvgTechnicalValidation } from "../types/internal/svg-technical-validation.type.js";
import { SvgGeometryValidator } from "./svg-geometry.validator.js";
import { SvgNumberParser } from "./svg-number.parser.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Applies universal blocking schema, geometry, and presentation validation.
 */
export class SvgTechnicalValidator {
  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Strict finite SVG number parser.
   */
  readonly #numberParser = new SvgNumberParser();

  /**
   * @description Supported geometry and presentation authority.
   */
  readonly #geometryValidator = new SvgGeometryValidator();

  /**
   * @description Validates one parser-safe SVG entry against universal technical invariants.
   * @param entry - Paired canonical SVG, syntax, and metadata source.
   * @returns Blocking diagnostics and safely computed collection metrics.
   */
  inspect(entry: ISvgValidationEntry): TSvgTechnicalValidation {
    const sourceId = entry.source.sourceId;
    const root = entry.document.root;
    const attribute = root.attributes.find(
      (candidate) => candidate.localName === "viewBox",
    );
    const sequence =
      attribute === undefined
        ? undefined
        : this.#numberParser.parseSequence(attribute.value);
    const validViewBox =
      sequence !== undefined &&
      sequence.length === 4 &&
      (sequence[2] ?? 0) > 0 &&
      (sequence[3] ?? 0) > 0;
    const diagnostics = [];

    if (!validViewBox) {
      diagnostics.push(
        this.#diagnosticFactory.create({
          kind: "invalid-view-box",
          sourceId,
          span: attribute?.valueSpan ?? root.nameSpan,
        }),
      );
    }

    const geometry = this.#geometryValidator.inspect(sourceId, root);
    diagnostics.push(...geometry.diagnostics);
    const viewBox =
      validViewBox && attribute !== undefined
        ? Object.freeze({
            value: Object.freeze({
              minX: sequence[0] ?? 0,
              minY: sequence[1] ?? 0,
              width: sequence[2] ?? 0,
              height: sequence[3] ?? 0,
            }),
            span: attribute.valueSpan,
          })
        : undefined;

    return Object.freeze({
      diagnostics: Object.freeze(diagnostics),
      metrics: Object.freeze({
        ...(viewBox === undefined ? {} : { viewBox }),
        primitiveCount: geometry.primitiveCount,
        pathCommandCount: geometry.pathCommandCount,
        gridValues: geometry.gridValues,
        strokeWidths: geometry.strokeWidths,
        bounds: geometry.bounds,
      }),
    });
  }
}
