/**
 * Completion Statuses
 *
 * @export
 * @enum {string}
 */
export enum COMPLETION_STATUS {
  COMPLETED = 'Completed',
  ACTIVE = 'Active'
}

/**
 * Submission Status Types.
 *
 * See submission_status_type table -> name.
 *
 * @export
 * @enum {number}
 */
export enum SUBMISSION_STATUS_TYPE {
  'SUBMITTED' = 'Submitted',
  'TEMPLATE_VALIDATED' = 'Template Validated',
  'DARWIN_CORE_VALIDATED' = 'Darwin Core Validated',
  'TEMPLATE_TRANSFORMED' = 'Template Transformed',
  'SUBMISSION_DATA_INGESTED' = 'Submission Data Ingested',
  'SECURED' = 'Secured',
  'AWAITING CURRATION' = 'Awaiting Curration',
  'REJECTED' = 'Rejected',
  'ON HOLD' = 'On Hold',
  'SYSTEM_ERROR' = 'System Error',

  //Failure

  'FAILED_GET_OCCURRENCE' = 'Failed to Get Occurrence Submission',
  'FAILED_GET_FILE_FROM_S3' = 'Failed to get file from S3',
  'FAILED_PARSE_SUBMISSION' = 'Failed to parse submission',
  'FAILED_PREP_DWC_ARCHIVE' = 'Failed to prep DarwinCore Archive',
  'FAILED_PERSIST_PARSE_ERRORS' = 'Failed to persist parse errors',
  'FAILED_GET_VALIDATION_RULES' = 'Failed to get validation rules',
  'FAILED_VALIDATE_DWC_ARCHIVE' = 'Failed to validate DarwinCore Archive',
  'FAILED_PERSIST_VALIDATION_RESULTS' = 'Failed to persist validation results',
  'FAILED_UPDATE_OCCURRENCE_SUBMISSION' = 'Failed to update occurrence submission'
}

export enum SUBMISSION_MESSAGE_TYPE {
  //message types that match the submission_message_type table

  'DUPLICATE_HEADER' = 'DUPLICATE_HEADER',
  'UNKNOWN_HEADER' = 'UNKNOWN_HEADER',
  'MISSING_REQUIRED_HEADER' = 'MISSING_REQUIRED_HEADER',
  'MISSING_RECOMMENDED_HEADER' = 'MISSING_RECOMMENDED_HEADER',
  'MISCELLANEOUS' = 'MISCELLANEOUS',
  'MISSING_REQUIRED_FIELD' = 'MISSING_REQUIRED_FIELD',
  'UNEXPECTED_FORMAT' = 'UNEXPECTED_FORMAT',
  'OUT_OF_RANGE' = 'OUT_OF_RANGE',
  'INVALID_VALUE' = 'INVALID_VALUE',
  'MISSING_VALIDATION_SCHEMA' = 'MISSING_VALIDATION_SCHEMA',

  // TO ADD TO THE TABLE, POSSIBLY
  'ERROR' = 'Error',
  'PARSE_ERROR' = 'Parse error'
}
