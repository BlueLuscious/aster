import assert from "node:assert/strict";
import test from "node:test";
import { AsterCommands } from "../../src/index.js";
import type { CatalogueProvider } from "../../src/catalogue/contracts/index.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../src/command/types/index.js";
import { CommandOutputPresenter } from "../../src/shell/presentation/runtime/command-output.presenter.js";
import { ExportHumanOutputPresenter } from "../../src/shell/presentation/runtime/export-human-output.presenter.js";
import { HelpHumanOutputPresenter } from "../../src/shell/presentation/runtime/help-human-output.presenter.js";
import { HumanTextFormatter } from "../../src/shell/presentation/runtime/human-text.formatter.js";

function fixture(
  count: number,
  options: { tags?: readonly string[]; displayName?: string } = {},
) {
  const identity = { namespace: "testing", name: "set" };
  const members = Array.from({ length: count }, (_, index) => ({
    namespace: "testing",
    name: `icon-${String(count - index).padStart(4, "0")}`,
    variant: "outline",
  }));
  const metadata = {
    displayName: options.displayName ?? "Set",
    ...(options.tags === undefined ? {} : { tags: options.tags }),
  };
  const calls = { icons: 0, collections: 0 };
  const provider: CatalogueProvider = {
    identity: "testing",
    async discover() {
      return {
        icons: members.map((member) => ({
          identity: member,
          metadata: { ...metadata, rtl: "preserve", deprecated: false },
          memberships: [identity],
        })),
        collections: [{ identity, metadata, memberIdentities: members }],
      };
    },
    async loadIcon() {
      calls.icons += 1;
      throw new Error("Unexpected artwork load during human presentation");
    },
    async loadCollection() {
      calls.collections += 1;
      throw new Error("Unexpected collection load during human presentation");
    },
  };
  return {
    members,
    calls,
    execute(invocation: AsterCommandInvocationType) {
      return AsterCommands.execute(invocation, {
        catalogues: [provider],
        productName: "Aster",
        productVersion: "0.1.1",
      });
    },
  };
}

function present(result: AsterCommandResultType): string {
  assert.ok(result.ok);
  const original = JSON.stringify(result);
  const presenter = new CommandOutputPresenter();
  const human = presenter.present(result, false);
  assert.deepEqual(presenter.present(result, true), {
    stdout: `${original}\n`,
    stderr: "",
    exitCode: 0,
  });
  assert.equal(JSON.stringify(result), original);
  assert.equal(human.stderr, "");
  assert.equal(human.exitCode, 0);
  assert.equal(human.stdout.endsWith("\n\n"), false);
  assert.equal(human.stdout.endsWith("\n"), true);
  assert.doesNotMatch(human.stdout, /\t|\r|\u001b| +\n/u);
  return human.stdout;
}

test("presents all collection members vertically in declared order at zero, small and large counts", async () => {
  for (const count of [0, 1, 2, 10, 100, 1000]) {
    const source = fixture(count);
    const result = await source.execute({
      command: "show",
      subject: "collection",
      identity: "testing/set",
    });
    assert.ok(result.ok && result.payload.kind === "collection-show");
    assert.deepEqual(
      result.payload.collection.memberIdentities,
      source.members,
    );
    const expected = source.members.map(
      (identity) => `  testing/${identity.name}@outline`,
    );
    assert.equal(
      present(result),
      [
        "Collection: testing/set",
        "Catalogue: testing",
        "Display name: Set",
        "Tags:",
        "  (none)",
        "Icons:",
        ...(expected.length === 0 ? ["  (none)"] : expected),
        "",
      ].join("\n"),
    );
    assert.deepEqual(source.calls, { icons: 0, collections: 0 });
  }
});

test("uses the same empty tag marker without conflating absent and empty structured fields", async () => {
  for (const options of [{}, { tags: [] }, { tags: ["alpha", "zeta"] }]) {
    const source = fixture(1, options);
    for (const subject of ["icon", "collection"] as const) {
      const result = await source.execute({
        command: "show",
        subject,
        identity:
          subject === "icon" ? "testing/icon-0001@outline" : "testing/set",
      });
      assert.ok(result.ok);
      const output = present(result);
      assert.ok(
        output.includes(
          "tags" in options && options.tags.length > 0
            ? "Tags:\n  alpha\n  zeta\n"
            : "Tags:\n  (none)\n",
        ),
      );
      if (
        result.payload.kind === "icon-show" ||
        result.payload.kind === "collection-show"
      ) {
        const metadata =
          result.payload.kind === "icon-show"
            ? result.payload.icon.metadata
            : result.payload.collection.metadata;
        assert.equal(Object.hasOwn(metadata, "tags"), "tags" in options);
      }
    }
  }
});

