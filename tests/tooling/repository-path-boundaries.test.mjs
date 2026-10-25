import assert from "node:assert/strict";
import { isAbsolute, relative, resolve, sep } from "node:path";
import test from "node:test";

import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

const isWindows = process.platform === "win32";
const absoluteRoot = isWindows
  ? "C:/aster-path-boundaries/repository"
  : "/aster-path-boundaries/repository";

function assertContainsCases(paths, cases) {
  for (const [root, target, expected] of cases) {
    assert.equal(
      paths.contains(root, target),
      expected,
      `contains(${JSON.stringify(root)}, ${JSON.stringify(target)})`,
    );
  }
}

test("normalises lexical containment without admitting siblings or ancestors", () => {
  const paths = new RepositoryPathResolver();
  const root = absoluteRoot;

  assertContainsCases(paths, [
    [root, root, true],
    [`${root}/`, root, true],
    [root, `${root}//icons/`, true],
    [`${root}/icons/..`, `${root}/icons/./arrow.svg`, true],
    [root, `${root}/icons/../metadata.json`, true],
    [root, `${root}/icons/../../repository/arrow.svg`, true],
    [root, `${root}/..icons/arrow.svg`, true],
    [root, `${root}/.../arrow.svg`, true],
    [root, `${root}/icons`, true],
    [`${root}/icons`, root, false],
    [root, `${root}/..`, false],
    [root, `${root}/../outside/arrow.svg`, false],
    [root, `${root}-copy/arrow.svg`, false],
    [`${root}-copy`, root, false],
    [`${root}/icons`, `${root}/icons-copy/arrow.svg`, false],
    [`${root}/icons`, `${root}/icons/../metadata.json`, false],
  ]);
});

test("keeps containment lexical even for paths unsuitable for filesystem operations", () => {
  const paths = new RepositoryPathResolver();
  const root = absoluteRoot;

  assertContainsCases(paths, [
    [root, `${root}/absent/../icons/arrow.svg`, true],
    [root, `${root}/not-a-directory/child`, true],
    [root, `${root}/invalid\0segment/child`, true],
    [`${root}/invalid\0segment`, `${root}/invalid\0segment/child`, true],
    [root, `${root}/invalid\0segment/../../outside`, false],
  ]);
});

test("resolves empty, dot and relative paths against the current directory independently", (context) => {
  const paths = new RepositoryPathResolver();
  const directory = isWindows
    ? "C:/aster-path-boundaries/working/directory"
    : "/aster-path-boundaries/working/directory";
  const cwd = context.mock.method(process, "cwd", () => directory);

  try {
    assertContainsCases(paths, [
      ["", "", true],
      ["", ".", true],
      [".", "", true],
      [".", "./", true],
      ["", "icons/arrow.svg", true],
      [".", "icons/../arrow.svg", true],
      ["./icons", "icons/arrow.svg", true],
      ["icons", "./icons", true],
      ["icons/./", "icons//arrow.svg", true],
      ["icons/..", "./arrow.svg", true],
      ["..", "../icons", true],
      [".", "..", false],
      ["..", "../../outside", false],
      ["icons", "icons-copy/arrow.svg", false],
      ["icons", ".", false],
      ["icons", "icons/../outside", false],
      ["icons", "arrow.svg", false],
      ["icons", "../icons/arrow.svg", false],
    ]);
  } finally {
    cwd.mock.restore();
  }
});

