import { Collection } from "@aster/core";
import { ArrowLeft } from "../icons/arrow-left.icon.js";
import { Check } from "../icons/check.icon.js";
import { Close } from "../icons/close.icon.js";
import { Plus } from "../icons/plus.icon.js";
import { Search } from "../icons/search.icon.js";
import { Settings } from "../icons/settings.icon.js";
import { Star } from "../icons/star.icon.js";

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
