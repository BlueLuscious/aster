import assert from "node:assert/strict";
import test from "node:test";

import type {
  CollectionIdentity,
  IconIdentity,
} from "@luscious-garden/aster-core";
import { AsterCommands } from "../../src/index.js";
import type {
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
  CatalogueProvider,
} from "../../src/catalogue/contracts/index.js";
import { CatalogueDiscoveryMembershipValidator } from "../../src/catalogue/runtime/catalogue-discovery-membership.validator.js";
import { CatalogueIdentityFormatter } from "../../src/catalogue/runtime/catalogue-identity.formatter.js";

function iconRecord(
  identity: IconIdentity,
  memberships: readonly CollectionIdentity[] = [],
): CatalogueDiscoveryIconRecord {
  return {
    identity,
    metadata: {
      displayName: identity.name,
      rtl: "preserve",
      deprecated: false,
    },
    memberships,
  };
}

function collectionRecord(
  identity: CollectionIdentity,
  memberIdentities: readonly IconIdentity[] = [],
): CatalogueDiscoveryCollectionRecord {
  return {
    identity,
    metadata: { displayName: identity.name },
    memberIdentities,
  };
}

function indexIcons(icons: readonly CatalogueDiscoveryIconRecord[]) {
  const identities = new CatalogueIdentityFormatter();
  return new Map(icons.map((icon) => [identities.icon(icon.identity), icon]));
}

// Preserve the old collection-first traversal as an independent test-only oracle.
// Do not preindex claims here: the repeated scans are the reference behaviour.
function oldMembershipFailure(
  collections: readonly CatalogueDiscoveryCollectionRecord[],
  iconsByIdentity: ReadonlyMap<string, CatalogueDiscoveryIconRecord>,
): string | undefined {
  const identities = new CatalogueIdentityFormatter();

  for (const collection of collections) {
    const collectionKey = identities.collection(collection.identity);
    const memberKeys = new Set(
      collection.memberIdentities.map((icon) => identities.icon(icon)),
    );

    for (const memberKey of memberKeys) {
      const icon = iconsByIdentity.get(memberKey);

      if (icon === undefined) {
        return `collection ${collectionKey} contains unavailable icon ${memberKey}`;
      }

      const membershipKeys = icon.memberships.map((membership) =>
        identities.collection(membership),
      );

      if (!membershipKeys.includes(collectionKey)) {
        return `icon ${memberKey} omits collection membership ${collectionKey}`;
      }
    }

    for (const icon of iconsByIdentity.values()) {
      const iconKey = identities.icon(icon.identity);
      const claimsMembership = icon.memberships.some(
        (membership) => identities.collection(membership) === collectionKey,
      );

      if (claimsMembership && !memberKeys.has(iconKey)) {
        return `icon ${iconKey} claims unavailable membership ${collectionKey}`;
      }
    }
  }

  return undefined;
}

function orderedSubsets<Value>(values: readonly Value[]): Value[][] {
  return [[], ...values.flatMap((value, index) =>
    orderedSubsets(values.filter((_, other) => other !== index))
      .map((tail) => [value, ...tail]),
  )];
}

function combinations<Value>(options: readonly Value[], count: number): Value[][] {
  if (count === 0) {
    return [[]];
  }

  return options.flatMap((option) =>
    combinations(options, count - 1).map((tail) => [option, ...tail]),
  );
}

