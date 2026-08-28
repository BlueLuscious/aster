import type { ICanonicalSvgSource } from "../../../source/contracts/internal/canonical-svg-source.contract.js";
import type { SvgIconImportSource } from "../../../source/contracts/svg-icon-import-source.contract.js";
import type { IIconImportAdapter } from "../../../format/contracts/internal/icon-import-adapter.contract.js";
import type { IconImportDraft } from "../../../adoption/contracts/index.js";
import type { DiagnosticResultType } from "../../../diagnostic/types/index.js";
import { iconImportFormats } from "../../../format/constants/icon-import-formats.constant.js";
import { DiagnosticResultFactory } from "../../../diagnostic/runtime/diagnostic-result.factory.js";
import { diagnosticSeverities } from "../../../diagnostic/constants/diagnostic-severities.constant.js";
import { SvgParser } from "../parser/runtime/svg.parser.js";
import { SvgTechnicalValidator } from "../validation/runtime/svg-technical.validator.js";
import { SvgImportDraftFactory } from "./svg-import-draft.factory.js";

/**
 * @description Built-in adapter for safe deterministic SVG source inspection.
 */
export class SvgIconImportAdapter implements IIconImportAdapter<SvgIconImportSource> {
  /**
   * @description Exact built-in format owned by this adapter.
   */
  readonly format = iconImportFormats.svg;

  /**
   * @description Safe SVG syntax parsing authority.
   */
  readonly #parser = new SvgParser();

  /**
   * @description Universal technical SVG validation authority.
   */
  readonly #validator = new SvgTechnicalValidator();

  /**
   * @description Neutral imported-draft construction authority.
   */
  readonly #draftFactory = new SvgImportDraftFactory();

  /**
   * @description Diagnostic-bearing result authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Inspects one isolated SVG source without semantic metadata or host effects.
   * @param source - Exact decoded and independently identified SVG source.
   * @returns Neutral draft or blocking parser and technical diagnostics.
   */
  inspect(source: SvgIconImportSource): DiagnosticResultType<IconImportDraft> {
    const canonical: ICanonicalSvgSource = Object.freeze({
      kind: iconImportFormats.svg,
      sourceId: source.sourceId,
      identity: source.identity,
      content: source.content,
    });
    const parsed = this.#parser.parse(canonical);

    if (!parsed.successful) {
      return this.#resultFactory.failure(parsed.diagnostics);
    }

    const technical = this.#validator.inspect({
      source: canonical,
      document: parsed.value,
    });

    if (
      technical.diagnostics.some(
        (diagnostic) => diagnostic.severity === diagnosticSeverities.error,
      )
    ) {
      return this.#resultFactory.failure(technical.diagnostics);
    }

    return this.#resultFactory.success(
      this.#draftFactory.create(source, parsed.value, technical.metrics),
      technical.diagnostics,
    );
  }
}
