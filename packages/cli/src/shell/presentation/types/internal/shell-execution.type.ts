/**
 * @description Complete effect description committed by the standalone executable entrypoint.
 */
export type TShellExecution = Readonly<{
  /**
   * @description Exact standard-output text, including any final newline.
   */
  stdout: string;

  /**
   * @description Exact standard-error text, including any final newline.
   */
  stderr: string;

  /**
   * @description Process exit status selected from the documented shell policy.
   */
  exitCode: number;
}>;
