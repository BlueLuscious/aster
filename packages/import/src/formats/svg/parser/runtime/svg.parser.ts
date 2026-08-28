import type {
  CommentToken,
  OpenTag,
  OpenTagToken,
  TextToken,
  XmlAnyToken,
  XmlAttribute,
} from "xmlsax-typescript";
import { tokenizeXml, XmlSaxError } from "xmlsax-typescript";

import type { ISvgParser } from "../contracts/internal/svg-parser.contract.js";
import type { ISvgSyntaxDocument } from "../contracts/internal/svg-syntax-document.contract.js";
import type { TSvgAttributeInput } from "../types/internal/svg-attribute-input.type.js";
import type { TSvgElementInput } from "../types/internal/svg-element-input.type.js";
import type { TSvgParsingIssue } from "../types/internal/svg-parsing-issue.type.js";
import type { TSvgTagLocation } from "../types/internal/svg-tag-location.type.js";
import type { DiagnosticResultType } from "../../../../diagnostic/types/index.js";
import type { ICanonicalSvgSource } from "../../../../source/contracts/internal/index.js";
import { DiagnosticResultFactory } from "../../../../diagnostic/runtime/diagnostic-result.factory.js";
import { SvgImportError } from "../../shared/runtime/svg-import.error.js";
import { svgParsingIssueKinds } from "../constants/svg-parsing-issue-kinds.constant.js";
import { svgParserLimits } from "../constants/svg-parser-limits.constant.js";
import { xmlInertSections } from "../constants/xml-inert-sections.constant.js";
import { xmlDeclarationPattern } from "../constants/xml-declaration-pattern.constant.js";
import { SvgEntityReferenceDetector } from "./svg-entity-reference.detector.js";
import { SvgParsingDiagnosticFactory } from "./svg-parsing-diagnostic.factory.js";
import { SvgSafetyValidator } from "./svg-safety.validator.js";
import { SvgSubsetValidator } from "./svg-subset.validator.js";
import { SvgSyntaxTreeBuilder } from "./svg-syntax-tree.builder.js";
import { SvgTagLocator } from "./svg-tag.locator.js";
import { SvgXmlCharacterValidator } from "./svg-xml-character.validator.js";

/**
 * @description Parses canonical SVG through a replaceable XML dependency and an Aster-owned trust boundary.
 * @remarks Parser-library tokens exist only within this implementation. Successful output remains an
 * internal untrusted syntax model until later validation stages establish technical validity.
 */
export class SvgParser implements ISvgParser {
  /**
   * @description Exact tag and attribute location authority.
   */
  readonly #tagLocator = new SvgTagLocator();

  /**
   * @description Entity expansion marker detector.
   */
  readonly #entityDetector = new SvgEntityReferenceDetector();

  /**
   * @description Accepted XML 1.0 character-set authority.
   */
  readonly #characterValidator = new SvgXmlCharacterValidator();

  /**
   * @description Blocking SVG safety policy.
   */
  readonly #safetyValidator = new SvgSafetyValidator();

  /**
   * @description Accepted parser-stage SVG subset policy.
   */
  readonly #subsetValidator = new SvgSubsetValidator();

