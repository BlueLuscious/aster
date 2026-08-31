import { documentationHierarchy } from "../constants/documentation-hierarchy.constant.mjs";
import { DocumentationIssueCollector } from "./documentation-issue.collector.mjs";

/**
 * @description Coordinates canonical documentation acquisition and independent policy inspectors.
 */
export class DocumentationVerifier {
  /**
   * @description Inspectors executed before canonical document acquisition.
   * @type {readonly import("../contracts/internal/documentation-inspector.contract.mjs").IDocumentationInspector[]}
   */
  #rootInspectors;

  /**
   * @description Canonical Markdown acquisition authority.
   * @type {import("./canonical-document.reader.mjs").CanonicalDocumentReader}
   */
  #documents;

  /**
   * @description Inspector applying ordered policies to acquired documents.
   * @type {import("./canonical-document.inspector.mjs").CanonicalDocumentInspector}
   */
  #documentInspector;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a documentation verifier with stable acquisition and policy order.
   * @param {readonly import("../contracts/internal/documentation-inspector.contract.mjs").IDocumentationInspector[]} rootInspectors - Ordered pre-acquisition inspectors.
   * @param {import("./canonical-document.reader.mjs").CanonicalDocumentReader} documents - Canonical Markdown reader.
   * @param {import("./canonical-document.inspector.mjs").CanonicalDocumentInspector} documentInspector - Ordered document policy inspector.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(rootInspectors, documents, documentInspector, paths) {
    this.#rootInspectors = Object.freeze([...rootInspectors]);
    this.#documents = documents;
    this.#documentInspector = documentInspector;
    this.#paths = paths;
  }

  /**
   * @description Verifies canonical documentation for one explicit workspace.
   * @param {string} workspaceRoot - Absolute repository root to verify.
   * @returns {Promise<{ issues: string[], markdownFileCount: number }>} Stable verification result.
   */
  async verify(workspaceRoot) {
    const issues = new DocumentationIssueCollector();
    const documentationRoot = this.#paths.resolve(
      workspaceRoot,
      documentationHierarchy.root,
    );
    /** @type {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} */
    const rootContext = Object.freeze({
      workspaceRoot,
      documentationRoot,
      documents: Object.freeze([]),
    });

    for (const inspector of this.#rootInspectors) {
      await inspector.inspect(rootContext, issues);
    }

    const documents = await this.#documents.read(documentationRoot);
    /** @type {import("../types/internal/documentation-context.type.mjs").TDocumentationContext} */
    const context = Object.freeze({ workspaceRoot, documentationRoot, documents });

    await this.#documentInspector.inspect(context, issues);

    return { issues: issues.snapshot(), markdownFileCount: documents.length };
  }
}
