import type {
  CollectionDefinition,
  IconDefinition,
} from "@aster/core";
import {
  AsterCollection,
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

// @ts-expect-error Canonical definitions are immutable.
directDefinition.identity.name = "changed";

// @ts-expect-error Collection modules do not expose framework components.
const component = ArrowLeft.component;

// @ts-expect-error Collection modules do not expose rendered SVG.
const markup = Search.svg;

void definitions;
void directDefinition;
void directCollection;
void component;
void markup;
