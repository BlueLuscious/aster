import type { IconIdentity } from "@luscious-garden/aster-core";

/**
 * @description Formats portable icon identities for deterministic internal comparison and prose.
 */
export class IconIdentityFormatter {
  /**
   * @description Formats one complete treatment identity without collapsing namespace absence.
   * @param identity - Accepted portable icon identity.
   * @returns Canonical unambiguous `[namespace/]name@variant` value.
   */
  format(identity: IconIdentity): string {
    const namespace = identity.namespace === undefined
      ? ""
      : `${identity.namespace}/`;
    return `${namespace}${identity.name}@${identity.variant}`;
  }
}