  /**
   * @description Stable parser-neutral diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgParsingDiagnosticFactory();

  /**
   * @description Success and failure result authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Parses one canonical SVG source without returning partial syntax after a failure.
   * @param source - Canonical SVG text and independently acquired identity.
   * @returns Complete untrusted syntax or blocking Aster-owned diagnostics without a value.
   */
  parse(source: ICanonicalSvgSource): DiagnosticResultType<ISvgSyntaxDocument> {
    if (source.content.length > svgParserLimits.maxSourceLength) {
      return this.#failure(source, [
        {
          kind: svgParsingIssueKinds.sourceLimit,
          startOffset: 0,
          endOffset: source.content.length,
        },
      ]);
    }

    const invalidCharacterOffset =
      this.#characterValidator.firstInvalidOffset(source.content);

    if (invalidCharacterOffset !== undefined) {
      return this.#failure(source, [
        {
          kind: svgParsingIssueKinds.malformedDocument,
          startOffset: invalidCharacterOffset,
          endOffset: invalidCharacterOffset + 1,
        },
      ]);
    }

    const issues: TSvgParsingIssue[] = [];

    for (const offset of this.#entityDetector.detect(source.content)) {
      issues.push({
        kind: svgParsingIssueKinds.entityReference,
        startOffset: offset,
        endOffset: offset + 1,
      });
    }

    let tokens: readonly XmlAnyToken[];

    try {
      tokens = tokenizeXml(source.content, {
        xmlns: true,
        includeNamespaceAttributes: true,
        allowDoctype: false,
        coalesceText: false,
        trackPosition: true,
      });
    } catch (error: unknown) {
      if (!(error instanceof XmlSaxError)) {
        throw error;
      }

      issues.push(this.#xmlFailure(source, error));
      return this.#failure(source, issues);
    }

    const tree = new SvgSyntaxTreeBuilder(source);
    let elementCount = 0;
    let nonSelfClosingDepth = 0;
    let rootCount = 0;
    let reportedElementLimit = false;
    let reportedDepthLimit = false;
    const rejectedContentStack: boolean[] = [];

    for (const token of tokens) {
      if (token.position === undefined) {
        throw new SvgImportError(
          "source",
          "parser omitted required source position metadata",
        );
      }

      const startOffset = token.position.offset;

      switch (token.kind) {
        case "open-tag": {
          const openToken = token as OpenTagToken;
          const location = this.#tagLocator.locateOpeningTag(
            source,
            startOffset,
          );
          const element = this.#elementInput(
            openToken.tag,
            openToken.depth,
            location,
          );
          elementCount += 1;

          if (openToken.depth === 1) {
            rootCount += 1;

            if (rootCount > 1) {
              issues.push({
                kind: svgParsingIssueKinds.malformedDocument,
                startOffset: location.span.start.offset,
                endOffset: location.span.end.offset,
              });
            }
          }

          if (
            elementCount > svgParserLimits.maxElements &&
            !reportedElementLimit
          ) {
            reportedElementLimit = true;
            issues.push({
              kind: svgParsingIssueKinds.elementLimit,
              startOffset: location.span.start.offset,
              endOffset: location.span.end.offset,
            });
          }

          if (
            openToken.depth > svgParserLimits.maxElementDepth &&
            !reportedDepthLimit
          ) {
            reportedDepthLimit = true;
            issues.push({
              kind: svgParsingIssueKinds.elementDepthLimit,
              startOffset: location.span.start.offset,
              endOffset: location.span.end.offset,
            });
          }

          if (
            element.attributes.length >
            svgParserLimits.maxAttributesPerElement
          ) {
            issues.push({
              kind: svgParsingIssueKinds.attributeLimit,
              startOffset: location.span.start.offset,
              endOffset: location.span.end.offset,
            });
          }

          if (location.duplicateAttributeName !== undefined) {
            issues.push({
              kind: svgParsingIssueKinds.malformedDocument,
              startOffset: location.span.start.offset,
              endOffset: location.span.end.offset,
            });
          }

          const insideRejectedContent =
            rejectedContentStack[rejectedContentStack.length - 1] ?? false;
          const rejectsCurrentContent =
            this.#safetyValidator.rejectsElement(element.localName);
          let rejectsElementSyntax = rejectsCurrentContent;

          if (!insideRejectedContent) {
            const safetyIssues = this.#safetyValidator.inspect(element);
            rejectsElementSyntax ||= safetyIssues.some(
              (issue) =>
                issue.startOffset === element.nameSpan.start.offset &&
                issue.kind === svgParsingIssueKinds.foreignNamespace,
            );
            issues.push(...safetyIssues);

            if (!rejectsElementSyntax) {
              issues.push(...this.#subsetValidator.inspectElement(element));
            }
          }

          tree.open(element);

          if (!element.selfClosing) {
            nonSelfClosingDepth += 1;
            rejectedContentStack.push(
              insideRejectedContent || rejectsElementSyntax,
            );
          }

          break;
        }
        case "close-tag":
          if (source.content.startsWith("</", startOffset)) {
            tree.close(
              this.#tagLocator.locateClosingTag(source, startOffset),
            );
            nonSelfClosingDepth -= 1;
            rejectedContentStack.pop();
          }

          break;
        case "text": {
          const textToken = token as TextToken;
          const issue = this.#subsetValidator.inspectText(
            textToken.text,
            startOffset,
            this.#textEnd(source.content, startOffset),
            nonSelfClosingDepth > 0,
          );

          if (
            issue !== undefined &&
            !(rejectedContentStack[rejectedContentStack.length - 1] ?? false)
          ) {
            issues.push(issue);
          }

          break;
        }
        case "cdata":
          issues.push({
            kind: svgParsingIssueKinds.unsupportedCdata,
            startOffset,
            endOffset: this.#sectionEnd(
              source.content,
              startOffset,
              xmlInertSections.cdata.closing,
            ),
          });
          break;
        case "processing-instruction": {
          const endOffset = this.#sectionEnd(
            source.content,
            startOffset,
            xmlInertSections.processingInstruction.closing,
          );
          const declaration = source.content.slice(startOffset, endOffset);

          if (
            startOffset !== 0 ||
            !xmlDeclarationPattern.test(declaration)
          ) {
            issues.push({
              kind: svgParsingIssueKinds.processingInstruction,
              startOffset,
              endOffset,
            });
          }

          break;
        }
        case "doctype":
          issues.push({
            kind: svgParsingIssueKinds.doctype,
            startOffset,
            endOffset: this.#sectionEnd(
              source.content,
              startOffset,
              ">",
            ),
          });
          break;
        case "comment": {
          const commentToken = token as CommentToken;

          if (
            commentToken.text.includes("--") ||
            commentToken.text.endsWith("-")
          ) {
            issues.push({
              kind: svgParsingIssueKinds.malformedDocument,
              startOffset,
              endOffset: this.#sectionEnd(
                source.content,
                startOffset,
                xmlInertSections.comment.closing,
              ),
            });
          }

          break;
        }
        case "end":
          break;
      }
    }

    if (rootCount === 0) {
      issues.push({
        kind: svgParsingIssueKinds.malformedDocument,
        startOffset: 0,
        endOffset: source.content.length,
      });
    }

    if (issues.length > 0) {
      return this.#failure(source, issues);
    }

    return this.#resultFactory.success(tree.finish());
  }

  /**
   * @description Converts one parser-library opening tag into a located Aster-owned input.
   * @param tag - Parser-library opening tag confined to this implementation.
   * @param depth - One-based parser structural depth.
   * @param location - Aster-owned exact opening-tag locations.
   * @returns Frozen parser-neutral element input.
   */
  #elementInput(
    tag: OpenTag,
    depth: number,
    location: TSvgTagLocation,
  ): TSvgElementInput {
    const attributes = location.attributes.map((attributeLocation) => {
      const parserAttribute = tag.attributes[attributeLocation.name];

      if (
        parserAttribute === undefined ||
        typeof parserAttribute === "string"
      ) {
        throw new SvgImportError(
          "source",
          "parser attribute metadata did not match exact source syntax",
        );
      }

      return this.#attributeInput(parserAttribute, attributeLocation);
    });

    return Object.freeze({
      name: tag.name,
      localName: tag.local ?? tag.name,
      prefix: tag.prefix ?? "",
      namespaceUri: tag.uri ?? "",
      attributes: Object.freeze(attributes),
      selfClosing: tag.isSelfClosing,
      depth,
      openingSpan: location.span,
      nameSpan: location.nameSpan,
    });
  }

  /**
   * @description Converts parser namespace metadata and exact authored location into an Aster input.
   * @param attribute - Parser-library namespace metadata confined to this implementation.
   * @param location - Exact Aster-owned authored attribute location.
   * @returns Frozen parser-neutral attribute input.
   */
  #attributeInput(
    attribute: XmlAttribute,
    location: TSvgTagLocation["attributes"][number],
  ): TSvgAttributeInput {
    return Object.freeze({
      name: location.name,
      localName: attribute.local,
      prefix: attribute.prefix,
      namespaceUri: attribute.uri,
      value: location.value,
      span: location.span,
      nameSpan: location.nameSpan,
      valueSpan: location.valueSpan,
    });
  }

  /**
   * @description Maps one XML parser failure to an Aster-owned issue without exposing its message.
   * @param source - Canonical SVG source.
   * @param error - Selected parser's structured XML failure.
   * @returns Parser-neutral safety or syntax issue.
   */
  #xmlFailure(
    source: ICanonicalSvgSource,
    error: XmlSaxError,
  ): TSvgParsingIssue {
    const startOffset = Math.max(
      0,
      Math.min(error.offset, source.content.length),
    );

    return {
      kind: source.content.startsWith("<!DOCTYPE", startOffset)
        ? svgParsingIssueKinds.doctype
        : svgParsingIssueKinds.malformedDocument,
      startOffset,
      endOffset: Math.min(startOffset + 1, source.content.length),
    };
  }

  /**
   * @description Resolves the raw character-data end at the next markup boundary.
   * @param content - Exact canonical source content.
   * @param startOffset - Inclusive character-data offset.
   * @returns Exclusive raw character-data offset.
   */
  #textEnd(content: string, startOffset: number): number {
    const markupOffset = content.indexOf("<", startOffset);
    return markupOffset === -1 ? content.length : markupOffset;
  }

  /**
   * @description Resolves an exclusive lexical-section end from a parser-proven opening.
   * @param content - Exact canonical source content.
   * @param startOffset - Inclusive lexical-section opening offset.
   * @param closing - Exact lexical closing marker.
   * @returns Exclusive lexical-section end, or source end for defensive diagnostics.
   */
  #sectionEnd(
    content: string,
    startOffset: number,
    closing: string,
  ): number {
    const closingOffset = content.indexOf(closing, startOffset);
    return closingOffset === -1
      ? content.length
      : closingOffset + closing.length;
  }

  /**
   * @description Creates one failure result from parser-neutral issues.
   * @param source - Canonical SVG source.
   * @param issues - Blocking parser-neutral issues.
   * @returns Failed result without partial syntax.
   */
  #failure(
    source: ICanonicalSvgSource,
    issues: readonly TSvgParsingIssue[],
  ): DiagnosticResultType<ISvgSyntaxDocument> {
    return this.#resultFactory.failure(
      issues.map((issue) => this.#diagnosticFactory.create(source, issue)),
    );
  }
}
