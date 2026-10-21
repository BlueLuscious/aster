import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { BenchmarkRunner } from "../../tooling/performance/shared/runtime/benchmark.runner.mjs";
import { BenchmarkComparisonRunner } from "../../tooling/performance/shared/runtime/benchmark-comparison.runner.mjs";
import { BenchmarkEvidence } from "../../tooling/performance/shared/runtime/benchmark-evidence.mjs";
import { NumericSampleStatistics } from "../../tooling/performance/shared/runtime/numeric-sample.statistics.mjs";

function fixture(
  nanoseconds = 1_000,
  options = { sampleCount: 3, warmupOperations: 2 },
) {
  let now = 0n;
  let active = false;
  const calls = [];
  const runner = new BenchmarkRunner(
    {
      assertAvailable() {},
      collectGarbage() {
        assert.equal(active, false);
      },
      now() {
        return now;
      },
      heapUsed() {
        return 100;
      },
      environment() {
        return {};
      },
    },
    new NumericSampleStatistics(),
    options,
  );
  const execute = (operations) => {
    calls.push(operations);
    now += BigInt(operations * nanoseconds);
    return operations * 7;
  };
  const asyncExecute = async (operations) => {
    assert.equal(active, false);
    active = true;
    await Promise.resolve();
    const result = execute(operations);
    active = false;
    return result;
  };
  return { runner, execute, asyncExecute, calls };
}

test("calibrates only increasing declared counts and retains all baseline pilot trials", async () => {
  const { runner, execute, calls } = fixture(10_000);
  const result = await runner.calibrate({ name: "pilot", execute });
  assert.deepEqual(calls, [1, 10, 100, 1_000, 10_000]);
  assert.equal(result.operationsPerSample, 10_000);
  assert.equal(result.warmupOperations, 20);
  assert.equal(result.reachedTarget, true);
  assert.deepEqual(
    result.trials.map((trial) => trial.elapsedNanoseconds),
    [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000],
  );
  assert.ok(Object.isFrozen(result.trials));
});

test("reports a capped short pilot without pretending it reached the duration target", async () => {
  const { runner, execute } = fixture(1);
  const result = await runner.calibrate({ name: "short", execute });
  assert.equal(result.reachedTarget, false);
  assert.equal(result.operationsPerSample, 10_000);
});

test("stops an over-budget pilot with the triggering trial, without a favourable retry", async () => {
  const { runner, execute, calls } = fixture(6_000_000_000);
  await assert.rejects(runner.calibrate({ name: "slow", execute }), (error) => {
    assert.equal(error.trials.length, 1);
    assert.equal(error.trials[0].elapsedNanoseconds, 6_000_000_000);
    return /budget/u.test(error.message);
  });
  assert.deepEqual(calls, [1]);
});

test("retains raw sync and async observations, complete checksums and explicit heap units", async () => {
  for (const asynchronous of [false, true]) {
    const { runner, execute, asyncExecute, calls } = fixture();
    const observed = await runner.observe({
      name: "complete",
      operationsPerSample: 4,
      execute: asynchronous ? asyncExecute : execute,
    });
    assert.deepEqual(calls, [2, 4, 4, 4]);
    assert.equal(observed.schemaVersion, 1);
    assert.equal(observed.methodology.warmupOperations, 2);
    assert.equal(observed.samples.length, 3);
    assert.ok(
      observed.samples.every(
        (sample) =>
          sample.elapsedNanoseconds === 4_000 &&
          sample.nanosecondsPerOperation === 1_000 &&
          sample.checksum === 28 &&
          sample.heapGrowthBytes === 0,
      ),
    );
    assert.equal(observed.timing.median, 1_000);
    assert.ok(Object.isFrozen(observed.samples));
    assert.ok(Object.isFrozen(observed.samples[0]));
  }
});

test("rejects changing supplemental checksums and retains the divergent observation", async () => {
  const { runner } = fixture();
  let checksum = 0;
  await assert.rejects(
    runner.observe({
      name: "unstable",
      operationsPerSample: 1,
      execute() {
        return checksum++;
      },
    }),
    (error) => {
      assert.deepEqual(
        error.samples.map((sample) => sample.checksum),
        [1, 2],
      );
      return true;
    },
  );
});

test("rejects non-finite checksums instead of hiding them in JSON", async () => {
  const { runner } = fixture();
  await assert.rejects(
    runner.observe({
      name: "invalid",
      operationsPerSample: 1,
      execute() {
        return NaN;
      },
    }),
    /Invalid benchmark/u,
  );
});

test("retains completed observations and the original reason when a later operation throws", async () => {
  const { runner } = fixture();
  let calls = 0;
  const original = new Error("worker failed");
  await assert.rejects(
    runner.observe({
      name: "partial",
      operationsPerSample: 1,
      execute() {
        calls += 1;
        if (calls === 3) {
          throw original;
        }
        return 1;
      },
    }),
    (error) => error.samples.length === 1 && error.cause === original,
  );
});

