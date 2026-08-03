import type { CollectionIdentity, IconIdentity } from "@aster/core";

/**
 * @description Formats portable identities for deterministic standalone-shell presentation.
 */
export class ShellIdentityFormatter {
  /**
   * @description Formats one icon or collection identity without locale-sensitive behaviour.
   * @param identity - Portable Core identity.
   * @returns Canonical `[namespace/]name[@variant]` text.
   */
  format(identity: IconIdentity | CollectionIdentity): string {
    const namespace = identity.namespace === undefined
      ? ""
      : `${identity.namespace}/`;
    const variant = "variant" in identity && identity.variant !== undefined
      ? `@${identity.variant}`
      : "";
    return `${namespace}${identity.name}${variant}`;
  }
}
