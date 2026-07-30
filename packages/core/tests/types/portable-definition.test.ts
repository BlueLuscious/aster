import type {
  IconPresentationPolicy,
  IconDefinition,
  IconNodeType,
  IconPresentation,
  IconRenderOptions,
} from "../../src/index.js";

const presentationDefaults: IconPresentation = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLineCap: "round",
  strokeLineJoin: "round",
};

const presentationPolicy: IconPresentationPolicy = {
  defaults: presentationDefaults,
  overrides: ["stroke", "strokeWidth"],
  defaultSize: 24,
  minimumSize: 12,
};

const nodes: readonly IconNodeType[] = [
  {
    kind: "path",
    data: "M2 12h20",
  },
  {
    kind: "circle",
    cx: 12,
    cy: 12,
    radius: 3,
    fill: "#112233",
  },
  {
    kind: "ellipse",
    cx: 12,
    cy: 12,
    radiusX: 6,
    radiusY: 4,
  },
  {
    kind: "rect",
    x: 3,
    y: 4,
    width: 18,
    height: 16,
    radiusX: 2,
    radiusY: 2,
  },
  {
    kind: "line",
    x1: 2,
    y1: 2,
    x2: 22,
    y2: 22,
  },
  {
    kind: "polyline",
    points: [
      { x: 2, y: 12 },
      { x: 8, y: 18 },
      { x: 14, y: 12 },
    ],
  },
  {
    kind: "polygon",
    points: [
      { x: 12, y: 2 },
      { x: 22, y: 22 },
      { x: 2, y: 22 },
    ],
    fillRule: "evenodd",
    opacity: 0.8,
  },
];

const definition: IconDefinition = {
  identity: {
    namespace: "minimal",
    name: "shape-sampler",
    variant: "outline",
  },
  viewBox: {
    minX: 0,
    minY: 0,
    width: 24,
    height: 24,
  },
  nodes,
  metadata: {
    displayName: "Shape Sampler",
    rtl: "preserve",
    presentation: presentationPolicy,
    licence: "CC-BY-4.0",
    attribution: "Example Author",
    deprecated: false,
  },
};

const options: IconRenderOptions = {
  size: 32,
  colour: "#445566",
  stroke: "currentColor",
  strokeWidth: 2,
  label: "Shape sampler",
  title: "Portable geometry",
  decorative: false,
  direction: "rtl",
};

const replacement: IconDefinition = {
  ...definition,
  identity: {
    namespace: "minimal",
    name: "shape-sampler-new",
  },
  metadata: {
    ...definition.metadata,
    deprecated: true,
    replacedBy: definition.identity,
  },
};

function acceptPortableValues(
  acceptedDefinition: IconDefinition,
  acceptedOptions: IconRenderOptions,
): void {
  void acceptedDefinition;
  void acceptedOptions;
}

acceptPortableValues(definition, options);
acceptPortableValues(replacement, {});
