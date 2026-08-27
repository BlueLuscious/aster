# CLI Shell Parsing

Status: **Pre-release**

The parsing subfeature adapts an explicit argv sequence into one immutable structured command
invocation and shell-only presentation options. It does not read process state, execute commands,
present results, or access the filesystem.

## Composition

`CommandLineParser` is the deterministic standalone dispatcher. It removes the shell-only
`--json` flag, selects the command identity, and delegates to one explicit
`ICommandLineCommandParser`. Duplicate parser identities fail during construction.

Dedicated parsers own the `export`, `list`, `search`, `show`, `help`, and `version` positional
forms. `CommandLineOptionParser` owns common discovery filters, while
`ExportCommandLineOptionParser` owns export render, accessibility, and destination options.
`CommandLineError` carries stable parser evidence for shell diagnostic adaptation.

No argument defaults to `help`. Unknown commands, duplicate singleton options, repeated `--json`,
missing option values, and trailing unsupported tokens are rejected before programmatic command
execution. The accepted grammar is documented by [CLI Shell](../index.md).
