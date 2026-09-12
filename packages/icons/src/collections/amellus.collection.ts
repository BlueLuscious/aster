import { Collection } from "@aster/core";
import { ArrowDown } from "../icons/arrow-down.icon.js";
import { ArrowLeft } from "../icons/arrow-left.icon.js";
import { ArrowRight } from "../icons/arrow-right.icon.js";
import { ArrowUp } from "../icons/arrow-up.icon.js";
import { Bell } from "../icons/bell.icon.js";
import { Camera } from "../icons/camera.icon.js";
import { Check } from "../icons/check.icon.js";
import { Close } from "../icons/close.icon.js";
import { Cloud } from "../icons/cloud.icon.js";
import { Download } from "../icons/download.icon.js";
import { Folder } from "../icons/folder.icon.js";
import { Heart } from "../icons/heart.icon.js";
import { Home } from "../icons/home.icon.js";
import { Info } from "../icons/info.icon.js";
import { Leaf } from "../icons/leaf.icon.js";
import { Lock } from "../icons/lock.icon.js";
import { Mail } from "../icons/mail.icon.js";
import { Menu } from "../icons/menu.icon.js";
import { Pause } from "../icons/pause.icon.js";
import { Play } from "../icons/play.icon.js";
import { Plus } from "../icons/plus.icon.js";
import { Search } from "../icons/search.icon.js";
import { Settings } from "../icons/settings.icon.js";
import { Star } from "../icons/star.icon.js";
import { User } from "../icons/user.icon.js";
import { Warning } from "../icons/warning.icon.js";

/**
 * @description Canonical Amellus collection containing the foundational general-purpose icon set.
 */
export const AmellusCollection = Collection.define({
  identity: {
    name: "amellus",
  },
  icons: [
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Home,
    Menu,
    Check,
    Close,
    Download,
    Plus,
    Search,
    Settings,
    Heart,
    Info,
    Lock,
    Star,
    Warning,
    Camera,
    Pause,
    Play,
    Bell,
    Mail,
    Cloud,
    Folder,
    Leaf,
    User,
  ],
  metadata: {
    displayName: "Amellus",
    description: "Minimalist general-purpose outline icons for application interfaces.",
    tags: [
      "application-icons",
      "general-purpose",
      "interface-icons",
      "minimalist",
      "outline-icons",
    ],
    licence: "ISC",
    attribution: "BlueLuscious",
  },
});
