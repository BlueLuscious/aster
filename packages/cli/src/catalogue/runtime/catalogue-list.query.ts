import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandResultFactory } from "../../command/runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../command/types/index.js";
import { CatalogueLoader } from "./catalogue.loader.js";
import { CatalogueQueryScope } from "./catalogue-query.scope.js";
import { CatalogueResultFactory } from "./catalogue-result.factory.js";

/**
 * @description Executes deterministic provider, collection, glyph and concrete icon listing.
 */
export class CatalogueListQuery {
  /**
   * @description Explicit provider loader shared by this query execution boundary.
   */
  readonly #loader: CatalogueLoader;

  /**
   * @description Shared exact-filter policy.
   */
  readonly #scope = new CatalogueQueryScope();

  /**
   * @description Accepted catalogue-record result projector.
   */
  readonly #catalogueResults = new CatalogueResultFactory();

  /**
   * @description Structured command outcome constructor.
   */
  readonly #commandResults = new CommandResultFactory();

  /**
   * @description Creates one list query using the explicit shared provider loader.
   * @param loader - Provider discovery and metadata acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
  }

  /**
   * @description Lists the requested catalogue value family through exact filters.
   * @param invocation - Canonical list invocation.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Structured immutable list result.
   */
  async execute(
    invocation: Extract<
      AsterCommandInvocationType,
      {
        /** @description List-command discriminator used for invocation narrowing. */
        command: typeof asterCommandNames.list;
      }
    >,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    const tagsValue = Object.hasOwn(invocation, "tags") ? invocation.tags : undefined;
    const glyphValue = Object.hasOwn(invocation, "glyph") ? invocation.glyph : undefined;
    const collectionValue = Object.hasOwn(invocation, "collection") ? invocation.collection : undefined;
    const catalogueValue = Object.hasOwn(invocation, "catalogue") ? invocation.catalogue : undefined;

    const loaded = await this.#loader.discover(context.catalogues);

    if (!loaded.accepted) {
      return this.#commandResults.failure(asterCommandNames.list, loaded.diagnostic);
    }

    const selected = this.#scope.selectCatalogues(loaded.value, catalogueValue);

    if (!selected.accepted) {
      return this.#commandResults.failure(asterCommandNames.list, selected.diagnostic);
    }

    if (invocation.subject === asterCommandSubjects.list.catalogues) {
      return this.#commandResults.success(asterCommandNames.list, Object.freeze({
        kind: asterCommandPayloadKinds.catalogueList,
        catalogues: Object.freeze(selected.value.map((catalogue) =>
          this.#catalogueResults.provider(catalogue),
        )),
      }));
    }

    if (invocation.subject === asterCommandSubjects.list.collections) {
      return this.#commandResults.success(asterCommandNames.list, Object.freeze({
        kind: asterCommandPayloadKinds.collectionList,
        collections: Object.freeze(selected.value.flatMap((catalogue) =>
          catalogue.collections.map((record) =>
            this.#catalogueResults.collection(catalogue.identity, record),
          ),
        )),
      }));
    }

    if (invocation.subject === asterCommandSubjects.list.glyphs) {
      return this.#commandResults.success(asterCommandNames.list, Object.freeze({
        kind: asterCommandPayloadKinds.glyphList,
        glyphs: Object.freeze(selected.value.flatMap((catalogue) => this.#catalogueResults.glyphs(catalogue))),
      }));
    }

    const glyph = this.#scope.acceptGlyph(selected.value, glyphValue);
    if (!glyph.accepted) {
      return this.#commandResults.failure(asterCommandNames.list, glyph.diagnostic);
    }

    const collection = this.#scope.acceptCollection(selected.value, collectionValue);

    if (!collection.accepted) {
      return this.#commandResults.failure(asterCommandNames.list, collection.diagnostic);
    }

    return this.#commandResults.success(asterCommandNames.list, Object.freeze({
      kind: asterCommandPayloadKinds.iconList,
      icons: Object.freeze(selected.value.flatMap((catalogue) =>
        catalogue.icons
          .filter((record) => this.#scope.matchesGlyph(record, glyphValue))
          .filter((record) => this.#scope.matchesCollection(record, collectionValue))
          .filter((record) => this.#scope.matchesTags(Object.hasOwn(record.metadata, "tags") ? record.metadata.tags : undefined, tagsValue))
          .map((record) => this.#catalogueResults.icon(catalogue.identity, record)),
      )),
    }));
  }
}
