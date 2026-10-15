import type { IconDefinition } from "../contracts/index.js";
import { IconMetadataNormaliser } from "../../metadata/runtime/icon-metadata.normaliser.js";
import { IconNodeNormaliser } from "../../node/runtime/icon-node.normaliser.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { IconIdentityNormaliser } from "./icon-identity.normaliser.js";
import { IconViewBoxNormaliser } from "./icon-view-box.normaliser.js";

/**
 * @description Constructs immutable icon definitions and recognises its canonical outputs.
 */
export class IconDefinitionFactory {
  /**
   * @description Weak identity authority shared by factory instances in this loaded Core copy.
   * @remarks Only fully constructed outputs enter this set; caller-owned inputs are never adopted.
   */
  static readonly #canonicalDefinitions = new WeakSet<object>();

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
   * @description Reuses a recognised output or validates and isolates an unknown definition.
   * @param value - Unknown authored definition value.
   * @returns Recognised input or newly constructed deeply frozen canonical icon definition.
   */
  create(value: unknown): IconDefinition {
    if (this.#recognises(value)) {
      return value;
    }

    const path = "definition";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["identity", "viewBox", "nodes", "metadata"],
      path,
    );

    const identity = this.#identityNormaliser.normalise(record.identity);

    const definition: IconDefinition = Object.freeze({
      identity,
      viewBox: this.#viewBoxNormaliser.normalise(record.viewBox),
      nodes: this.#nodeNormaliser.normaliseSequence(record.nodes),
      metadata: this.#metadataNormaliser.normalise(record.metadata, identity),
    });

    IconDefinitionFactory.#canonicalDefinitions.add(definition);
    return definition;
  }

  /**
   * @description Identifies an exact canonical output previously constructed by this Core copy.
   * @param value - Candidate reference without assumed structure or immutability.
   * @returns Whether private construction membership proves a canonical icon definition.
   */
  #recognises(value: unknown): value is IconDefinition {
    return typeof value === "object"
      && value !== null
      && IconDefinitionFactory.#canonicalDefinitions.has(value);
  }
}
