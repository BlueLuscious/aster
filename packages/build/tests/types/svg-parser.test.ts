import type { ISvgParser } from "../../src/parser/contracts/internal/svg-parser.contract.js";
// @ts-expect-error Internal parser syntax is intentionally absent from the package root.
import type { ISvgSyntaxDocument } from "../../src/index.js";
import { SvgParser } from "../../src/parser/runtime/svg.parser.js";

const parser: ISvgParser = new SvgParser();

void parser;

declare const internalSyntax: ISvgSyntaxDocument;

void internalSyntax;