test("retains native Windows case, separators, volumes and drive-relative semantics", {
  skip: !isWindows,
}, () => {
  const paths = new RepositoryPathResolver();

  assertContainsCases(paths, [
    ["C:\\aster", "c:\\ASTER", true],
    ["C:\\aster", "c:/ASTER\\icons//arrow.svg", true],
    ["C:/aster/", "C:\\aster\\icons\\..\\metadata.json", true],
    ["C:\\aster\\icons", "C:\\aster\\ICONS\\arrow.svg", true],
    ["C:\\", "C:\\aster\\arrow.svg", true],
    ["C:\\aster", "C:\\aster-copy\\arrow.svg", false],
    ["C:\\aster", "C:\\", false],
    ["C:\\aster", "D:\\aster\\arrow.svg", false],
    ["C:\\", "D:\\", false],
    ["\\aster", "\\ASTER/icons", true],
    ["\\aster", "\\aster-copy", false],
    ["\\aster", "\\", false],
    ["C:", "C:icons", true],
    ["C:aster", "C:aster\\icons", true],
    ["C:aster\\icons\\..", "C:aster\\icons\\arrow.svg", true],
    ["C:aster", "C:aster\\..hidden", true],
    ["C:aster", "C:aster-copy", false],
    ["C:aster", "C:", false],
    ["C:aster", "C:aster\\..\\outside", false],
    ["C:aster", "D:aster", false],
  ]);
});

test("retains lexical Windows UNC and device namespace boundaries", {
  skip: !isWindows,
}, () => {
  const paths = new RepositoryPathResolver();
  const share = "\\\\aster-path-host\\share";
  const root = `${share}\\repository`;
  const device = "\\\\?\\C:\\aster";
  const deviceShare = "\\\\?\\UNC\\aster-path-host\\share\\repository";

  assertContainsCases(paths, [
    [share, root, true],
    [root, root, true],
    [root, `${root}\\icons`, true],
    [root, "\\\\ASTER-PATH-HOST\\SHARE\\REPOSITORY\\icons", true],
    [root, "//aster-path-host/share/repository/icons", true],
    [root, `${root}-copy\\icons`, false],
    [root, share, false],
    [share, "\\\\aster-path-host\\share-copy\\repository", false],
    [share, "\\\\other-path-host\\share\\repository", false],
    [device, device, true],
    [device, `${device}\\icons`, true],
    [device, "\\\\?\\c:\\ASTER\\icons", true],
    [device, `${device}-copy\\icons`, false],
    [device, "\\\\?\\D:\\aster\\icons", false],
    [deviceShare, `${deviceShare}\\icons`, true],
    [deviceShare, `${deviceShare}-copy\\icons`, false],
    [deviceShare, "\\\\?\\UNC\\aster-path-host\\share-copy\\repository", false],
    [deviceShare, "\\\\?\\UNC\\other-path-host\\share\\repository", false],
    ["\\\\.\\C:\\aster", "\\\\.\\C:\\aster\\icons", true],
    ["\\\\.\\pipe\\aster", "\\\\.\\pipe\\aster\\child", true],
    ["\\\\.\\pipe\\aster", "\\\\.\\pipe\\aster-copy", false],
    ["C:\\aster", `${device}\\icons`, false],
    [device, "C:\\aster\\icons", false],
    [root, `${deviceShare}\\icons`, false],
    [deviceShare, `${root}\\icons`, false],
    ["C:\\aster", "\\\\.\\C:\\aster\\icons", false],
  ]);
});

test("retains POSIX case sensitivity and treats backslashes and drive letters literally", {
  skip: isWindows,
}, () => {
  const paths = new RepositoryPathResolver();

  assertContainsCases(paths, [
    ["/", "/aster/icons", true],
    ["/aster", "/ASTER/icons", false],
    ["/aster", "/aster\\icons", false],
    ["/aster", "/aster/icons\\arrow.svg", true],
    ["/aster", "/aster/..\\outside", true],
    ["/aster\\icons", "/aster\\icons/arrow.svg", true],
    ["C:\\aster", "C:\\aster\\icons", false],
    ["C:\\aster", "C:\\aster/icons", true],
    ["C:", "C:icons", false],
    ["//aster/share", "/aster/share/icons", true],
  ]);
});

