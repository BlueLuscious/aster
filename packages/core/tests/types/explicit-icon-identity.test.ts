import type { IconGlyphIdentity, IconIdentity, IconMetadata } from "../../src/index.js";

const glyph: IconGlyphIdentity = { namespace: "testing", name: "camera" };
const concrete: IconIdentity = { ...glyph, variant: "outline" };
const numeric: IconIdentity = { name: "camera", variant: "2-tone" };
const replacement: NonNullable<IconMetadata["replacedBy"]> = concrete;
// @ts-expect-error A glyph identity is not a concrete treatment identity.
const missing: IconIdentity = glyph;
// @ts-expect-error Namespace absence does not make the treatment optional.
const bare: IconIdentity = { name: "camera" };
const undefinedTreatment: IconIdentity = {
  name: "camera",
  // @ts-expect-error An explicitly undefined treatment is not a canonical string.
  variant: undefined,
};
// @ts-expect-error Replacement metadata also requires a concrete treatment.
const missingReplacement: NonNullable<IconMetadata["replacedBy"]> = glyph;
// @ts-expect-error Glyph projection has no implicit treatment field.
glyph.variant;

void [concrete, numeric, replacement, missing, bare, undefinedTreatment, missingReplacement];
