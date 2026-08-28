import type { IconDefinition } from "@aster/core";
import type { IconModuleOutput } from "../contracts/index.js";

/**
 * @description Derives stable editable-module names from portable icon identities.
 */
export class IconModuleNameFactory {
  /**
   * @description Resolves the exported symbol and suggested authored path.
   * @param definition - Complete accepted portable definition.
   * @returns Naming fields for an editable icon module.
   */
  create(definition: IconDefinition): Pick<IconModuleOutput, "symbol" | "suggestedPath"> {
    const identity = definition.identity;
    const symbolParts = [
      ...identity.name.split("-"),
      ...(identity.variant === undefined ? [] : identity.variant.split("-")),
    ];
    const baseSymbol = symbolParts
      .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
      .join("");
    const symbol = /^[0-9]/u.test(baseSymbol) ? `Icon${baseSymbol}` : baseSymbol;
    const suggestedPath = identity.variant === undefined
      ? `icons/${identity.name}.icon.ts`
      : `icons/${identity.name}/${identity.variant}.icon.ts`;

    return Object.freeze({ symbol, suggestedPath });
  }
}
