# Experimental Authoring and Export Boundary

Status: **Provisional**

The experimental collection may be drawn directly as SVG or exported from an editable vector
master. Adobe Illustrator is supported as an authoring tool, but neither Aster nor automated CI
parses `.ai` documents.

## Editable masters

No editable master is committed for the initial spike. The reserved `masters/` boundary may later
contain one master per icon or a documented multi-artboard file. Until the pilot workflow provides
evidence, master organisation, binary storage transport, layer naming, and the Illustrator export
preset remain provisional.

When a master is added:

- its icon or artboard identity must map unambiguously to the canonical icon slug;
- it must retain editable shapes, strokes, guides, and construction evidence;
- corrections discovered by validation must be applied to the master and exported again;
- generated normalised data must never become the only editable geometry source.

## Canonical SVG export

The committed SVG is the automated geometry authority. An export must:

- use the SVG namespace and the approved `viewBox`;
- contain only supported explicit geometry and presentation attributes;
- preserve source paint order and accepted primitives;
- avoid transforms, stylesheets, text, definitions, raster content, scripts, external resources,
  hidden editor content, and foreign namespaces;
- use the canonical icon slug as its filename;
- remain valid without Illustrator being installed.

The formal Illustrator preset, manual checklist, and round-trip correction workflow belong to the
pilot collection milestone. The experimental sources provide evidence for that later decision
without claiming that the workflow is complete.
