import type {
  IconDefinition,
  IconRenderOptions,
} from "@aster/core";
import {
  Svg,
  SvgRenderError,
  type SvgApi,
  type SvgMarkupType,
} from "../../src/index.js";

declare const definition: IconDefinition;

const api: SvgApi = {
  render(
    acceptedDefinition: IconDefinition,
    options?: IconRenderOptions,
  ): SvgMarkupType {
    void acceptedDefinition;
    void options;
    return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  },
};

const defaultMarkup: SvgMarkupType = api.render(definition);
const semanticMarkup: SvgMarkupType = api.render(definition, {
  size: 24,
  colour: "currentColor",
  label: "Camera",
  decorative: false,
  direction: "rtl",
});
const publicMarkup: SvgMarkupType = Svg.render(definition);
const publicError: TypeError = new SvgRenderError(
  "options.size",
  "expected a positive finite number",
);
const publicErrorCode: string = SvgRenderError.code;

api.render(definition, {
  // @ts-expect-error Arbitrary SVG attributes are not portable renderer options.
  className: "icon",
});

api.render(definition, {
  // @ts-expect-error Event handlers are outside the standalone markup renderer boundary.
  onClick: (): void => {},
});

// @ts-expect-error Exact optional fields do not accept explicit undefined.
api.render(definition, { title: undefined });

// @ts-expect-error DOM ambient types are absent from the portable renderer compilation.
const hostElement: SVGElement = defaultMarkup;

void defaultMarkup;
void semanticMarkup;
void publicMarkup;
void publicError;
void publicErrorCode;
void hostElement;
