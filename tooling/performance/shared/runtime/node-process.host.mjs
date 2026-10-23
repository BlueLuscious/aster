import { execFile, spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { benchmarkComparison } from "../constants/benchmark-comparison.constant.mjs";

/**
 * @description Executes fresh Node processes for development-only package comparisons.
 */
export class NodeProcessHost {
  /** @description Absolute repository root used for package and executable resolution. */
  #repositoryRoot;

  /**
   * @description Creates one process host rooted at the explicit repository location.
   * @param {string} repositoryRoot - Absolute repository root.
   */
  constructor(repositoryRoot) {
    this.#repositoryRoot = repositoryRoot;
  }

  /**
   * @description Executes one fresh Node process and captures complete observable evidence.
   * @param {{ executablePath?: string, arguments: readonly string[] }} request - Fresh process request.
   * @returns {{ elapsedNanoseconds: number, status: number | null, stdout: string, stderr: string }} Complete-process `elapsedNanoseconds`, nullable exit `status`, and captured UTF-8 `stdout` and `stderr`.
   */
  execute(request) {
    const arguments_ =
      request.executablePath === undefined
        ? request.arguments
        : [request.executablePath, ...request.arguments];
    const startedAt = process.hrtime.bigint();
    const result = spawnSync(process.execPath, arguments_, {
      cwd: this.#repositoryRoot,
      encoding: "utf8",
    });
    const elapsedNanoseconds = Number(process.hrtime.bigint() - startedAt);

    if (result.error !== undefined) {
      throw result.error;
    }

    return Object.freeze({
      elapsedNanoseconds,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  }

  /**
   * @description Runs one trusted supplemental worker with finite time, output and reported-RSS budgets.
   * @remarks Workers must await their non-detached children before normal exit. Timeout cleanup
   * kills the live Windows tree or POSIX process group; this is not a sandbox for escaping or
   * malicious programs. RSS messages are observer evidence, not an OS-enforced RSS limit.
   * Budget-triggered termination keeps the first abort reason and retains only a bounded output prefix.
   * @param {{ executablePath: string, arguments: readonly string[], timeoutMilliseconds?: number, maximumOutputBytes?: number, maximumRssBytes?: number, exposeGc?: boolean }} request - Explicit file-based worker and bounded controls.
   * @returns {Promise<{ ok: boolean, reason: string, status: number | null, signal: string | null, elapsedNanoseconds: number, stdout: string, stderr: string, terminationError: string | null }>} Outcome `ok` and `reason`, nullable exit `status`/`signal`, complete-process `elapsedNanoseconds`, bounded `stdout`/`stderr`, and nullable cleanup failure in `terminationError`.
   */
  async executeBounded(request) {
    const timeout =
      request.timeoutMilliseconds ?? benchmarkComparison.timeoutMilliseconds;
    const maximumOutput =
      request.maximumOutputBytes ?? benchmarkComparison.maximumOutputBytes;
    const maximumRss =
      request.maximumRssBytes ?? benchmarkComparison.maximumRssBytes;
    for (const [value, limit] of [
      [timeout, benchmarkComparison.timeoutMilliseconds],
      [maximumOutput, benchmarkComparison.maximumOutputBytes],
      [maximumRss, benchmarkComparison.maximumRssBytes],
    ]) {
      if (
        value === undefined ||
        limit === undefined ||
        !Number.isSafeInteger(value) ||
        value <= 0 ||
        value > limit
      ) {
        throw new TypeError("Invalid bounded benchmark process budget.");
      }
    }
    const startedAt = process.hrtime.bigint();
    return new Promise((complete) => {
      /** @type {import("node:child_process").ChildProcess} */
      let child;
      try {
        child = spawn(
          process.execPath,
          [
            `--max-old-space-size=${benchmarkComparison.heapMebibytes}`,
            ...(request.exposeGc === true ? ["--expose-gc"] : []),
            resolve(this.#repositoryRoot, request.executablePath),
            ...request.arguments,
          ],
          {
            cwd: this.#repositoryRoot,
            windowsHide: true,
            detached: process.platform !== "win32",
            stdio: ["ignore", "pipe", "pipe", "ipc"],
          },
        );
      } catch (error) {
        complete(
          Object.freeze({
            ok: false,
            reason: "spawn-error",
            status: null,
            signal: null,
            elapsedNanoseconds: Number(process.hrtime.bigint() - startedAt),
            stdout: "",
            stderr: (error instanceof Error
              ? error.message
              : String(error)
            ).slice(0, maximumOutput),
            terminationError: null,
          }),
        );
        return;
      }
      /** @type {Buffer[]} */
      const stdout = [];
      /** @type {Buffer[]} */
      const stderr = [];
      let bytes = 0;
      let reason = "exit";
      /** @type {Promise<string | null>} */
      let termination = Promise.resolve(null);
      /** @type {(cause: string) => void} */
      const stop = (cause) => {
        if (reason !== "exit") {
          return;
        }
        reason = cause;
        if (child.pid !== undefined) {
          termination = this.#terminate(child.pid);
        }
      };
      /** @type {(stream: Buffer[], chunk: Buffer) => void} */
      const append = (stream, chunk) => {
        const remaining = maximumOutput - bytes;
        if (remaining > 0) {
          stream.push(chunk.subarray(0, remaining));
          bytes += Math.min(remaining, chunk.length);
        }
        if (chunk.length > remaining) {
          stop("output-limit");
        }
      };
      child.stdout?.on("data", (chunk) => append(stdout, chunk));
      child.stderr?.on("data", (chunk) => append(stderr, chunk));
      child.on("message", (message) => {
        if (
          message !== null &&
          typeof message === "object" &&
          "type" in message &&
          message.type === "benchmark.rss"
        ) {
          if (
            !("bytes" in message) ||
            typeof message.bytes !== "number" ||
            !Number.isSafeInteger(message.bytes) ||
            message.bytes < 0
          ) {
            stop("resource-protocol");
          } else if (message.bytes > maximumRss) {
            stop("rss-limit");
          }
        }
      });
      child.on("error", (error) => {
        reason = "spawn-error";
        append(stderr, Buffer.from(error.message));
      });
      const timer = setTimeout(() => stop("timeout"), timeout);
      child.on("close", (status, signal) => {
        clearTimeout(timer);
        void termination.then((terminationError) =>
          complete(
            Object.freeze({
              ok:
                reason === "exit" && status === 0 && terminationError === null,
              reason,
              status,
              signal,
              elapsedNanoseconds: Number(process.hrtime.bigint() - startedAt),
              stdout: Buffer.concat(stdout).toString("utf8"),
              stderr: Buffer.concat(stderr).toString("utf8"),
              terminationError,
            }),
          ),
        );
      });
    });
  }

  /**
   * @description Terminates only the live process tree or group acquired by executeBounded.
   * @param {number} pid - Positive owned child PID, never the host PID.
   * @returns {Promise<string | null>} Cleanup error or successful termination.
   */
  async #terminate(pid) {
    if (!Number.isSafeInteger(pid) || pid <= 0 || pid === process.pid) {
      return "Invalid benchmark worker PID.";
    }
    if (process.platform === "win32") {
      return new Promise((complete) =>
        execFile(
          "taskkill",
          ["/PID", String(pid), "/T", "/F"],
          { windowsHide: true, timeout: 10_000 },
          (error) => complete(error?.message ?? null),
        ),
      );
    }
    try {
      process.kill(-pid, "SIGKILL");
      return null;
    } catch (error) {
      return error instanceof Error && "code" in error && error.code === "ESRCH"
        ? null
        : String(error);
    }
  }
}
