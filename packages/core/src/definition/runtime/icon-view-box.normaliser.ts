import type { IconViewBox } from "../contracts/index.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates and clones portable logical coordinate systems.
 */
export class IconViewBoxNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Produces one frozen canonical viewBox.
   * @param value - Unknown authored viewBox.
   * @returns Frozen canonical viewBox.
   */
  normalise(value: unknown): IconViewBox {
    const path = "definition.viewBox";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["minX", "minY", "width", "height"], path);

    return Object.freeze({
      minX: this.#validator.finiteNumber(record.minX, `${path}.minX`),
      minY: this.#validator.finiteNumber(record.minY, `${path}.minY`),
      width: this.#validator.positiveNumber(record.width, `${path}.width`),
      height: this.#validator.positiveNumber(record.height, `${path}.height`),
    });
  }
}
