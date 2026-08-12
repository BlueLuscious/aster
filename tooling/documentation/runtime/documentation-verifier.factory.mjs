import { NodeRepositoryFileSystem } from "../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryDirectoryReader } from "../../shared/runtime/repository-directory.reader.mjs";
import { RepositoryFileWalker } from "../../shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../../shared/runtime/repository-path.resolver.mjs";
import { CanonicalDocumentInspector } from "./canonical-document.inspector.mjs";
import { CanonicalDocumentReader } from "./canonical-document.reader.mjs";
import { DecisionRecordInspector } from "./decision-record.inspector.mjs";
import { DocumentationHierarchyInspector } from "./documentation-hierarchy.inspector.mjs";
import { DocumentationVerifier } from "./documentation-verifier.mjs";
import { LocalLinkPolicy } from "./local-link.policy.mjs";
import { LocalReferencePolicy } from "./local-reference.policy.mjs";
import { MarkdownLinkTargetExtractor } from "./markdown-link-target.extractor.mjs";
import { PackageDocumentationMirroringInspector } from "./package-documentation-mirroring.inspector.mjs";

/**
 * @description Composes documentation verification from private repository capabilities and policies.
 */
export class DocumentationVerifierFactory {
  /**
   * @description Creates one independently stateful documentation verifier.
   * @returns {DocumentationVerifier} Fully composed documentation verifier.
   */
  create() {
    const fileSystem = new NodeRepositoryFileSystem();
    const paths = new RepositoryPathResolver();
    const directories = new RepositoryDirectoryReader(fileSystem);
    const files = new RepositoryFileWalker(fileSystem, paths);

    return new DocumentationVerifier(
      [
        new DocumentationHierarchyInspector(fileSystem, paths),
        new PackageDocumentationMirroringInspector(directories, paths),
      ],
      new CanonicalDocumentReader(fileSystem, files),
      new CanonicalDocumentInspector([
        new LocalReferencePolicy(paths),
        new LocalLinkPolicy(fileSystem, new MarkdownLinkTargetExtractor(), paths),
      ]),
      new DecisionRecordInspector(fileSystem, paths),
      paths,
    );
  }
}
