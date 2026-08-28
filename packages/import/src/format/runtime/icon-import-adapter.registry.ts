import type { IIconImportAdapter } from "../contracts/internal/icon-import-adapter.contract.js";
import type { IconImportFormatType } from "../types/index.js";
import { IconImportError } from "../../error/index.js";

/**
 * @description Immutable explicit composition of built-in icon import adapters.
 */
export class IconImportAdapterRegistry {
  /**
   * @description Adapter authority indexed by exact built-in format.
   */
  readonly #adapters: ReadonlyMap<IconImportFormatType, IIconImportAdapter>;

  /**
   * @description Creates one immutable adapter composition.
   * @param adapters - Complete explicit built-in adapter sequence.
   */
  constructor(adapters: readonly IIconImportAdapter[]) {
    const indexed = new Map<IconImportFormatType, IIconImportAdapter>();

    for (const adapter of adapters) {
      if (indexed.has(adapter.format)) {
        throw new IconImportError(
          "adapters",
          `duplicate adapter for ${adapter.format}`,
        );
      }

      indexed.set(adapter.format, adapter);
    }

    this.#adapters = indexed;
  }

  /**
   * @description Resolves the sole adapter responsible for one built-in format.
   * @param format - Exact source format discriminator.
   * @returns Matching internal format adapter.
   */
  resolve(format: IconImportFormatType): IIconImportAdapter {
    const adapter = this.#adapters.get(format);

    if (adapter === undefined) {
      throw new IconImportError("source.format", "unsupported import format");
    }

    return adapter;
  }
}
