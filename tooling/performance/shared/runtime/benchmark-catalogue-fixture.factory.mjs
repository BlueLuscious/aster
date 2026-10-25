import { Collection, Icon } from "@luscious-garden/aster-core";
import { benchmarkCatalogueFixture } from "../constants/benchmark-catalogue-fixture.constant.mjs";
import { benchmarkScaleFixture } from "../constants/benchmark-scale-fixture.constant.mjs";

/**
 * @description Prepares fixed and explicitly scalable synthetic catalogues for cross-package measurements.
 * @remarks The fixed corpus is independent from product artwork; supplemental scales carry their own dimensions and report identity.
 */
export class BenchmarkCatalogueFixtureFactory {
  /**
   * @description Prepares a bounded synthetic catalogue with explicit dimensions independent from the fixed corpus.
   * @param {import("../contracts/internal/benchmark-scale-options.contract.mjs").IBenchmarkScaleOptions} [options] - Independent scale and output axes.
   * @returns {import("../contracts/internal/benchmark-scaled-catalogue-fixture.contract.mjs").IBenchmarkScaledCatalogueFixture} Canonical references, authored inputs and actual counts.
   */
  createScaled(options = {}) {
    const {
      definitions = 16,
      variantsPerGlyph = 1,
      collections = 1,
      membersPerCollection = definitions,
      sharedMembers = 0,
      nodesPerDefinition = 1,
      pointsPerNode = 0,
      labelWidth = 16,
      providers = 1,
      overlappingDefinitions = 0,
    } = options;
    for (const [path, value, minimum, maximum] of [
      ["definitions", definitions, 0, benchmarkScaleFixture.maximumEntries],
      [
        "variantsPerGlyph",
        variantsPerGlyph,
        1,
        benchmarkScaleFixture.maximumVariants,
      ],
      ["collections", collections, 0, benchmarkScaleFixture.maximumEntries],
      ["membersPerCollection", membersPerCollection, 0, definitions],
      ["sharedMembers", sharedMembers, 0, membersPerCollection],
      [
        "nodesPerDefinition",
        nodesPerDefinition,
        1,
        benchmarkScaleFixture.maximumNodesPerDefinition,
      ],
      [
        "pointsPerNode",
        pointsPerNode,
        0,
        benchmarkScaleFixture.maximumPointsPerNode,
      ],
      ["labelWidth", labelWidth, 1, benchmarkScaleFixture.maximumLabelWidth],
      ["providers", providers, 1, benchmarkScaleFixture.maximumProviders],
      ["overlappingDefinitions", overlappingDefinitions, 0, definitions],
    ]) {
      if (
        typeof value !== "number" ||
        typeof minimum !== "number" ||
        typeof maximum !== "number" ||
        !Number.isSafeInteger(value) ||
        value < minimum ||
        value > maximum
      ) {
        throw new TypeError(`Invalid benchmark scale: ${path}.`);
      }
    }
    if (
      definitions % variantsPerGlyph !== 0 ||
      pointsPerNode === 1 ||
      definitions * nodesPerDefinition * Math.max(1, pointsPerNode) >
        benchmarkScaleFixture.maximumGeometryUnits ||
      (collections > 0 &&
        sharedMembers + collections * (membersPerCollection - sharedMembers) >
          definitions)
    ) {
      throw new TypeError(
        "Benchmark scale cannot satisfy its geometry or disjoint membership contract.",
      );
    }
    /** @type {import("@luscious-garden/aster-core").IconDefinition[]} */
    const mutableIcons = Array.from({ length: definitions }, (_, index) => ({
      identity: {
        namespace: "benchmark",
        name: `scale-glyph-${String(Math.floor(index / variantsPerGlyph)).padStart(5, "0")}`,
        variant: `treatment-${index % variantsPerGlyph}`,
      },
      viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
      nodes: Array.from({ length: nodesPerDefinition }, () =>
        this.#scaledNode(pointsPerNode),
      ),
      metadata: {
        displayName: "X".repeat(labelWidth),
        tags: ["benchmark"],
        rtl: "preserve",
        presentation: {
          defaults: { fill: "none", stroke: "currentColor" },
          overrides: [],
        },
        deprecated: false,
      },
    }));
    const icons = Object.freeze(mutableIcons.map((icon) => Icon.define(icon)));
    const selected = Object.freeze(
      Array.from({ length: collections }, (_, index) => {
        const members = Array.from(
          { length: membersPerCollection },
          (_, member) => {
            const position =
              member < sharedMembers
                ? member
                : sharedMembers +
                  index * (membersPerCollection - sharedMembers) +
                  member -
                  sharedMembers;
            const icon = icons[position];
            if (icon === undefined) {
              throw new Error(
                "Benchmark membership exceeded the prepared corpus.",
              );
            }
            return icon;
          },
        );
        /** @type {Record<string, Record<string, import("@luscious-garden/aster-core").IconDefinition>>} */
        const groups = Object.create(null);
        for (const icon of members) {
          const alias = `glyph${Number(icon.identity.name.slice("scale-glyph-".length))}`;
          const group = groups[alias] ?? (groups[alias] = Object.create(null));
          group[Icon.variantPropertyName(icon.identity.variant)] = icon;
        }
        return Collection.define({
          identity: {
            namespace: "benchmark",
            name: `scale-collection-${index}`,
          },
          icons: groups,
          metadata: {
            displayName: `Scale ${index}`,
            description: "Synthetic benchmark selection.",
            tags: ["benchmark"],
          },
        });
      }),
    );
    const catalogues = Object.freeze(
      Array.from({ length: providers }, (_, index) =>
        this.#provider(
          index,
          providers,
          overlappingDefinitions,
          icons,
          selected,
        ),
      ),
    );
    return Object.freeze({
      icons,
      mutableIcons,
      collections: selected,
      mutableCollections: structuredClone(selected),
      providers: catalogues,
      counts: Object.freeze({
        definitions: icons.length,
        glyphs: definitions / variantsPerGlyph,
        variantsPerGlyph,
        collections: selected.length,
        membershipReferences: selected.reduce(
          (sum, collection) => sum + collection.members.length,
          0,
        ),
        selectedDefinitions: new Set(
          selected.flatMap((collection) => collection.members),
        ).size,
        sharedMembers,
        nodesPerDefinition,
        pointsPerNode,
        totalNodes: definitions * nodesPerDefinition,
        totalPoints: definitions * nodesPerDefinition * pointsPerNode,
        providers,
        labelWidth,
        discoveryRecords: catalogues.reduce(
          (sum, provider) => sum + provider.recordCount,
          0,
        ),
      }),
    });
  }

  /**
   * @description Creates one independently controlled geometry unit.
   * @param {number} points - Zero for a primitive or at least two polyline points.
   * @returns {import("@luscious-garden/aster-core").IconNodeType} Mutable authored geometry.
   */
  #scaledNode(points) {
    return points === 0
      ? { kind: "circle", cx: 12, cy: 12, radius: 6 }
      : {
          kind: "polyline",
          points: Array.from({ length: points }, (_, index) => ({
            x: index % 24,
            y: (index * 7) % 24,
          })),
        };
  }

  /**
   * @description Selects reference provenance without confusing a clone with a canonical output.
   * @remarks JSON copies are a narrow typed round trip of Core's portable data, not validation of external JSON.
   * @param {import("../contracts/internal/benchmark-scaled-catalogue-fixture.contract.mjs").IBenchmarkScaledCatalogueFixture} fixture - Prepared owned fixture.
   * @param {"canonical" | "mutable" | "shallow" | "clone" | "json" | "foreign"} ownership - Explicit input lifecycle.
   * @param {{ define(value: import("@luscious-garden/aster-core").IconDefinition): import("@luscious-garden/aster-core").IconDefinition }} [foreign] - Actual separate Core API for foreign provenance.
   * @returns {readonly import("@luscious-garden/aster-core").IconDefinition[]} Prepared references without canonicalising unknown originals locally.
   */
  inputs(fixture, ownership, foreign) {
    switch (ownership) {
      case "canonical":
        return fixture.icons;
      case "mutable":
        return fixture.mutableIcons;
      case "shallow":
        return fixture.icons.map((icon) => ({ ...icon }));
      case "clone":
        return structuredClone(fixture.icons);
      case "json":
        return /** @type {import("@luscious-garden/aster-core").IconDefinition[]} */ (
          JSON.parse(JSON.stringify(fixture.icons))
        );
      case "foreign": {
        if (foreign === undefined) {
          throw new TypeError(
            "Foreign benchmark inputs require a separate Core API.",
          );
        }
        return fixture.icons.map((icon) => {
          const definition = foreign.define(icon);
          if (definition === icon || Icon.define(definition) === definition) {
            throw new TypeError(
              "Foreign benchmark inputs must come from a separate Core copy.",
            );
          }
          return definition;
        });
      }
      default:
        throw new TypeError("Unknown benchmark input ownership.");
    }
  }

  /**
   * @description Prepares a coherent metadata-only provider and exact loaders, including selected member closure.
   * @param {number} index - Provider ordinal.
   * @param {number} count - Total providers.
   * @param {number} overlap - Initial definitions exposed by every provider.
   * @param {readonly import("@luscious-garden/aster-core").IconDefinition[]} icons - Canonical corpus.
   * @param {readonly import("@luscious-garden/aster-core").CollectionDefinition[]} collections - Explicit selections.
   * @returns {import("@luscious-garden/aster-cli").CatalogueProvider & { recordCount: number }} Canonical `CatalogueProvider` capabilities plus `recordCount`, the concrete definitions exposed by this provider including selected collection members.
   */
  #provider(index, count, overlap, icons, collections) {
    const localCollections = collections.filter(
      (_, ordinal) => ordinal % count === index,
    );
    const selected = new Set(
      icons.filter(
        (_, ordinal) => ordinal < overlap || ordinal % count === index,
      ),
    );
    for (const collection of localCollections) {
      for (const icon of collection.members) {
        selected.add(icon);
      }
    }
    const localIcons = [...selected];
    /** @type {Map<import("@luscious-garden/aster-core").IconDefinition, import("@luscious-garden/aster-core").CollectionIdentity[]>} */
    const memberships = new Map(localIcons.map((icon) => [icon, []]));
    for (const collection of localCollections) {
      for (const icon of collection.members) {
        memberships.get(icon)?.push(collection.identity);
      }
    }
    const key = this.#identityKey;
    const byIcon = new Map(
      localIcons.map((icon) => [key(icon.identity), icon]),
    );
    const byCollection = new Map(
      localCollections.map((collection) => [
        key(collection.identity),
        collection,
      ]),
    );
    const discovery = Object.freeze({
      icons: Object.freeze(
        localIcons.map((icon) =>
          Object.freeze({
            identity: icon.identity,
            metadata: Object.freeze({
              displayName: icon.metadata.displayName,
              tags: icon.metadata.tags ?? [],
              rtl: icon.metadata.rtl,
              deprecated: icon.metadata.deprecated,
            }),
            memberships: Object.freeze(memberships.get(icon) ?? []),
          }),
        ),
      ),
      collections: Object.freeze(
        localCollections.map((collection) =>
          Object.freeze({
            identity: collection.identity,
            metadata: collection.metadata,
            memberIdentities: Object.freeze(
              collection.members.map((icon) => icon.identity),
            ),
          }),
        ),
      ),
    });
    return Object.freeze({
      identity: `scale-provider-${index}`,
      recordCount: localIcons.length,
      /**
       * @returns {Promise<import("@luscious-garden/aster-cli").CatalogueDiscovery>}
       */
      async discover() {
        return discovery;
      },
      /**
       * @param {import("@luscious-garden/aster-core").IconIdentity} identity
       * @returns {Promise<import("@luscious-garden/aster-core").IconDefinition | undefined>}
       */
      async loadIcon(identity) {
        return byIcon.get(key(identity));
      },
      /**
       * @param {import("@luscious-garden/aster-core").CollectionIdentity} identity
       * @returns {Promise<import("@luscious-garden/aster-core").CollectionDefinition | undefined>}
       */
      async loadCollection(identity) {
        return byCollection.get(key(identity));
      },
    });
  }

  /**
   * @description Encodes portable identities without merging missing namespaces or treatment values.
   * @param {import("@luscious-garden/aster-core").IconIdentity | import("@luscious-garden/aster-core").CollectionIdentity} identity - Prepared concrete or collection identity.
   * @returns {string} Unambiguous local lookup tuple.
   */
  #identityKey(identity) {
    return JSON.stringify([
      identity.namespace ?? null,
      identity.name,
      "variant" in identity ? identity.variant : null,
    ]);
  }
  /**
   * @description Creates one deeply immutable benchmark catalogue through public Core APIs.
   * @returns {import("../contracts/internal/benchmark-catalogue-fixture.contract.mjs").IBenchmarkCatalogueFixture} Stable synthetic catalogue values.
   */
  create() {
    const icons = Object.freeze(
      Array.from({ length: benchmarkCatalogueFixture.corpusSize }, (_, index) =>
        this.#icon(index),
      ),
    );
    const iconMap = Object.fromEntries(
      icons.map((definition, index) => [
        `fixture${index + 1}`,
        { [Icon.variantPropertyName(definition.identity.variant)]: definition },
      ]),
    );
    const collection = Collection.define({
      identity: { name: "benchmark" },
      icons: iconMap,
      metadata: {
        displayName: "Benchmark",
        description: "Stable synthetic performance corpus.",
        tags: ["benchmark"],
      },
    });
    const snapshot = Object.freeze({
      icons: Object.freeze(
        icons.map((definition) =>
          Object.freeze({
            definition,
            memberships: Object.freeze([collection.identity]),
          }),
        ),
      ),
      collections: Object.freeze([Object.freeze({ definition: collection })]),
    });
    const icon = icons[0];

    if (icon === undefined) {
      throw new TypeError("The benchmark catalogue requires one icon.");
    }

    return Object.freeze({ icon, icons, collection, snapshot });
  }

  /**
   * @description Creates one canonical definition from a deterministic geometry family.
   * @param {number} index - Zero-based corpus position.
   * @returns {import("@luscious-garden/aster-core").IconDefinition} Canonical synthetic icon.
   */
  #icon(index) {
    const ordinal = index + 1;

    return Icon.define({
      identity: {
        variant: "fixture",
        namespace: "benchmark",
        name: `fixture-${String(ordinal).padStart(2, "0")}`,
      },
      viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
      nodes: this.#nodes(index),
      metadata: {
        displayName: `Benchmark Fixture ${ordinal}`,
        tags: ["benchmark", `fixture-${ordinal}`],
        rtl: "preserve",
        presentation: {
          defaults: {
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.5,
            strokeLineCap: "round",
            strokeLineJoin: "round",
          },
          overrides: [],
          defaultSize: 24,
        },
        deprecated: false,
      },
    });
  }

  /**
   * @description Selects one deterministic geometry family for a corpus position.
   * @param {number} index - Zero-based corpus position.
   * @returns {import("@luscious-garden/aster-core").IconNodeType[]} Mutable authored nodes consumed immediately by Core.
   */
  #nodes(index) {
    const offset = index % 4;

    switch (offset) {
      case 0:
        return [{ kind: "circle", cx: 12, cy: 12, radius: 3 + (index % 6) }];
      case 1:
        return [
          {
            kind: "path",
            commands: [
              { kind: "move", x: 2 + (index % 3), y: 12 },
              { kind: "line", x: 18, y: 12 },
            ],
          },
        ];
      case 2:
        return [
          { kind: "line", x1: 3, y1: 12, x2: 21, y2: 12 },
          {
            kind: "polyline",
            points: [
              { x: 9, y: 6 },
              { x: 3, y: 12 },
              { x: 9, y: 18 },
            ],
          },
        ];
      default:
        return [
          {
            kind: "rect",
            x: 4,
            y: 5,
            width: 16,
            height: 14,
            radiusX: 2,
            radiusY: 2,
          },
          { kind: "ellipse", cx: 12, cy: 12, radiusX: 5, radiusY: 3 },
        ];
    }
  }
}
