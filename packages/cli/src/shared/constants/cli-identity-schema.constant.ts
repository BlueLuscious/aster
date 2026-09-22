/**
 * @description Immutable grammar authority for CLI-owned canonical identity strings.
 */
export const cliIdentitySchema = Object.freeze({
  /** @description Complete grammar for one canonical identity section. */
  slugPatternSource: String.raw`^[a-z0-9]+(?:-[a-z0-9]+)*$`,
  /** @description Separator between namespace and local identity sections. */
  namespaceSeparator: "/",
  /** @description Separator introducing an optional identity variant. */
  variantSeparator: "@",
  /** @description Maximum namespace and local-name sections accepted before a variant. */
  maximumIdentitySections: 2,
} as const);
