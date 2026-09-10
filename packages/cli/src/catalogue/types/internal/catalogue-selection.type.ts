import type { CollectionDefinition } from "@aster/core";
import type { AsterCommandShowSubjectType } from "../../../command/types/index.js";
import type { TCatalogueSelectedIcon } from "./catalogue-selected-icon.type.js";

/**
 * @description Internal exact catalogue selection shared by host-neutral consumers.
 */
export type TCatalogueSelection = Readonly<{
  /**
   * @description Exact provider that supplied the accepted selection.
   */
  catalogue: string;

  /**
   * @description Selected portable value family.
   */
  subject: AsterCommandShowSubjectType;

  /**
   * @description Canonical textual identity requested by the caller.
   */
  identity: string;

  /**
   * @description Selected collection definition when the subject is a collection.
   */
  collection?: CollectionDefinition;

  /**
   * @description Canonically ordered selected icons with membership evidence.
   */
  icons: readonly TCatalogueSelectedIcon[];
}>;
