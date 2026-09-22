/**
 * @description Fresh Node process capability shared by package baselines.
 * @typedef {object} IProcessHost
 * @property {(request: { executablePath?: string, arguments: readonly string[] }) => { elapsedNanoseconds: number, status: number | null, stdout: string, stderr: string }} execute - Executes one fresh Node process and captures complete observable evidence.
 */

export {};
