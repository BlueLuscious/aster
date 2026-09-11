import {
  iconPathCommandKinds,
  type IconPathCommandType,
} from "@aster/core";
import { SvgRenderError } from "../../error/index.js";
import { svgPathCommandLetters } from "../constants/svg-path-command-letters.constant.js";
import { SvgNumberSerialiser } from "./svg-number.serialiser.js";

/**
 * @description Maps portable path commands to deterministic target-owned SVG path data.
 */
export class SvgPathDataSerialiser {
  /**
   * @description Canonical SVG number serialiser.
   */
  readonly #numberSerialiser = new SvgNumberSerialiser();

  /**
   * @description Produces one uppercase expanded path-data value with single ASCII spaces.
   * @param commands - Canonical portable path command sequence.
   * @param path - Logical node path used by defensive target failures.
   * @returns Deterministic SVG path data.
   */
  serialise(commands: readonly IconPathCommandType[], path: string): string {
    return commands
      .map((command) => {
        switch (command.kind) {
          case iconPathCommandKinds.move:
          case iconPathCommandKinds.line:
            return this.#values(svgPathCommandLetters[command.kind], [
              command.x,
              command.y,
            ]);
          case iconPathCommandKinds.cubicBezier:
            return this.#values(svgPathCommandLetters[command.kind], [
              command.control1X,
              command.control1Y,
              command.control2X,
              command.control2Y,
              command.x,
              command.y,
            ]);
          case iconPathCommandKinds.quadraticBezier:
            return this.#values(svgPathCommandLetters[command.kind], [
              command.controlX,
              command.controlY,
              command.x,
              command.y,
            ]);
          case iconPathCommandKinds.arc:
            return this.#values(svgPathCommandLetters[command.kind], [
              command.radiusX,
              command.radiusY,
              command.rotation,
              command.largeArc ? 1 : 0,
              command.sweep ? 1 : 0,
              command.x,
              command.y,
            ]);
          case iconPathCommandKinds.close:
            return svgPathCommandLetters[command.kind];
          default:
            throw new SvgRenderError(path, "expected a supported path command");
        }
      })
      .join(" ");
  }

  /**
   * @description Joins one SVG command letter and its canonical numeric operands.
   * @param letter - Target-owned uppercase command letter.
   * @param values - Ordered finite operation operands.
   * @returns One expanded SVG command group.
   */
  #values(letter: string, values: readonly number[]): string {
    return `${letter} ${values
      .map((value) => this.#numberSerialiser.serialise(value))
      .join(" ")}`;
  }
}
