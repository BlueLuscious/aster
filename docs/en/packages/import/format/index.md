# Import Formats

`iconImportFormats` is the immutable runtime authority for built-in source discriminators and
currently contains only `svg`. `IconImportFormatType` is derived from that authority.

Each format provides a private `IIconImportAdapter<Source>` implementation. Adapter composition is
explicit and immutable; Import has no plugin discovery or mutable global registry. A new format is
justified only by an actual source family and must produce the same neutral `IconImportDraft`.

