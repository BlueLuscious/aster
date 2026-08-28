/**
 * @description Prepared public Import values used outside benchmark timing boundaries.
 * @typedef {object} IImportBaselineFixtures
 * @property {import("@aster/import").SvgIconImportSource} minimalSource - Minimal accepted host-owned SVG source.
 * @property {import("@aster/import").SvgIconImportSource} editorSource - Accepted editor-export SVG source containing finite noise.
 * @property {import("@aster/import").SvgIconImportSource} rejectedSource - Safely rejected executable SVG source.
 * @property {import("@aster/import").IconImportDefinitionRequest} definitionRequest - Accepted draft and reviewed metadata.
 * @property {import("@aster/import").IconModuleEmissionRequest} emissionRequest - Canonical definition and provenance.
 * @property {import("@aster/import").IconAdoptionRequest} adoptionRequest - Single complete adoption input.
 * @property {readonly import("@aster/import").IconAdoptionRequest[]} batchRequests - Distinct complete adoption inputs.
 * @property {{ readonly minimalSourceBytes: number, readonly editorSourceBytes: number, readonly rejectedSourceBytes: number, readonly batchSize: number }} sizes - Explicit scenario fixture sizes.
 */

export {};