test("nests complete membership sequences in icon lists, glyph details and filtered search", async () => {
  const source = fixture(1, { tags: ["testing"] });
  const summary = "testing/icon-0001@outline [testing] - Set";
  const members = "    Collections:\n      testing/set";
  const cases: readonly [AsterCommandInvocationType, string][] = [
    [
      { command: "list", subject: "icons" },
      `Icons:\n  ${summary}\n${members}\n`,
    ],
    [
      {
        command: "list",
        subject: "icons",
        glyph: "testing/icon-0001",
        collection: "testing/set",
        tags: ["testing"],
      },
      `Icons:\n  ${summary}\n${members}\n`,
    ],
    [
      { command: "show", subject: "glyph", identity: "testing/icon-0001" },
      `Glyph: testing/icon-0001\nCatalogue: testing\nVariants:\n  ${summary}\n${members}\n`,
    ],
    [
      { command: "search", query: "icon-0001" },
      `Results:\n  icon: ${summary}\n${members}\n`,
    ],
    [
      { command: "list", subject: "glyphs" },
      "Glyphs:\n  testing/icon-0001 [testing] (1 variant)\n    Variants:\n      outline\n",
    ],
  ];
  for (const [invocation, expected] of cases) {
    assert.equal(present(await source.execute(invocation)), expected);
  }
  assert.deepEqual(source.calls, { icons: 0, collections: 0 });
});

test("preserves compact collection and catalogue summaries and explicit empty result sequences", async () => {
  const source = fixture(2);
  assert.equal(
    present(await source.execute({ command: "list", subject: "catalogues" })),
    "Catalogues:\n  testing (2 icons, 1 collection)\n",
  );
  assert.equal(
    present(await source.execute({ command: "list", subject: "collections" })),
    "Collections:\n  testing/set [testing] - Set (2 icons)\n",
  );
  assert.equal(
    present(await source.execute({ command: "search", query: "not-present" })),
    "Results:\n  (none)\n",
  );
  assert.equal(
    present(
      await source.execute({
        command: "list",
        subject: "icons",
        tags: ["absent"],
      }),
    ),
    "Icons:\n  (none)\n",
  );
});

test("represents control-bearing names visibly while preserving Unicode, long names and original JSON", async () => {
  const controls = [
    ...Array.from({ length: 32 }, (_, index) => index),
    ...Array.from({ length: 33 }, (_, index) => index + 127),
    0x2028,
    0x2029,
  ];
  const formatter = new HumanTextFormatter();
  for (const code of controls) {
    const displayName = `Camera${String.fromCodePoint(code)}Outline`;
    const source = fixture(1, { displayName });
    for (const invocation of [
      {
        command: "show",
        subject: "icon",
        identity: "testing/icon-0001@outline",
      },
      { command: "show", subject: "collection", identity: "testing/set" },
      { command: "list", subject: "icons" },
      { command: "list", subject: "collections" },
      { command: "show", subject: "glyph", identity: "testing/icon-0001" },
      { command: "search", query: "icon-0001" },
    ] as const) {
      const result = await source.execute(invocation);
      const output = present(result);
      assert.ok(output.includes(formatter.value(displayName)));
      assert.doesNotMatch(
        output,
        /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u2028\u2029]/u,
      );
      assert.ok(
        JSON.stringify(result).includes(
          JSON.stringify(displayName).slice(1, -1),
        ),
      );
    }
  }
  for (const displayName of [
    "C\u00e1mara \u65e5\u672c",
    "x".repeat(4096),
    "C:\\icons\\camera",
  ]) {
    const source = fixture(1, { displayName });
    assert.ok(
      present(
        await source.execute({ command: "list", subject: "icons" }),
      ).includes(displayName),
    );
  }
});

test("indents every structural line without altering the text formatter's input", () => {
  const formatter = new HumanTextFormatter();
  const entry = "camera\n  Collections:\n    testing/set";
  assert.equal(
    formatter.sequence("Icons", [entry]),
    "Icons:\n  camera\n    Collections:\n      testing/set",
  );
  assert.equal(formatter.sequence("Icons", []), "Icons:\n  (none)");
  assert.equal(entry, "camera\n  Collections:\n    testing/set");
});

