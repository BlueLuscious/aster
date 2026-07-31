import type { IconMetadata } from "@aster/core";
import type { ICollectionMetadataValue } from "../contracts/internal/collection-metadata-value.contract.js";
import type { IIconMetadataValue } from "../contracts/internal/icon-metadata-value.contract.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";

/**
 * @description Composes collection and icon metadata according to their accepted ownership authority.
 */
export class IconMetadataComposer {
  /**
   * @description Resolves one portable metadata value from collection defaults and icon authority.
   * @param collection - Structured collection-authored defaults and override policy.
   * @param icon - Structured icon-authored metadata.
   * @returns Resolved metadata ready for Core definition creation.
   */
  compose(
    collection: ICollectionMetadataValue,
    icon: IIconMetadataValue,
  ): IconMetadata {
    if (
      icon.licence !== undefined &&
      !collection.allowIconLicenceOverride
    ) {
      throw new BuildContractError(
        "request.iconMetadata.licence",
        "the collection does not allow icon licence overrides",
      );
    }

    const licence = icon.licence ?? collection.licence;
    const attribution =
      icon.attribution ??
      (icon.licence === undefined ? collection.attribution : undefined);

    return {
      displayName: icon.displayName,
      ...(icon.tags === undefined ? {} : { tags: icon.tags }),
      rtl: icon.rtl ?? "preserve",
      presentation: collection.presentation,
      ...(licence === undefined ? {} : { licence }),
      ...(attribution === undefined ? {} : { attribution }),
      deprecated: icon.deprecated ?? false,
      ...(icon.replacedBy === undefined
        ? {}
        : { replacedBy: icon.replacedBy }),
    };
  }
}
