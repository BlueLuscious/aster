import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readRepositoryFile(path) {
  return (await readFile(new URL(`../../${path}`, import.meta.url), "utf8"))
    .replaceAll("\r\n", "\n");
}

function runScripts(source) {
  const scripts = [];
  let script;
  let indentation = 0;

  for (const line of source.split("\n")) {
    if (script !== undefined && line.trim() !== "" && line.search(/\S/u) <= indentation) {
      scripts.push(script);
      script = undefined;
    }

    const run = /^( *)(- )?run: (.*)$/u.exec(line);
    if (run !== null) {
      indentation = run[1].length + (run[2]?.length ?? 0);
      if (run[3] === "|") {
        script = "";
      } else {
        scripts.push(run[3]);
      }
    } else if (script !== undefined) {
      script += `\n${line}`;
    }
  }

  if (script !== undefined) {
    scripts.push(script);
  }
  return scripts;
}

test("checks catalogue drift before build-capable gates and retains independent workflow builds", async () => {
  const { scripts } = JSON.parse(await readRepositoryFile("package.json"));
  const checks = scripts.check.split(" && ");

  assert.equal(checks[0], "pnpm run check:catalogue");
  assert.ok(checks.indexOf("pnpm run check:types") > 0);
  assert.equal(scripts.verify, "pnpm run check && pnpm run test");
  assert.equal(scripts.test.split(" && ")[0], "pnpm run test:tooling");
  assert.equal(scripts.test.split(" && ").at(-1), "pnpm run test:workflow");
  assert.match(scripts["test:workflow"], /^pnpm run build && /u);
  assert.doesNotMatch(scripts.verify, /(?:format(?!:check)|release|publish)/u);

  for (const name of ["core", "svg", "import", "icons", "cli"]) {
    const manifest = JSON.parse(await readRepositoryFile(`packages/${name}/package.json`));
    assert.match(manifest.scripts["test:abi"], /^pnpm run build && /u, name);
    assert.match(manifest.scripts.clean, /tooling\/workspace\/clean-package-output\.mjs dist$/u, name);
  }

  const cli = JSON.parse(await readRepositoryFile("packages/cli/package.json"));
  assert.match(cli.scripts["test:conformance"], /^pnpm run build && /u);
  assert.match(cli.scripts["test:executable"], /^pnpm run build && /u);
});

test("CI verifies frozen installations independently on both platforms with read-only authority", async () => {
  const workflow = await readRepositoryFile(".github/workflows/ci.yaml");
  assert.match(workflow, /^permissions:\n  contents: read\n/mu);
  assert.match(workflow, /os: \[ubuntu-latest, windows-latest\]/u);
  assert.match(workflow, /fail-fast: false/u);
  assert.match(workflow, /persist-credentials: false/u);
  assert.match(workflow, /node-version-file: \.node-version/u);
  assert.match(workflow, /cache-dependency-path: pnpm-lock\.yaml/u);
  const scripts = runScripts(workflow);
  assert.deepEqual(scripts, ["pnpm install --frozen-lockfile", "pnpm run verify"]);
  assert.doesNotMatch(workflow, /secrets\.|:\s*write\b|pull_request_target/u);
});

test("draft automation scopes writes to the approved job and passes inputs through environment variables", async () => {
  const workflow = await readRepositoryFile(".github/workflows/package-release.yaml");
  const prepareStart = workflow.indexOf("\n  prepare:\n");
  const draftStart = workflow.indexOf("\n  draft:\n");
  assert.ok(prepareStart > 0 && draftStart > prepareStart);
  const prepare = workflow.slice(prepareStart, draftStart);
  const draft = workflow.slice(draftStart);

  assert.match(workflow.slice(0, prepareStart), /^permissions:\n  contents: read\n  actions: read\n/mu);
  assert.doesNotMatch(prepare, /:\s*write\b|secrets\./u);
  assert.match(draft, /needs: prepare/u);
  assert.match(draft, /if: inputs\.operation == 'draft'/u);
  assert.match(draft, /^    permissions:\n      contents: write\n      actions: read\n/mu);
  assert.match(draft, /CONFIRMATION: \$\{\{ inputs\.confirmation \}\}/u);
  assert.match(draft, /"\$CONFIRMATION" != "CREATE_DRAFT"/u);
  for (const job of [prepare, draft]) {
    assert.match(job, /persist-credentials: false/u);
    assert.match(job, /"refs\/heads\/master"/u);
  }
  assert.equal((workflow.match(/contents: write/gu) ?? []).length, 1);
  assert.ok(runScripts(workflow).length > 0);
  for (const script of runScripts(workflow)) {
    assert.doesNotMatch(script, /\$\{\{/u);
  }
});

test("notification automation has no repository authority or untrusted inline shell expressions", async () => {
  const workflow = await readRepositoryFile(".github/workflows/discord.yaml");
  assert.match(workflow, /^permissions: \{\}\n/mu);
  assert.match(workflow, /DISCORD_WEBHOOK: \$\{\{ secrets\.ASTER_DISCORD_WEBHOOK \}\}/u);
  assert.doesNotMatch(workflow, /actions\/checkout|:\s*write\b/u);
  const scripts = runScripts(workflow);
  assert.ok(scripts.length > 0);
  for (const script of scripts) {
    assert.doesNotMatch(script, /\$\{\{/u);
    assert.match(script, /\[ -z "\$DISCORD_WEBHOOK" \]/u);
  }
});

test("workflow source checks include multiline shell content rather than environment declarations", () => {
  assert.deepEqual(runScripts([
    "steps:",
    "  - env:",
    "      INPUT: ${{ inputs.value }}",
    "    run: |",
    "      echo \"$INPUT\"",
    "",
    "      echo '${{ inputs.unsafe }}'",
    "  - run: node verify.mjs",
    "    name: Verify",
  ].join("\n")), [
    "\n      echo \"$INPUT\"\n\n      echo '${{ inputs.unsafe }}'",
    "node verify.mjs",
  ]);
});
