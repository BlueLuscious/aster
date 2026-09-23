import type {
  CollectionDefinition,
  CollectionIconMap,
} from "../../contracts/index.js";

/**
 * @description Internal keyed and ordered membership result derived from one collection definition.
 * @typeParam TIconMap - Concrete collection-local icon alias map.
 */
export type TCollectionMembershipResult<
  TIconMap extends CollectionIconMap = CollectionIconMap,
> = Pick<CollectionDefinition<TIconMap>, "icons" | "members">;
