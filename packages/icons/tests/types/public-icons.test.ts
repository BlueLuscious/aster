import type {
  CollectionDefinition,
  IconDefinition,
  IconVariantMap,
} from "@luscious-garden/aster-core";
import { CameraVariants } from "../../src/generated/facades/icons/camera.js";
// @ts-expect-error The dictionary entry exports no individual definition.
import { CameraOutline } from "../../src/generated/facades/icons/camera.js";
// @ts-expect-error The dictionary entry does not preserve the old definition export.
import { Camera } from "../../src/generated/facades/icons/camera.js";
import { ArrowLeftOutline } from "../../src/generated/facades/icons/arrow-left/outline.js";
import { SearchOutline } from "../../src/generated/facades/icons/search/outline.js";
// @ts-expect-error Concrete treatment facades do not retain the obsolete unsuffixed export.
import { Search } from "../../src/generated/facades/icons/search/outline.js";
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

const directDefinition: IconDefinition = ArrowLeftOutline;
const glyphVariants: IconVariantMap = CameraVariants;
const glyphDefinition: IconDefinition = CameraVariants.outline;

// @ts-expect-error A glyph dictionary is not a concrete definition.
const invalidGlyph: IconDefinition = CameraVariants;
// @ts-expect-error Generated glyphs preserve exact distributed treatment keys.
CameraVariants.filled;
// @ts-expect-error Glyph dictionaries have no implicit default.
CameraVariants.default;
// @ts-expect-error Generated glyph dictionaries are readonly.
CameraVariants.outline = ArrowLeftOutline;
const iconManifest: readonly IconManifestEntry[] = AsterIconManifest;
const collectionManifest: readonly CollectionManifestEntry[] =
  AsterCollectionManifest;
const iconLoaders: IconDefinitionLoaderMap = AsterIconLoaders;
const collectionLoaders: CollectionDefinitionLoaderMap =
  AsterCollectionLoaders;
const iconLoader: IconDefinitionLoader | undefined =
  AsterIconLoaders["aster/arrow-left@outline"];
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
const amellusArrowLeft: IconDefinition = Amellus.icons.arrowLeft.outline;
const firstAmellusMember: IconDefinition | undefined =
  Amellus.members[0];

// @ts-expect-error Canonical definitions are immutable.
directDefinition.identity.name = "changed";

// @ts-expect-error Collection modules do not expose framework components.
const component = ArrowLeftOutline.component;

// @ts-expect-error Collection modules do not expose rendered SVG.
const markup = SearchOutline.svg;

// @ts-expect-error Canonical manifest ordering is immutable.
AsterIconManifest.push(AsterIconManifest[0]);

// @ts-expect-error Canonical manifest records are immutable.
AsterIconManifest[0].key = "changed";

// @ts-expect-error Canonical collection membership is immutable.
AsterCollectionManifest[0].members.push("aster/changed");

// @ts-expect-error Concrete collection aliases reject unknown glyph access.
Amellus.icons.absent.outline;

// @ts-expect-error Concrete collection aliases are immutable.
Amellus.icons.arrowLeft.outline = ArrowLeftOutline;

// @ts-expect-error Canonical loader maps are immutable.
AsterIconLoaders["aster/changed"] = iconLoader;

// @ts-expect-error Canonical loader maps are immutable.
AsterCollectionLoaders.changed = collectionLoader;

void directDefinition;
void glyphVariants;
void glyphDefinition;
void invalidGlyph;
void Camera;
void CameraOutline;
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
void Search;