test("preserves exact membership diagnostics and source-order priorities", () => {
  const validator = new CatalogueDiscoveryMembershipValidator();
  const zeta: IconIdentity = { namespace: "testing", name: "zeta", variant: "outline" };
  const alpha: IconIdentity = { namespace: "testing", name: "alpha", variant: "outline" };
  const missing: IconIdentity = { namespace: "testing", name: "missing", variant: "outline" };
  const first: CollectionIdentity = { namespace: "testing", name: "zeta" };
  const second: CollectionIdentity = { namespace: "testing", name: "alpha" };
  const cases = [
    {
      name: "empty graph",
      collections: [],
      icons: [],
      expected: undefined,
    },
    {
      name: "empty collections and standalone icons",
      collections: [collectionRecord(first), collectionRecord(second)],
      icons: [iconRecord(zeta), iconRecord(alpha)],
      expected: undefined,
    },
    {
      name: "disjoint memberships in unsorted source order",
      collections: [collectionRecord(first, [zeta]), collectionRecord(second, [alpha])],
      icons: [iconRecord(zeta, [first]), iconRecord(alpha, [second])],
      expected: undefined,
    },
    {
      name: "shared memberships in unsorted source order",
      collections: [collectionRecord(first, [zeta, alpha]), collectionRecord(second, [zeta])],
      icons: [iconRecord(zeta, [first, second]), iconRecord(alpha, [first])],
      expected: undefined,
    },
    {
      name: "unavailable declared member before a reverse claim",
      collections: [collectionRecord(first, [missing])],
      icons: [iconRecord(zeta, [first])],
      expected: "collection testing/zeta contains unavailable icon testing/missing@outline",
    },
    {
      name: "omitted reciprocal claim before a later unavailable member and reverse claim",
      collections: [collectionRecord(first, [zeta, missing])],
      icons: [iconRecord(alpha, [first]), iconRecord(zeta)],
      expected: "icon testing/zeta@outline omits collection membership testing/zeta",
    },
    {
      name: "declared member order rather than icon map order",
      collections: [collectionRecord(first, [zeta, alpha])],
      icons: [iconRecord(alpha), iconRecord(zeta)],
      expected: "icon testing/zeta@outline omits collection membership testing/zeta",
    },
    {
      name: "reversed declared member order",
      collections: [collectionRecord(first, [alpha, zeta])],
      icons: [iconRecord(zeta), iconRecord(alpha)],
      expected: "icon testing/alpha@outline omits collection membership testing/zeta",
    },
    {
      name: "first reverse claimant in unsorted map insertion order",
      collections: [collectionRecord(first)],
      icons: [iconRecord(zeta, [first]), iconRecord(alpha, [first])],
      expected: "icon testing/zeta@outline claims unavailable membership testing/zeta",
    },
    {
      name: "reversed icon map insertion order",
      collections: [collectionRecord(first)],
      icons: [iconRecord(alpha, [first]), iconRecord(zeta, [first])],
      expected: "icon testing/alpha@outline claims unavailable membership testing/zeta",
    },
    {
      name: "earlier collection reverse claim before later collection unavailable member",
      collections: [collectionRecord(first), collectionRecord(second, [missing])],
      icons: [iconRecord(zeta, [first])],
      expected: "icon testing/zeta@outline claims unavailable membership testing/zeta",
    },
    {
      name: "reversed collection source order",
      collections: [collectionRecord(second, [missing]), collectionRecord(first)],
      icons: [iconRecord(zeta, [first])],
      expected: "collection testing/alpha contains unavailable icon testing/missing@outline",
    },
    {
      name: "collection order rather than global reverse claimant order",
      collections: [collectionRecord(first), collectionRecord(second)],
      icons: [iconRecord(alpha, [second]), iconRecord(zeta, [first])],
      expected: "icon testing/zeta@outline claims unavailable membership testing/zeta",
    },
    {
      name: "collection order rather than an icon's membership order",
      collections: [collectionRecord(first), collectionRecord(second)],
      icons: [iconRecord(zeta, [second, first])],
      expected: "icon testing/zeta@outline claims unavailable membership testing/zeta",
    },
  ];

  for (const sample of cases) {
    assert.equal(
      validator.inspect(sample.collections, indexIcons(sample.icons)),
      sample.expected,
      sample.name,
    );
  }
});

test("matches the old traversal for every ordered two-icon two-collection graph", () => {
  const validator = new CatalogueDiscoveryMembershipValidator();
  const iconIdentities: readonly IconIdentity[] = [
    { namespace: "testing", name: "zeta", variant: "outline" },
    { namespace: "testing", name: "alpha", variant: "filled" },
  ];
  const collectionIdentities: readonly CollectionIdentity[] = [
    { namespace: "testing", name: "zeta" },
    { namespace: "testing", name: "alpha" },
  ];
  const memberOrders = orderedSubsets(iconIdentities);
  const iconOrders = orderedSubsets(iconIdentities);
  let checked = 0;

  // Availability and both directed edge sets vary independently. Ordered subsets
  // also exhaust collection, member, icon-map and membership insertion orders.
  for (const collectionOrder of orderedSubsets(collectionIdentities)) {
    for (const members of combinations(memberOrders, collectionOrder.length)) {
      const collections = collectionOrder.map((identity, index) =>
        collectionRecord(identity, members[index]!),
      );

      for (const iconOrder of iconOrders) {
        for (const claims of combinations(orderedSubsets(collectionOrder), iconOrder.length)) {
          const icons = iconOrder.map((identity, index) => iconRecord(identity, claims[index]!));
          const iconsByIdentity = indexIcons(icons);
          const expected = oldMembershipFailure(collections, iconsByIdentity);

          assert.equal(
            validator.inspect(collections, iconsByIdentity),
            expected,
            JSON.stringify({ collections, icons }),
          );
          checked += 1;
        }
      }
    }
  }

  assert.equal(checked, 3185);
});

