import type { IconDefinition } from "@luscious-garden/aster-core";
import type { IconModuleOutput } from "../contracts/index.js";

/**
 * @description Derives stable editable-module names from portable icon identities.
 */
export class IconModuleNameFactory {
  /**
   * @description Resolves the named export identifier and suggested authored path.
   * @param definition - Complete accepted portable definition.
   * @returns Naming fields for an editable icon module.
   */
  create(definition: IconDefinition): Pick<IconModuleOutput, "exportName" | "suggestedPath"> {
    const identity = definition.identity;
    const exportNameParts = [
      ...identity.name.split("-"),
      ...identity.variant.split("-"),
    ];
    const baseExportName = exportNameParts
      .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
      .join("");
    const exportName = /^[0-9]/u.test(baseExportName) ? `Icon${baseExportName}` : baseExportName;
    const suggestedPath = `icons/${identity.name}/${identity.variant}.icon.ts`;

    return Object.freeze({ exportName, suggestedPath });
  }
}
