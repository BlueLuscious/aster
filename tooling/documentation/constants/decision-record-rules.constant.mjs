/**
 * @description Immutable decision-record filenames, statuses, headings, and required section rules.
 */
export const decisionRecordRules = Object.freeze({
  acceptedStatuses: Object.freeze(["Proposed", "Accepted", "Rejected", "Superseded"]),
  consequencesHeading: "## Consequences",
  filenamePattern: /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/u,
  statusPattern: /^Status:\s+\*\*([^*]+)\*\*$/mu,
});
