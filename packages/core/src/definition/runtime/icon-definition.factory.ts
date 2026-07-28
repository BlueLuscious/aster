import type { IconDefinition } from "../contracts/index.js";
import { IconMetadataNormaliser } from "../../metadata/runtime/icon-metadata.normaliser.js";
import { IconNodeNormaliser } from "../../node/runtime/icon-node.normaliser.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { IconIdentityNormaliser } from "./icon-identity.normaliser.js";
import { IconViewBoxNormaliser } from "./icon-view-box.normaliser.js";

/**
 * @description Internal construction authority for accepted immutable icon definitions.
 */
export class IconDefinitionFactory {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Definition identity normaliser.
   */
  readonly #identityNormaliser = new IconIdentityNormaliser();

  /**
   * @description Logical coordinate-system normaliser.
   */
  readonly #viewBoxNormaliser = new IconViewBoxNormaliser();

  /**
   * @description Ordered portable node normaliser.
   */
  readonly #nodeNormaliser = new IconNodeNormaliser();

  /**
   * @description Resolved icon metadata normaliser.
   */
  readonly #metadataNormaliser = new IconMetadataNormaliser();

  /**
   * @description Validates authored data and returns an isolated deeply frozen definition.
   * @param value - Unknown authored definition value.
   * @returns Deeply frozen canonical icon definition.
   */
  create(value: unknown): IconDefinition {
    const path = "definition";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["identity", "viewBox", "nodes", "metadata"],
      path,
    );

    const identity = this.#identityNormaliser.normalise(record.identity);

    return Object.freeze({
      identity,
      viewBox: this.#viewBoxNormaliser.normalise(record.viewBox),
      nodes: this.#nodeNormaliser.normaliseSequence(record.nodes),
      metadata: this.#metadataNormaliser.normalise(record.metadata, identity),
    });
  }
}
