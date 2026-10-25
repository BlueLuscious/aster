/**
 * @description One complete observation and the identities required to admit it into matched comparisons.
 * @typedef {object} IBenchmarkComparisonEntry
 * @property {string} sourceSignature - Exact declared source/artefact identity; baseline and control must agree.
 * @property {string} workloadSignature - Full workload/cardinality/flags/dependency identity shared by all variants.
 * @property {string} outputSignature - Preflight full output signature shared by all variants.
 * @property {import("./benchmark-observation.contract.mjs").IBenchmarkObservation} observation - Supplemental raw observation.
 */

export {};
