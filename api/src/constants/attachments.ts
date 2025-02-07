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
  CFG = 'Cfg',
  /**
   * Vectronic API key file type.
   */
  KEYX = 'KeyX',

  /**
   * Unknown file type.
   */
  UNKNOWN = 'unknown'
}

/**
 * Vectronic device key required xml tags
 *
 * @type {readonly ["</collarKey>", "</collar>", "</comIDList>", "comType", "</comID>", "</key>", "</collarType>"]}
 */
export const TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS = [
  '</collarKey>',
  '</collar>',
  '</comIDList>',
  'comType',
  '</comID>',
  '</key>',
  '</collarType>'
] as const;

/**
 * The error messages of survey telemetry credential attachment files upload.
 *
 * @export
 * @enum {number}
 */
export enum TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING {
  INVALID_ZIP_CONTENT = 'The file is neither a .keyx or .cfg file, nor is it an archive containing only files of these types.',
  ARCHIVE_WITH_NO_FILES = 'File is an archive that contains no content',
  INVALID_KEY_FILE = 'Invalid key file in ZIP: ',
  INVALID_XML_FILE = 'Invalid XML file: ',
  KEYX_NOT_FOUND = 'Key not found in the remote vectronic records.'
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
