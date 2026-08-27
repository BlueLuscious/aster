import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
  CatalogueProviderResult,
} from "../../catalogue/contracts/index.js";
import type { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandDescriptor } from "../contracts/index.js";
import type { AsterExportPlan } from "../../export/contracts/index.js";

/**
 * @description Closed immutable success payload union returned by the initial command family.
 */
export type AsterCommandPayloadType =
  | Readonly<{
      /**
       * @description Discriminator for one complete headless export plan.
       */
      kind: typeof asterCommandPayloadKinds.export;

      /**
       * @description Complete immutable SVG artefact plan.
       */
      plan: AsterExportPlan;
    }>
  | Readonly<{
      /**
       * @description Discriminator for provider listing.
       */
      kind: typeof asterCommandPayloadKinds.catalogueList;

      /**
       * @description Canonically ordered loaded provider summaries.
       */
      catalogues: readonly CatalogueProviderResult[];
    }>
  | Readonly<{
      /**
       * @description Discriminator for collection listing.
       */
      kind: typeof asterCommandPayloadKinds.collectionList;

      /**
       * @description Canonically ordered collection results.
       */
      collections: readonly CatalogueCollectionResult[];
    }>
  | Readonly<{
      /**
       * @description Discriminator for icon listing.
       */
      kind: typeof asterCommandPayloadKinds.iconList;

      /**
       * @description Canonically ordered icon results.
       */
      icons: readonly CatalogueIconResult[];
    }>
  | Readonly<{
      /**
       * @description Discriminator for mixed catalogue search.
       */
      kind: typeof asterCommandPayloadKinds.search;

      /**
       * @description Canonically ordered icon and collection matches.
       */
      results: readonly (CatalogueIconResult | CatalogueCollectionResult)[];
    }>
  | Readonly<{
      /**
       * @description Discriminator for exact icon output.
       */
      kind: typeof asterCommandPayloadKinds.iconShow;

      /**
       * @description Exact resolved icon result.
       */
      icon: CatalogueIconResult;
    }>
  | Readonly<{
      /**
       * @description Discriminator for exact collection output.
       */
      kind: typeof asterCommandPayloadKinds.collectionShow;

      /**
       * @description Exact resolved collection result.
       */
      collection: CatalogueCollectionResult;
    }>
  | Readonly<{
      /**
       * @description Discriminator for deterministic help metadata.
       */
      kind: typeof asterCommandPayloadKinds.help;

      /**
       * @description Canonically ordered descriptors selected by the request.
       */
      descriptors: readonly AsterCommandDescriptor[];
    }>
  | Readonly<{
      /**
       * @description Discriminator for explicit product metadata.
       */
      kind: typeof asterCommandPayloadKinds.version;

      /**
       * @description Product name supplied by the execution host.
       */
      productName: string;

      /**
       * @description Product version supplied by the execution host.
       */
      productVersion: string;
    }>;
