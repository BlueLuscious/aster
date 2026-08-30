import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { cliBaseline } from "../../tooling/performance/cli/constants/cli-baseline.constant.mjs";
import { CliBaselineFixtureFactory } from "../../tooling/performance/cli/runtime/cli-baseline-fixture.factory.mjs";
import { CliBaselineRunner } from "../../tooling/performance/cli/runtime/cli-baseline.runner.mjs";
import { CliColdStartRunner } from "../../tooling/performance/cli/runtime/cli-cold-start.runner.mjs";
import { coreBaseline } from "../../tooling/performance/core/constants/core-baseline.constant.mjs";
import { CoreBaselineFixtureFactory } from "../../tooling/performance/core/runtime/core-baseline-fixture.factory.mjs";
import { CoreBaselineRunner } from "../../tooling/performance/core/runtime/core-baseline.runner.mjs";
import { importBaseline } from "../../tooling/performance/import/constants/import-baseline.constant.mjs";
import { ImportBaselineFixtureFactory } from "../../tooling/performance/import/runtime/import-baseline-fixture.factory.mjs";
import { ImportBaselineRunner } from "../../tooling/performance/import/runtime/import-baseline.runner.mjs";
import { BenchmarkRunner } from "../../tooling/performance/shared/runtime/benchmark.runner.mjs";
import { NumericSampleStatistics } from "../../tooling/performance/shared/runtime/numeric-sample.statistics.mjs";
import { PackageDistributionInspector } from "../../tooling/performance/shared/runtime/package-distribution.inspector.mjs";
import { svgBaseline } from "../../tooling/performance/svg/constants/svg-baseline.constant.mjs";
import { SvgBaselineFixtureFactory } from "../../tooling/performance/svg/runtime/svg-baseline-fixture.factory.mjs";
import { SvgBaselineRunner } from "../../tooling/performance/svg/runtime/svg-baseline.runner.mjs";
import { NodeRepositoryFileSystem } from "../../tooling/shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../tooling/shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../tooling/shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

test("prepares distinct mutable and canonical Core benchmark fixtures", () => {
  const fixtures = new CoreBaselineFixtureFactory().create();

  assert.ok(Object.isFrozen(fixtures));
  assert.ok(Object.isFrozen(fixtures.canonicalIcons));
  assert.equal(Object.isFrozen(fixtures.mutableIcons), false);
  assert.notEqual(fixtures.mutableIcons, fixtures.canonicalIcons);
  assert.notEqual(fixtures.mutableIcons[0], fixtures.canonicalIcons[0]);
  assert.deepEqual(fixtures.mutableIcons, fixtures.canonicalIcons);
  assert.equal(Object.isFrozen(fixtures.mutableCollection), false);
  assert.deepEqual(fixtures.mutableCollection, fixtures.canonicalCollection);
  assert.equal(fixtures.emptyCollection.icons.length, 0);
  assert.equal(fixtures.singleCanonicalCollection.icons.length, 1);
  assert.equal(
    fixtures.singleCanonicalCollection.icons[0],
    fixtures.canonicalIcons[0],
  );
});

test("runs the complete Core scenario matrix through public values", async () => {
  const measured = [];
  const runner = new CoreBaselineRunner(
    {
      measure(scenario) {
        const result = Object.freeze({
          name: scenario.name,
          checksum: scenario.execute(2),
        });
        measured.push(result);
        return result;
      },
      methodology() {
        return Object.freeze({ fixture: true });
      },
    },
    {
      async inspect(packagePath) {
        return Object.freeze({ packagePath });
      },
    },
    {
      environment() {
        return Object.freeze({ fixture: true });
      },
    },
    new CoreBaselineFixtureFactory().create(),
  );
  const report = await runner.run();

  assert.equal(report.schemaVersion, 2);
  assert.deepEqual(
    measured.map((scenario) => scenario.name),
    Object.values(coreBaseline.scenarios).map((scenario) => scenario.name),
  );
  assert.equal(measured[0]?.checksum, measured[1]?.checksum);
  assert.equal(measured[2]?.checksum, 10);
  assert.equal(measured[3]?.checksum, 34);
  assert.equal(measured[4]?.checksum, 42);
  assert.equal(measured[5]?.checksum, 42);
  assert.deepEqual(report.distribution, { packagePath: "packages/core" });
});

