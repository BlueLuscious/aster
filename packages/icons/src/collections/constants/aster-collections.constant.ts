import type { CollectionDefinition } from "@aster/core";
import { AsterCollection } from "../aster.collection.js";

/**
 * @description Complete immutable index of canonical Aster collection definitions.
 * @remarks Icon discovery remains independent from collection membership and collection count.
 */
export const AsterCollections: readonly CollectionDefinition[] = Object.freeze([
  AsterCollection,
]);
