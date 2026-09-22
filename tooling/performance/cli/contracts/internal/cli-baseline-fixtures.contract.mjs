/**
 * @description Prepared CLI values consumed outside fixture construction.
 * @typedef {object} ICliBaselineFixtures
 * @property {import("@luscious-garden/aster-core").IconDefinition} icon - Canonical representative icon definition.
 * @property {import("@luscious-garden/aster-cli").AsterCommandContext} context - Explicit context backed by prepared discovery and exact definitions.
 * @property {Readonly<{ help: import("@luscious-garden/aster-cli").AsterCommandInvocationType, version: import("@luscious-garden/aster-cli").AsterCommandInvocationType, listIcons: import("@luscious-garden/aster-cli").AsterCommandInvocationType, exportIcon: import("@luscious-garden/aster-cli").AsterCommandInvocationType, exportCollection: import("@luscious-garden/aster-cli").AsterCommandInvocationType, reviewCollection: import("@luscious-garden/aster-cli").AsterCommandInvocationType }>} invocations - Closed representative structured invocations.
 * @property {Readonly<{ help: readonly string[], collectionExport: readonly string[] }>} arguments - Closed representative standalone argument sequences.
 * @property {import("@luscious-garden/aster-cli").AsterCommandSet} commands - Public immutable command composition under measurement.
 */

export {};
