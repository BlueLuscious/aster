import { resolve } from "node:path";

import { CatalogueIconRemovalSession } from "./catalogue-icon-removal-session.mjs";
import { CatalogueSourceSynchroniserFactory } from "./catalogue-source-synchroniser.factory.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Coordinates explicit guarded source removal with the existing producer/build and final checks.
 */
export class CatalogueIconRemovalApplicator {
  /** @description Explicit checkout boundary. */
  #root;
  /** @description Borrowed prerequisite check and existing build operation. */
  #build;
  /** @description Borrowed source-session constructor, independent of preview. */
  #session;
  /** @description Existing static graph and generated-output authority. */
  #catalogues = new CatalogueSourceSynchroniserFactory();

  /**
   * @description Creates an application coordinator without acquiring mutation authority until apply.
   * @param {string} workspaceRoot - Explicit workspace containing packages/icons.
   * @param {{ prepare(): Promise<void>, run(): Promise<void> }} build - Existing build capability, never a second emitter.
   * @param {() => CatalogueIconRemovalSession} [session] - Independent owned source publication lifecycle.
   */
  constructor(workspaceRoot, build, session = () => new CatalogueIconRemovalSession(workspaceRoot)) {
    this.#root = resolve(workspaceRoot);
    this.#build = build;
    this.#session = session;
  }

  /**
   * @description Applies only the freshly reviewed proposal and distinguishes source recovery from later build failure.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Fresh complete proposal.
   * @param {string} fingerprint - Explicit maintainer-reviewed token.
   * @returns {Promise<void>} Verified source/generated/emitted state and complete owned evidence cleanup.
   */
  async apply(plan, fingerprint) {
    if (fingerprint !== plan.fingerprint) {
      throw new CatalogueSourceError("Removal fingerprint does not match current inputs. Review a fresh preview before applying.");
    }
    const session = this.#session();
    const packageRoot = resolve(this.#root, "packages/icons");
    try {
      await this.#build.prepare();
      await session.prepare(plan);
      await session.publish(plan);
      await session.verify(plan, "sources");
      const source = session.source();
      await this.#catalogues.inspect(packageRoot, source.view());
      await source.verify();
      await session.accept(plan);
      await session.guardTree("packages/icons/src/generated");
      await session.guardTree(plan.buildRoot);
      await this.#build.run();
      await session.guardTree("packages/icons/src/generated");
      await session.guardTree(plan.buildRoot);
      await session.verify(plan, "complete");
      const final = session.source();
      const checked = await this.#catalogues.create(final.view()).synchronise(packageRoot, true);
      if (checked.changedPaths.length !== 0) {
        throw new CatalogueSourceError(`Generated removal outputs remain incomplete: ${checked.changedPaths.join(", ")}`);
      }
      await final.verify();
      await this.#emitted(session, plan);
      await session.verified(plan);
      await session.clean();
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown application failure.";
      throw new CatalogueSourceError(await session.failure(reason, plan));
    }
  }

  /**
   * @description Requires compiled counterparts for retained source and no stale removed leaf/dictionary artefacts.
   * @param {CatalogueIconRemovalSession} session - Current guarded filesystem session.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Applied output proposal.
   * @returns {Promise<void>} Existing emitted files for retained outputs and absence for removed outputs.
   */
  async #emitted(session, plan) {
    const source = session.source();
    const removed = [plan.removalPath, ...plan.outputs.filter((output) => output.content === undefined).map((output) => output.path)];
    const retained = [...plan.edits.map((edit) => edit.path), ...plan.outputs.filter((output) => output.content !== undefined && output.path.endsWith(".ts")).map((output) => output.path)];
    for (const { paths, present } of [{ paths: removed, present: false }, { paths: retained, present: true }]) {
      for (const path of paths) {
        const base = path.replace(/^packages\/icons\/src\//u, `${plan.buildRoot}/`).replace(/\.ts$/u, "");
        for (const extension of [".js", ".d.ts"]) {
          const status = await source.status(resolve(this.#root, `${base}${extension}`));
          if ((status?.isFile() ?? false) !== present || (!present && status !== undefined)) {
            throw new CatalogueSourceError(`Emitted removal postcondition failed: ${base}${extension}`);
          }
        }
      }
    }
  }
}
