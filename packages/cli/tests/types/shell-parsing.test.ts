import type {
  IconDirectionType,
  IconPaintType,
} from "@luscious-garden/aster-core";
import { CommandLineParser } from "../../src/shell/parsing/runtime/command-line.parser.js";
import { ExportCommandLineOptionParser } from "../../src/shell/parsing/runtime/export-command-line-option.parser.js";

const rawExportOptions = new ExportCommandLineOptionParser().parse(
  ["--colour", "red", "--direction", "sideways"],
  "icon",
);

if (rawExportOptions.colour !== undefined) {
  // @ts-expect-error An argv colour is not canonical paint before command validation.
  const paint: IconPaintType = rawExportOptions.colour;
  void paint;
}

if (rawExportOptions.direction !== undefined) {
  // @ts-expect-error An argv direction is not canonical before command validation.
  const direction: IconDirectionType = rawExportOptions.direction;
  void direction;
}

const parsed = new CommandLineParser().parse([
  "export",
  "icon",
  "aster/camera",
  "--colour",
  "red",
]);

if (
  parsed.invocation.command === "export"
  && parsed.invocation.options?.colour !== undefined
) {
  // @ts-expect-error A parsed shell invocation has not passed command validation.
  const paint: IconPaintType = parsed.invocation.options.colour;
  void paint;
}
