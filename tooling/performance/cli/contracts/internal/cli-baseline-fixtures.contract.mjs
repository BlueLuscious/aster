/**
 * @description Prepared CLI values consumed outside fixture construction.
 * @typedef {object} ICliBaselineFixtures
 * @property {import("@luscious-garden/aster-core").IconDefinition} icon - Canonical representative icon definition.
 * @property {import("@luscious-garden/aster-cli").AsterCommandContext} context - Explicit context backed by prepared discovery and exact definitions.
 * @property {Readonly<{ help: import("@luscious-garden/aster-cli").AsterCommandInvocationType, version: import("@luscious-garden/aster-cli").AsterCommandInvocationType, listIcons: import("@luscious-garden/aster-cli").AsterCommandInvocationType, exportIcon: import("@luscious-garden/aster-cli").AsterCommandInvocationType, exportCollection: import("@luscious-garden/aster-cli").AsterCommandInvocationType, reviewCollection: import("@luscious-garden/aster-cli").AsterCommandInvocationType }>} invocations - Named `help`, `version`, `listIcons`, `exportIcon`, `exportCollection` and `reviewCollection` inputs; each uses canonical `AsterCommandInvocationType` field semantics.
 * @property {Readonly<{ help: readonly string[], collectionExport: readonly string[] }>} arguments - Standalone argument vectors: `help` requests executable help and `collectionExport` selects the representative collection export.
 * @property {import("@luscious-garden/aster-cli").AsterCommandSet} commands - Public immutable command composition under measurement.
 */

export {};
