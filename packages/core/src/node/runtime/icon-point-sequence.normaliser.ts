import type { IconPoint } from "../contracts/index.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates, clones, and freezes portable coordinate sequences.
 */
export class IconPointSequenceNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Produces one deeply frozen point sequence with required cardinality.
   * @param value - Unknown authored point sequence.
   * @param minimum - Minimum required point count.
   * @param path - Logical sequence path.
   * @returns Frozen canonical point sequence.
   */
  normalise(value: unknown, minimum: number, path: string): readonly IconPoint[] {
    const points = this.#validator.array(value, path);

    if (points.length < minimum) {
      throw new IconDefinitionError(path, `expected at least ${minimum} points`);
    }

    return Object.freeze(
      points.map((point, index) => {
        const pointPath = `${path}[${index}]`;
        const record = this.#validator.record(point, pointPath);
        this.#validator.exactFields(record, ["x", "y"], pointPath);

        return Object.freeze({
          x: this.#validator.finiteNumber(record.x, `${pointPath}.x`),
          y: this.#validator.finiteNumber(record.y, `${pointPath}.y`),
        });
      }),
    );
  }
}
