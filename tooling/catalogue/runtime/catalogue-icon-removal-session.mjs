import { createHash, randomUUID } from "node:crypto";
import * as nodeFileSystem from "node:fs/promises";
import { resolve } from "node:path";

import { catalogueIconRemoval } from "../constants/catalogue-icon-removal.constant.mjs";
import { CatalogueIconRemovalSource } from "./catalogue-icon-removal-source.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Owns guarded source publication, exact recovery copies and finite application evidence.
 * @remarks Exclusive links publish only into absent destinations. Observed races are preserved, not overwritten; this is not a lock against arbitrary editors or an atomic source/build transaction.
 */
export class CatalogueIconRemovalSession {
  /** @description Explicit physical workspace boundary. */
  #root;
  /** @description Borrowed Node filesystem effects; inspections retain their no-follow authority. */
  #fs;
  /** @description Unique adjacent same-volume recovery directory. */
  #directory;
  /** @description Cooperating removal invocations' exclusive marker. */
  #lock;
  /** @description Unique marker text expected by this session. */
  #marker;
  /** @description Whether this session created its recovery directory. */
  #created = false;
  /** @description Whether exclusive marker acquisition completed. */
  #locked = false;
  /** @description Whether any source displacement was attempted successfully. */
  #mutated = false;
  /** @description Whether the complete prospective source graph has been accepted. */
  #accepted = false;
  /** @description Whether source/generated/emitted postconditions completed before evidence cleanup. */
  #verified = false;
  /**
   * @description Owned evidence files and their exact current contents.
   * @type {Map<string, string>}
   */
  #evidence = new Map();
  /**
   * @description Ordered source actions, including incomplete publication/restoration.
   * @type {import("../contracts/internal/catalogue-icon-removal-state.contract.mjs").ICatalogueIconRemovalState[]}
   */
  #states = [];
  /** @description Monotonic immutable recovery-record sequence. */
  #sequence = 0;

  /**
   * @description Creates one session without acquiring locks or writing anything.
   * @param {string} workspaceRoot - Explicit workspace containing packages/icons.
   * @param {typeof nodeFileSystem} [fileSystem] - Borrowed Node effects.
   */
  constructor(workspaceRoot, fileSystem = nodeFileSystem) {
    this.#root = resolve(workspaceRoot);
    this.#fs = fileSystem;
    this.#directory = resolve(this.#root, `packages/icons/${catalogueIconRemoval.stageMarker}${randomUUID()}`);
    this.#lock = resolve(this.#root, `packages/icons/${catalogueIconRemoval.lockName}`);
    this.#marker = JSON.stringify({ owner: "aster-icon-removal", directory: this.#directory, token: randomUUID() }) + "\n";
  }

