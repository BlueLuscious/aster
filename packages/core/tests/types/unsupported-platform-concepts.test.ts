import type {
  IconDefinition,
  IconNodeType,
  IconPaintType,
  IconPresentation,
  IconRenderOptions,
} from "../../src/index.js";

const unsupportedNode: IconNodeType = {
  // @ts-expect-error Structural groups are source syntax rather than portable nodes.
  kind: "group",
  children: [],
};

const arbitraryPresentation: IconPresentation = {
  // @ts-expect-error Arbitrary CSS classes are target-specific.
  className: "icon",
};

// @ts-expect-error URL paint can resolve external or document-owned resources.
const resourcePaint: IconPaintType = "url(#gradient)";

const variantOption: IconRenderOptions = {
  // @ts-expect-error Variants are selected by passing a distinct definition.
  variant: "filled",
};

const eventOption: IconRenderOptions = {
  // @ts-expect-error Event handlers have no portable render-option meaning.
  onClick: (): void => {},
};

const catalogueMetadata: IconDefinition["metadata"] = {
  displayName: "Searchable",
  rtl: "preserve",
  presentation: {
    defaults: {},
    overrides: [],
  },
  deprecated: false,
  // @ts-expect-error Search aliases remain outside portable runtime metadata.
  aliases: ["find-me"],
};

// @ts-expect-error Exact optional fields do not accept explicit undefined.
const invalidOptionalIdentity: IconDefinition["identity"] = {
  collection: "minimal",
  name: "camera",
  variant: undefined,
};

// @ts-expect-error DOM ambient types are excluded from portable compilation.
const hostNode: Node = unsupportedNode;

void arbitraryPresentation;
void resourcePaint;
void variantOption;
void eventOption;
void catalogueMetadata;
void invalidOptionalIdentity;
void hostNode;
