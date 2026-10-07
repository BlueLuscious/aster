import { CliPackageVersionReader } from "../../src/shell/version/runtime/cli-package-version.reader.js";

const reader = new CliPackageVersionReader(new URL("file:///aster/dist/shell/aster.js"));

void reader.readDependencies();

// @ts-expect-error Private Import is not a public package selector.
void reader.readDependencies("import");

// @ts-expect-error Arbitrary npm package names are not accepted.
void reader.readDependencies("@luscious-garden/aster-core");
