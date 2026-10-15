import { Collection } from "@luscious-garden/aster-core";
import { asterArtworkLicence } from "../../../authoring/constants/aster-artwork-licence.constant.js";
import { ArrowDownOutline } from "../../../glyphs/a/arrow-down/arrow-down-outline.icon.js";
import { ArrowLeftOutline } from "../../../glyphs/a/arrow-left/arrow-left-outline.icon.js";
import { ArrowRightOutline } from "../../../glyphs/a/arrow-right/arrow-right-outline.icon.js";
import { ArrowUpOutline } from "../../../glyphs/a/arrow-up/arrow-up-outline.icon.js";
import { BellOutline } from "../../../glyphs/b/bell/bell-outline.icon.js";
import { CameraOutline } from "../../../glyphs/c/camera/camera-outline.icon.js";
import { CheckOutline } from "../../../glyphs/c/check/check-outline.icon.js";
import { CloseOutline } from "../../../glyphs/c/close/close-outline.icon.js";
import { CloudOutline } from "../../../glyphs/c/cloud/cloud-outline.icon.js";
import { DownloadOutline } from "../../../glyphs/d/download/download-outline.icon.js";
import { FolderOutline } from "../../../glyphs/f/folder/folder-outline.icon.js";
import { HeartOutline } from "../../../glyphs/h/heart/heart-outline.icon.js";
import { HomeOutline } from "../../../glyphs/h/home/home-outline.icon.js";
import { InfoOutline } from "../../../glyphs/i/info/info-outline.icon.js";
import { LeafOutline } from "../../../glyphs/l/leaf/leaf-outline.icon.js";
import { LockOutline } from "../../../glyphs/l/lock/lock-outline.icon.js";
import { MailOutline } from "../../../glyphs/m/mail/mail-outline.icon.js";
import { MenuOutline } from "../../../glyphs/m/menu/menu-outline.icon.js";
import { PauseOutline } from "../../../glyphs/p/pause/pause-outline.icon.js";
import { PlayOutline } from "../../../glyphs/p/play/play-outline.icon.js";
import { PlusOutline } from "../../../glyphs/p/plus/plus-outline.icon.js";
import { SearchOutline } from "../../../glyphs/s/search/search-outline.icon.js";
import { SettingsOutline } from "../../../glyphs/s/settings/settings-outline.icon.js";
import { StarOutline } from "../../../glyphs/s/star/star-outline.icon.js";
import { UserOutline } from "../../../glyphs/u/user/user-outline.icon.js";
import { WarningOutline } from "../../../glyphs/w/warning/warning-outline.icon.js";

/**
 * @description Canonical Amellus collection containing the foundational general-purpose icon set.
 */
export const Amellus = Collection.define({
  identity: {
    name: "amellus",
  },
  icons: {
    arrowLeft: ArrowLeftOutline,
    arrowRight: ArrowRightOutline,
    arrowUp: ArrowUpOutline,
    arrowDown: ArrowDownOutline,
    home: HomeOutline,
    menu: MenuOutline,
    check: CheckOutline,
    close: CloseOutline,
    download: DownloadOutline,
    plus: PlusOutline,
    search: SearchOutline,
    settings: SettingsOutline,
    heart: HeartOutline,
    info: InfoOutline,
    lock: LockOutline,
    star: StarOutline,
    warning: WarningOutline,
    camera: CameraOutline,
    pause: PauseOutline,
    play: PlayOutline,
    bell: BellOutline,
    mail: MailOutline,
    cloud: CloudOutline,
    folder: FolderOutline,
    leaf: LeafOutline,
    user: UserOutline,
  },
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
