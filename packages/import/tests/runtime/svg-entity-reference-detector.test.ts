import assert from "node:assert/strict";
import test from "node:test";

import { IconImport, iconImportFormats } from "../../src/index.js";
import { xmlInertSections } from "../../src/formats/svg/parser/constants/xml-inert-sections.constant.js";
import { SvgEntityReferenceDetector } from "../../src/formats/svg/parser/runtime/svg-entity-reference.detector.js";

// Preserve the original per-offset Object.values traversal independently of the detector.
function originalInertEnd(content: string, offset: number): number | undefined {
  for (const section of Object.values(xmlInertSections)) {
    if (content.startsWith(section.opening, offset)) {
      const closingOffset = content.indexOf(
        section.closing,
        offset + section.opening.length,
      );

      return closingOffset === -1
        ? content.length
        : closingOffset + section.closing.length;
    }
  }

  return undefined;
}

function originalDetect(content: string): readonly number[] {
  const offsets: number[] = [];
  let offset = 0;

  while (offset < content.length) {
    const inertEnd = originalInertEnd(content, offset);

    if (inertEnd !== undefined) {
      offset = inertEnd;
    } else {
      if (content[offset] === "&") {
        offsets.push(offset);
      }

      offset += 1;
    }
  }

  return Object.freeze(offsets);
}

function* generatedSources(
  alphabet: readonly string[],
  remaining: number,
  prefix = "",
): Generator<string> {
  yield prefix;

  if (remaining === 0) {
    return;
  }

  for (const fragment of alphabet) {
    yield* generatedSources(alphabet, remaining - 1, prefix + fragment);
  }
}

for (const [name, content, expected] of [
  ["empty input", "", []],
  ["ordinary XML without markers", '<svg id="plain"/>', []],
  ["a marker at the first offset", "&", [0]],
  ["a marker at the last offset", "text&", [4]],
  ["consecutive bare markers", "&&&", [0, 1, 2]],
  [
    "named, decimal, hexadecimal and unknown references",
    "&amp;&#65;&#x41;&missing;",
    [0, 5, 10, 16],
  ],
  ["incomplete reference spellings", "&amp &; &#x &", [0, 5, 8, 12]],
  [
    "markers in both attribute quote styles and character data",
    '<g a="&" b=\'&\'>&</g>&',
    [6, 12, 15, 20],
  ],
  ["unmatched closing delimiters", "-->&]]>&?>&", [3, 7, 10]],
  ["a partial comment opening", "<!-&", [3]],
  ["whitespace inside a comment-like opening", "< !--&-->&", [5, 9]],
  ["a partial CDATA opening", "<![CDATA&", [8]],
  ["a differently cased CDATA opening", "<![cdata[&]]>&", [9, 13]],
  ["a partial processing-instruction opening", "<&?&", [1, 3]],
  ["a marker interrupting a CDATA-like opening", "<!&[CDATA[&", [2, 10]],
  ["astral characters before active markers", "\u{1f331}&\u{1f680}&&", [2, 5, 6]],
  ["combining and precomposed characters", "e\u0301&\u00e9&", [2, 4]],
  ["unmodified CRLF, CR and LF offsets", "&\r\n&\r&\n&", [0, 3, 5, 7]],
  ["a lexical comment opening inside quotes", '"<!--&-->"&', [10]],
  ["a lexical CDATA opening inside quotes", "'<![CDATA[&]]>'&", [15]],
  ["a lexical processing instruction inside quotes", '"<?p &?>"&', [9]],
  ["three adjacent inert section kinds", "&<!--&--><![CDATA[&]]><?&?>&", [0, 27]],
] as const) {
  test(`detects exact UTF-16 entity offsets for ${name}`, () => {
    const actual = new SvgEntityReferenceDetector().detect(content);

    assert.deepEqual(actual, expected);
    assert.equal(Object.isFrozen(actual), true);
  });
}

// Literal fixtures keep expected lexical boundaries independent of the shared authority.
const inertSections = [
  ["comment", "<!--", "-->", "]]> & <? & <![CDATA[ &"],
  ["CDATA", "<![CDATA[", "]]>", "--> & <? & <!-- &"],
  ["processing instruction", "<?", "?>", "--> & <![CDATA[ & <!-- & ]]>"],
] as const;

