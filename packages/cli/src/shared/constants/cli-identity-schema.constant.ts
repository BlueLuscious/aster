/**
 * @description Immutable grammar authority for CLI-owned canonical identity strings.
 */
export const cliIdentitySchema = Object.freeze({
  slugPatternSource: String.raw`^[a-z0-9]+(?:-[a-z0-9]+)*$`,
  namespaceSeparator: "/",
  variantSeparator: "@",
  maximumIdentitySections: 2,
} as const);

