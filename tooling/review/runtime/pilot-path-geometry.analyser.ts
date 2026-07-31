/**
 * @description Extracts path command, anchor, and control-envelope evidence for pilot review.
 */
export class PilotPathGeometryAnalyser {
  /**
   * @description Parses one canonical path without assigning visual-quality meaning.
   * @param data - Canonical SVG path data retained by a portable path node.
   * @returns Path command count, construction anchors, and a control-point envelope.
   */
  analyse(data: string): Readonly<{
    bounds: readonly [number, number, number, number];
    anchors: readonly number[];
    commandCount: number;
  }> {
    const tokens =
      data.match(
        /[a-zA-Z]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/gu,
      ) ?? [];
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    const anchors: number[] = [];
    let command = "";
    let commandCount = 0;
    let index = 0;
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    /**
     * @description Adds one point to the mutable control envelope.
     * @param x - Absolute horizontal coordinate.
     * @param y - Absolute vertical coordinate.
     * @returns Nothing.
     */
    const include = (x: number, y: number): void => {
      bounds[0] = Math.min(bounds[0] ?? x, x);
      bounds[1] = Math.min(bounds[1] ?? y, y);
      bounds[2] = Math.max(bounds[2] ?? x, x);
      bounds[3] = Math.max(bounds[3] ?? y, y);
    };

    while (index < tokens.length) {
      const token = tokens[index];

      if (token === undefined) {
        break;
      }

      if (/^[a-zA-Z]$/u.test(token)) {
        command = token;
        index += 1;

        if (command.toUpperCase() === "Z") {
          currentX = startX;
          currentY = startY;
          include(currentX, currentY);
          commandCount += 1;
          command = "";
        }

        continue;
      }

      if (command === "") {
        throw new TypeError("Path operands require an explicit command.");
      }

      const upper = command.toUpperCase();
      const relative = command === command.toLowerCase();
      const arity = this.#arity(upper);
      const values = tokens
        .slice(index, index + arity)
        .map((value) => Number(value));

      if (
        values.length !== arity ||
        values.some((value) => !Number.isFinite(value))
      ) {
        throw new TypeError(`Path command ${command} has incomplete operands.`);
      }

      index += arity;
      commandCount += 1;

      /**
       * @description Resolves one horizontal operand against the current path cursor.
       * @param value - Parsed horizontal operand.
       * @returns Absolute horizontal coordinate.
       */
      const absoluteX = (value: number): number =>
        relative ? currentX + value : value;

      /**
       * @description Resolves one vertical operand against the current path cursor.
       * @param value - Parsed vertical operand.
       * @returns Absolute vertical coordinate.
       */
      const absoluteY = (value: number): number =>
        relative ? currentY + value : value;

      switch (upper) {
        case "M":
        case "L":
        case "T": {
          const x = absoluteX(values[0] ?? 0);
          const y = absoluteY(values[1] ?? 0);
          anchors.push(x, y);
          currentX = x;
          currentY = y;
          include(x, y);

          if (upper === "M") {
            startX = x;
            startY = y;
            command = relative ? "l" : "L";
          }
          break;
        }
        case "H": {
          const x = absoluteX(values[0] ?? 0);
          anchors.push(x);
          currentX = x;
          include(currentX, currentY);
          break;
        }
        case "V": {
          const y = absoluteY(values[0] ?? 0);
          anchors.push(y);
          currentY = y;
          include(currentX, currentY);
          break;
        }
        case "C": {
          const points = [
            [absoluteX(values[0] ?? 0), absoluteY(values[1] ?? 0)],
            [absoluteX(values[2] ?? 0), absoluteY(values[3] ?? 0)],
            [absoluteX(values[4] ?? 0), absoluteY(values[5] ?? 0)],
          ] as const;

          for (const [x, y] of points) {
            anchors.push(x, y);
            include(x, y);
          }

          currentX = points[2][0];
          currentY = points[2][1];
          break;
        }
        case "S":
        case "Q": {
          const points = [
            [absoluteX(values[0] ?? 0), absoluteY(values[1] ?? 0)],
            [absoluteX(values[2] ?? 0), absoluteY(values[3] ?? 0)],
          ] as const;

          for (const [x, y] of points) {
            anchors.push(x, y);
            include(x, y);
          }

          currentX = points[1][0];
          currentY = points[1][1];
          break;
        }
        case "A": {
          const radiusX = Math.abs(values[0] ?? 0);
          const radiusY = Math.abs(values[1] ?? 0);
          const x = absoluteX(values[5] ?? 0);
          const y = absoluteY(values[6] ?? 0);
          anchors.push(radiusX, radiusY, x, y);
          currentX = x;
          currentY = y;
          include(x, y);
          break;
        }
        default:
          throw new TypeError(`Unsupported pilot path command ${command}.`);
      }
    }

    return Object.freeze({
      bounds: Object.freeze([
        bounds[0] ?? 0,
        bounds[1] ?? 0,
        bounds[2] ?? 0,
        bounds[3] ?? 0,
      ] as const),
      anchors: Object.freeze(anchors),
      commandCount,
    });
  }

  /**
   * @description Resolves the fixed operand count of one supported path command group.
   * @param command - Uppercase SVG path command.
   * @returns Number of operands required by one command group.
   */
  #arity(command: string): number {
    switch (command) {
      case "M":
      case "L":
      case "T":
        return 2;
      case "H":
      case "V":
        return 1;
      case "C":
        return 6;
      case "S":
      case "Q":
        return 4;
      case "A":
        return 7;
      default:
        throw new TypeError(`Unsupported pilot path command ${command}.`);
    }
  }
}