for (const [sectionName, opening, closing, conflicting] of inertSections) {
  const firstActiveAfterNestedOpening = opening.length * 2 + closing.length + 3;

  for (const [name, content, expected] of [
    [
      "ignores an internal marker but preserves both adjacent active markers",
      `&${opening}&${closing}&`,
      [0, opening.length + closing.length + 2],
    ],
    [
      "resumes immediately after an empty section",
      `&${opening}${closing}&`,
      [0, opening.length + closing.length + 1],
    ],
    [
      "skips adjacent sections without consuming the following marker",
      `&${opening}&${closing}${opening}&${closing}&`,
      [0, (opening.length + closing.length + 1) * 2 + 1],
    ],
    [
      "consumes an unterminated section through EOF",
      `${opening}&\r\n\u{1f331}&`,
      [],
    ],
    [
      "preserves earlier markers before an unterminated section",
      `\u{1f331}&&${opening}&`,
      [2, 3],
    ],
    [
      "closes at the first matching delimiter rather than nesting openings",
      `&${opening}&${opening}&${closing}&${closing}&`,
      [
        0,
        firstActiveAfterNestedOpening,
        firstActiveAfterNestedOpening + closing.length + 1,
      ],
    ],
    [
      "leaves repeated closing delimiters active",
      `&${opening}&${closing}${closing}&`,
      [0, opening.length + closing.length * 2 + 2],
    ],
    [
      "preserves Unicode and CRLF offsets on either side",
      `\u{1f331}&\r\n${opening}\u{1f680}&\r\n${closing}\r\n&e\u0301&`,
      [2, opening.length + closing.length + 12, opening.length + closing.length + 15],
    ],
    [
      "ignores conflicting openings and foreign closing delimiters inside",
      `${opening}${conflicting}${closing}&`,
      [opening.length + conflicting.length + closing.length],
    ],
    [
      "does not let foreign closing delimiters terminate an unfinished section",
      `&${opening}${conflicting}&`,
      [0],
    ],
    [
      "does not treat quotes as shielding its first closing delimiter",
      `${opening}"${closing}"&`,
      [opening.length + closing.length + 2],
    ],
  ] as const) {
    test(`${sectionName}: ${name}`, () => {
      const actual = new SvgEntityReferenceDetector().detect(content);

      assert.deepEqual(actual, expected);
      assert.equal(Object.isFrozen(actual), true);
    });
  }
}

test("preserves markers across every ordered pair of adjacent inert section kinds", () => {
  const detector = new SvgEntityReferenceDetector();

  for (const [, firstOpening, firstClosing] of inertSections) {
    for (const [, secondOpening, secondClosing] of inertSections) {
      const content =
        `&${firstOpening}&${firstClosing}${secondOpening}&${secondClosing}&`;
      const lastOffset =
        firstOpening.length + firstClosing.length +
        secondOpening.length + secondClosing.length + 3;

      assert.deepEqual(detector.detect(content), [0, lastOffset], content);
    }
  }
});

test("freezes empty and populated results against insertion and replacement", () => {
  const detector = new SvgEntityReferenceDetector();

  for (const content of ["", "<svg/>", "&", "&<!--&-->&"]) {
    const offsets = detector.detect(content);
    const retained = [...offsets];

    assert.equal(Object.isFrozen(offsets), true);
    assert.equal(Reflect.set(offsets, "length", 100), false);
    assert.equal(Reflect.set(offsets, "0", 99), false);
    // Deliberately bypass readonly typing to exercise the runtime ownership boundary.
    assert.throws(() => (offsets as number[]).push(99), TypeError);
    assert.deepEqual(offsets, retained);
  }
});

test("does not retain lexical or offset state across calls or detector instances", () => {
  const detector = new SvgEntityReferenceDetector();
  const cases = [
    ["&<!--&", [0]],
    ["&&", [0, 1]],
    ["<![CDATA[&", []],
    ["\u{1f331}&", [2]],
    ["<?p &", []],
    ["-->&]]>&?>&", [3, 7, 10]],
    ["", []],
    ["&<!--&-->&", [0, 9]],
  ] as const;
  const retained = cases.map(([content]) => detector.detect(content));

  for (let repetition = 0; repetition < 3; repetition += 1) {
    const otherDetector = new SvgEntityReferenceDetector();

    for (const [content, expected] of [...cases].reverse()) {
      assert.deepEqual(detector.detect(content), expected, content);
      assert.deepEqual(otherDetector.detect(content), expected, content);
    }
  }

  for (const [index, [content, expected]] of cases.entries()) {
    assert.deepEqual(retained[index], expected, content);
    assert.equal(Object.isFrozen(retained[index]), true);
  }
});

