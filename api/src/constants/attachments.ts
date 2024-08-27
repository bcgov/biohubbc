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
   */
  KEYX = 'KeyX',
  /**
   * Vectronic API key file type.
   */
  CFG = 'Cfg'
}
