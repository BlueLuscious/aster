/**
 * @description Fixed self-contained presentation rules for static review documents.
 * @remarks CSS vocabulary follows the external CSS standard, including `color` spellings.
 */
export const reviewDocumentStyles = `:root {
  color-scheme: light;
  font-family: "Trebuchet MS", "Gill Sans", sans-serif;
  background: #ebe7de;
  color: #172033;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: radial-gradient(circle at top right, #fff8e8 0, transparent 34rem), #ebe7de; }
a { color: #9f302b; text-underline-offset: 0.18em; }
a:focus-visible, summary:focus-visible { outline: 3px solid #d94841; outline-offset: 3px; }
code, pre { font-family: "Cascadia Mono", "SFMono-Regular", monospace; }
.review-header { padding: 3.5rem max(1.25rem, calc((100vw - 76rem) / 2)); background: #172033; color: #fff8e8; }
.review-header p { max-width: 52rem; }
.review-eyebrow { margin: 0 0 0.75rem; color: #f3b562; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
h1, h2, h3 { font-family: Georgia, "Times New Roman", serif; line-height: 1.08; }
h1 { margin: 0; font-size: clamp(2.5rem, 8vw, 5.5rem); }
h2 { margin-top: 0; font-size: clamp(1.8rem, 4vw, 3rem); }
h3 { font-size: 1.35rem; }
.review-nav { padding: 0.85rem max(1.25rem, calc((100vw - 76rem) / 2)); border-bottom: 1px solid #c9c1b2; background: #fffdf7; }
.review-nav ul { display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; margin: 0; padding: 0; list-style: none; }
.review-main { width: min(76rem, calc(100% - 2rem)); margin: 0 auto; padding: 2rem 0 5rem; }
.review-panel { margin: 0 0 2rem; padding: clamp(1rem, 3vw, 2rem); border: 1px solid #c9c1b2; border-radius: 1.25rem; background: rgba(255, 253, 247, 0.94); box-shadow: 0 1rem 3rem rgba(23, 32, 51, 0.08); }
.review-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.75rem; margin: 0; }
.review-summary div { padding: 0.9rem; border-radius: 0.75rem; background: #f2eee5; }
.review-summary dt { color: #665e53; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.review-summary dd { margin: 0.35rem 0 0; overflow-wrap: anywhere; }
.review-tags { display: flex; flex-wrap: wrap; gap: 0.45rem; padding: 0; list-style: none; }
.review-tag, .review-badge { display: inline-block; padding: 0.28rem 0.55rem; border: 1px solid #c9c1b2; border-radius: 999px; background: #fff; font-size: 0.8rem; }
.review-contact-sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: 0.8rem; }
.review-contact-card { display: grid; gap: 0.6rem; min-height: 10rem; padding: 1rem; border: 1px solid #d8d1c5; border-radius: 0.8rem; color: inherit; text-decoration: none; background: #fff; }
.review-contact-card:hover { border-color: #d94841; transform: translateY(-2px); }
.review-contact-card svg { width: 4rem; height: 4rem; margin: auto; color: #172033; }
.review-contact-card span { overflow-wrap: anywhere; text-align: center; }
.review-palettes { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.8rem; }
.review-swatch { margin: 0; }
.review-swatch figcaption { margin-top: 0.45rem; font-size: 0.85rem; }
.review-canvas { position: relative; display: grid; min-height: 14rem; place-items: center; overflow: hidden; border: 1px solid #b9b1a5; border-radius: 0.8rem; }
.review-canvas svg { position: relative; z-index: 2; width: min(62%, 10rem); height: min(62%, 10rem); }
.review-palette-light { background: #f8fafc; color: #172033; }
.review-palette-dark { background: #172033; color: #f8fafc; }
.review-palette-transparent { color: #d94841; background-color: #fff; background-image: linear-gradient(45deg, #d8d8d8 25%, transparent 25%), linear-gradient(-45deg, #d8d8d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d8d8d8 75%), linear-gradient(-45deg, transparent 75%, #d8d8d8 75%); background-position: 0 0, 0 0.5rem, 0.5rem -0.5rem, -0.5rem 0; background-size: 1rem 1rem; }
.review-size-ladder { display: flex; flex-wrap: wrap; align-items: end; gap: 1.25rem; padding: 1rem; border-radius: 0.8rem; background: #f2eee5; }
.review-size-sample { display: grid; justify-items: center; gap: 0.4rem; }
.review-size-sample svg { width: var(--review-size); height: var(--review-size); color: #172033; }
.review-size-16 { --review-size: 16px; }
.review-size-24 { --review-size: 24px; }
.review-size-32 { --review-size: 32px; }
.review-size-48 { --review-size: 48px; }
.review-guides { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.8rem; }
.review-guide-grid { background-color: #fff; background-image: linear-gradient(#d8d1c5 1px, transparent 1px), linear-gradient(90deg, #d8d1c5 1px, transparent 1px); background-size: 12.5% 12.5%; color: #172033; }
.review-guide-bounds { background: #fff; color: #172033; }
.review-guide-bounds svg { outline: 2px dashed #d94841; outline-offset: 2px; }
.review-unavailable { min-height: 14rem; padding: 1.5rem; border: 1px dashed #9b9184; border-radius: 0.8rem; background: #f2eee5; }
.review-code { max-height: 22rem; margin: 0; padding: 1rem; overflow: auto; border-radius: 0.75rem; background: #101827; color: #e9edf5; white-space: pre-wrap; overflow-wrap: anywhere; }
.review-empty { padding: 2rem; border: 1px dashed #9b9184; border-radius: 0.8rem; text-align: center; }
.review-footer { padding: 1.5rem; background: #172033; color: #fff8e8; text-align: center; }
@media (max-width: 38rem) {
  .review-header { padding-top: 2.5rem; padding-bottom: 2.5rem; }
  .review-main { width: min(100% - 1rem, 76rem); }
  .review-panel { border-radius: 0.8rem; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .review-contact-card:hover { transform: none; }
}`;
