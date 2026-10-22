import assert from "node:assert/strict";
import test from "node:test";
import { AsterCommands } from "../../src/index.js";
import type { CatalogueProvider } from "../../src/catalogue/contracts/index.js";
import { CommandDiagnosticFactory } from "../../src/command/runtime/command-diagnostic.factory.js";
import { commandDiagnosticSchema } from "../../src/command/constants/command-diagnostic-schema.constant.js";
import { CommandResultFactory } from "../../src/command/runtime/command-result.factory.js";
import type {
  AsterCommandDiagnosticType,
  AsterCommandInvocationType,
} from "../../src/command/types/index.js";
import { CommandOutputPresenter } from "../../src/shell/presentation/runtime/command-output.presenter.js";
import { HumanTextFormatter } from "../../src/shell/presentation/runtime/human-text.formatter.js";

function fixture(identity = "alpha") {
  const calls = { icons: 0, collections: 0 };
  const provider: CatalogueProvider = {
    identity,
    async discover() {
      return {
        icons: [
          {
            identity: {
              namespace: "example",
              name: "camera",
              variant: "outline",
            },
            metadata: {
              displayName: "Camera",
              rtl: "preserve",
              deprecated: false,
            },
            memberships: [],
          },
        ],
        collections: [],
      };
    },
    async loadIcon() {
      calls.icons += 1;
      throw new Error("Unexpected icon load during diagnostic discovery");
    },
    async loadCollection() {
      calls.collections += 1;
      throw new Error("Unexpected collection load during diagnostic discovery");
    },
  };
  return { provider, calls };
}

function context(providers: readonly CatalogueProvider[]) {
  return {
    catalogues: providers,
    productName: "Aster",
    productVersion: "0.1.1",
  };
}

function assertFrozen(value: unknown) {
  if (typeof value === "object" && value !== null) {
    assert.ok(Object.isFrozen(value));
    for (const child of Object.values(value)) {
      assertFrozen(child);
    }
  }
}

function assertPresentation(
  diagnostic: AsterCommandDiagnosticType,
  lines: readonly string[],
  exitCode = 1,
) {
  const presenter = new CommandOutputPresenter();
  const result = new CommandResultFactory().failure("show", diagnostic);
  const original = JSON.stringify(result);
  const human = presenter.present(result, false);
  const json = presenter.present(result, true);
  assert.deepEqual(human, {
    stdout: "",
    stderr: `${lines.join("\n")}\n`,
    exitCode,
  });
  assert.deepEqual(json, { stdout: `${original}\n`, stderr: "", exitCode });
  assert.deepEqual(JSON.parse(json.stdout), result);
  assert.equal(JSON.stringify(result), original);
  assert.equal(Object.hasOwn(diagnostic, "related"), false);
  assertFrozen(result);
  assert.ok(Object.isFrozen(human));
  assert.ok(Object.isFrozen(json));
}

test("labels real lookup subjects under Details without parsing messages or loading definitions", async () => {
  const source = fixture();
  const cases: readonly [
    AsterCommandInvocationType,
    string,
    string,
    string,
    string,
  ][] = [
    [
      { command: "show", subject: "icon", identity: "camera@outline" },
      "identity",
      "camera@outline",
      "icon",
      "Icon",
    ],
    [
      { command: "show", subject: "icon", identity: "example/missing@outline" },
      "identity",
      "example/missing@outline",
      "icon",
      "Icon",
    ],
    [
      { command: "show", subject: "glyph", identity: "example/missing" },
      "identity",
      "example/missing",
      "glyph",
      "Glyph",
    ],
    [
      { command: "show", subject: "collection", identity: "missing" },
      "identity",
      "missing",
      "collection",
      "Collection",
    ],
    [
      { command: "list", subject: "icons", catalogue: "missing" },
      "catalogue",
      "missing",
      "catalogue",
      "Catalogue",
    ],
    [
      { command: "list", subject: "icons", collection: "missing" },
      "collection",
      "missing",
      "collection",
      "Collection",
    ],
    [
      { command: "list", subject: "icons", glyph: "example/missing" },
      "glyph",
      "example/missing",
      "glyph",
      "Glyph",
    ],
    [
      { command: "search", query: "camera", collection: "missing" },
      "collection",
      "missing",
      "collection",
      "Collection",
    ],
    [
      {
        command: "export",
        subject: "icon",
        identity: "example/missing@outline",
      },
      "identity",
      "example/missing@outline",
      "icon",
      "Icon",
    ],
    [
      { command: "review", subject: "collection", identity: "missing" },
      "identity",
      "missing",
      "collection",
      "Collection",
    ],
  ];
  for (const [invocation, family, identity, subject, label] of cases) {
    const result = await AsterCommands.execute(
      invocation,
      context([source.provider]),
    );
    assert.ok(!result.ok);
    const message = `${family} ${identity} was not found`;
    assert.deepEqual(result.diagnostic, {
      category: "not-found",
      code: "ASTER-CLI-004",
      message,
      details: { kind: "lookup", subject, identity },
    });
    assertPresentation(result.diagnostic, [
      `[ASTER-CLI-004] ${message}`,
      "Details:",
      `  ${label}: ${identity}`,
    ]);
  }
  assert.deepEqual(source.calls, { icons: 0, collections: 0 });
});

