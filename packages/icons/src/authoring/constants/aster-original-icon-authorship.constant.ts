import { asterArtworkLicence } from "./aster-artwork-licence.constant.js";

/**
 * @description Immutable authorship shared by original Aster icon artwork.
 * @remarks This authority is optional authoring input rather than a package-wide requirement, so
 * differently owned or licensed definitions can provide their own metadata independently.
 */
export const asterOriginalIconAuthorship = Object.freeze({
  /** @description Canonical technical namespace for original Aster icon identities. */
  namespace: "aster",
  /** @description Effective licence identifier for original Aster icon artwork. */
  licence: asterArtworkLicence,
  /** @description Attribution retained by original Aster icon artwork. */
  attribution: "BlueLuscious",
});
