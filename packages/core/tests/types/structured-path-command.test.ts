import { iconPathCommandKinds } from "../../src/index.js";
import type {
  IconPathArcCommand,
  IconPathCommandType,
  IconPathCubicBezierCommand,
} from "../../src/index.js";

const commands: readonly IconPathCommandType[] = [
  { kind: iconPathCommandKinds.move, x: 2, y: 12 },
  { kind: iconPathCommandKinds.line, x: 5, y: 9 },
  {
    kind: iconPathCommandKinds.cubicBezier,
    control1X: 7,
    control1Y: 3,
    control2X: 10,
    control2Y: 3,
    x: 12,
    y: 7,
  },
  {
    kind: iconPathCommandKinds.quadraticBezier,
    controlX: 16,
    controlY: 3,
    x: 19,
    y: 9,
  },
  {
    kind: iconPathCommandKinds.arc,
    radiusX: 3,
    radiusY: 4,
    rotation: 0,
    largeArc: false,
    sweep: true,
    x: 20,
    y: 12,
  },
  { kind: iconPathCommandKinds.close },
];

function endpoint(command: IconPathCommandType): readonly [number, number] | undefined {
  switch (command.kind) {
    case iconPathCommandKinds.move:
    case iconPathCommandKinds.line:
    case iconPathCommandKinds.cubicBezier:
    case iconPathCommandKinds.quadraticBezier:
    case iconPathCommandKinds.arc:
      return [command.x, command.y];
    case iconPathCommandKinds.close:
      return undefined;
  }
}

const cubic: IconPathCubicBezierCommand = commands[2] as IconPathCubicBezierCommand;
const arc: IconPathArcCommand = commands[4] as IconPathArcCommand;

// @ts-expect-error Portable command sequences are readonly.
commands.push({ kind: iconPathCommandKinds.close });

// @ts-expect-error Portable command coordinates are readonly.
cubic.control1X = 8;

// @ts-expect-error Relative SVG command letters are not portable discriminators.
const relativeMove: IconPathCommandType = { kind: "m", x: 2, y: 12 };

// @ts-expect-error Cubic commands require both complete control points.
const incompleteCubic: IconPathCubicBezierCommand = {
  kind: iconPathCommandKinds.cubicBezier,
  control1X: 7,
  control1Y: 3,
  control2X: 10,
  x: 12,
  y: 7,
};

const numericArcFlag: IconPathArcCommand = {
  kind: iconPathCommandKinds.arc,
  radiusX: 3,
  radiusY: 4,
  rotation: 0,
  // @ts-expect-error Arc flags are semantic booleans rather than SVG numeric tokens.
  largeArc: 0,
  sweep: true,
  x: 20,
  y: 12,
};

void endpoint(commands[0] as IconPathCommandType);
void cubic.control1X;
void arc.largeArc;
void relativeMove;
void incompleteCubic;
void numericArcFlag;
