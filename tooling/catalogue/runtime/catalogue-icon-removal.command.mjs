import { catalogueIconRemoval } from "../constants/catalogue-icon-removal.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Adapts private read-only removal planning to finite process output.
 */
export class CatalogueIconRemovalCommand {
  /** @description Borrowed read-only planning capability. */
  #planner;
  /** @description Borrowed process arguments, streams and exit state. */
  #process;

  /**
   * @description Creates a private preview command without application authority.
   * @param {{ plan(selector: string): Promise<import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan> }} planner - Read-only planner.
   * @param {{ argv: string[], stdout: { write(text: string): unknown }, stderr: { write(text: string): unknown }, exitCode?: string | number | null | undefined }} processHost - Explicit process capability.
   */
  constructor(planner, processHost) {
    this.#planner = planner;
    this.#process = processHost;
  }

  /**
   * @description Executes exactly one preview or reports unsupported invocation without planning.
   * @returns {Promise<void>} Completion after finite output or failure reporting.
   */
  async run() {
    const arguments_ = this.#process.argv.slice(2);
    if (arguments_.includes("--apply")) {
      this.#process.stderr.write("Icon removal application is not implemented; this command is preview-only.\n");
      this.#process.exitCode = 1;
      return;
    }
    const selector = arguments_[0];
    if (arguments_.length !== 1 || selector === undefined || selector.startsWith("-")) {
      this.#process.stderr.write(`Usage: ${catalogueIconRemoval.command} <[namespace/]name@variant>\n`);
      this.#process.exitCode = 1;
      return;
    }
    try {
      const plan = await this.#planner.plan(selector);
      this.#process.stdout.write(this.#format(plan));
    } catch (error) {
      this.#process.stderr.write(`Icon removal preview failed: ${this.#text(error instanceof CatalogueSourceError ? error.message : "Input acquisition or inspection failed.")}\n`);
      this.#process.exitCode = 1;
    }
  }

  /**
   * @description Shows every exact authored edit, derived change and disclosed manual-review notice.
   * @param {import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan} plan - Complete immutable proposal.
   * @returns {string} Deterministic terminal/redirection text, without terminal controls from source values.
   */
  #format(plan) {
    const lines = [
      "Icon removal preview (no files written)",
      `Identity: ${this.#text(plan.identity)}`,
      `Fingerprint: ${plan.fingerprint}`,
      `Remove file: ${this.#text(plan.removalPath)} (entire file)`,
      "Collection edits:",
    ];
    if (plan.edits.length === 0) {
      lines.push("  (none)");
    }
    for (const edit of plan.edits) {
      lines.push(`  ${this.#text(edit.path)}`, `  Aliases: ${edit.aliases.map((alias) => this.#text(alias)).join(", ")}`);
      if (edit.empty) {
        lines.push("  Review required: collection becomes empty; curatorial and test policies still apply.");
      }
      for (const change of edit.changes) {
        lines.push(`  @@ UTF-16 ${change.start}:${change.end} @@`);
        for (const line of change.removedText.replace(/\r?\n$/u, "").split(/\r?\n/u)) {
          lines.push(`  -${this.#text(line)}`);
        }
      }
    }
    lines.push("Generated/export changes:");
    for (const output of plan.outputs) {
      lines.push(`  ${output.content === undefined ? "Remove" : "Update"}: ${this.#text(output.path)}`);
    }
    lines.push(`Rebuild: ${plan.buildCommand}`, `Owned emitted root: ${plan.buildRoot}`, "Review references:");
    if (plan.references.length === 0) {
      lines.push("  (none)");
    }
    for (const reference of plan.references) {
      lines.push(`  ${this.#text(reference.path)}:${reference.lines.join(",")}`);
    }
    lines.push(
      "Reference search: literal identities, export names, canonical filenames and public leaf routes in packages/tooling/tests/docs and README.md.",
      "Generated/dependency/output trees are excluded; computed and external references are not proven absent.",
      "No tests, documentation, provenance or artwork have been changed. Application is not implemented.",
    );
    return `${lines.join("\n")}\n`;
  }

  /**
   * @description Escapes source-derived terminal controls without changing stored plan text.
   * @param {string} value - One presentation line/value.
   * @returns {string} Visible control representation suitable for terminal or redirection.
   */
  #text(value) {
    return value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/gu, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
  }
}
