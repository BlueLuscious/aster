import type { DiagnosticResultType } from "../../src/diagnostic/types/index.js";
import type {
  CollectionBuildOutput,
  CollectionBuildRequest,
} from "../../src/pipeline/contracts/index.js";
import { CollectionBuildPipeline } from "../../src/pipeline/runtime/collection-build.pipeline.js";

const pipeline = new CollectionBuildPipeline();
const result: DiagnosticResultType<CollectionBuildOutput> = pipeline.build(
  {} as CollectionBuildRequest,
);

if (result.successful) {
  const packageName: string = result.value.packageName;
  void packageName;

  // @ts-expect-error Successful output is immutable.
  result.value.files.push({ path: "changed.ts", content: "" });
}
