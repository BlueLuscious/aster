import { Collection } from "@luscious-garden/aster-core";
import { asterArtworkLicence } from "../../../authoring/constants/aster-artwork-licence.constant.js";
import { ArrowDown } from "../../../glyphs/a/arrow-down/arrow-down.icon.js";
import { ArrowLeft } from "../../../glyphs/a/arrow-left/arrow-left.icon.js";
import { ArrowRight } from "../../../glyphs/a/arrow-right/arrow-right.icon.js";
import { ArrowUp } from "../../../glyphs/a/arrow-up/arrow-up.icon.js";
import { Bell } from "../../../glyphs/b/bell/bell.icon.js";
import { Camera } from "../../../glyphs/c/camera/camera.icon.js";
import { Check } from "../../../glyphs/c/check/check.icon.js";
import { Close } from "../../../glyphs/c/close/close.icon.js";
import { Cloud } from "../../../glyphs/c/cloud/cloud.icon.js";
import { Download } from "../../../glyphs/d/download/download.icon.js";
import { Folder } from "../../../glyphs/f/folder/folder.icon.js";
import { Heart } from "../../../glyphs/h/heart/heart.icon.js";
import { Home } from "../../../glyphs/h/home/home.icon.js";
import { Info } from "../../../glyphs/i/info/info.icon.js";
import { Leaf } from "../../../glyphs/l/leaf/leaf.icon.js";
import { Lock } from "../../../glyphs/l/lock/lock.icon.js";
import { Mail } from "../../../glyphs/m/mail/mail.icon.js";
import { Menu } from "../../../glyphs/m/menu/menu.icon.js";
import { Pause } from "../../../glyphs/p/pause/pause.icon.js";
import { Play } from "../../../glyphs/p/play/play.icon.js";
import { Plus } from "../../../glyphs/p/plus/plus.icon.js";
import { Search } from "../../../glyphs/s/search/search.icon.js";
import { Settings } from "../../../glyphs/s/settings/settings.icon.js";
import { Star } from "../../../glyphs/s/star/star.icon.js";
import { User } from "../../../glyphs/u/user/user.icon.js";
import { Warning } from "../../../glyphs/w/warning/warning.icon.js";

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
    licence: asterArtworkLicence,
    attribution: "BlueLuscious",
  },
});
