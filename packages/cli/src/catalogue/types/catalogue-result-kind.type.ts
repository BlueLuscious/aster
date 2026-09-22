import type { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";

/**
 * @description Stable discriminator of one public catalogue discovery result.
 */
export type CatalogueResultKindType =
  (typeof catalogueResultKinds)[keyof typeof catalogueResultKinds];
