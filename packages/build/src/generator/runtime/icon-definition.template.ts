import type { IconDefinition } from "@aster/core";
import { TypeScriptValueSerialiser } from "./typescript-value.serialiser.js";

/**
 * @description Renders one portable definition as a public Core construction expression.
 */
export class IconDefinitionTemplate {
  /**
   * @description Deterministic portable-value serialisation authority.
   */
  readonly #serialiser = new TypeScriptValueSerialiser();

  /**
   * @description Renders one complete portable definition construction expression.
   * @param definition - Complete immutable portable definition.
   * @returns TypeScript expression delegating construction to public Core authority.
   */
  render(definition: IconDefinition): string {
    return `$Icon.define(${this.#serialiser.serialise(definition)})`;
  }
}
