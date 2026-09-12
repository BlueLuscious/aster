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

const directDefinition: IconDefinition = ArrowLeft;
const indexedDefinitions: readonly IconDefinition[] = AsterIcons;
const indexedCollections: readonly CollectionDefinition[] = AsterCollections;
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

void directDefinition;
void indexedDefinitions;
void indexedCollections;
void component;
void markup;