test("prepares explicit Import benchmark fixtures outside timed work", () => {
  const fixtures = new ImportBaselineFixtureFactory().create();

  assert.ok(Object.isFrozen(fixtures));
  assert.ok(Object.isFrozen(fixtures.batchRequests));
  assert.ok(Object.isFrozen(fixtures.largeBatchRequests));
  assert.ok(Object.isFrozen(fixtures.definitionRequest.draft));
  assert.ok(Object.isFrozen(fixtures.emissionRequest.definition));
  assert.equal(fixtures.sizes.batchSize, importBaseline.batchSize);
  assert.equal(fixtures.batchRequests.length, importBaseline.batchSize);
  assert.equal(
    fixtures.largeBatchRequests.length,
    importBaseline.scales.largeBatchSize,
  );
  assert.ok(fixtures.sizes.minimalSourceBytes > 0);
  assert.ok(
    fixtures.sizes.editorSourceBytes > fixtures.sizes.minimalSourceBytes,
  );
  assert.ok(fixtures.sizes.rejectedSourceBytes > 0);
  assert.equal(
    fixtures.sizes.mediumSourceElements,
    importBaseline.scales.mediumSourceElements,
  );
  assert.equal(
    fixtures.sizes.largeSourceElements,
    importBaseline.scales.largeSourceElements,
  );
  assert.ok(
    fixtures.sizes.largeSourceBytes > fixtures.sizes.mediumSourceBytes,
  );
});

test("runs the complete Import scenario matrix through public operations", async () => {
  const measured = [];
  const fixtures = new ImportBaselineFixtureFactory().create();
  const runner = new ImportBaselineRunner(
    {
      measure(scenario) {
        const result = Object.freeze({
          name: scenario.name,
          checksum: scenario.execute(2),
        });
        measured.push(result);
        return result;
      },
      methodology() {
        return Object.freeze({ fixture: true });
      },
    },
    {
      async inspect(packagePath) {
        return Object.freeze({ packagePath });
      },
    },
    {
      environment() {
        return Object.freeze({ fixture: true });
      },
    },
    fixtures,
  );
  const report = await runner.run();

  assert.equal(report.schemaVersion, 2);
  assert.deepEqual(
    measured.map((scenario) => scenario.name),
    Object.values(importBaseline.scenarios).map((scenario) => scenario.name),
  );
  assert.ok(measured.every((scenario) => scenario.checksum !== 0));
  assert.deepEqual(report.fixtures, fixtures.sizes);
  assert.deepEqual(report.distribution, { packagePath: "packages/import" });
});

test("prepares independent immutable SVG benchmark fixtures", () => {
  const fixtures = new SvgBaselineFixtureFactory().create();

  assert.ok(Object.isFrozen(fixtures));
  assert.ok(Object.isFrozen(fixtures.minimalDefinition));
  assert.ok(Object.isFrozen(fixtures.primitivesDefinition));
  assert.ok(Object.isFrozen(fixtures.corpusDefinitions));
  assert.ok(Object.isFrozen(fixtures.overrideDefinition));
  assert.ok(Object.isFrozen(fixtures.rtlDefinition));
  assert.ok(Object.isFrozen(fixtures.escapingDefinition));
  assert.ok(Object.isFrozen(fixtures.pointSequenceDefinition));
  assert.ok(Object.isFrozen(fixtures.semanticOptions));
  assert.ok(Object.isFrozen(fixtures.overrideOptions));
  assert.ok(Object.isFrozen(fixtures.rtlOptions));
  assert.ok(Object.isFrozen(fixtures.escapingOptions));
  assert.equal(fixtures.minimalDefinition.nodes.length, 1);
  assert.equal(fixtures.primitivesDefinition.nodes.length, 7);
  assert.ok(fixtures.corpusDefinitions.length > 0);
  assert.equal(fixtures.pointSequenceDefinition.nodes[0]?.kind, "polyline");
  assert.equal(fixtures.pointSequenceDefinition.nodes[0]?.points.length, 128);
});

