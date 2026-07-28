# Source Assets and Generated Outputs

Status: **Accepted**

## Purpose

This policy separates authored icon evidence from derived distribution artefacts. It prevents
collection source, design-tool working files, and generated output from acquiring ambiguous
ownership.

## Canonical source

A committed collection owns its canonical source beneath `collections/<collection>/`. Its source
must be sufficient to reproduce every derived artefact that the repository elects to distribute.

Canonical source may include:

- reviewed vector masters;
- collection metadata and licensing evidence;
- deterministic aliases and semantic classification;
- explicit exceptions required by collection policy.

Each collection must document its source format, provenance, licence, visual rules, and generation
workflow beneath `docs/en/collections/<collection>/`.

## Design-tool files

Working files from drawing or design tools are not canonical source unless a collection explicitly
adopts their format and documents a deterministic, reviewable extraction process.

Temporary exports, autosaves, caches, preview renders, editor metadata, and local tool state must
not be committed as collection source. A visually authoritative working file may be retained
outside the repository without becoming a build dependency.

## Generated outputs

Generated artefacts must live outside their authored source boundary and must identify:

- the canonical source from which they were produced;
- the generator or stable command that produced them;
- the ownership boundary responsible for cleaning and rebuilding them.

Generated output must be reproducible deterministically. It must never be edited manually, and the
repository must not accept it until cleanup, regeneration, and verification behaviour are defined.

## Collection boundary

Documentation and generated output must not create a fictional collection.
`docs/en/collections/<collection>/` and any collection-specific distribution artefacts are valid
only when `collections/<collection>/` exists.

Shared schemas, workflows, and policies belong to the collection root or package that owns them
rather than to a placeholder collection.

## Review requirements

A source or generation change must provide evidence appropriate to its effect:

- provenance and licence evidence for new authored source;
- deterministic regeneration for generator changes;
- visual evidence for geometry-affecting changes;
- confirmation that unrelated collections and generated roots remain unchanged.

The broader evidence and ownership model is defined by
[Contribution and Review](contribution-and-review.md).
