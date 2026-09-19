/**
 * @description Documents the fresh Node process capability shared by package baselines.
 */
export class IProcessHost {
  /**
   * @description Executes one fresh Node process and captures complete observable evidence.
   * @param {{ executablePath?: string, arguments: readonly string[] }} _request - Fresh process request.
   * @returns {{ elapsedNanoseconds: number, status: number | null, stdout: string, stderr: string }} Process evidence.
   */
  execute(_request) {
    throw new Error("IProcessHost.execute must be implemented.");
  }
}
