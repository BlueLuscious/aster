/**
 * @description Accepted consistency failure facts retained before diagnostic construction.
 */
export type TCatalogueDefinitionFailure = Readonly<{
  /** @description Deterministic explanation owned by the consistency validator. */
  message: string;
  /** @description Known failing concrete member, absent for collection-wide inconsistencies. */
  member?: string;
}>;
