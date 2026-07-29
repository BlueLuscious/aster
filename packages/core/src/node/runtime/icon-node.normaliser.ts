import type { IconNodeType } from "../types/index.js";
import { iconPresentationFields } from "../../presentation/constants/icon-presentation-fields.constant.js";
import { IconPresentationNormaliser } from "../../presentation/runtime/icon-presentation.normaliser.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";
import { IconPointSequenceNormaliser } from "./icon-point-sequence.normaliser.js";

/**
 * @description Validates, clones, and freezes the closed portable node union.
 */
export class IconNodeNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Explicit node presentation normaliser.
   */
  readonly #presentationNormaliser = new IconPresentationNormaliser();

  /**
   * @description Coordinate sequence normaliser.
   */
  readonly #pointSequenceNormaliser = new IconPointSequenceNormaliser();

  /**
   * @description Produces a deeply frozen node sequence in original paint order.
   * @param value - Unknown authored node sequence.
   * @returns Frozen non-empty canonical node sequence.
   */
  normaliseSequence(value: unknown): readonly IconNodeType[] {
    const input = this.#validator.array(value, "definition.nodes");

    if (input.length === 0) {
      throw new IconDefinitionError("definition.nodes", "expected at least one node");
    }

    return Object.freeze(
      input.map((node, index) =>
        this.#normaliseNode(node, `definition.nodes[${index}]`),
      ),
    );
  }

  /**
   * @description Produces one frozen node after discriminator-specific validation.
   * @param value - Unknown authored node.
   * @param path - Logical node path.
   * @returns Frozen canonical node.
   */
  #normaliseNode(value: unknown, path: string): IconNodeType {
    const record = this.#validator.record(value, path);
    const presentation = this.#normaliseNodePresentation(record, path);

    switch (record.kind) {
      case iconNodeKinds.path:
        this.#acceptNodeFields(record, ["kind", "data"], path);
        return Object.freeze({
          kind: iconNodeKinds.path,
          data: this.#validator.text(record.data, `${path}.data`),
          ...presentation,
        });
      case iconNodeKinds.circle:
        this.#acceptNodeFields(record, ["kind", "cx", "cy", "radius"], path);
        return Object.freeze({
          kind: iconNodeKinds.circle,
          cx: this.#validator.finiteNumber(record.cx, `${path}.cx`),
          cy: this.#validator.finiteNumber(record.cy, `${path}.cy`),
          radius: this.#validator.positiveNumber(record.radius, `${path}.radius`),
          ...presentation,
        });
      case iconNodeKinds.ellipse:
        this.#acceptNodeFields(
          record,
          ["kind", "cx", "cy", "radiusX", "radiusY"],
          path,
        );
        return Object.freeze({
          kind: iconNodeKinds.ellipse,
          cx: this.#validator.finiteNumber(record.cx, `${path}.cx`),
          cy: this.#validator.finiteNumber(record.cy, `${path}.cy`),
          radiusX: this.#validator.positiveNumber(record.radiusX, `${path}.radiusX`),
          radiusY: this.#validator.positiveNumber(record.radiusY, `${path}.radiusY`),
          ...presentation,
        });
      case iconNodeKinds.rectangle:
        this.#acceptNodeFields(
          record,
          ["kind", "x", "y", "width", "height", "radiusX", "radiusY"],
          path,
        );
        return this.#normaliseRect(record, presentation, path);
      case iconNodeKinds.line:
        this.#acceptNodeFields(record, ["kind", "x1", "y1", "x2", "y2"], path);
        return Object.freeze({
          kind: iconNodeKinds.line,
          x1: this.#validator.finiteNumber(record.x1, `${path}.x1`),
          y1: this.#validator.finiteNumber(record.y1, `${path}.y1`),
          x2: this.#validator.finiteNumber(record.x2, `${path}.x2`),
          y2: this.#validator.finiteNumber(record.y2, `${path}.y2`),
          ...presentation,
        });
      case iconNodeKinds.polyline:
        this.#acceptNodeFields(record, ["kind", "points"], path);
        return Object.freeze({
          kind: iconNodeKinds.polyline,
          points: this.#pointSequenceNormaliser.normalise(
            record.points,
            2,
            `${path}.points`,
          ),
          ...presentation,
        });
      case iconNodeKinds.polygon:
        this.#acceptNodeFields(record, ["kind", "points"], path);
        return Object.freeze({
          kind: iconNodeKinds.polygon,
          points: this.#pointSequenceNormaliser.normalise(
            record.points,
            3,
            `${path}.points`,
          ),
          ...presentation,
        });
      default:
        throw new IconDefinitionError(`${path}.kind`, "unsupported node kind");
    }
  }

  /**
   * @description Produces a rectangle while omitting absent corner radii.
   * @param record - Authored rectangle record.
   * @param presentation - Canonical node presentation.
   * @param path - Logical node path.
   * @returns Frozen canonical rectangle.
   */
  #normaliseRect(
    record: Record<string, unknown>,
    presentation: object,
    path: string,
  ): IconNodeType {
    const radiusX =
      "radiusX" in record
        ? this.#validator.nonNegativeNumber(record.radiusX, `${path}.radiusX`)
        : undefined;
    const radiusY =
      "radiusY" in record
        ? this.#validator.nonNegativeNumber(record.radiusY, `${path}.radiusY`)
        : undefined;

    return Object.freeze({
      kind: iconNodeKinds.rectangle,
      x: this.#validator.finiteNumber(record.x, `${path}.x`),
      y: this.#validator.finiteNumber(record.y, `${path}.y`),
      width: this.#validator.nonNegativeNumber(record.width, `${path}.width`),
      height: this.#validator.nonNegativeNumber(record.height, `${path}.height`),
      ...(radiusX === undefined ? {} : { radiusX }),
      ...(radiusY === undefined ? {} : { radiusY }),
      ...presentation,
    });
  }

  /**
   * @description Extracts presentation fields before geometry field validation.
   * @param record - Authored node record.
   * @param path - Logical node path.
   * @returns Frozen canonical node presentation.
   */
  #normaliseNodePresentation(
    record: Record<string, unknown>,
    path: string,
  ): object {
    const input: Record<string, unknown> = {};

    for (const field of iconPresentationFields) {
      if (field in record) {
        input[field] = record[field];
      }
    }

    return this.#presentationNormaliser.normalise(input, path);
  }

  /**
   * @description Validates geometry and presentation fields as one closed node object.
   * @param record - Authored node record.
   * @param geometryFields - Fields owned by the selected geometry.
   * @param path - Logical node path.
   * @returns Nothing.
   */
  #acceptNodeFields(
    record: Record<string, unknown>,
    geometryFields: readonly string[],
    path: string,
  ): void {
    this.#validator.exactFields(
      record,
      [...geometryFields, ...iconPresentationFields],
      path,
    );
  }
}
