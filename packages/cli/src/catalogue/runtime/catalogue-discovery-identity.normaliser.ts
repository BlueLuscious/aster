import type {
  CollectionIdentity,
  IconIdentity,
} from "@aster/core";
import { CanonicalIdentityValidator } from "../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { catalogueDiscoverySchema } from "../constants/catalogue-discovery-schema.constant.js";

/**
 * @description Accepts and isolates portable identities supplied through discovery metadata.
 */
export class CatalogueDiscoveryIdentityNormaliser {
  /** @description Canonical slug authority shared by every identity component. */
  readonly #identities = new CanonicalIdentityValidator();

  /** @description Exact plain-record inspection authority. */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Accepts one complete icon identity.
   * @param value - Candidate identity record.
   * @returns Frozen canonical icon identity or no value after rejection.
   */
  icon(value: unknown): IconIdentity | undefined {
    const record = this.#data.record(
      value,
      catalogueDiscoverySchema.iconIdentityFields,
      ["name"],
    );

    if (
      record === undefined
      || !this.#identities.slug(record.name)
      || (
        Object.hasOwn(record, "namespace")
        && !this.#identities.slug(record.namespace)
      )
      || (
        Object.hasOwn(record, "variant")
        && !this.#identities.slug(record.variant)
      )
    ) {
      return undefined;
    }

    return Object.freeze({
      ...(Object.hasOwn(record, "namespace")
        ? { namespace: record.namespace as string }
        : {}),
      name: record.name,
      ...(Object.hasOwn(record, "variant")
        ? { variant: record.variant as string }
        : {}),
    });
  }

  /**
   * @description Accepts one complete collection identity.
   * @param value - Candidate identity record.
   * @returns Frozen canonical collection identity or no value after rejection.
   */
  collection(value: unknown): CollectionIdentity | undefined {
    const record = this.#data.record(
      value,
      catalogueDiscoverySchema.collectionIdentityFields,
      ["name"],
    );

    if (
      record === undefined
      || !this.#identities.slug(record.name)
      || (
        Object.hasOwn(record, "namespace")
        && !this.#identities.slug(record.namespace)
      )
    ) {
      return undefined;
    }

    return Object.freeze({
      ...(Object.hasOwn(record, "namespace")
        ? { namespace: record.namespace as string }
        : {}),
      name: record.name,
    });
  }
}
