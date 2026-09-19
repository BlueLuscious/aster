import type { AsterCommandShowSubjectType } from "../../../command/types/index.js";
import type {
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
} from "../../contracts/index.js";

/**
 * @description Internal exact metadata selection resolved before definition loading.
 */
export type TCatalogueDiscoverySelection = Readonly<{
  /** @description Exact provider that supplied the accepted record. */
  catalogue: string;

  /** @description Selected portable value family. */
  subject: AsterCommandShowSubjectType;

  /** @description Canonical textual identity requested by the caller. */
  identity: string;

  /** @description Selected icon record when the subject is an icon. */
  icon?: CatalogueDiscoveryIconRecord;

  /** @description Selected collection record when the subject is a collection. */
  collection?: CatalogueDiscoveryCollectionRecord;
}>;
