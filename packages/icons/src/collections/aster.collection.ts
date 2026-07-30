import { Collection } from "@aster/core";
import {
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
} from "../icons/index.js";

/**
 * @description Canonical Experimental Aster collection retaining the representative pilot set.
 */
export const AsterCollection = Collection.define({
  identity: {
    name: "aster",
  },
  icons: [
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
  ],
  metadata: {
    displayName: "Aster",
    description: "Geometric outline interface icons.",
    tags: ["interface-icons", "outline-icons"],
    licence: "ISC",
    attribution: "BlueLuscious",
  },
});
