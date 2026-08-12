/**
 * @description Capability that reports one emitted package distribution without changing it.
 * @typedef {object} IPackageDistributionInspector
 * @property {(packagePath: string) => Promise<Readonly<Record<string, unknown>>>} inspect - Inspects one package root.
 */

export {};
