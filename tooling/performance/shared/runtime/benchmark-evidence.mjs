import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import {
  availableParallelism,
  cpus,
  release,
  totalmem,
  version,
} from "node:os";
import { resolve } from "node:path";

/** @description Records explicit JSON projections, physical file identity and the comparison host. */
export class BenchmarkEvidence {
  /**
   * @description Hashes a declared JSON projection without silently omitting unsupported values.
   * @remarks Only plain own-data JSON projections are accepted. Accessors, hidden fields, sparse arrays and toJSON behaviour cannot alter the recorded data.
   * @param {unknown} value - Declared serialisable input or output projection.
   * @returns {string} SHA-256 over the exact UTF-8 JSON representation.
   */
  fingerprint(value) {
    const json = this.#encode(value, new Set());
    return createHash("sha256").update(json).digest("hex");
  }

  /**
   * @description Serialises complete plain JSON data without executing accessors or conversion hooks.
   * @param {unknown} value - Explicit data projection.
   * @param {Set<object>} ancestors - Active recursion path, not a ban on shared references.
   * @returns {string} Exact finite JSON representation.
   */
  #encode(value, ancestors) {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))
    ) {
      return JSON.stringify(value);
    }
    if (typeof value !== "object" || ancestors.has(value)) {
      throw new TypeError(
        "Benchmark evidence requires a complete finite JSON projection.",
      );
    }
    const array = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (!array && prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Benchmark evidence requires plain JSON records.");
    }
    const keys = Reflect.ownKeys(value).filter(
      (key) => !(array && key === "length"),
    );
    if (
      keys.some((key) => typeof key !== "string") ||
      (array && keys.length !== value.length)
    ) {
      throw new TypeError(
        "Benchmark evidence rejects sparse arrays and symbol fields.",
      );
    }
    ancestors.add(value);
    try {
      const entries = keys.map((key, index) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (
          descriptor === undefined ||
          !Object.hasOwn(descriptor, "value") ||
          !descriptor.enumerable ||
          (array && key !== String(index))
        ) {
          throw new TypeError(
            "Benchmark evidence requires enumerable own data fields.",
          );
        }
        const encoded = this.#encode(descriptor.value, ancestors);
        return array ? encoded : `${JSON.stringify(key)}:${encoded}`;
      });
      return array ? `[${entries.join(",")}]` : `{${entries.join(",")}}`;
    } finally {
      ancestors.delete(value);
    }
  }

  /**
   * @description Captures exact physical bytes for an explicit finite source, dependency or artefact set.
   * @param {readonly string[]} paths - Explicit file paths, including lockfiles/manifests where relevant.
   * @returns {Promise<readonly Readonly<{ path: string, physicalPath: string, bytes: number, sha256: string }>[]>} Sorted identities with requested `path`, resolved `physicalPath`, byte count in `bytes` and hexadecimal `sha256`; not a hermetic dependency archive.
   */
  async files(paths) {
    const entries = [];
    const unique = [...new Set(paths.map((path) => resolve(path)))].sort();
    for (const path of unique) {
      const physicalPath = await realpath(path);
      const content = await readFile(physicalPath);
      entries.push(
        Object.freeze({
          path,
          physicalPath,
          bytes: content.byteLength,
          sha256: createHash("sha256").update(content).digest("hex"),
        }),
      );
    }
    return Object.freeze(entries);
  }

  /**
   * @description Rejects drift in an already recorded finite file set.
   * @param {Awaited<ReturnType<BenchmarkEvidence["files"]>>} expected - Earlier physical byte identities.
   * @returns {Promise<void>} Nothing after exact path/byte agreement.
   */
  async assertUnchanged(expected) {
    const actual = await this.files(expected.map((entry) => entry.path));
    if (this.fingerprint(actual) !== this.fingerprint(expected)) {
      throw new Error("Benchmark source or artefact identity changed.");
    }
  }

  /**
   * @description Records runtime, machine and caller-declared cache, power, dependency and output context.
   * @param {Readonly<Record<string, unknown>>} context - Explicit conditions, including unobserved/unknown limits.
   * @returns {Readonly<Record<string, unknown>>} Serialisable environment without silently claiming controlled host conditions.
   */
  environment(context) {
    this.fingerprint(context);
    return Object.freeze({
      node: process.version,
      v8: process.versions.v8,
      platform: process.platform,
      architecture: process.arch,
      os: version(),
      release: release(),
      cpu: cpus()[0]?.model ?? "unknown",
      logicalProcessors: cpus().length,
      availableParallelism: availableParallelism(),
      totalMemoryBytes: totalmem(),
      execArgv: Object.freeze([...process.execArgv]),
      nodeOptions: process.env.NODE_OPTIONS ?? "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      context,
    });
  }
}
