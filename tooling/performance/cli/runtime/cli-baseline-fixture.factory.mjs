import { AsterCatalogue, AsterCommands } from "@aster/cli";
import { AsterCollection } from "@aster/icons";
import { CatalogueIdentityFormatter } from "../../../../packages/cli/dist/catalogue/runtime/catalogue-identity.formatter.js";

/**
 * @description Prepares representative immutable CLI inputs outside measured operations.
 */
export class CliBaselineFixtureFactory {
  /**
   * @description Creates one immutable CLI scenario fixture matrix.
   * @returns {import("../contracts/internal/cli-baseline-fixtures.contract.mjs").ICliBaselineFixtures} Prepared CLI inputs.
   */
  create() {
    const icon = AsterCollection.icons[0];

    if (icon === undefined) {
      throw new TypeError("The CLI baseline requires one canonical icon.");
    }

    const identities = new CatalogueIdentityFormatter();

    const snapshot = Object.freeze({
      icons: Object.freeze(
        AsterCollection.icons.map((definition) =>
          Object.freeze({
            definition,
            memberships: Object.freeze([AsterCollection.identity]),
          }),
        ),
      ),
      collections: Object.freeze([
        Object.freeze({ definition: AsterCollection }),
      ]),
    });
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
      builtInContext: Object.freeze({
        catalogues: Object.freeze([AsterCatalogue]),
        productName: "Aster",
        productVersion: "0.0.0",
      }),
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
          identity: identities.collection(AsterCollection.identity),
          options: Object.freeze({ size: 24 }),
        }),
      }),
      arguments: Object.freeze({
        help: Object.freeze(["help"]),
        collectionExport: Object.freeze([
          "export",
          "collection",
          identities.collection(AsterCollection.identity),
          "--size",
          "24",
          "--json",
        ]),
      }),
      commands: AsterCommands,
    });
  }
}
