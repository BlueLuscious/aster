import { performance, PerformanceObserver } from "node:perf_hooks";
import { setImmediate as settle } from "node:timers/promises";

/** @description Collects explicitly instrumented resource evidence separately from latency comparisons. */
export class BenchmarkResourceObserver {
  /**
   * @description Observes CPU, sampled RSS, lifetime RSS high-water marks, post-GC heap and GC events.
   * @remarks maxRSS is an OS lifetime high-water mark in KiB, not workload-local allocation.
   * Sampling can miss transient RSS. Filesystem counters retain their OS units/support limitations.
   * The conservative growth bound can include preparation peaks. Samples retain the observed
   * high-water mark and report worker RSS to the bounded parent when connected.
   * @param {() => unknown | Promise<unknown>} execute - Named complete resource workload, not an uninstrumented timing sample.
   * @returns {Promise<{ value: unknown, resources: Readonly<Record<string, unknown>> }>} The exact workload result in `value` and instrumented counters in `resources`, with the ownership, units and limitations described above.
   */
  async measure(execute) {
    if (typeof globalThis.gc !== "function") {
      throw new Error("Resource observation requires Node --expose-gc.");
    }
    globalThis.gc();
    await settle();
    /** @type {{ startTime: number, durationMilliseconds: number }[]} */
    const events = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        events.push({
          startTime: entry.startTime,
          durationMilliseconds: entry.duration,
        });
      }
    });
    observer.observe({ entryTypes: ["gc"] });
    const memoryBefore = process.memoryUsage();
    const usageBefore = process.resourceUsage();
    let sampledPeakRssBytes = memoryBefore.rss;
    const sample = () => {
      const bytes = process.memoryUsage.rss();
      sampledPeakRssBytes = Math.max(sampledPeakRssBytes, bytes);
      if (process.connected && process.send !== undefined) {
        process.send({ type: "benchmark.rss", bytes });
      }
    };
    sample();
    const timer = setInterval(sample, 10);
    const startedAt = performance.now();
    try {
      const value = await execute();
      const endedAt = performance.now();
      clearInterval(timer);
      sample();
      const memoryAfter = process.memoryUsage();
      const usageAfter = process.resourceUsage();
      if (process.connected && process.send !== undefined) {
        process.send({
          type: "benchmark.rss",
          bytes: Math.max(sampledPeakRssBytes, usageAfter.maxRSS * 1024),
        });
      }
      await settle();
      await settle();
      observer.disconnect();
      globalThis.gc();
      const postGcHeapUsedBytes = process.memoryUsage().heapUsed;
      return Object.freeze({
        value,
        resources: Object.freeze({
          instrumented: true,
          elapsedMilliseconds: endedAt - startedAt,
          cpuUserMicroseconds: usageAfter.userCPUTime - usageBefore.userCPUTime,
          cpuSystemMicroseconds:
            usageAfter.systemCPUTime - usageBefore.systemCPUTime,
          rssBeforeBytes: memoryBefore.rss,
          rssAfterBytes: memoryAfter.rss,
          sampledPeakRssBytes,
          lifetimeMaxRssBeforeBytes: usageBefore.maxRSS * 1024,
          lifetimeMaxRssAfterBytes: usageAfter.maxRSS * 1024,
          peakGrowthUpperBoundBytes: Math.max(
            0,
            usageAfter.maxRSS * 1024 - memoryBefore.rss,
          ),
          heapBeforeBytes: memoryBefore.heapUsed,
          heapAfterBytes: memoryAfter.heapUsed,
          postGcHeapUsedBytes,
          gcEvents: Object.freeze(
            events
              .filter(
                (entry) =>
                  entry.startTime >= startedAt && entry.startTime <= endedAt,
              )
              .map((entry) => Object.freeze(entry)),
          ),
          osFilesystemReadOperations: usageAfter.fsRead - usageBefore.fsRead,
          osFilesystemWriteOperations: usageAfter.fsWrite - usageBefore.fsWrite,
        }),
      });
    } finally {
      clearInterval(timer);
      observer.disconnect();
    }
  }
}
