import type { IconIdentity } from "@luscious-garden/aster-core";
import type { CatalogueCollectionResult, CatalogueDiscoveryCollectionRecord } from "../../src/index.js";

declare const discovery: CatalogueDiscoveryCollectionRecord;
declare const result: CatalogueCollectionResult;

const discovered: readonly IconIdentity[] = discovery.memberIdentities;
const returned: readonly IconIdentity[] = result.memberIdentities;
// @ts-expect-error Collection discovery exposes no legacy field alias.
discovery.icons;
// @ts-expect-error Collection results expose no legacy field alias.
result.icons;
// @ts-expect-error The returned identity sequence is readonly.
result.memberIdentities.push({ name: "camera", variant: "outline" });
void discovered;
void returned;
