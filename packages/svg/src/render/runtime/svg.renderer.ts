import {
  Icon,
  IconDefinitionError,
  type IconDefinition,
  type IconRenderOptions,
} from "@aster/core";
import { SvgRenderError } from "../../error/index.js";
import type { SvgMarkupType } from "../types/index.js";
import { SvgMarkupSerialiser } from "./svg-markup.serialiser.js";
import { SvgRenderOptionsNormaliser } from "./svg-render-options.normaliser.js";

/**
 * @description Coordinates Core validation, SVG option acceptance, and deterministic serialisation.
 */
export class SvgRenderer {
  /**
   * @description Accepted render-options normaliser.
   */
  readonly #optionsNormaliser = new SvgRenderOptionsNormaliser();

  /**
   * @description Complete deterministic markup serialiser.
   */
  readonly #markupSerialiser = new SvgMarkupSerialiser();

  /**
   * @description Renders one untrusted portable definition and optional options atomically.
   * @param definition - Portable definition candidate.
   * @param options - Optional portable render options candidate.
   * @returns Complete deterministic standalone SVG markup.
   */
  render(
    definition: IconDefinition,
    options?: IconRenderOptions,
  ): SvgMarkupType {
    let acceptedDefinition: IconDefinition;

    try {
      acceptedDefinition = Icon.define(definition);
    } catch (error: unknown) {
      if (!(error instanceof IconDefinitionError)) {
        throw error;
      }

      throw new SvgRenderError(
        error.path,
        "expected a valid portable icon definition",
      );
    }

    const context = this.#optionsNormaliser.normalise(
      acceptedDefinition,
      options,
    );

    return this.#markupSerialiser.serialise(context);
  }
}
