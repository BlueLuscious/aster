/**
 * @description Independent synthetic scale axes, all prepared outside timed work.
 * @typedef {object} IBenchmarkScaleOptions
 * @property {number} [definitions] - Concrete definition count, divisible by variantsPerGlyph.
 * @property {number} [variantsPerGlyph] - Explicit treatments per glyph.
 * @property {number} [collections] - Distinct collection count.
 * @property {number} [membersPerCollection] - Concrete leaves selected by each collection.
 * @property {number} [sharedMembers] - Leaves shared by every collection; remaining selections are disjoint.
 * @property {number} [nodesPerDefinition] - Geometry nodes in each concrete definition.
 * @property {number} [pointsPerNode] - Zero for circles, otherwise polyline point count.
 * @property {number} [labelWidth] - Repeated metadata label characters, independently of geometry.
 * @property {number} [providers] - Provider count; partitioning preserves distinct identities.
 * @property {number} [overlappingDefinitions] - Initial definitions exposed by every provider.
 */

export {};