test("rediscovers mutable membership evidence on repeated public commands without leaking state", async () => {
  const first: CollectionIdentity = { namespace: "testing", name: "zeta" };
  const second: CollectionIdentity = { namespace: "testing", name: "alpha" };
  const zetaMemberships: CollectionIdentity[] = [];
  const alphaMemberships: CollectionIdentity[] = [];
  const firstMembers: IconIdentity[] = [];
  const secondMembers: IconIdentity[] = [];
  const zeta = iconRecord(
    { namespace: "testing", name: "zeta", variant: "outline" },
    zetaMemberships,
  );
  const alpha = iconRecord(
    { namespace: "testing", name: "alpha", variant: "outline" },
    alphaMemberships,
  );
  const source = {
    icons: [zeta, alpha],
    collections: [collectionRecord(first, firstMembers), collectionRecord(second, secondMembers)],
  };
  let discoveries = 0;
  let definitionLoads = 0;
  const provider: CatalogueProvider = {
    identity: "testing",
    async discover() {
      discoveries += 1;
      return source;
    },
    async loadIcon() {
      definitionLoads += 1;
      throw new Error("Unexpected icon definition load");
    },
    async loadCollection() {
      definitionLoads += 1;
      throw new Error("Unexpected collection definition load");
    },
  };
  const context = {
    catalogues: [provider],
    productName: "Aster",
    productVersion: "0.0.0",
  };
  const list = () => AsterCommands.execute({ command: "list", subject: "icons" }, context);

  async function expectFailure(message: string) {
    const result = await list();
    assert.ok(!result.ok);
    assert.deepEqual(result.diagnostic, {
      category: "catalogue-unavailable",
      code: "ASTER-CLI-006",
      message,
      related: ["testing"],
    });
  }

  const initial = await list();
  assert.ok(initial.ok && initial.payload.kind === "icon-list");
  assert.deepEqual(initial.payload.icons.map((icon) => icon.identity), [alpha.identity, zeta.identity]);

  zetaMemberships.push(first);
  alphaMemberships.push(first);
  await expectFailure("icon testing/zeta@outline claims unavailable membership testing/zeta");

  firstMembers.push(zeta.identity, alpha.identity);
  const linked = await list();
  assert.ok(linked.ok && linked.payload.kind === "icon-list");
  assert.deepEqual(linked.payload.icons.map((icon) => icon.memberships), [[first], [first]]);

  zetaMemberships.length = 0;
  await expectFailure("icon testing/zeta@outline omits collection membership testing/zeta");

  zetaMemberships.push(first);
  source.icons.shift();
  await expectFailure("collection testing/zeta contains unavailable icon testing/zeta@outline");

  source.icons.length = 0;
  source.collections.length = 0;
  const empty = await list();
  assert.ok(empty.ok && empty.payload.kind === "icon-list");
  assert.deepEqual(empty.payload.icons, []);

  zetaMemberships.push(second);
  secondMembers.push(zeta.identity);
  source.icons.push(zeta, alpha);
  source.collections.push(collectionRecord(first, firstMembers), collectionRecord(second, secondMembers));
  const shared = await list();
  assert.ok(shared.ok && shared.payload.kind === "icon-list");
  assert.deepEqual(
    shared.payload.icons.map((icon) => [icon.identity, icon.memberships]),
    [[alpha.identity, [first]], [zeta.identity, [second, first]]],
  );
  assert.deepEqual(initial.payload.icons.map((icon) => icon.memberships), [[], []]);
  assert.deepEqual(linked.payload.icons.map((icon) => icon.memberships), [[first], [first]]);
  assert.equal(discoveries, 7);
  assert.equal(definitionLoads, 0);
});