test("does not retain resolved roots or targets between calls when the current directory changes", (context) => {
  const paths = new RepositoryPathResolver();
  const first = `${absoluteRoot}/first`;
  const second = `${absoluteRoot}/second`;
  let directory = first;
  const cwd = context.mock.method(process, "cwd", () => directory);

  try {
    for (directory of [first, second, first, second]) {
      const withinFirst = directory === first;

      assertContainsCases(paths, [
        ["icons", `${first}/icons/arrow.svg`, withinFirst],
        [`${first}/icons`, "icons/arrow.svg", withinFirst],
        ["", `${first}/arrow.svg`, withinFirst],
        [".", `${first}/arrow.svg`, withinFirst],
        [`${first}/icons`, `${first}/icons/arrow.svg`, true],
        [`${second}/icons`, `${first}/icons/arrow.svg`, false],
        [`${first}/icons`, `${second}/icons/arrow.svg`, false],
        [`${second}/icons`, `${second}/icons/arrow.svg`, true],
      ]);
    }
  } finally {
    cwd.mock.restore();
  }
});

test("rejects invalid root and target arguments with the native error type and code", () => {
  const paths = new RepositoryPathResolver();
  const invalidValues = [
    undefined,
    null,
    false,
    0,
    1n,
    Symbol("invalid path"),
    {},
    [],
    new String("icons"),
    new URL("file:///icons"),
    new Uint8Array([1]),
    () => "icons",
  ];
  const isInvalidArgument = (error) =>
    error instanceof TypeError && error.code === "ERR_INVALID_ARG_TYPE";

  assert.throws(() => paths.contains(), isInvalidArgument);
  assert.throws(() => paths.contains("icons"), isInvalidArgument);

  for (const value of invalidValues) {
    assert.throws(() => paths.contains(value, ""), isInvalidArgument);
    assert.throws(() => paths.contains("", value), isInvalidArgument);
    assert.throws(() => paths.contains(value, value), isInvalidArgument);
  }
});

test("matches the original expression across a deterministic 3,136-pair native corpus", () => {
  const paths = new RepositoryPathResolver();
  const root = absoluteRoot;
  const corpus = [
    "",
    ".",
    "./",
    "..",
    "../",
    "../..",
    "icons",
    "./icons",
    "icons/",
    "icons//outline/",
    "icons/./arrow.svg",
    "icons/../metadata.json",
    "icons/../../outside",
    "icons-copy",
    "Icons",
    "..icons",
    ".../arrow.svg",
    "icons\\outline",
    "/",
    "//",
    "///aster-path-boundaries//repository/",
    root,
    `${root}/`,
    `${root}/icons`,
    `${root}/icons/./arrow.svg`,
    `${root}/icons/../metadata.json`,
    `${root}/../outside`,
    `${root}-copy`,
    `${root}/..icons`,
    `${root}/invalid\0segment/child`,
    root.toUpperCase(),
    `${root}/case/CASE`,
    "C:",
    "C:.",
    "C:..",
    "C:icons",
    "C:icons\\arrow.svg",
    "C:\\",
    "C:\\aster",
    "C:/aster//icons/./arrow.svg",
    "c:\\ASTER\\icons",
    "C:\\aster-copy",
    "D:",
    "D:icons",
    "D:\\aster\\icons",
    "\\aster",
    "\\aster\\icons",
    "\\\\aster-path-host\\share",
    "\\\\aster-path-host\\share\\icons",
    "\\\\aster-path-host\\share-copy\\icons",
    "\\\\other-path-host\\share\\icons",
    "\\\\?\\C:\\aster",
    "\\\\?\\C:\\aster\\icons",
    "\\\\?\\UNC\\aster-path-host\\share\\icons",
    "\\\\.\\C:\\aster",
    "\\\\.\\pipe\\aster",
  ];
  const originalContains = (rootPath, targetPath) => {
    const relation = relative(resolve(rootPath), resolve(targetPath));

    return relation === "" || (
      !isAbsolute(relation) && relation !== ".." && !relation.startsWith(`..${sep}`)
    );
  };

  assert.equal(corpus.length, 56);

  for (const rootPath of corpus) {
    for (const targetPath of corpus) {
      assert.equal(
        paths.contains(rootPath, targetPath),
        originalContains(rootPath, targetPath),
        `contains(${JSON.stringify(rootPath)}, ${JSON.stringify(targetPath)})`,
      );
    }
  }
});
