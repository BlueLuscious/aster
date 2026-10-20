import assert from "node:assert/strict";
import test from "node:test";

import {
  Icon,
  IconDefinitionError,
  type IconDefinition,
  type IconRenderOptions,
} from "@luscious-garden/aster-core";
import { Svg, SvgRenderError } from "../../src/index.js";
import { SvgRenderOptionsNormaliser } from "../../src/render/runtime/svg-render-options.normaliser.js";

function createDefinition(): IconDefinition {
  return Icon.define({
    identity: { namespace: "testing", name: "option-isolation", variant: "outline" },
    viewBox: { minX: 0, minY: 0, width: 24, height: 16 },
    nodes: [{ kind: "rect", x: 2, y: 3, width: 12, height: 8 }],
    metadata: {
      displayName: "Option Isolation",
      rtl: "mirror",
      presentation: { defaults: {}, overrides: ["fill", "stroke", "strokeWidth"] },
      deprecated: false,
    },
  });
}

function probePrototype(
  field: string,
  descriptor: PropertyDescriptor,
  operation: () => unknown,
): { result: unknown; error: unknown } {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, field);
  let result: unknown;
  let error: unknown;

  Object.defineProperty(Object.prototype, field, { ...descriptor, configurable: true });
  try {
    result = operation();
  } catch (caught) {
    error = caught;
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, field);
    } else {
      Object.defineProperty(Object.prototype, field, previous);
    }
  }

  return { result, error };
}

const optionValues = [
  ["size", 32],
  ["colour", "#abc"],
  ["fill", "#123"],
  ["stroke", "#456"],
  ["strokeWidth", 3],
  ["label", "Own label"],
  ["title", "Own title"],
  ["decorative", true],
  ["direction", "rtl"],
] as const;

test("ignores inherited option getters for omitted, plain and null-prototype options", () => {
  const canonical = createDefinition();
  const expected = Svg.render(canonical);
  const options = [undefined, {}, Object.create(null) as IconRenderOptions];

  for (const definition of [canonical, structuredClone(canonical)]) {
    for (const candidate of options) {
      for (const [field, value] of optionValues) {
        let reads = 0;
        const probe = probePrototype(field, {
          get() {
            reads += 1;
            return value;
          },
        }, () => Svg.render(definition, candidate));

        assert.equal(probe.error, undefined, field);
        assert.equal(reads, 0, field);
        assert.equal(probe.result, expected, field);
      }
    }
  }
});

test("captures own option data without invoking inherited setters or getters", () => {
  const definition = createDefinition();

  for (const [field, value] of optionValues) {
    const options = { [field]: value } as IconRenderOptions;
    const expected = Svg.render(definition, options);
    let reads = 0;
    let writes = 0;
    const probe = probePrototype(field, {
      get() {
        reads += 1;
        return value;
      },
      set() {
        writes += 1;
      },
    }, () => Svg.render(definition, options));

    assert.equal(probe.error, undefined, field);
    assert.equal(reads, 0, field);
    assert.equal(writes, 0, field);
    assert.equal(probe.result, expected, field);
    assert.deepEqual(options, { [field]: value });
  }
});

test("captures own options despite inherited non-writable data fields", () => {
  const definition = createDefinition();
  const options = { size: 32, label: "Own label" };
  const expected = Svg.render(definition, options);

  for (const field of ["size", "label"]) {
    const probe = probePrototype(field, { value: "inherited", writable: false }, () =>
      Svg.render(definition, options),
    );

    assert.equal(probe.error, undefined, field);
    assert.equal(probe.result, expected, field);
  }
});

test("ignores absent viewport-policy fields inherited by canonical definitions", () => {
  const canonical = createDefinition();

  for (const definition of [canonical, structuredClone(canonical)]) {
    for (const options of [undefined, { size: 8 }]) {
      const expected = Svg.render(definition, options);
      for (const field of ["defaultSize", "minimumSize"]) {
        let reads = 0;
        const probe = probePrototype(field, {
          get() {
            reads += 1;
            return 64;
          },
        }, () => Svg.render(definition, options));

        assert.equal(probe.error, undefined, field);
        assert.equal(reads, 0, field);
        assert.equal(probe.result, expected, field);
      }
    }
  }
});

test("does not serialise inherited optional rectangle radii", () => {
  const canonical = createDefinition();
  const expected = Svg.render(canonical);

  for (const definition of [canonical, structuredClone(canonical)]) {
    for (const field of ["radiusX", "radiusY"]) {
      let reads = 0;
      const probe = probePrototype(field, {
        get() {
          reads += 1;
          return 2;
        },
      }, () => Svg.render(definition));

      assert.equal(probe.error, undefined, field);
      assert.equal(reads, 0, field);
      assert.equal(probe.result, expected, field);
    }
  }
});

test("represents resolved context absences as immutable own data", () => {
  const context = new SvgRenderOptionsNormaliser().normalise(createDefinition(), undefined);
  assert.ok(Object.isFrozen(context));
  assert.ok(Object.isFrozen(context.presentationOverrides));

  for (const field of ["colour", "accessibleName", "title"] as const) {
    assert.ok(Object.hasOwn(context, field), field);
    assert.equal(context[field], undefined, field);
  }
});

test("revalidates captured option data without caching a mutable caller record", () => {
  const definition = createDefinition();
  const options = { size: 32 };
  assert.match(Svg.render(definition, options), / width="32" height="32"/u);
  options.size = 16;
  assert.match(Svg.render(definition, options), / width="16" height="16"/u);
  options.size = 0;
  assert.throws(() => Svg.render(definition, options), (error: unknown) => {
    assert.ok(error instanceof SvgRenderError);
    assert.equal(error.path, "options.size");
    return true;
  });
});

test("accepts definitions before inspecting options and preserves option exception identity", () => {
  const definition = createDefinition();
  let reflections = 0;
  const failure = new IconDefinitionError("caller.options", "caller reflection failure");
  const options = new Proxy({}, {
    ownKeys() {
      reflections += 1;
      throw failure;
    },
  });

  assert.throws(() => Svg.render({ ...definition, nodes: [] }, options), (error: unknown) => {
    assert.ok(error instanceof SvgRenderError);
    assert.equal(error.path, "definition.nodes");
    return true;
  });
  assert.equal(reflections, 0);
  assert.throws(() => Svg.render(definition, options), (error: unknown) => error === failure);
  assert.equal(reflections, 1);
});

test("rejects explicitly undefined option data instead of treating it as omitted", () => {
  const definition = createDefinition();
  for (const [field] of optionValues) {
    const options = { [field]: undefined } as IconRenderOptions;
    assert.throws(() => Svg.render(definition, options), (error: unknown) => {
      assert.ok(error instanceof SvgRenderError);
      assert.equal(error.path, `options.${field}`);
      return true;
    });
  }
});