  /**
   * @description Checks every acquired input, inventory and absence, accounting only for owned changes.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Reviewed proposal.
   * @param {"before" | "sources" | "complete"} stage - Accepted changes at this boundary.
   * @returns {Promise<void>} Completion only when exact state and physical paths agree.
   */
  async verify(plan, stage = "before") {
    await this.#ownership();
    const source = this.source();
    const view = source.view();
    /** @type {Map<string, string | undefined>} */
    const changes = new Map();
    if (stage !== "before") {
      for (const edit of plan.edits) {
        changes.set(edit.path, edit.after);
      }
      changes.set(plan.removalPath, undefined);
      if (stage === "complete") {
        for (const output of plan.outputs) {
          changes.set(output.path, output.content);
        }
      }
    }
    for (const input of plan.inputs) {
      const expected = changes.has(input.path) ? changes.get(input.path) : input.content;
      if (await view.readTextIfPresent(resolve(this.#root, input.path)) !== expected) {
        throw new CatalogueSourceError(`Removal input changed: ${input.path}`);
      }
    }
    for (const [path, expected] of changes) {
      if (await view.readTextIfPresent(resolve(this.#root, path)) !== expected) {
        throw new CatalogueSourceError(`Removal postimage differs: ${path}`);
      }
    }
    for (const inventory of plan.inventories) {
      if (stage === "complete" && inventory.path.startsWith("packages/icons/src/generated")) {
        continue;
      }
      let expected = [...inventory.entries];
      if (stage === "complete" && inventory.path === "packages/icons" && !expected.includes("directory:dist")) {
        expected.push("directory:dist");
      }
      const prefix = inventory.path === "" ? "" : `${inventory.path}/`;
      for (const [path, content] of changes) {
        if (path.startsWith(prefix) && !path.slice(prefix.length).includes("/")) {
          expected = expected.filter((entry) => entry !== `file:${path.slice(prefix.length)}`);
          if (content !== undefined) {
            expected.push(`file:${path.slice(prefix.length)}`);
          }
        }
      }
      const actual = (await view.entries(resolve(this.#root, inventory.path))).map((entry) => `${entry.kind}:${entry.name}`);
      if (JSON.stringify(actual.sort()) !== JSON.stringify(expected.sort())) {
        throw new CatalogueSourceError(`Removal directory changed: ${inventory.path}`);
      }
    }
    for (const path of plan.absentPaths) {
      if (!changes.has(path) && await view.exists(resolve(this.#root, path))) {
        throw new CatalogueSourceError(`Absent removal input appeared: ${path}`);
      }
    }
    await source.verify();
  }

  /**
   * @description Acquires exclusive evidence and prepares complete originals and same-volume publication probes.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Exact source edits/removal.
   * @returns {Promise<void>} Prepared originals and finite recovery record, before source mutation.
   */
  async prepare(plan) {
    await this.verify(plan);
    await this.guardTree("packages/icons/src/generated");
    await this.guardTree(plan.buildRoot);
    try {
      await this.#fs.writeFile(this.#lock, this.#marker, { encoding: "utf8", flag: "wx" });
      this.#locked = true;
    } catch (error) {
      if (await this.source().view().readTextIfPresent(this.#lock) === this.#marker) {
        this.#locked = true;
      }
      throw error;
    }
    await this.#fs.mkdir(this.#directory);
    this.#created = true;
    await this.#save("owner.json", this.#marker);
    const removed = plan.inputs.find((input) => input.path === plan.removalPath);
    if (removed === undefined) {
      throw new CatalogueSourceError("Selected source preimage is missing from the removal plan.");
    }
    for (const [index, edit] of [...plan.edits, { path: plan.removalPath, before: removed.content, after: undefined }].entries()) {
      const state = { path: edit.path, before: edit.before, after: edit.after, original: `${index}.original`, prepared: `${index}.prepared`, displaced: `${index}.displaced`, moved: false, published: false, restored: false };
      this.#states.push(state);
      await this.#save(state.original, state.before);
      if (state.after !== undefined) {
        await this.#save(state.prepared, state.after);
      }
      const probe = resolve(this.#directory, `${index}.probe`);
      await this.#expect(resolve(this.#directory, state.original), state.before);
      await this.#expect(probe, undefined);
      await this.#fs.link(resolve(this.#directory, state.original), probe);
      await this.#fs.unlink(probe);
    }
    await this.#record(plan, "prepared");
    await this.verify(plan);
  }

  /**
   * @description Publishes deterministic collection edits and quarantines the selected definition last.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Reviewed proposal.
   * @returns {Promise<void>} Completed source effects, not yet graph acceptance.
   */
  async publish(plan) {
    for (const state of this.#states) {
      await this.#ownership();
      const target = resolve(this.#root, state.path);
      await this.#expect(target, state.before);
      await this.#expect(resolve(this.#directory, state.displaced), undefined);
      await this.#record(plan, `before ${state.path}`);
      await this.#ownership();
      await this.#expect(target, state.before);
      try {
        await this.#fs.rename(target, resolve(this.#directory, state.displaced));
      } catch (error) {
        if (await nodeFileSystem.lstat(resolve(this.#directory, state.displaced)).catch(() => undefined) !== undefined) {
          state.moved = true;
          this.#mutated = true;
        }
        throw error;
      }
      state.moved = true;
      this.#mutated = true;
      await this.source().status(resolve(this.#directory, state.displaced));
      const displaced = await nodeFileSystem.readFile(resolve(this.#directory, state.displaced), "utf8");
      this.#evidence.set(state.displaced, displaced);
      if (displaced !== state.before) {
        throw new CatalogueSourceError(`Source changed during displacement: ${state.path}`);
      }
      if (state.after !== undefined) {
        await this.#expect(resolve(this.#directory, state.prepared), state.after);
        await this.#fs.link(resolve(this.#directory, state.prepared), target);
        state.published = true;
        await this.#fs.unlink(resolve(this.#directory, state.prepared));
        this.#evidence.delete(state.prepared);
        await this.#expect(target, state.after);
      }
      await this.#record(plan, `published ${state.path}`);
    }
  }

  /**
   * @description Records source acceptance before invoking independent generated/build effects.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Applied source proposal.
   * @returns {Promise<void>} Persisted accepted-source boundary.
   */
  async accept(plan) {
    this.#accepted = true;
    try {
      await this.#record(plan, "sources accepted; build pending");
    } catch (error) {
      this.#accepted = false;
      throw error;
    }
  }

  /**
   * @description Separates completed output verification from subsequent evidence cleanup.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Fully verified proposal.
   * @returns {Promise<void>} Recorded final postconditions before cleanup.
   */
  async verified(plan) {
    this.#verified = true;
    await this.#record(plan, "sources and distribution verified; cleanup pending");
  }

  /**
   * @description Attempts reverse-order restoration without replacing changed or reappeared targets.
   * @returns {Promise<void>} Per-file restoration attempts; conflicts remain in the report/evidence.
   */
  async restore() {
    if (this.#accepted) {
      return;
    }
    for (const state of [...this.#states].reverse()) {
      if (!state.moved) {
        continue;
      }
      try {
        await this.#ownership();
        const target = resolve(this.#root, state.path);
        if (state.published) {
          await this.#expect(target, state.after);
          const withdrawn = `${state.displaced}.withdrawn`;
          await this.#expect(resolve(this.#directory, withdrawn), undefined);
          await this.#fs.rename(target, resolve(this.#directory, withdrawn));
          await this.source().status(resolve(this.#directory, withdrawn));
          const actual = await nodeFileSystem.readFile(resolve(this.#directory, withdrawn), "utf8");
          this.#evidence.set(withdrawn, actual);
          if (actual !== state.after) {
            await this.#fs.link(resolve(this.#directory, withdrawn), target);
            await this.#fs.unlink(resolve(this.#directory, withdrawn));
            this.#evidence.delete(withdrawn);
            continue;
          }
        } else {
          await this.#expect(target, undefined);
        }
        const displaced = resolve(this.#directory, state.displaced);
        await this.source().status(displaced);
        if (this.#evidence.has(state.displaced)) {
          await this.#expect(displaced, this.#evidence.get(state.displaced));
        }
        await this.#fs.link(displaced, target);
        await this.#fs.unlink(displaced);
        this.#evidence.delete(state.displaced);
        state.restored = true;
      } catch {
        continue;
      }
    }
  }

  /**
   * @description Creates a physically guarded fresh source view excluding only this session's exact evidence.
   * @returns {CatalogueIconRemovalSource} Independent no-follow snapshot owner.
   */
  source() {
    return new CatalogueIconRemovalSource(this.#root, this.#locked ? [this.#lock, this.#directory] : []);
  }

  /**
   * @description Rejects links and non-regular entries throughout a future producer/cleaner boundary.
   * @param {string} path - Workspace-relative owned tree.
   * @returns {Promise<void>} Completion for absent or physically contained regular entries.
   */
  async guardTree(path) {
    const source = this.source();
    const target = resolve(this.#root, path);
    const status = await source.status(target);
    if (status?.isDirectory()) {
      for (const entry of await source.view().entries(target)) {
        await this.guardTree(`${path}/${entry.name}`);
      }
    }
  }

  /**
   * @description Cleans only exact owned evidence after success or preparation-only failure.
   * @param {boolean} [incomplete] - Whether absent preparation files are expected after a pre-mutation failure.
   * @returns {Promise<void>} Complete cleanup or retained evidence on any mismatch/failure.
   */
  async clean(incomplete = false) {
    await this.#ownership();
    if (this.#created) {
      const names = await nodeFileSystem.readdir(this.#directory);
      if (names.some((name) => !this.#evidence.has(name)) || (!incomplete && names.length !== this.#evidence.size)) {
        throw new CatalogueSourceError("Recovery evidence changed; cleanup refused.");
      }
      for (const [name, content] of this.#evidence) {
        if (incomplete && !names.includes(name)) {
          continue;
        }
        await this.#expect(resolve(this.#directory, name), content);
      }
      for (const [name, content] of this.#evidence) {
        if (incomplete && !names.includes(name)) {
          this.#evidence.delete(name);
          continue;
        }
        await this.#expect(resolve(this.#directory, name), content);
        await this.#fs.unlink(resolve(this.#directory, name));
        this.#evidence.delete(name);
      }
      await this.#fs.rmdir(this.#directory);
      this.#created = false;
    }
    if (this.#locked) {
      await this.#expect(this.#lock, this.#marker);
      await this.#fs.unlink(this.#lock);
      this.#locked = false;
    }
  }

  /**
   * @description Captures failure state without hiding individual restoration or independent build work.
   * @param {string} reason - Exact observed failure.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Original proposal for the final recovery record.
   * @returns {Promise<string>} Finite actionable status, with retained recovery paths when present.
   */
  async failure(reason, plan) {
    await this.restore();
    if (!this.#mutated) {
      try {
        await this.clean(true);
      } catch {
        reason += " Preparation evidence could not be safely cleaned.";
      }
    } else {
      try {
        await this.#ownership();
        await this.#record(plan, `failed: ${reason}`);
      } catch {
        reason += " The final recovery record could not be safely written; retain all existing evidence.";
      }
    }
    const lines = [reason, `Sources accepted: ${this.#accepted ? (this.#verified ? "yes; distribution verified; evidence cleanup incomplete" : "yes; generated/emitted verification is incomplete") : "no"}`];
    for (const state of this.#states) {
      lines.push(`${state.restored ? "Restored" : state.moved ? (this.#accepted ? "Applied" : "Pending recovery") : "Not applied"}: ${state.path}`);
    }
    if (this.#locked || this.#created) {
      lines.push(`Recovery directory: ${this.#directory}`, `Cooperative marker: ${this.#lock}`, "Inspect original copies and recovery records before manual repair. Do not start another removal or discard evidence until sources and distribution are verified.");
    }
    return lines.join("\n");
  }

  /**
   * @description Rechecks exclusive marker and recovery-root ownership without following links.
   * @returns {Promise<void>} Completion only for this exact live session.
   */
  async #ownership() {
    if (this.#locked) {
      await this.#expect(this.#lock, this.#marker);
    }
    if (this.#created) {
      const status = await this.source().status(this.#directory);
      if (!status?.isDirectory()) {
        throw new CatalogueSourceError("Recovery directory is unavailable.");
      }
      if (this.#evidence.has("owner.json")) {
        await this.#expect(resolve(this.#directory, "owner.json"), this.#marker);
      }
    }
  }

  /**
   * @description Requires exact regular-file bytes or genuine absence at a contained path.
   * @param {string} path - Absolute contained target.
   * @param {string | undefined} expected - Exact UTF-8 contents, or absence.
   * @returns {Promise<void>} Completion only for the required current state.
   */
  async #expect(path, expected) {
    const source = this.source();
    if (await source.view().readTextIfPresent(path) !== expected) {
      throw new CatalogueSourceError(`Source/evidence preimage changed: ${source.display(path)}`);
    }
  }

  /**
   * @description Writes a new exclusive immutable evidence file, never replacing prior records.
   * @param {string} name - Session-owned flat filename.
   * @param {string} content - Complete exact contents.
   * @returns {Promise<void>} Successful exclusive creation.
   */
  async #save(name, content) {
    await this.#ownership();
    await this.#expect(resolve(this.#directory, name), undefined);
    this.#evidence.set(name, content);
    await this.#fs.writeFile(resolve(this.#directory, name), content, { encoding: "utf8", flag: "wx" });
  }

  /**
   * @description Persists complete action positions and hashes alongside independent original copies.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Reviewed plan.
   * @param {string} stage - Last fully observed lifecycle boundary.
   * @returns {Promise<void>} New immutable recovery record.
   */
  async #record(plan, stage) {
    const content = JSON.stringify({ identity: plan.identity, fingerprint: plan.fingerprint, stage, sourcesAccepted: this.#accepted, states: this.#states.map(({ before, after, ...state }) => ({ ...state, beforeHash: createHash("sha256").update(before).digest("hex"), afterHash: after === undefined ? null : createHash("sha256").update(after).digest("hex") })) }, null, 2) + "\n";
    await this.#save(`record-${this.#sequence++}.json`, content);
  }
}
