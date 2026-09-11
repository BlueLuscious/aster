# Amellus Initial Inventory

Status: **Accepted for authorship**

The initial Amellus inventory contains twenty-six deliberately bounded application concepts.
Seventeen concepts currently have independent primitive-first canonical definitions: seven
originate in the Experimental pilot, eight close the first semantic gaps, and two complete the
directional-arrow family. Nine concepts remain accepted but await structured-path authorship after
their visually weak polygon experiments were discarded.

## Concepts

| Identity | Primary role | Canonical meaning | Search tags and aliases | Source disposition |
| --- | --- | --- | --- | --- |
| `arrow-left` | Navigation | Logical previous or backward movement, authored pointing left. | `arrow`, `back`, `left`, `navigation`, `previous` | Refine candidate. |
| `arrow-right` | Navigation | Logical next or forward movement, authored pointing right. | `arrow`, `forward`, `navigation`, `next`, `right` | New. |
| `arrow-up` | Navigation | Literal upward movement without horizontal reading-direction semantics. | `arrow`, `navigation`, `top`, `up` | Directional expansion. |
| `arrow-down` | Navigation | Literal downward movement without horizontal reading-direction semantics. | `arrow`, `bottom`, `down`, `navigation` | Directional expansion. |
| `home` | Navigation | Primary home or application landing destination. | `home`, `house`, `navigation`, `start` | Pending structured-path authorship. |
| `menu` | Navigation | Reveal or represent a primary application menu. | `hamburger`, `menu`, `navigation` | New. |
| `check` | Action and status | Confirm, complete or indicate a successful state. | `check`, `complete`, `confirm`, `done`, `success` | Refine candidate. |
| `close` | Action | Close, dismiss or cancel the current surface or operation. | `cancel`, `close`, `dismiss`, `remove`, `x` | Refine candidate. |
| `download` | Action | Transfer content towards local or retained storage. | `download`, `save`, `transfer` | New. |
| `plus` | Action | Add or create one item. | `add`, `create`, `new`, `plus` | Refine candidate. |
| `search` | Action | Find or inspect catalogue or application content. | `find`, `lookup`, `search` | Refine candidate. |
| `settings` | Action and navigation | Open configuration or preferences. | `configuration`, `preferences`, `settings` | Refine candidate. |
| `heart` | Status | Mark affection, appreciation or a favourite relationship. | `favourite`, `heart`, `like`, `love` | Pending structured-path authorship. |
| `info` | Status | Present neutral explanatory information. | `about`, `help`, `info`, `information` | New. |
| `lock` | Status and object | Represent locked, private or secured content. | `lock`, `privacy`, `secure`, `security` | Pending structured-path authorship. |
| `star` | Status | Mark a featured, saved or rated item. | `bookmark`, `favourite`, `featured`, `rating`, `star` | Refine candidate. |
| `warning` | Status | Indicate a condition requiring attention without implying success. | `alert`, `attention`, `caution`, `warning` | New. |
| `camera` | Media | Represent photographic capture or camera media. | `camera`, `media`, `photo`, `photograph` | Pending structured-path authorship. |
| `pause` | Media | Temporarily suspend media or an active process. | `hold`, `media`, `pause`, `playback` | New. |
| `play` | Media | Start or resume media or a runnable process. | `media`, `play`, `playback`, `start` | New. |
| `bell` | Communication | Represent notifications and notification controls. | `alert`, `bell`, `notification` | Pending structured-path authorship. |
| `mail` | Communication | Represent an email message, inbox or written communication. | `email`, `envelope`, `inbox`, `mail`, `message` | New. |
| `cloud` | Object | Represent remote or cloud-hosted content. | `cloud`, `remote`, `storage` | Pending structured-path authorship. |
| `folder` | Object | Represent a directory or grouped file container. | `directory`, `files`, `folder` | Pending structured-path authorship. |
| `leaf` | Object | Represent a leaf, nature or environmental concern. | `environment`, `leaf`, `nature`, `plant` | Pending structured-path authorship. |
| `user` | Object and identity | Represent one person or user account. | `account`, `person`, `profile`, `user` | Pending structured-path authorship. |

Search aliases are tags, not additional icon identities or public export names. Every identity
remains independent from Amellus membership and may join other collections.

## Semantic boundaries

Potentially adjacent concepts must remain distinguishable:

| Concepts | Required distinction |
| --- | --- |
| `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down` and `play` | Arrows use an open shaft; horizontal arrows express logical movement and mirror, vertical arrows preserve literal orientation, and Play uses a closed media triangle. |
| `check` and `close` | Check uses an asymmetric rising confirmation stroke; Close uses centred opposing diagonals. |
| `plus` and `close` | Plus is orthogonal addition; Close is diagonal dismissal. |
| `info` and `warning` | Info uses a circular neutral enclosure; Warning uses a triangular caution enclosure. |
| `bell` and `mail` | Bell represents notification state; Mail uses an envelope enclosure for message content. |
| `heart` and `star` | Heart is an organic relationship mark; Star is a geometric feature or rating mark. |
| `home` and `folder` | Home has a centred roof and entrance; Folder is an asymmetric tabbed container. |
| `download` and directional arrows | Download combines vertical transfer with a receiving baseline; it is not navigation and does not mirror. |
| `settings` and `search` | Settings uses radial mechanical repetition; Search combines one circle with a directed handle. |

An alias must not be promoted to another icon when the geometry and meaning are equivalent. A new
identity requires a distinct semantic role, not merely another product's preferred vocabulary.

## Stress coverage

| Construction concern | Required evidence |
| --- | --- |
| Curves | `search`, `heart`, `cloud`, `user` |
| Diagonals | `arrow-left`, `arrow-right`, `check`, `close`, `play`, `star`, `warning` |
| Symmetry | `close`, `plus`, `home`, `info`, `menu`, `pause`, `settings`, `user` |
| Enclosures and negative space | `camera`, `info`, `lock`, `mail`, `warning` |
| Detached detail | `bell`, `info` |
| Mixed primitives | `camera`, `download`, `lock`, `mail`, `search` |
| Organic balance | `cloud`, `heart`, `leaf` |
| Complexity pressure | `camera`, `settings`, `star`, `warning` |
| RTL direction | `arrow-left` and `arrow-right` mirror; `arrow-up` and `arrow-down` preserve their vertical orientation. |

This set is sufficient to test the [visual contract](design-contract.md) across common geometric
families while keeping every candidate individually reviewable. Authorship may reject a candidate
whose metaphor or geometry cannot satisfy the contract; replacement requires the same semantic
and stress-coverage review rather than preserving the count automatically.
