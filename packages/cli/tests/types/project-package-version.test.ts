import { ProjectPackageVersionReader } from "../../src/shell/version/runtime/project-package-version.reader.js";

const reader = new ProjectPackageVersionReader("/aster/current-project");

void reader.read("core");
void reader.read("icons");
void reader.read("svg");
void reader.read("cli");
void reader.read("all");

// @ts-expect-error Private Import is not a public package selector.
void reader.read("import");

// @ts-expect-error Arbitrary npm package names are not accepted.
void reader.read("@luscious-garden/aster-core");
