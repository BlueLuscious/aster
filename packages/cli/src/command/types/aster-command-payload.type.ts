import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
  CatalogueProviderResult,
} from "../../catalogue/contracts/index.js";
import type { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandDescriptor } from "../contracts/index.js";
import type { AsterInstalledPackageVersion } from "../contracts/aster-installed-package-version.contract.js";
import type { AsterCliLocationEvidence } from "../contracts/aster-cli-location-evidence.contract.js";
import type { AsterPackageDependencyGroup } from "../contracts/aster-package-dependency-group.contract.js";
import type { AsterPackageVersionSourceType } from "./aster-package-version-source.type.js";
import type { AsterExportPlan } from "../../export/contracts/index.js";
import type { AsterReviewPlan } from "../../review/contracts/index.js";

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
       * @description Discriminator for one complete headless review plan.
       */
      kind: typeof asterCommandPayloadKinds.review;

      /**
       * @description Complete immutable static review plan.
       */
      plan: AsterReviewPlan;
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

      /** @description Requested executed-CLI location, absent from ordinary version results. */
      location?: AsterCliLocationEvidence;
    }>
  | Readonly<{
      /** @description Discriminator for explicit installed public package evidence. */
      kind: typeof asterCommandPayloadKinds.packageVersions;

      /** @description Project or executed-CLI installation measured by the query. */
      source: AsterPackageVersionSourceType;

      /** @description Marks a complete requested view, even when it has one or no members. */
      aggregate?: true;

      /** @description Selected package versions in canonical public order. */
      packages: readonly AsterInstalledPackageVersion[];
      /** @description Requested executed-CLI location on a named CLI version result. */
      location?: AsterCliLocationEvidence;
    }>
  | Readonly<{
      /** @description Discriminator for installed root and direct-dependency groups. */
      kind: typeof asterCommandPayloadKinds.packageDependencies;

      /** @description Source from which the root packages were selected. */
      source: AsterPackageVersionSourceType;

      /** @description Independent root groups in canonical package order. */
      groups: readonly AsterPackageDependencyGroup[];

      /** @description Requested executed-CLI location on CLI-rooted queries. */
      location?: AsterCliLocationEvidence;
    }>;
