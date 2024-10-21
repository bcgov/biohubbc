/**
 * The type of project/survey attachment files.
 *
 * @export
 * @enum {number}
 */
export enum ATTACHMENT_TYPE {
  REPORT = 'Report',
  OTHER = 'Other'
}

/**
 * The type of survey telemetry credential attachment files.
 *
 * @export
 * @enum {number}
 */
export enum TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE {
  /**
   * Lotek API key file type.
   *
   * @export
   * @enum {string}
   */
  KEYX = 'KeyX',
  /**
   * Vectronic API key file type.
   */
  CFG = 'Cfg'
}

export enum CRITTER_CAPTURE_ATTACHMENT_TYPE {
  /**
   * Critter Capture Attachment file type.
   *
   * Note: This will not be used as the attachment type on the record.
   * But used to identify which service to get the S3 key from in the endpoint.
   *
   * @export
   * @enum {string}
   */
  CAPTURE = 'Capture',
  MORTALITY = 'Mortality'
}