test("retains real ambiguous providers in canonical order with correctly nested labels", async () => {
  const alpha = fixture("alpha");
  const beta = fixture("beta");
  const result = await AsterCommands.execute(
    { command: "show", subject: "icon", identity: "example/camera@outline" },
    context([beta.provider, alpha.provider]),
  );
  assert.ok(!result.ok);
  assert.deepEqual(result.diagnostic.details, {
    kind: "ambiguity",
    subject: "icon",
    identity: "example/camera@outline",
    catalogues: ["alpha", "beta"],
  });
  assertPresentation(result.diagnostic, [
    "[ASTER-CLI-005] identity example/camera@outline is available from multiple catalogues",
    "Details:",
    "  Icon: example/camera@outline",
    "  Catalogues:",
    "    alpha",
    "    beta",
  ]);
  assert.deepEqual(alpha.calls, { icons: 0, collections: 0 });
  assert.deepEqual(beta.calls, { icons: 0, collections: 0 });
});

test("retains repeated received providers instead of deduplicating conflict evidence", async () => {
  const result = await AsterCommands.execute(
    { command: "list", subject: "catalogues" },
    context([
      fixture("zeta").provider,
      fixture("alpha").provider,
      fixture("zeta").provider,
    ]),
  );
  assert.ok(!result.ok);
  assert.deepEqual(result.diagnostic.details, {
    kind: "catalogues",
    catalogues: ["zeta", "alpha", "zeta"],
  });
  assertPresentation(result.diagnostic, [
    "[ASTER-CLI-003] catalogue provider identities must be unique",
    "Details:",
    "  Catalogues:",
    "    zeta",
    "    alpha",
    "    zeta",
  ]);
});

