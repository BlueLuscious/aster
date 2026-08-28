import assert from "node:assert/strict";
import test from "node:test";

import type { IconMetadata } from "@aster/core";
import {
  IconImport,
  iconImportFormats,
  type IconAdoptionRequest,
} from "../../src/index.js";

const metadata: IconMetadata = {
  displayName: "Composition",
  rtl: "preserve",
  presentation: {
    defaults: {},
    overrides: [],
  },
  deprecated: false,
};

function request(namespace: string, name: string): IconAdoptionRequest {
  return {
    source: {
      format: iconImportFormats.svg,
      sourceId: `composition/${namespace}/${name}.svg`,
      identity: { namespace, name },
      content:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>',
    },
    metadata: {
      ...metadata,
      displayName: name,
    },
  };
}

test("composes single, batch, collection-scale and independent collection adoption", () => {
  const single = IconImport.adopt(request("independent", "single"));
  const batch = IconImport.adoptMany([
    request("batch", "second"),
    request("batch", "first"),
  ]);
  const firstCollection = IconImport.adoptMany([
    request("flora", "leaf"),
    request("flora", "seed"),
  ]);
  const secondCollection = IconImport.adoptMany([
    request("weather", "sun"),
    request("weather", "cloud"),
  ]);

  assert.equal(single.successful, true);
  assert.equal(batch.successful, true);
  assert.equal(firstCollection.successful, true);
  assert.equal(secondCollection.successful, true);

  if (
    !single.successful ||
    !batch.successful ||
    !firstCollection.successful ||
    !secondCollection.successful
  ) {
    throw new Error("Expected successful independent adoption compositions.");
  }

  assert.equal(single.value.definition.identity.name, "single");
  assert.deepEqual(
    batch.value.entries.map((entry) => entry.definition.identity.name),
    ["first", "second"],
  );
  assert.deepEqual(
    firstCollection.value.entries.map((entry) => entry.definition.identity.namespace),
    ["flora", "flora"],
  );
  assert.deepEqual(
    secondCollection.value.entries.map((entry) => entry.definition.identity.namespace),
    ["weather", "weather"],
  );
  assert.notEqual(firstCollection.value, secondCollection.value);
});