test("indents independent dependency roots and separates optional location by one blank line", async () => {
  const context = {
    catalogues: [],
    productName: "Aster",
    productVersion: "0.1.1",
    packageDependencies: {
      source: "project" as const,
      groups: [
        {
          root: { name: "@luscious-garden/aster-core", version: "0.1.1" },
          dependencies: [],
        },
        {
          root: { name: "@luscious-garden/aster-icons", version: "0.2.0" },
          dependencies: [
            { name: "@luscious-garden/aster-core", version: "0.1.1" },
          ],
        },
      ],
    },
  };
  const result = await AsterCommands.execute(
    { command: "version", scope: "all", dependencies: true },
    context,
  );
  assert.equal(
    present(result),
    "Project Aster package dependencies:\n  @luscious-garden/aster-core 0.1.1\n    (none)\n\n  @luscious-garden/aster-icons 0.2.0\n    @luscious-garden/aster-core 0.1.1\n",
  );
  for (const projectCli of [
    "same",
    "different",
    "absent",
    "no-project",
    "unavailable",
  ] as const) {
    const located = await AsterCommands.execute(
      { command: "version", location: true },
      {
        catalogues: [],
        productName: "Aster",
        productVersion: "0.1.1",
        cliLocation: { entrypoint: "C:\\aster\\cli.js", projectCli },
      },
    );
    assert.match(
      present(located),
      /^Aster 0\.1\.1\n\nCLI module: C:\\aster\\cli\.js\nProject CLI: [^\n]+\n$/u,
    );
  }
});

test("escapes accepted product and location text while preserving empty dependency groups", async () => {
  const result = await AsterCommands.execute(
    { command: "version", location: true },
    {
      catalogues: [],
      productName: "As\nter",
      productVersion: "version\tvalue",
      cliLocation: { entrypoint: "C:\\aster\ncli.js", projectCli: "same" },
    },
  );
  assert.equal(
    present(result),
    '"As\\nter" "version\\tvalue"\n\nCLI module: "C:\\\\aster\\ncli.js"\nProject CLI: same installation as the project CLI\n',
  );
  const empty = await AsterCommands.execute(
    { command: "version", scope: "all", dependencies: true },
    {
      catalogues: [],
      productName: "Aster",
      productVersion: "0.1.1",
      packageDependencies: { source: "project", groups: [] },
    },
  );
  assert.equal(
    present(empty),
    "Project Aster package dependencies:\n  (none)\n",
  );
});

test("escapes help metadata without changing its established description and usage hierarchy", () => {
  assert.equal(
    new HelpHumanOutputPresenter().present([
      {
        name: "show",
        summary: "Show\nvalues",
        usage: ["show\ticon"],
      },
    ]),
    'Aster commands:\n  show: "Show\\nvalues"\n    aster "show\\ticon"\nPresentation:\n  --json  Emit one JSON result document.',
  );
});

test("escapes publication destinations and retains raw SVG, empty output and replacement distinctions", () => {
  const presenter = new CommandOutputPresenter();
  const targetRoot = "C:\\icons\\exports\nnext";
  for (const count of [0, 1, 2]) {
    const publication = presenter.presentPublication({
      targetRoot,
      artefactCount: count,
      committed: count !== 0,
    });
    assert.equal(
      publication.stdout,
      count === 0
        ? 'No SVG artefacts were published; output root was not created: "C:\\\\icons\\\\exports\\nnext"\n'
        : `Exported ${count} SVG artefact${count === 1 ? "" : "s"} to "C:\\\\icons\\\\exports\\nnext"\n`,
    );
    assert.equal(publication.stderr, "");
    assert.equal(publication.exitCode, 0);
  }
  for (const replaced of [false, true]) {
    assert.equal(
      presenter.presentReviewPublication({ targetRoot, replaced }).stdout,
      `${replaced ? "Replaced Aster review at" : "Published Aster review to"} "C:\\\\icons\\\\exports\\nnext"\n`,
    );
  }
  const content = "<svg>\n  <text>Camera</text>\n</svg>";
  assert.equal(
    new ExportHumanOutputPresenter().plan({
      target: "svg",
      subject: "icon",
      catalogue: "testing",
      identity: "camera@outline",
      artefacts: [{ path: "camera.svg", mediaType: "image/svg+xml", content }],
    }),
    content,
  );
});
