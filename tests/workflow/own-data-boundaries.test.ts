import assert from "node:assert/strict";
import test from "node:test";

import { Icon, IconDefinitionError } from "@luscious-garden/aster-core";
import { IconImport, IconImportError } from "@luscious-garden/aster-import";
import { Svg, SvgRenderError } from "@luscious-garden/aster-svg";

test("rejects accessor inputs even when property descriptors inherit a value", () => {
  const identity = { name: "disc", variant: "outline" };
  const definition = Icon.define({
    identity,
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
    metadata: {
      displayName: "Disc",
      rtl: "preserve",
      presentation: { defaults: {}, overrides: [] },
      deprecated: false,
    },
  });
  const authored = { ...definition };
  const source = {
    format: "svg" as const,
    identity,
    sourceId: "external/disc.svg",
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>',
  };
  const options = {};
  let reads = 0;
  Object.defineProperty(authored, "identity", {
    enumerable: true,
    get() {
      reads += 1;
      return identity;
    },
  });
  Object.defineProperty(source, "format", {
    enumerable: true,
    get() {
      reads += 1;
      return "svg";
    },
  });
  Object.defineProperty(options, "size", {
    enumerable: true,
    get() {
      reads += 1;
      return 32;
    },
  });
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, "value");
  const failures: unknown[] = [];

  try {
    Object.defineProperty(Object.prototype, "value", {
      configurable: true,
      writable: true,
      value: 16,
    });

    for (const operation of [
      () => Icon.define(authored),
      () => IconImport.inspect(source),
      () => Svg.render(definition, options),
    ]) {
      try {
        operation();
        failures.push(undefined);
      } catch (error: unknown) {
        failures.push(error);
      }
    }
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, "value");
    } else {
      Object.defineProperty(Object.prototype, "value", previous);
    }
  }

  assert.ok(failures[0] instanceof IconDefinitionError);
  assert.ok(failures[1] instanceof IconImportError);
  assert.ok(failures[2] instanceof SvgRenderError);
  assert.equal(reads, 0);
});
