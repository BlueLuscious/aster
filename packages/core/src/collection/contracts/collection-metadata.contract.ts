/**
 * @description Portable descriptive and redistribution metadata for one collection.
 */
export interface CollectionMetadata {
  /**
   * @description Human-readable collection name.
   */
  readonly displayName: string;

  /**
   * @description Optional concise purpose or visual-language description.
   */
  readonly description?: string;

  /**
   * @description Optional canonical intrinsic terms for collection discovery.
   */
  readonly tags?: readonly string[];

  /**
   * @description Optional effective artwork licence shared by the collection itself.
   */
  readonly licence?: string;

  /**
   * @description Optional attribution required by the collection artwork licence.
   */
  readonly attribution?: string;
}