test("uses structured roles regardless of headline wording and preserves all eight detail shapes", () => {
  const cases: readonly [AsterCommandDiagnosticType, readonly string[]][] = [
    [
      {
        category: "catalogue-conflict",
        code: "ASTER-CLI-003",
        message: "Conflict",
        details: { kind: "catalogues", catalogues: ["beta", "alpha", "beta"] },
      },
      ["  Catalogues:", "    beta", "    alpha", "    beta"],
    ],
    [
      {
        category: "catalogue-conflict",
        code: "ASTER-CLI-003",
        message: "Conflict",
        details: { kind: "catalogue", catalogue: "alpha" },
      },
      ["  Catalogue: alpha"],
    ],
    [
      {
        category: "not-found",
        code: "ASTER-CLI-004",
        message: "Different wording",
        details: {
          kind: "lookup",
          subject: "glyph",
          identity: "example/camera",
        },
      },
      ["  Glyph: example/camera"],
    ],
    [
      {
        category: "ambiguous",
        code: "ASTER-CLI-005",
        message: "Ambiguous",
        details: {
          kind: "ambiguity",
          subject: "collection",
          identity: "set",
          catalogues: ["beta", "alpha"],
        },
      },
      ["  Collection: set", "  Catalogues:", "    beta", "    alpha"],
    ],
    [
      {
        category: "catalogue-unavailable",
        code: "ASTER-CLI-006",
        message: "Unavailable",
        details: { kind: "catalogue", catalogue: "alpha" },
      },
      ["  Catalogue: alpha"],
    ],
    [
      {
        category: "catalogue-unavailable",
        code: "ASTER-CLI-006",
        message: "Unavailable",
        details: {
          kind: "definition",
          catalogue: "alpha",
          selection: { kind: "icon", identity: "example/camera@outline" },
        },
      },
      ["  Catalogue: alpha", "  Icon: example/camera@outline"],
    ],
    [
      {
        category: "catalogue-unavailable",
        code: "ASTER-CLI-006",
        message: "Unavailable",
        details: {
          kind: "definition",
          catalogue: "alpha",
          selection: { kind: "collection", identity: "set" },
        },
      },
      ["  Catalogue: alpha", "  Collection: set"],
    ],
    [
      {
        category: "catalogue-unavailable",
        code: "ASTER-CLI-006",
        message: "Unavailable",
        details: {
          kind: "definition",
          catalogue: "alpha",
          selection: { kind: "collection", identity: "set" },
          member: "example/camera@outline",
        },
      },
      [
        "  Catalogue: alpha",
        "  Collection: set",
        "  Member icon: example/camera@outline",
      ],
    ],
    [
      {
        category: "render-failure",
        code: "ASTER-CLI-007",
        message: "Render failed",
        details: { kind: "export-render", path: "example/camera@outline.svg" },
      },
      ["  Artefact path: example/camera@outline.svg"],
    ],
    [
      {
        category: "render-failure",
        code: "ASTER-CLI-007",
        message: "Render failed",
        details: { kind: "review-render", icon: "example/camera@outline" },
      },
      ["  Icon: example/camera@outline"],
    ],
    [
      {
        category: "export-conflict",
        code: "ASTER-CLI-008",
        message: "Conflict",
        details: { kind: "path-conflict", path: "example/camera@outline.svg" },
      },
      ["  Artefact path: example/camera@outline.svg"],
    ],
  ];
  assert.deepEqual(
    new Set(
      cases.flatMap(([input]) =>
        input.details === undefined ? [] : [input.details.kind],
      ),
    ),
    new Set(Object.values(commandDiagnosticSchema.details)),
  );
  for (const [input, lines] of cases) {
    const diagnostic = new CommandDiagnosticFactory().create(input);
    assert.notEqual(diagnostic, input);
    assert.notEqual(diagnostic.details, input.details);
    assertPresentation(diagnostic, [
      `[${input.code}] ${input.message}`,
      "Details:",
      ...lines,
    ]);
  }
});

test("isolates nested selections and arrays without freezing caller-owned inputs", () => {
  const selection = { kind: "collection", identity: "set" } as const;
  const details = {
    kind: "definition",
    catalogue: "alpha",
    selection,
    member: "example/camera@outline",
  } as const;
  const diagnostic = new CommandDiagnosticFactory().create({
    category: "catalogue-unavailable",
    code: "ASTER-CLI-006",
    message: "Failure",
    details,
  });
  const catalogues = ["beta", "alpha", "beta"];
  const conflict = new CommandDiagnosticFactory().create({
    category: "catalogue-conflict",
    code: "ASTER-CLI-003",
    message: "Conflict",
    details: { kind: "catalogues", catalogues },
  });
  assert.notEqual(diagnostic.details, details);
  assert.equal(Object.isFrozen(details), false);
  assert.equal(Object.isFrozen(selection), false);
  assert.equal(Object.isFrozen(catalogues), false);
  Reflect.set(selection, "identity", "changed");
  Reflect.set(details, "member", "changed@outline");
  catalogues.push("changed");
  assert.deepEqual(diagnostic.details, {
    kind: "definition",
    catalogue: "alpha",
    selection: { kind: "collection", identity: "set" },
    member: "example/camera@outline",
  });
  assert.deepEqual(conflict.details, {
    kind: "catalogues",
    catalogues: ["beta", "alpha", "beta"],
  });
  assertFrozen(diagnostic);
  assertFrozen(conflict);
});

test("does not acquire inherited optional details or member accessors", () => {
  const keys = ["details", "member"];
  const previous = keys.map((key) =>
    Object.getOwnPropertyDescriptor(Object.prototype, key),
  );
  let reads = 0;
  try {
    for (const key of keys) {
      Object.defineProperty(Object.prototype, key, {
        configurable: true,
        get() {
          reads += 1;
          return "inherited";
        },
      });
    }
    const factory = new CommandDiagnosticFactory();
    assertPresentation(
      factory.create({
        category: "usage",
        code: "ASTER-CLI-001",
        message: "Usage",
      }),
      ["[ASTER-CLI-001] Usage"],
      2,
    );
    const diagnostic = factory.create({
      category: "catalogue-unavailable",
      code: "ASTER-CLI-006",
      message: "Failure",
      details: {
        kind: "definition",
        catalogue: "alpha",
        selection: { kind: "collection", identity: "set" },
      },
    });
    assertPresentation(diagnostic, [
      "[ASTER-CLI-006] Failure",
      "Details:",
      "  Catalogue: alpha",
      "  Collection: set",
    ]);
    assert.equal(reads, 0);
  } finally {
    for (const [index, key] of keys.entries()) {
      const descriptor = previous[index];
      if (descriptor === undefined) {
        Reflect.deleteProperty(Object.prototype, key);
      } else {
        Object.defineProperty(Object.prototype, key, descriptor);
      }
    }
  }
});

