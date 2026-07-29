import type { ISvgSyntaxAttribute } from "../contracts/internal/svg-syntax-attribute.contract.js";
import type { ISvgSyntaxDocument } from "../contracts/internal/svg-syntax-document.contract.js";
import type { ISvgSyntaxElement } from "../contracts/internal/svg-syntax-element.contract.js";
import type { TSvgElementInput } from "../types/internal/svg-element-input.type.js";
import type { TSvgSyntaxElementBuilder } from "../types/internal/svg-syntax-element-builder.type.js";
import type { CanonicalSvgSource } from "../../source/contracts/index.js";
import type { SourceSpan } from "../../diagnostic/contracts/index.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { SourceLocator } from "../../source/runtime/source.locator.js";

/**
 * @description Assembles parser-neutral SVG syntax while preserving hierarchy and exact source order.
 */
export class SvgSyntaxTreeBuilder {
  /**
   * @description Canonical source retained only while constructing spans and the document identity.
   */
  readonly #source: CanonicalSvgSource;

  /**
   * @description Exact UTF-16 source-position authority.
   */
  readonly #sourceLocator = new SourceLocator();

  /**
   * @description Open element stack in source order.
   */
  readonly #stack: TSvgSyntaxElementBuilder[] = [];

  /**
   * @description Parsed document-level elements used to prove a sole root before completion.
   */
  readonly #roots: TSvgSyntaxElementBuilder[] = [];

  /**
   * @description Creates an empty syntax assembler for one canonical source.
   * @param source - Canonical SVG source.
   */
  constructor(source: CanonicalSvgSource) {
    this.#source = source;
  }

  /**
   * @description Adds one located parser-neutral opening element.
   * @param element - Located opening element input.
   * @returns Nothing.
   */
  open(element: TSvgElementInput): void {
    const builder: TSvgSyntaxElementBuilder = {
      name: element.name,
      localName: element.localName,
      prefix: element.prefix,
      namespaceUri: element.namespaceUri,
      attributes: element.attributes,
      openingSpan: element.openingSpan,
      nameSpan: element.nameSpan,
      children: [],
      endOffset: element.openingSpan.end.offset,
    };
    const parent = this.#stack[this.#stack.length - 1];

    if (parent === undefined) {
      this.#roots.push(builder);
    } else {
      parent.children.push(builder);
    }

    if (!element.selfClosing) {
      this.#stack.push(builder);
    }
  }

  /**
   * @description Completes the most recently opened non-self-closing element.
   * @param closingSpan - Complete parser-validated closing-tag span.
   * @returns Nothing.
   */
  close(closingSpan: SourceSpan): void {
    const builder = this.#stack.pop();

    if (builder === undefined) {
      throw new BuildContractError(
        "source",
        "parser emitted an unmatched closing boundary",
      );
    }

    builder.endOffset = closingSpan.end.offset;
  }

  /**
   * @description Creates the deeply immutable syntax document after all source invariants are proven.
   * @returns Complete parser-neutral syntax document.
   */
  finish(): ISvgSyntaxDocument {
    if (this.#roots.length !== 1 || this.#stack.length !== 0) {
      throw new BuildContractError(
        "source",
        "cannot finish syntax without one complete root",
      );
    }

    const root = this.#roots[0];

    if (root === undefined) {
      throw new BuildContractError(
        "source",
        "cannot finish syntax without a root",
      );
    }

    return Object.freeze({
      sourceId: this.#source.sourceId,
      root: this.#freezeElement(root),
    });
  }

  /**
   * @description Converts mutable construction state into one deeply immutable syntax element.
   * @param builder - Completed construction state.
   * @returns Deeply frozen parser-neutral syntax element.
   */
  #freezeElement(builder: TSvgSyntaxElementBuilder): ISvgSyntaxElement {
    const attributes = builder.attributes.map((attribute) =>
      this.#freezeAttribute(attribute),
    );
    const children = builder.children.map((child) =>
      this.#freezeElement(child),
    );

    return Object.freeze({
      name: builder.name,
      localName: builder.localName,
      prefix: builder.prefix,
      namespaceUri: builder.namespaceUri,
      attributes: Object.freeze(attributes),
      children: Object.freeze(children),
      openingSpan: builder.openingSpan,
      nameSpan: builder.nameSpan,
      span: this.#sourceLocator.span(
        this.#source,
        builder.openingSpan.start.offset,
        builder.endOffset,
      ),
    });
  }

  /**
   * @description Isolates and freezes one located syntax attribute.
   * @param attribute - Located parser-neutral attribute input.
   * @returns Deeply frozen syntax attribute.
   */
  #freezeAttribute(
    attribute: TSvgElementInput["attributes"][number],
  ): ISvgSyntaxAttribute {
    return Object.freeze({
      name: attribute.name,
      localName: attribute.localName,
      prefix: attribute.prefix,
      namespaceUri: attribute.namespaceUri,
      value: attribute.value,
      span: attribute.span,
      nameSpan: attribute.nameSpan,
      valueSpan: attribute.valueSpan,
    });
  }
}