test("runs the complete SVG scenario matrix through public values", async () => {
  const measured = [];
  const runner = new SvgBaselineRunner(
    {
      measure(scenario) {
        const result = Object.freeze({
          name: scenario.name,
          checksum: scenario.execute(2),
        });
        measured.push(result);
        return result;
      },
      methodology() {
        return Object.freeze({ fixture: true });
      },
    },
    {
      async inspect(packagePath) {
        return Object.freeze({ packagePath });
      },
    },
    {
      environment() {
        return Object.freeze({ fixture: true });
      },
    },
    new SvgBaselineFixtureFactory().create(),
  );
  const report = await runner.run();

  assert.equal(report.schemaVersion, 1);
  assert.deepEqual(
    measured.map((scenario) => scenario.name),
    Object.values(svgBaseline.scenarios).map((scenario) => scenario.name),
  );
  assert.ok(measured.every((scenario) => scenario.checksum !== 0));
  assert.deepEqual(report.distribution, { packagePath: "packages/svg" });
});

test("aggregates synchronous timing without suspending its measurement path", async () => {
  const clock = [0n, 20n, 100n, 140n, 200n, 260n];
  const heap = [100, 120, 200, 180, 300, 360];
  let collections = 0;
  let availabilityChecks = 0;
  const executions = [];
  const runner = new BenchmarkRunner(
    {
      assertAvailable() {
        availabilityChecks += 1;
      },
      collectGarbage() {
        collections += 1;
      },
      now() {
        return clock.shift();
      },
      heapUsed() {
        return heap.shift();
      },
      environment() {
        return Object.freeze({});
      },
    },
    new NumericSampleStatistics(),
    { warmupOperations: 3, sampleCount: 3 },
  );

  const resultPromise = runner.measure({
    name: "fixture.operation",
    operationsPerSample: 2,
    execute(iterations) {
      executions.push(iterations);
      return executions.length;
    },
  });
  assert.deepEqual(executions, [3, 2, 2, 2]);

  const result = await resultPromise;

  assert.deepEqual(result, {
    name: "fixture.operation",
    operationsPerSample: 2,
    medianNanosecondsPerOperation: 20,
    minimumNanosecondsPerOperation: 10,
    maximumNanosecondsPerOperation: 30,
    medianHeapGrowthBytesPerOperation: 10,
    checksum: 4,
  });
  assert.equal(availabilityChecks, 1);
  assert.equal(collections, 3);
  assert.deepEqual(runner.methodology(), {
    sampleCount: 3,
    warmupOperations: 3,
    timing: "median high-resolution elapsed nanoseconds per operation",
    memory:
      "median non-negative heap growth bytes per operation after forced pre-sample collection",
  });
});

test("aggregates asynchronous timing and heap samples without overlapping scenarios", async () => {
  const clock = [0n, 20n, 100n, 140n];
  const heap = [100, 120, 200, 180];
  const executions = [];
  const runner = new BenchmarkRunner(
    {
      assertAvailable() {},
      collectGarbage() {},
      now() {
        return clock.shift();
      },
      heapUsed() {
        return heap.shift();
      },
      environment() {
        return Object.freeze({});
      },
    },
    new NumericSampleStatistics(),
    { warmupOperations: 3, sampleCount: 2 },
  );

  const result = await runner.measure({
    name: "fixture.async-operation",
    operationsPerSample: 2,
    async execute(iterations) {
      executions.push(iterations);
      await Promise.resolve();
      return executions.length;
    },
  });

  assert.deepEqual(result, {
    name: "fixture.async-operation",
    operationsPerSample: 2,
    medianNanosecondsPerOperation: 15,
    minimumNanosecondsPerOperation: 10,
    maximumNanosecondsPerOperation: 20,
    medianHeapGrowthBytesPerOperation: 5,
    checksum: 3,
  });
  assert.deepEqual(executions, [3, 2, 2]);
});

test("prepares immutable CLI benchmark fixtures", () => {
  const fixtures = new CliBaselineFixtureFactory().create();

  assert.ok(Object.isFrozen(fixtures));
  assert.ok(Object.isFrozen(fixtures.icon));
  assert.ok(Object.isFrozen(fixtures.context));
  assert.ok(Object.isFrozen(fixtures.builtInContext));
  assert.ok(Object.isFrozen(fixtures.invocations));
  assert.ok(Object.isFrozen(fixtures.arguments));
  assert.equal(fixtures.invocations.exportIcon.identity, "aster/arrow-left");
  assert.equal(fixtures.context.catalogues[0]?.identity, "fixture");
});

