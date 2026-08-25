import type { IconRenderOptions } from "@aster/core";
import { Svg, SvgRenderError } from "@aster/svg";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { svgExportArtefactSchema } from "../constants/svg-export-artefact-schema.constant.js";
import type { AsterExportArtefact } from "../contracts/index.js";
import type { TExportSelection } from "../types/internal/export-selection.type.js";
import { ExportPathFormatter } from "./export-path.formatter.js";

/**
 * @description Renders complete deterministic SVG artefacts for one accepted selection.
 */
export class SvgExportArtefactFactory {
  /**
   * @description Canonical logical artefact-path formatter.
   */
  readonly #paths = new ExportPathFormatter();

  /**
   * @description Immutable diagnostic constructor for render and path conflicts.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Renders every selected definition before exposing one complete artefact sequence.
   * @param selection - Exact accepted catalogue selection.
   * @param options - Optional canonical portable render values.
   * @returns Complete immutable artefacts or one deterministic failure.
   */
  create(
    selection: TExportSelection,
    options: IconRenderOptions | undefined,
  ): TAcceptanceResult<readonly AsterExportArtefact[]> {
    const artefacts: AsterExportArtefact[] = [];
    const paths = new Set<string>();

    for (const definition of selection.definitions) {
      const path = this.#paths.icon(definition.identity);

      if (paths.has(path)) {
        return Object.freeze({
          accepted: false,
          diagnostic: this.#diagnostics.create(
            commandDiagnosticSchema.categories.exportConflict,
            commandDiagnosticSchema.codes.exportConflict,
            `multiple selected icons resolve to artefact path ${path}`,
            [path],
          ),
        });
      }

      try {
        artefacts.push(Object.freeze({
          path,
          mediaType: svgExportArtefactSchema.mediaType,
          content: Svg.render(definition, options),
        }));
      } catch (error) {
        if (!(error instanceof SvgRenderError)) {
          throw error;
        }

        return Object.freeze({
          accepted: false,
          diagnostic: this.#diagnostics.create(
            commandDiagnosticSchema.categories.renderFailure,
            commandDiagnosticSchema.codes.renderFailure,
            `icon ${path} could not be rendered as SVG`,
            [path],
          ),
        });
      }

      paths.add(path);
    }

    return Object.freeze({ accepted: true, value: Object.freeze(artefacts) });
  }
}

