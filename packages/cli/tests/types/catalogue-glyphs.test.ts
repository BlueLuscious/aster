import type {
  AsterCommandInvocationType,
  AsterCommandListSubjectType,
  AsterCommandShowSubjectType,
  AsterCommandPayloadType,
  CatalogueGlyphResult,
  CatalogueIconResult,
  CatalogueResultKindType,
} from "../../src/index.js";

const icon: CatalogueIconResult = {
  kind: "icon",
  catalogue: "sample",
  identity: { namespace: "aster", name: "camera", variant: "outline" },
  metadata: { displayName: "Camera", rtl: "preserve", deprecated: false },
  memberships: [],
};
const glyph: CatalogueGlyphResult = {
  kind: "glyph",
  catalogue: "sample",
  identity: { namespace: "aster", name: "camera" },
  variants: [icon],
};
const invocations: readonly AsterCommandInvocationType[] = [
  { command: "list", subject: "glyphs", catalogue: "sample" },
  {
    command: "show",
    subject: "glyph",
    identity: "aster/camera",
    catalogue: "sample",
  },
  {
    command: "list",
    subject: "icons",
    glyph: "aster/camera",
    collection: "amellus",
    tags: ["outline"],
  },
];
const listSubject: AsterCommandListSubjectType = "glyphs";
const showSubject: AsterCommandShowSubjectType = "glyph";
const kind: CatalogueResultKindType = "glyph";
const listed: AsterCommandPayloadType = { kind: "glyph-list", glyphs: [glyph] };
const shown: AsterCommandPayloadType = { kind: "glyph-show", glyph };

// @ts-expect-error Glyph identities have no treatment or implicit default.
glyph.identity.variant;
const variant = glyph.variants[0];
if (variant !== undefined) {
  // @ts-expect-error Metadata-only glyphs have no complete definition geometry.
  variant.nodes;
  // @ts-expect-error Glyph treatments preserve lightweight discovery metadata.
  variant.metadata.presentation;
  // @ts-expect-error Variant metadata remains readonly.
  variant.metadata.displayName = "Changed";
}
// @ts-expect-error Derived glyph identities are readonly.
glyph.identity.name = "changed";
// @ts-expect-error Derived variant sequences are readonly.
glyph.variants.push(icon);
const invalidExport: AsterCommandInvocationType = {
  command: "export",
  // @ts-expect-error Glyphs are discovery subjects, not exportable definitions.
  subject: "glyph",
  identity: "aster/camera",
};
const invalidReview: AsterCommandInvocationType = {
  command: "review",
  // @ts-expect-error Glyphs are not reviewable concrete subjects.
  subject: "glyph",
  identity: "aster/camera",
};

void [
  invocations,
  listSubject,
  showSubject,
  kind,
  listed,
  shown,
  invalidExport,
  invalidReview,
];
