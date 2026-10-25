import { ModuleImportProbe } from "./runtime/module-import.probe.mjs";
import { BenchmarkResourceObserver } from "./runtime/benchmark-resource.observer.mjs";
import { open } from "node:fs/promises";
import { benchmarkComparison } from "./constants/benchmark-comparison.constant.mjs";

/**
 * @description Acquires inline JSON or a bounded immutable request file without operating-system argv-size constraints.
 * @returns {Promise<unknown>} Decoded data awaiting structural validation.
 */
async function readRequest() {
  if (process.argv[2] !== "--request") {
    return JSON.parse(process.argv[2] ?? "null");
  }
  const path = process.argv[3];
  if (path === undefined || process.argv.length !== 4) {
    throw new TypeError(
      "Native import request files require one explicit path.",
    );
  }
  const file = await open(path, "r");
  try {
    const stat = await file.stat();
    if (
      !stat.isFile() ||
      stat.size <= 0 ||
      stat.size > benchmarkComparison.maximumRequestBytes
    ) {
      throw new TypeError(
        "Native import request file exceeded its byte budget.",
      );
    }
    const content = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < content.length) {
      const { bytesRead } = await file.read(
        content,
        offset,
        content.length - offset,
        offset,
      );
      if (bytesRead === 0) {
        throw new Error(
          "Native import request file changed during acquisition.",
        );
      }
      offset += bytesRead;
    }
    if ((await file.read(Buffer.alloc(1), 0, 1, stat.size)).bytesRead !== 0) {
      throw new Error("Native import request file changed during acquisition.");
    }
    return JSON.parse(content.toString("utf8").replace(/^\uFEFF/u, ""));
  } finally {
    await file.close();
  }
}

/** @description Decoded explicit native-import request, validated before module acquisition. @type {unknown} */
const request = await readRequest();

if (
  request === null ||
  typeof request !== "object" ||
  Object.keys(request).some(
    (key) => key !== "specifiers" && key !== "resources",
  ) ||
  !("specifiers" in request) ||
  !Array.isArray(request.specifiers) ||
  !request.specifiers.every((value) => typeof value === "string") ||
  ("resources" in request && typeof request.resources !== "boolean")
) {
  throw new TypeError("Invalid native module import request.");
}

/** @description Validated explicit module inputs. */
const specifiers = request.specifiers;
/**
 * @description Performs the explicit import-only operation, optionally wrapped by a resource observer.
 * @returns {ReturnType<ModuleImportProbe["inspectNative"]>} Complete native import evidence.
 */
const run = () => new ModuleImportProbe().inspectNative(specifiers);
/** @description Complete native or explicitly instrumented resource evidence. */
const result =
  "resources" in request && request.resources === true
    ? await new BenchmarkResourceObserver().measure(run)
    : await run();

process.stdout.write(`${JSON.stringify(result)}\n`);
