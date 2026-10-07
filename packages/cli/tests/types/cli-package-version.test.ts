import { CliPackageVersionReader } from "../../src/shell/version/runtime/cli-package-version.reader.js";

const reader = new CliPackageVersionReader(new URL("file:///aster/dist/shell/aster.js"));

void reader.read("core");
void reader.read("icons");
void reader.read("svg");
void reader.read("cli");
void reader.read("all");

// @ts-expect-error Private Import is not a public package selector.
void reader.read("import");

// @ts-expect-error Arbitrary npm package names are not accepted.
void reader.read("@luscious-garden/aster-core");
