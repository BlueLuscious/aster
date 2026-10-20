/** @description Allocation bounds for synthetic fixtures, not public Core or catalogue limits. */
export const benchmarkScaleFixture = Object.freeze({
  /** @description Largest explicitly supported definition or collection count. */
  maximumEntries: 10_000,
  /** @description Maximum treatments per synthetic glyph. */
  maximumVariants: 10,
  /** @description Maximum nodes per synthetic definition. */
  maximumNodesPerDefinition: 1_000,
  /** @description Maximum points per synthetic polyline. */
  maximumPointsPerNode: 1_024,
  /** @description Maximum prepared geometry units across a fixture. */
  maximumGeometryUnits: 1_000_000,
  /** @description Maximum declared synthetic metadata width. */
  maximumLabelWidth: 1_024,
  /** @description Maximum provider count for a synthetic catalogue. */
  maximumProviders: 8,
});
