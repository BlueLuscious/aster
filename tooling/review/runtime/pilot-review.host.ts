import {
  mkdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { AsterCollection } from "@aster/icons";
import { pilotReviewConfig } from "../constants/pilot-review-config.constant.js";
import { PilotReviewPlanner } from "./pilot-review.planner.js";

/**
 * @description Filesystem host for disposable deterministic Aster pilot review evidence.
 */
export class PilotReviewHost {
  /**
   * @description Pure review artefact planner.
   */
  readonly #planner = new PilotReviewPlanner();

  /**
   * @description Rebuilds the fixed owned review boundary from canonical package definitions.
   * @param workspaceRoot - Absolute Aster workspace root.
   * @returns Completion after every planned UTF-8 file is committed.
   */
  async generate(workspaceRoot: string): Promise<void> {
    const outputRoot = resolve(
      workspaceRoot,
      pilotReviewConfig.outputDirectory,
    );
    const ownedRoot = resolve(workspaceRoot, "dist/review");

    if (!this.#isWithin(ownedRoot, outputRoot) || outputRoot === ownedRoot) {
      throw new TypeError("Pilot review output must remain below dist/review.");
    }

    const files = this.#planner.plan(AsterCollection);
    await rm(outputRoot, { recursive: true, force: true });

    for (const file of files) {
      const target = resolve(outputRoot, ...file.path.split("/"));

      if (!this.#isWithin(outputRoot, target) || target === outputRoot) {
        throw new TypeError(
          `Review file escapes the owned output root: ${file.path}`,
        );
      }

      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.content, "utf8");
    }

    process.stdout.write(
      `Generated ${files.length} disposable review files in ${pilotReviewConfig.outputDirectory}.\n`,
    );
  }

  /**
   * @description Determines whether one absolute path is inside or equal to another.
   * @param root - Candidate absolute ancestor.
   * @param target - Candidate absolute descendant.
   * @returns Whether the target remains within the root.
   */
  #isWithin(root: string, target: string): boolean {
    const relation = relative(root, target);
    return (
      relation === "" ||
      (relation !== ".." && !relation.startsWith(`..${sep}`))
    );
  }
}

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await new PilotReviewHost().generate(
    resolve(dirname(fileURLToPath(import.meta.url)), "../../.."),
  );
}