test("rejects ambiguity without distinct providers even at internal construction", () => {
  const factory = new CommandDiagnosticFactory();
  for (let size = 0; size < 24; size += 1) {
    const repeated: [string, string, ...string[]] = [
      "alpha",
      "alpha",
      ...Array<string>(size).fill("alpha"),
    ];
    assert.throws(
      () =>
        factory.create({
          category: "ambiguous",
          code: "ASTER-CLI-005",
          message: "Ambiguous",
          details: {
            kind: "ambiguity",
            subject: "icon",
            identity: "example/camera@outline",
            catalogues: repeated,
          },
        }),
      /distinct catalogue providers/u,
    );
    const candidates: [string, string, ...string[]] = [
      "alpha",
      "alpha",
      ...repeated,
      "beta",
    ];
    const accepted = factory.create({
      category: "ambiguous",
      code: "ASTER-CLI-005",
      message: "Ambiguous",
      details: {
        kind: "ambiguity",
        subject: "icon",
        identity: "example/camera@outline",
        catalogues: candidates,
      },
    });
    assert.deepEqual(accepted.details, {
      kind: "ambiguity",
      subject: "icon",
      identity: "example/camera@outline",
      catalogues: candidates,
    });
    assertFrozen(accepted);
  }
});

test("retains all no-detail code families without inventing context", () => {
  const cases: readonly AsterCommandDiagnosticType[] = [
    { category: "usage", code: "ASTER-CLI-001", message: "Usage" },
    { category: "usage", code: "ASTER-CLI-002", message: "Context" },
    { category: "output-conflict", code: "ASTER-CLI-009", message: "Conflict" },
    { category: "output-failure", code: "ASTER-CLI-010", message: "Failure" },
    {
      category: "version-unavailable",
      code: "ASTER-CLI-011",
      message: "Unavailable",
    },
    {
      category: "execution-failure",
      code: "ASTER-CLI-999",
      message: "Unexpected",
    },
  ];
  for (const input of cases) {
    const diagnostic = new CommandDiagnosticFactory().create(input);
    assert.equal(Object.hasOwn(diagnostic, "details"), false);
    assertPresentation(
      diagnostic,
      [`[${input.code}] ${input.message}`],
      input.category === "usage" ? 2 : 1,
    );
  }
});

test("escapes all approved controls in headlines and labelled values without changing JSON data", () => {
  const controls = [
    ...Array.from({ length: 32 }, (_, index) => index),
    ...Array.from({ length: 33 }, (_, index) => index + 127),
    0x2028,
    0x2029,
  ];
  const formatter = new HumanTextFormatter();
  for (const codePoint of controls) {
    const value = `before${String.fromCodePoint(codePoint)}after`;
    const diagnostic = new CommandDiagnosticFactory().create({
      category: "not-found",
      code: "ASTER-CLI-004",
      message: value,
      details: { kind: "lookup", subject: "icon", identity: value },
    });
    const printable = formatter.value(value);
    assert.equal(JSON.parse(printable), value);
    assert.doesNotMatch(printable, /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u);
    assertPresentation(diagnostic, [
      `[ASTER-CLI-004] ${printable}`,
      "Details:",
      `  Icon: ${printable}`,
    ]);
  }
});

test("preserves printable Unicode, Windows paths and literal escape text", () => {
  const formatter = new HumanTextFormatter();
  for (const value of [
    "Camera",
    "C:\\icons\\camera.svg",
    "C\u00e1mara \u65e5\u672c",
    "literal \\n text",
    'Camera "Outline"',
  ]) {
    assert.equal(formatter.value(value), value);
  }
  for (const value of [
    "Camera\nOutline",
    "Camera\tOutline",
    "Camera\rOutline",
    "Camera\u001b[31mRed",
    "Camera\u0085Outline",
    'C:\\icons\\"camera"\n',
  ]) {
    assert.equal(JSON.parse(formatter.value(value)), value);
  }
});
