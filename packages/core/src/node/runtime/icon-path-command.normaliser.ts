import type { IconPathCommandType } from "../types/index.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";

/**
 * @description Validates, canonicalises, and isolates portable path command sequences.
 * @remarks The normaliser owns portable contour ordering and command shape. It does not parse or
 * retain syntax belonging to an external vector format.
 */
export class IconPathCommandNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Complete field vocabulary used to inspect a command before discriminator access.
   */
  readonly #commandFields = Object.freeze([
    "kind",
    "x",
    "y",
    "control1X",
    "control1Y",
    "control2X",
    "control2Y",
    "controlX",
    "controlY",
    "radiusX",
    "radiusY",
    "rotation",
    "largeArc",
    "sweep",
  ] as const);

  /**
   * @description Produces one deeply frozen canonical command sequence.
   * @param value - Unknown authored command sequence.
   * @param path - Logical sequence path.
   * @returns Frozen non-empty canonical command sequence.
   */
  normaliseSequence(
    value: unknown,
    path: string,
  ): readonly IconPathCommandType[] {
    const input = this.#validator.array(value, path);

    if (input.length === 0) {
      throw new IconDefinitionError(path, "expected at least one path command");
    }

    let contourStarted = false;
    let contourDrawn = false;
    let contourStartPath = path;
    const commands: IconPathCommandType[] = [];

    for (let index = 0; index < input.length; index += 1) {
      const commandPath = `${path}[${index}]`;
      const command = this.#normaliseCommand(input[index], commandPath);

      if (command.kind === iconPathCommandKinds.move) {
        if (contourStarted && !contourDrawn) {
          throw new IconDefinitionError(
            `${commandPath}.kind`,
            "expected a drawing command before another move",
          );
        }

        contourStarted = true;
        contourDrawn = false;
        contourStartPath = commandPath;
      } else if (command.kind === iconPathCommandKinds.close) {
        if (!contourStarted) {
          throw new IconDefinitionError(
            `${commandPath}.kind`,
            "expected a move before contour closure",
          );
        }

        if (!contourDrawn) {
          throw new IconDefinitionError(
            `${commandPath}.kind`,
            "expected a drawing command before contour closure",
          );
        }

        contourStarted = false;
        contourDrawn = false;
      } else {
        if (!contourStarted) {
          throw new IconDefinitionError(
            `${commandPath}.kind`,
            "expected a move before a drawing command",
          );
        }

        contourDrawn = true;
      }

      commands.push(command);
    }

    if (contourStarted && !contourDrawn) {
      throw new IconDefinitionError(
        `${contourStartPath}.kind`,
        "expected a drawing command after the final move",
      );
    }

    return Object.freeze(commands);
  }

  /**
   * @description Produces one frozen command after strict shape and operand validation.
   * @param value - Unknown authored command.
   * @param path - Logical command path.
   * @returns Frozen canonical command.
   */
  #normaliseCommand(value: unknown, path: string): IconPathCommandType {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, this.#commandFields, path);

    switch (record.kind) {
      case iconPathCommandKinds.move:
      case iconPathCommandKinds.line:
        this.#validator.exactFields(record, ["kind", "x", "y"], path);
        return Object.freeze({
          kind: record.kind,
          x: this.#validator.finiteNumber(record.x, `${path}.x`),
          y: this.#validator.finiteNumber(record.y, `${path}.y`),
        });
      case iconPathCommandKinds.cubicBezier:
        this.#validator.exactFields(
          record,
          [
            "kind",
            "x",
            "y",
            "control1X",
            "control1Y",
            "control2X",
            "control2Y",
          ],
          path,
        );
        return Object.freeze({
          kind: iconPathCommandKinds.cubicBezier,
          x: this.#validator.finiteNumber(record.x, `${path}.x`),
          y: this.#validator.finiteNumber(record.y, `${path}.y`),
          control1X: this.#validator.finiteNumber(
            record.control1X,
            `${path}.control1X`,
          ),
          control1Y: this.#validator.finiteNumber(
            record.control1Y,
            `${path}.control1Y`,
          ),
          control2X: this.#validator.finiteNumber(
            record.control2X,
            `${path}.control2X`,
          ),
          control2Y: this.#validator.finiteNumber(
            record.control2Y,
            `${path}.control2Y`,
          ),
        });
      case iconPathCommandKinds.quadraticBezier:
        this.#validator.exactFields(
          record,
          ["kind", "x", "y", "controlX", "controlY"],
          path,
        );
        return Object.freeze({
          kind: iconPathCommandKinds.quadraticBezier,
          x: this.#validator.finiteNumber(record.x, `${path}.x`),
          y: this.#validator.finiteNumber(record.y, `${path}.y`),
          controlX: this.#validator.finiteNumber(
            record.controlX,
            `${path}.controlX`,
          ),
          controlY: this.#validator.finiteNumber(
            record.controlY,
            `${path}.controlY`,
          ),
        });
      case iconPathCommandKinds.arc:
        this.#validator.exactFields(
          record,
          [
            "kind",
            "x",
            "y",
            "radiusX",
            "radiusY",
            "rotation",
            "largeArc",
            "sweep",
          ],
          path,
        );
        return Object.freeze({
          kind: iconPathCommandKinds.arc,
          x: this.#validator.finiteNumber(record.x, `${path}.x`),
          y: this.#validator.finiteNumber(record.y, `${path}.y`),
          radiusX: this.#validator.nonNegativeNumber(
            record.radiusX,
            `${path}.radiusX`,
          ),
          radiusY: this.#validator.nonNegativeNumber(
            record.radiusY,
            `${path}.radiusY`,
          ),
          rotation: this.#validator.finiteNumber(
            record.rotation,
            `${path}.rotation`,
          ),
          largeArc: this.#validator.boolean(
            record.largeArc,
            `${path}.largeArc`,
          ),
          sweep: this.#validator.boolean(record.sweep, `${path}.sweep`),
        });
      case iconPathCommandKinds.close:
        this.#validator.exactFields(record, ["kind"], path);
        return Object.freeze({ kind: iconPathCommandKinds.close });
      default:
        throw new IconDefinitionError(
          `${path}.kind`,
          "unsupported path command kind",
        );
    }
  }
}
