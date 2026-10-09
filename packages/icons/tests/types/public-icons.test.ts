import type {
  CollectionDefinition,
  IconDefinition,
} from "@luscious-garden/aster-core";
import { ArrowLeft } from "../../src/generated/facades/icons/arrow-left.js";
import { Search } from "../../src/generated/facades/icons/search.js";
import { Amellus } from "../../src/generated/facades/collections/amellus.js";
// @ts-expect-error Collection facades do not retain the obsolete named export.
import { AmellusCollection } from "../../src/generated/facades/collections/amellus.js";
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
const runtimeKey: string = "__proto__";
const constructorIconLoader: IconDefinitionLoader | undefined =
  AsterIconLoaders["constructor"];
const constructorCollectionLoader: CollectionDefinitionLoader | undefined =
  AsterCollectionLoaders["constructor"];
const selectedIcon: Promise<IconDefinition> | undefined =
  AsterIconLoaders[runtimeKey]?.();
const selectedCollection: Promise<CollectionDefinition> | undefined =
  AsterCollectionLoaders[runtimeKey]?.();
const amellusArrowLeft: IconDefinition = Amellus.icons.arrowLeft;
const firstAmellusMember: IconDefinition | undefined =
  Amellus.members[0];

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

// @ts-expect-error Concrete collection aliases reject unknown glyph access.
Amellus.icons.absent;

// @ts-expect-error Concrete collection aliases are immutable.
Amellus.icons.arrowLeft = ArrowLeft;

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
void constructorIconLoader;
void constructorCollectionLoader;
void selectedIcon;
void selectedCollection;
void amellusArrowLeft;
void firstAmellusMember;
void AmellusCollection;
void component;
void markup;
