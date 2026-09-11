import { AsterCommands } from "@aster/cli";
import { CatalogueIdentityFormatter } from "../../../../packages/cli/dist/catalogue/runtime/catalogue-identity.formatter.js";
import { BenchmarkCatalogueFixtureFactory } from "../../shared/runtime/benchmark-catalogue-fixture.factory.mjs";

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
    const provider = Object.freeze({
      identity: "fixture",
      /**
       * @description Returns the already acquired immutable fixture snapshot.
       * @returns {Promise<object>} Prepared catalogue snapshot.
       */
      async load() {
        return snapshot;
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