function entry(
  source = "same",
  output = "full-output",
  workload = "same-work",
) {
  return {
    sourceSignature: source,
    outputSignature: output,
    workloadSignature: workload,
    observation: {
      schemaVersion: 1,
      name: "complete",
      operationsPerSample: 1,
      methodology: {
        sampleCount: 1,
        warmupOperations: 1,
        timing: "ns/op",
        memory: "net heap bytes",
      },
      timing: { median: 10, minimum: 10, maximum: 10 },
      samples: [
        {
          elapsedNanoseconds: 10,
          nanosecondsPerOperation: 10,
          heapGrowthBytes: 1,
          checksum: 7,
        },
      ],
    },
  };
}

test("rotates matched controls and candidate without sorting or discarding observations", async () => {
  const calls = [];
  const variants = Object.fromEntries(
    ["baseline", "control", "candidate"].map((name) => [
      name,
      async () => {
        calls.push(name);
        return entry(name === "candidate" ? "changed" : "same");
      },
    ]),
  );
  const result = await new BenchmarkComparisonRunner().run(variants);
  assert.equal(result.complete, true);
  assert.deepEqual(calls, [
    "baseline",
    "control",
    "candidate",
    "candidate",
    "baseline",
    "control",
    "control",
    "candidate",
    "baseline",
  ]);
  assert.equal(result.runs.length, 9);
  assert.equal(result.failure, null);
});

test("retains failed comparisons and previous results without retrying incompatible work", async () => {
  for (const incompatible of [
    entry("different"),
    entry("same", "different-output"),
    entry("same", "full-output", "different-work"),
  ]) {
    let candidates = 0;
    const result = await new BenchmarkComparisonRunner().run({
      baseline: async () => entry(),
      control: async () => incompatible,
      candidate: async () => {
        candidates += 1;
        return entry();
      },
    });
    assert.equal(result.complete, false);
    assert.equal(result.runs.length, 2);
    assert.equal(candidates, 0);
    assert.equal(result.failure.variant, "control");
  }
});

test("rejects malformed raw samples and inherited variant capabilities", async () => {
  const malformed = entry();
  malformed.observation.samples[0].nanosecondsPerOperation = 12;
  const result = await new BenchmarkComparisonRunner().run({
    baseline: async () => malformed,
  });
  assert.equal(result.complete, false);
  assert.equal(result.runs.length, 1);
  const inherited = await new BenchmarkComparisonRunner().run(
    Object.create({ baseline: async () => entry() }),
  );
  assert.equal(inherited.complete, false);
  assert.equal(inherited.runs.length, 0);
});

test("rejects empty samples, false summaries and source drift between matched rounds", async () => {
  for (const malformed of [
    () => {
      const v = entry();
      v.observation.samples = [];
      v.observation.methodology.sampleCount = 0;
      return v;
    },
    () => {
      const v = entry();
      v.observation.timing.median = 12;
      return v;
    },
  ]) {
    const result = await new BenchmarkComparisonRunner().run({
      baseline: async () => malformed(),
    });
    assert.equal(result.complete, false);
  }
  let candidates = 0;
  const result = await new BenchmarkComparisonRunner().run({
    baseline: async () => entry(),
    control: async () => entry(),
    candidate: async () => entry(`candidate-${candidates++}`),
  });
  assert.equal(result.complete, false);
  assert.match(result.failure.message, /source/u);
});

test("fingerprints complete projections and fails on omitted or non-finite evidence", () => {
  const evidence = new BenchmarkEvidence();
  assert.equal(
    evidence.fingerprint({ result: "svg" }),
    evidence.fingerprint({ result: "svg" }),
  );
  assert.notEqual(
    evidence.fingerprint({ result: "svg" }),
    evidence.fingerprint({ result: "xml" }),
  );
  for (const value of [
    undefined,
    { missing: undefined },
    { method() {} },
    [NaN],
    [Infinity],
    1n,
  ]) {
    assert.throws(() => evidence.fingerprint(value), TypeError);
  }
  let executed = false;
  const accessor = {
    get unsafe() {
      executed = true;
      return "value";
    },
  };
  assert.throws(() => evidence.fingerprint(accessor), /own data/u);
  assert.equal(executed, false);
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => evidence.fingerprint(cyclic), TypeError);
  assert.throws(() => evidence.fingerprint(new Array(2)), TypeError);
  assert.throws(() => evidence.fingerprint(new Date()), TypeError);
  const shared = { value: 1 };
  assert.equal(
    evidence.fingerprint([shared, shared]),
    evidence.fingerprint([{ value: 1 }, { value: 1 }]),
  );
  const environment = evidence.environment({
    cache: "not evicted",
    power: "unknown",
    outputWidth: 24,
  });
  assert.equal(environment.node, process.version);
  assert.equal(environment.context.power, "unknown");
});

test("detects physical byte and dependency-manifest drift before comparison", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-evidence-"));
  try {
    const path = join(root, "input.json");
    await writeFile(path, "{}\n");
    const evidence = new BenchmarkEvidence();
    const expected = await evidence.files([path, path]);
    assert.equal(expected.length, 1);
    assert.equal(expected[0].bytes, 3);
    await evidence.assertUnchanged(expected);
    await writeFile(path, "{}\r\n");
    assert.equal((await readFile(path)).byteLength, 4);
    await assert.rejects(
      evidence.assertUnchanged(expected),
      /identity changed/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
