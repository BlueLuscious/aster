import { Collection } from "@aster/core";
import {
  ArrowLeft,
  Check,
  Close,
  Plus,
  Search,
  Settings,
  Star,
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
    Check,
    Close,
    Plus,
    Search,
    Settings,
    Star,
  ],
  metadata: {
    displayName: "Aster",
    description: "Geometric outline interface icons.",
    tags: ["interface-icons", "outline-icons"],
    licence: "ISC",
    attribution: "BlueLuscious",
  },
});
