import type {
  CollectionDefinition,
  IconDefinition,
} from "@aster/core";
import {
  AsterIcons,
  ArrowLeft,
  Search,
} from "../../src/index.js";
import {
  AsterCollections,
} from "../../src/collections/index.js";
import type {
  CollectionManifestEntry,
  IconManifestEntry,
} from "../../src/manifest/index.js";
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "../../src/manifest/index.js";

const directDefinition: IconDefinition = ArrowLeft;
const indexedDefinitions: readonly IconDefinition[] = AsterIcons;
const indexedCollections: readonly CollectionDefinition[] = AsterCollections;
const iconManifest: readonly IconManifestEntry[] = AsterIconManifest;
const collectionManifest: readonly CollectionManifestEntry[] =
  AsterCollectionManifest;
declare const collectionDefinition: CollectionDefinition;

// @ts-expect-error Canonical definitions are immutable.
directDefinition.identity.name = "changed";

// @ts-expect-error Collection modules do not expose framework components.
const component = ArrowLeft.component;

// @ts-expect-error Collection modules do not expose rendered SVG.
const markup = Search.svg;

// @ts-expect-error Canonical icon indexes are immutable.
AsterIcons.push(ArrowLeft);

// @ts-expect-error Canonical collection indexes are immutable.
AsterCollections.push(collectionDefinition);

// @ts-expect-error Canonical manifest ordering is immutable.
AsterIconManifest.push(AsterIconManifest[0]);

// @ts-expect-error Canonical manifest records are immutable.
AsterIconManifest[0].key = "changed";

// @ts-expect-error Canonical collection membership is immutable.
AsterCollectionManifest[0].members.push("aster/changed");

void directDefinition;
void indexedDefinitions;
void indexedCollections;
void iconManifest;
void collectionManifest;
void component;
void markup;
