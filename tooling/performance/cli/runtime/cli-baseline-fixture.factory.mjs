import { AsterCommands } from "@luscious-garden/aster-cli";
import { BenchmarkCatalogueFixtureFactory } from "../../shared/runtime/benchmark-catalogue-fixture.factory.mjs";

/** @description Built CLI identity formatter module loaded during fixture preparation. */
const catalogueIdentityFormatterModule =
  "../../../../packages/cli/dist/catalogue/runtime/catalogue-identity.formatter.js";
/** @description Built CLI identity formatter constructor. */
const { CatalogueIdentityFormatter } = await import(
  catalogueIdentityFormatterModule
);

/**
 * @description Prepares representative immutable CLI inputs outside measured operations.
 */
export class CliBaselineFixtureFactory {
  /**
   * @description Creates one immutable CLI scenario fixture matrix.
   * @returns {import("../contracts/internal/cli-baseline-fixtures.contract.mjs").ICliBaselineFixtures} Prepared CLI inputs.
   */
  create() {
    const catalogue = new BenchmarkCatalogueFixtureFactory().create();
    const { collection, icon, snapshot } = catalogue;
    const identities = new CatalogueIdentityFormatter();
    const iconsByIdentity = new Map(snapshot.icons.map((record) => [
      identities.icon(record.definition.identity),
      record.definition,
    ]));
    const collectionsByIdentity = new Map(snapshot.collections.map((record) => [
      identities.collection(record.definition.identity),
      record.definition,
    ]));
    const discovery = Object.freeze({
      icons: Object.freeze(snapshot.icons.map((record) => Object.freeze({
        identity: record.definition.identity,
        metadata: Object.freeze({
          displayName: record.definition.metadata.displayName,
          ...(record.definition.metadata.tags === undefined
            ? {}
            : { tags: record.definition.metadata.tags }),
          rtl: record.definition.metadata.rtl,
          deprecated: record.definition.metadata.deprecated,
        }),
        memberships: record.memberships,
      }))),
      collections: Object.freeze(snapshot.collections.map((record) => Object.freeze({
        identity: record.definition.identity,
        metadata: record.definition.metadata,
        icons: Object.freeze(
          record.definition.members.map((member) => member.identity),
        ),
      }))),
    });
    const provider = Object.freeze({
      identity: "fixture",
      /**
       * @description Returns already acquired immutable fixture discovery metadata.
       * @returns {Promise<import("@luscious-garden/aster-cli").CatalogueDiscovery>} Prepared catalogue discovery.
       */
      async discover() {
        return discovery;
      },
      /**
       * @description Resolves one exact prepared icon definition.
       * @param {import("@luscious-garden/aster-core").IconIdentity} identity - Selected icon identity.
       * @returns {Promise<import("@luscious-garden/aster-core").IconDefinition | undefined>} Prepared definition or no value.
       */
      async loadIcon(identity) {
        return iconsByIdentity.get(identities.icon(identity));
      },
      /**
       * @description Resolves one exact prepared collection definition.
       * @param {import("@luscious-garden/aster-core").CollectionIdentity} identity - Selected collection identity.
       * @returns {Promise<import("@luscious-garden/aster-core").CollectionDefinition | undefined>} Prepared definition or no value.
       */
      async loadCollection(identity) {
        return collectionsByIdentity.get(identities.collection(identity));
      },
    });
    const context = Object.freeze({
      catalogues: Object.freeze([provider]),
      productName: "Aster",
      productVersion: "0.0.0",
    });

    return Object.freeze({
      icon,
      context,
      invocations: Object.freeze({
        help: Object.freeze({ command: "help" }),
        version: Object.freeze({ command: "version" }),
        listIcons: Object.freeze({ command: "list", subject: "icons" }),
        exportIcon: Object.freeze({
          command: "export",
          subject: "icon",
          identity: identities.icon(icon.identity),
          options: Object.freeze({ size: 24 }),
        }),
        exportCollection: Object.freeze({
          command: "export",
          subject: "collection",
          identity: identities.collection(collection.identity),
          options: Object.freeze({ size: 24 }),
        }),
        reviewCollection: Object.freeze({
          command: "review",
          subject: "collection",
          identity: identities.collection(collection.identity),
        }),
      }),
      arguments: Object.freeze({
        help: Object.freeze(["help"]),
        collectionExport: Object.freeze([
          "export",
          "collection",
          identities.collection(collection.identity),
          "--size",
          "24",
          "--json",
        ]),
      }),
      commands: AsterCommands,
    });
  }
}
