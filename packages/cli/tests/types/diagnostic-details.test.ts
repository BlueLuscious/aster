import type { AsterCommandDiagnosticDetailsType, AsterCommandDiagnosticType } from "../../src/index.js";

function accept(diagnostic: AsterCommandDiagnosticType): AsterCommandDiagnosticType {
  return diagnostic;
}

const lookup = accept({ code: "ASTER-CLI-004", category: "not-found", message: "Missing", details: { kind: "lookup", subject: "glyph", identity: "example/camera" } });
const collection = accept({ code: "ASTER-CLI-006", category: "catalogue-unavailable", message: "Invalid", details: { kind: "definition", catalogue: "example", selection: { kind: "collection", identity: "set" }, member: "example/camera@outline" } });
const ambiguity = accept({ code: "ASTER-CLI-005", category: "ambiguous", message: "Ambiguous", details: { kind: "ambiguity", subject: "icon", identity: "example/camera@outline", catalogues: ["alpha", "beta"] } });
const review: AsterCommandDiagnosticDetailsType = { kind: "review-render", icon: "example/camera@outline" };

// @ts-expect-error Codes and categories are correlated, not independent unions.
accept({ code: "ASTER-CLI-004", category: "catalogue-unavailable", message: "Invalid", details: { kind: "lookup", subject: "icon", identity: "camera@outline" } });
// @ts-expect-error Lookup failures must retain an explicit subject and identity.
accept({ code: "ASTER-CLI-004", category: "not-found", message: "Missing" });
// @ts-expect-error A provider list is not lookup evidence.
accept({ code: "ASTER-CLI-004", category: "not-found", message: "Missing", details: { kind: "catalogues", catalogues: ["alpha"] } });
// @ts-expect-error Definition failures must identify their selected provider.
accept({ code: "ASTER-CLI-006", category: "catalogue-unavailable", message: "Invalid", details: { kind: "definition", selection: { kind: "icon", identity: "camera@outline" } } });
// @ts-expect-error Definition failures must retain an explicit concrete selection.
accept({ code: "ASTER-CLI-006", category: "catalogue-unavailable", message: "Invalid", details: { kind: "definition", catalogue: "alpha" } });
// @ts-expect-error A glyph group is not a concrete definition selection.
accept({ code: "ASTER-CLI-006", category: "catalogue-unavailable", message: "Invalid", details: { kind: "definition", catalogue: "alpha", selection: { kind: "glyph", identity: "camera" } } });
// @ts-expect-error Individual icon selections cannot carry a failing collection member.
accept({ code: "ASTER-CLI-006", category: "catalogue-unavailable", message: "Invalid", details: { kind: "definition", catalogue: "alpha", selection: { kind: "icon", identity: "camera@outline" }, member: "bell@outline" } });
// @ts-expect-error A singleton provider list does not establish ambiguity.
accept({ code: "ASTER-CLI-005", category: "ambiguous", message: "Ambiguous", details: { kind: "ambiguity", subject: "icon", identity: "camera@outline", catalogues: ["alpha"] } });
// @ts-expect-error A review rendering failure carries an icon identity, not an artefact path.
accept({ code: "ASTER-CLI-007", category: "render-failure", message: "Invalid", details: { kind: "review-render", path: "camera.svg" } });
// @ts-expect-error An export conflict cannot carry rendering evidence.
accept({ code: "ASTER-CLI-008", category: "export-conflict", message: "Invalid", details: { kind: "export-render", path: "camera.svg" } });
// @ts-expect-error Usage failures do not acquire fabricated lookup details.
accept({ code: "ASTER-CLI-001", category: "usage", message: "Invalid", details: { kind: "lookup", subject: "icon", identity: "camera@outline" } });
// @ts-expect-error No alias preserves the retired anonymous evidence field.
accept({ code: "ASTER-CLI-004", category: "not-found", message: "Missing", details: { kind: "lookup", subject: "icon", identity: "camera@outline" }, related: ["camera@outline"] });
// @ts-expect-error Explicit undefined does not stand in for absent no-detail evidence.
accept({ code: "ASTER-CLI-999", category: "execution-failure", message: "Unexpected", details: undefined });
// @ts-expect-error Detail roles use a closed vocabulary.
const unknownDetails: AsterCommandDiagnosticDetailsType = { kind: "suggestions", icons: [] };
if (ambiguity.details?.kind === "ambiguity") {
  // @ts-expect-error Supporting provider sequences remain readonly.
  ambiguity.details.catalogues.push("gamma");
}

void lookup;
void collection;
void review;
void unknownDetails;
