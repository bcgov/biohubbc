/**
 * A single resource file.
 *
 * @export
 * @interface IResourceFile
 */
export interface IResourceFile {
  /**
   * The URL (key) of the file
   *
   * @memberof IResourceFile
   */
  url: string;
  /**
   * The size of the file (in bytes)
   * 
   * @memberof IResourceFile
   */
  fileSize: number;
  /**
   * Resource metadata for the file
   * 
   * @memberof IResourceFile
   */
  metadata: IResourceMetadata
}

/**
 * Resource file metadata
 * 
 * @export
 * @interface IResourceMetadata
 */
export interface IResourceMetadata {
  /**
   * The name of the template
   * 
   * @memberof IResourceMetadata
   */
  templateName: string;
  /**
   * The type of resource template
   * 
   * @memberof IResourceMetadata
   */
  templateType: string;
  /**
   * (Optional) The species pertaining to this particular resource
   * 
   * @memberof IResourceMetadata
   */
  species?: string;
}

/**
 * List resources endpoint response object.
 *
 * @export
 * @interface IListResourcesResponse
 */
export interface IListResourcesResponse {
  /**
   * An array of resource files
   * 
   * @memberof IListResourcesResponse
   */
  files: IResourceFile[]
}
