/**
 * @description Documents the cold Node process capability required by the CLI baseline.
 */
export class ICliProcessHost {
  /**
   * @description Executes one fresh Node process and captures complete observable evidence.
   * @param {{ executablePath?: string, arguments: readonly string[] }} _request - Cold process request.
   * @returns {{ elapsedNanoseconds: number, status: number | null, stdout: string, stderr: string }} Process evidence.
   */
  execute(_request) {
    throw new Error("ICliProcessHost.execute must be implemented.");
  }
}
