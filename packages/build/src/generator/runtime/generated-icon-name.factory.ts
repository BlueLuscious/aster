import type { IconDefinition } from "@aster/core";
import type { TGeneratedIconName } from "../types/internal/generated-icon-name.type.js";
import { generatorModulePaths } from "../constants/generator-module-paths.constant.js";

/**
 * @description Derives stable TypeScript, module, package, and manifest names from portable identity.
 */
export class GeneratedIconNameFactory {
  /**
   * @description Derives every generated name for one portable definition.
   * @param definition - Complete portable definition with canonical identity.
   * @returns Frozen deterministic generated-name set.
   */
  create(definition: IconDefinition): TGeneratedIconName {
    const identity = definition.identity;
    const manifestKey =
      identity.variant === undefined
        ? identity.name
        : `${identity.name}/${identity.variant}`;
    const symbolParts = [
      ...identity.name.split("-"),
      ...(identity.variant === undefined
        ? []
        : identity.variant.split("-")),
    ];
    const baseSymbol = symbolParts
      .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
      .join("");
    const symbol = /^[0-9]/u.test(baseSymbol)
      ? `Icon${baseSymbol}`
      : baseSymbol;
    const modulePath =
      identity.variant === undefined
        ? `${generatorModulePaths.iconRoot}/${identity.name}.ts`
        : `${generatorModulePaths.iconRoot}/${identity.name}/${identity.variant}.ts`;

    return Object.freeze({
      identityKey: `${identity.collection}/${manifestKey}`,
      symbol,
      modulePath,
      publicSubpath: `./${manifestKey}`,
      manifestKey,
    });
  }
}
