import { CommandInvocationNormaliser } from "../../src/command/invocation/runtime/command-invocation.normaliser.js";
import { ExportInvocationNormaliser } from "../../src/command/invocation/runtime/export-invocation.normaliser.js";
import { HelpInvocationNormaliser } from "../../src/command/invocation/runtime/help-invocation.normaliser.js";
import { ListInvocationNormaliser } from "../../src/command/invocation/runtime/list-invocation.normaliser.js";
import { SearchInvocationNormaliser } from "../../src/command/invocation/runtime/search-invocation.normaliser.js";
import { ShowInvocationNormaliser } from "../../src/command/invocation/runtime/show-invocation.normaliser.js";
import { VersionInvocationNormaliser } from "../../src/command/invocation/runtime/version-invocation.normaliser.js";

export function createCommandInvocations(): CommandInvocationNormaliser {
  return new CommandInvocationNormaliser([
    new ExportInvocationNormaliser(),
    new ListInvocationNormaliser(),
    new SearchInvocationNormaliser(),
    new ShowInvocationNormaliser(),
    new HelpInvocationNormaliser(),
    new VersionInvocationNormaliser(),
  ]);
}
