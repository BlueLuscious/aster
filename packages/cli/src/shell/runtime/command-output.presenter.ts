import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandResultType } from "../../command/types/index.js";
import type { TShellExecution } from "../types/internal/shell-execution.type.js";
import type { TExportOutputPublication } from "../types/internal/export-output-publication.type.js";
import { HumanOutputPresenter } from "./human-output.presenter.js";
import { JsonOutputPresenter } from "./json-output.presenter.js";

/**
 * @description Maps structured command results to shell streams and documented exit status.
 */
export class CommandOutputPresenter {
  /**
   * @description Plain deterministic human presenter.
   */
  readonly #human = new HumanOutputPresenter();

  /**
   * @description Stable unstyled machine presenter.
   */
  readonly #json = new JsonOutputPresenter();

  /**
   * @description Presents one completed standalone output publication.
   * @param publication - Immutable committed or empty-plan publication evidence.
   * @returns Human stdout summary and successful exit status.
   */
  presentPublication(
    publication: TExportOutputPublication,
  ): TShellExecution {
    return Object.freeze({
      stdout: `${this.#human.publication(publication)}\n`,
      stderr: "",
      exitCode: 0,
    });
  }

  /**
   * @description Presents one result without writing to process streams.
   * @param result - Structured immutable command result.
   * @param json - Whether machine-readable presentation was explicitly requested.
   * @returns Complete stream contents and exit status for the executable entrypoint.
   */
  present(result: AsterCommandResultType, json: boolean): TShellExecution {
    const exitCode = result.ok
      ? 0
      : result.diagnostic.category === commandDiagnosticSchema.categories.usage
        ? 2
        : 1;

    if (json) {
      return Object.freeze({
        stdout: `${this.#json.present(result)}\n`,
        stderr: "",
        exitCode,
      });
    }

    return Object.freeze({
      stdout: result.ok ? `${this.#human.success(result)}\n` : "",
      stderr: result.ok ? "" : `${this.#human.failure(result)}\n`,
      exitCode,
    });
  }
}
