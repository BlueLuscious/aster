import type {
  CollectionDefinition,
  IconDefinition,
} from "@aster/core";
import {
  AsterCollection,
  AsterCollections,
  AsterIcons,
  ArrowLeft,
  Bell,
  Camera,
  Check,
  Close,
  Cloud,
  Folder,
  Heart,
  Home,
  Leaf,
  Lock,
  Plus,
  Search,
  Settings,
  Star,
  User,
} from "../../src/index.js";

const definitions = [
  ArrowLeft,
  Bell,
  Camera,
  Check,
  Close,
  Cloud,
  Folder,
  Heart,
  Home,
  Leaf,
  Lock,
  Plus,
  Search,
  Settings,
  Star,
  User,
] satisfies readonly IconDefinition[];

const directDefinition: IconDefinition = ArrowLeft;
const directCollection: CollectionDefinition = AsterCollection;
const indexedDefinitions: readonly IconDefinition[] = AsterIcons;
const indexedCollections: readonly CollectionDefinition[] = AsterCollections;

// @ts-expect-error Canonical definitions are immutable.
directDefinition.identity.name = "changed";

// @ts-expect-error Collection modules do not expose framework components.
const component = ArrowLeft.component;

// @ts-expect-error Collection modules do not expose rendered SVG.
const markup = Search.svg;

// @ts-expect-error Canonical icon indexes are immutable.
AsterIcons.push(ArrowLeft);

// @ts-expect-error Canonical collection indexes are immutable.
AsterCollections.push(AsterCollection);

void definitions;
void directDefinition;
void directCollection;
void indexedDefinitions;
void indexedCollections;
void component;
void markup;
