import type {
  CollectionIdentity,
  IconDefinition,
} from "@aster/core";

/**
 * @description Internal accepted icon definition and its independent collection memberships.
 */
export type TCatalogueSelectedIcon = Readonly<{
  /**
   * @description Canonical isolated icon definition supplied by the selected catalogue.
   */
  definition: IconDefinition;

  /**
   * @description Canonically ordered collection identities retaining the icon.
   */
  memberships: readonly CollectionIdentity[];
}>;
