import type {
  IconDefinition,
} from "@luscious-garden/aster-core";
import { ArrowLeft } from "../../src/generated/facades/icons/arrow-left.js";
import { Search } from "../../src/generated/facades/icons/search.js";
import type {
  CollectionDefinitionLoader,
  CollectionDefinitionLoaderMap,
  IconDefinitionLoader,
  IconDefinitionLoaderMap,
} from "../../src/dynamic/index.js";
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "../../src/dynamic/index.js";
import type {
  CollectionManifestEntry,
  IconManifestEntry,
} from "../../src/manifest/index.js";
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "../../src/manifest/index.js";

const directDefinition: IconDefinition = ArrowLeft;
const iconManifest: readonly IconManifestEntry[] = AsterIconManifest;
const collectionManifest: readonly CollectionManifestEntry[] =
  AsterCollectionManifest;
const iconLoaders: IconDefinitionLoaderMap = AsterIconLoaders;
const collectionLoaders: CollectionDefinitionLoaderMap =
  AsterCollectionLoaders;
const iconLoader: IconDefinitionLoader | undefined =
  AsterIconLoaders["aster/arrow-left"];
const collectionLoader: CollectionDefinitionLoader | undefined =
  AsterCollectionLoaders.amellus;

// @ts-expect-error Canonical definitions are immutable.
directDefinition.identity.name = "changed";

// @ts-expect-error Collection modules do not expose framework components.
const component = ArrowLeft.component;

// @ts-expect-error Collection modules do not expose rendered SVG.
const markup = Search.svg;

// @ts-expect-error Canonical manifest ordering is immutable.
AsterIconManifest.push(AsterIconManifest[0]);

// @ts-expect-error Canonical manifest records are immutable.
AsterIconManifest[0].key = "changed";

// @ts-expect-error Canonical collection membership is immutable.
AsterCollectionManifest[0].members.push("aster/changed");

// @ts-expect-error Canonical loader maps are immutable.
AsterIconLoaders["aster/changed"] = iconLoader;

// @ts-expect-error Canonical loader maps are immutable.
AsterCollectionLoaders.changed = collectionLoader;

void directDefinition;
void iconManifest;
void collectionManifest;
void iconLoaders;
void collectionLoaders;
void iconLoader;
void collectionLoader;
void component;
void markup;
