import type { IconIdentity } from "@aster/core";

/**
 * @description Formats portable icon identities for deterministic internal comparison and prose.
 */
export class IconIdentityFormatter {
  /**
   * @description Formats one identity without collapsing absent namespace or variant positions.
   * @param identity - Accepted portable icon identity.
   * @returns Canonical unambiguous `[namespace/]name[@variant]` value.
   */
  format(identity: IconIdentity): string {
    const namespace = identity.namespace === undefined
      ? ""
      : `${identity.namespace}/`;
    const variant = identity.variant === undefined
      ? ""
      : `@${identity.variant}`;

    return `${namespace}${identity.name}${variant}`;
  }
}