test("runs the complete CLI scenario matrix through explicit runners", async () => {
  const synchronous = [];
  const asynchronous = [];
  const cold = [];
  const runner = new CliBaselineRunner(
    {
      measure(scenario) {
        const result = Object.freeze({
          name: scenario.name,
          checksum: scenario.execute(2),
        });
        synchronous.push(result);
        return result;
      },
      methodology() {
        return Object.freeze({ fixture: "synchronous" });
      },
    },
    {
      async measure(scenario) {
        const result = Object.freeze({
          name: scenario.name,
          checksum: await scenario.execute(2),
        });
        asynchronous.push(result);
        return result;
      },
      methodology() {
        return Object.freeze({ fixture: "asynchronous" });
      },
    },
    {
      measure(scenario) {
        const result = Object.freeze({ name: scenario.name });
        cold.push(result);
        return result;
      },
    },
    {
      async inspect(packagePath) {
        return Object.freeze({ packagePath });
      },
    },
    {
      environment() {
        return Object.freeze({ fixture: true });
      },
    },
    new CliBaselineFixtureFactory().create(),
    "fixture/aster.js",
  );
  const report = await runner.run();

  assert.equal(report.schemaVersion, 1);
  assert.deepEqual(
    synchronous.map((scenario) => scenario.name),
    Object.values(cliBaseline.scenarios).map((scenario) => scenario.name),
  );
  assert.deepEqual(
    asynchronous.map((scenario) => scenario.name),
    Object.values(cliBaseline.asyncScenarios).map((scenario) => scenario.name),
  );
  assert.deepEqual(
    cold.map((scenario) => scenario.name),
    Object.values(cliBaseline.coldScenarios).map((scenario) => scenario.name),
  );
  assert.ok(synchronous.every((scenario) => scenario.checksum !== 0));
  assert.ok(asynchronous.every((scenario) => scenario.checksum !== 0));
  assert.deepEqual(report.distribution, { packagePath: "packages/cli" });
});

test("measures cold CLI processes only after validating their contract", () => {
  const timings = [30, 10, 20];
  const runner = new CliColdStartRunner(
    {
      execute(request) {
        return Object.freeze({
          elapsedNanoseconds: timings.shift(),
          status: 0,
          stdout: request.stdout,
          stderr: "",
        });
      },
    },
    new NumericSampleStatistics(),
    3,
  );

  assert.deepEqual(
    runner.measure({
      name: "fixture.cold",
      arguments: Object.freeze([]),
      stdout: "ready\n",
    }),
    {
      name: "fixture.cold",
      samples: 3,
      medianNanoseconds: 20,
      minimumNanoseconds: 10,
      maximumNanoseconds: 30,
      stdoutBytes: 6,
    },
  );
});

test("inspects an isolated emitted-package fixture deterministically", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-distribution-inspector-"));
  const fileSystem = new NodeRepositoryFileSystem();
  const paths = new RepositoryPathResolver();
  const inspector = new PackageDistributionInspector(
    fileSystem,
    new RepositoryJsonReader(fileSystem),
    paths,
    new RepositoryFileWalker(fileSystem, paths),
  );
  const moduleSource = "export const fixture = true;\n";
  const declarationSource = "export declare const fixture: true;\n";

  try {
    await mkdir(resolve(root, "dist", "nested"), { recursive: true });
    await writeFile(
      resolve(root, "package.json"),
      JSON.stringify({
        exports: { "./zeta": "./dist/zeta.js", ".": "./dist/index.js" },
        sideEffects: false,
      }),
      "utf8",
    );
    await writeFile(resolve(root, "dist", "index.js"), moduleSource, "utf8");
    await writeFile(
      resolve(root, "dist", "nested", "index.d.ts"),
      declarationSource,
      "utf8",
    );
    await writeFile(resolve(root, "dist", "ignored.map"), "{}\n", "utf8");

    assert.deepEqual(await inspector.inspect(root), {
      files: 3,
      bytes:
        Buffer.byteLength(moduleSource)
        + Buffer.byteLength(declarationSource)
        + Buffer.byteLength("{}\n"),
      moduleFiles: 1,
      moduleBytes: Buffer.byteLength(moduleSource),
      declarationFiles: 1,
      declarationBytes: Buffer.byteLength(declarationSource),
      exports: [".", "./zeta"],
      sideEffects: false,
      type: undefined,
      main: undefined,
      types: undefined,
      bin: undefined,
      engines: undefined,
      dependencies: undefined,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