for (const corpus of [
  {
    name: "complete delimiter fragments",
    alphabet: [
      "x", "&", "<!--", "-->", "<![CDATA[", "]]>", "<?", "?>", "\r\n", "\u{1f331}",
    ],
    maxFragments: 4,
    prefix: "\u{1f331}",
    cardinality: 11_111,
  },
  {
    name: "individual delimiter characters",
    alphabet: ["&", "<", "!", "-", "[", "]", "?", ">"],
    maxFragments: 5,
    prefix: "",
    cardinality: 37_449,
  },
] as const) {
  test(`matches the original per-offset oracle for ${corpus.cardinality} ${corpus.name} strings`, () => {
    const detector = new SvgEntityReferenceDetector();
    const seen = new Set<string>();
    let count = 0;

    // Enumerate every word up to the bound, including the empty word, without randomness.
    // The fragment alphabet is prefix-free; its astral prefix makes the corpora disjoint.
    for (const content of generatedSources(
      corpus.alphabet,
      corpus.maxFragments,
      corpus.prefix,
    )) {
      const expected = originalDetect(content);
      const actual = detector.detect(content);

      assert.deepEqual(actual, expected, JSON.stringify(content));
      assert.equal(Object.isFrozen(actual), true, JSON.stringify(content));
      seen.add(content);
      count += 1;
    }

    assert.equal(count, corpus.cardinality);
    assert.equal(seen.size, corpus.cardinality);
  });
}

for (const [name, separator] of [["LF", "\n"], ["CRLF", "\r\n"]] as const) {
  test(`IconImport.inspect preserves exact entity diagnostic spans and order with ${name}`, () => {
    // These are well-formed XML references in attributes, not malformed bare ampersands.
    // CDATA and processing instructions are valid XML but independently outside the SVG subset.
    const lines = [
      '<?xml version="1.0"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
      '  <g id="\u{1f331}&amp;&#65;"/>',
      "  <!-- &ignored; <?fake?> <![CDATA[ &ignored; ]]> -->",
      '  <g id="&lt;"/>',
      "  <![CDATA[\u{1f331}&ignored; <!-- <?fake?> ]]>",
      '  <g id="e\u0301&#x41;"/>',
      "  <?probe &ignored; <![CDATA[ --> ?>",
      '  <path id="&quot;&apos;&gt;" d="M0 0H1"/>',
      "</svg>",
    ];
    const content = lines.join(separator);
    const sourceId = `entities/${name.toLowerCase()}.svg`;
    const result = IconImport.inspect({
      format: iconImportFormats.svg,
      sourceId,
      identity: { variant: "outline", namespace: "entities", name: "inert-sections" },
      content,
    });
    const lineStarts: number[] = [];
    let lineStart = 0;

    for (const line of lines) {
      lineStarts.push(lineStart);
      lineStart += line.length + separator.length;
    }

    // Fixed one-based UTF-16 coordinates are independent of the detector and source locator.
    const expected = [
      [3, 12], [3, 17], [5, 10], [7, 12], [9, 13], [9, 19], [9, 25],
    ].map(([line, column]) => {
      assert.ok(line !== undefined && column !== undefined);
      const start = lineStarts[line - 1];
      assert.ok(start !== undefined);
      const offset = start + column - 1;
      assert.equal(content[offset], "&");

      return {
        code: "ASTER-SAFETY-002",
        category: "safety",
        severity: "error",
        sourceId,
        span: {
          start: { offset, line, column },
          end: { offset: offset + 1, line, column: column + 1 },
        },
      };
    });
    const entities = result.diagnostics.filter(
      (diagnostic) => diagnostic.code === "ASTER-SAFETY-002",
    );

    assert.equal(result.successful, false);
    assert.equal("value" in result, false);
    assert.deepEqual(
      [...new Set(result.diagnostics.map((diagnostic) => diagnostic.code))].sort(),
      ["ASTER-SAFETY-002", "ASTER-SAFETY-008", "ASTER-TECHNICAL-004"],
    );
    assert.deepEqual(
      entities.map(({ code, category, severity, sourceId, span }) => ({
        code, category, severity, sourceId, span,
      })),
      expected,
    );
    assert.equal(Object.isFrozen(result.diagnostics), true);

    for (const diagnostic of entities) {
      assert.ok(diagnostic.span !== undefined);
      assert.equal(
        content.slice(diagnostic.span.start.offset, diagnostic.span.end.offset),
        "&",
      );
      assert.equal(Object.isFrozen(diagnostic), true);
      assert.equal(Object.isFrozen(diagnostic.span), true);
      assert.equal(Object.isFrozen(diagnostic.span.start), true);
      assert.equal(Object.isFrozen(diagnostic.span.end), true);
    }
  });
}
