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
  'FAILED_OCCURRENCE_PREPARATION' = 'Failed to prepare submission',
  'INVALID_MEDIA' = 'Media is not valid',
  'FAILED_VALIDATION' = 'Failed to validate',
  'FAILED_TRANSFORMED' = 'Failed to transform',
  'FAILED_PROCESSING_OCCURRENCE_DATA' = 'Failed to process occurrence data',
  'FAILED_SUMMARY_PREPARATION' = 'Failed to prepare summary submission'
}

export enum SUMMARY_SUBMISSION_MESSAGE_TYPE {
  'DUPLICATE_HEADER' = 'Duplicate Header',
  'UNKNOWN_HEADER' = 'Unknown Header',
  'MISSING_REQUIRED_HEADER' = 'Missing Required Header',
  'MISSING_RECOMMENDED_HEADER' = 'Missing Recommended Header',
  'DANGLING_PARENT_CHILD_KEY' = 'Missing Child Key from Parent',
  'MISCELLANEOUS' = 'Miscellaneous',
  'MISSING_REQUIRED_FIELD' = 'Missing Required Field',
  'UNEXPECTED_FORMAT' = 'Unexpected Format',
  'OUT_OF_RANGE' = 'Out of Range',
  'INVALID_VALUE' = 'Invalid Value',
  'MISSING_VALIDATION_SCHEMA' = 'Missing Validation Schema',
  'INVALID_MEDIA' = 'Media is Invalid',
  'INVALID_XLSX_CSV' = 'XLSX CSV is Invalid',
  'FAILED_TO_GET_TEMPLATE_NAME_VERSION' = 'Missing Name or Version Number',
  'FAILED_GET_VALIDATION_RULES' = 'Failed to Get Validation Rules',
  'FAILED_PARSE_VALIDATION_SCHEMA' = 'Failed to Parse Validation Schema',
  'UNSUPPORTED_FILE_TYPE' = 'Unsupported File Type',
  'FOUND_VALIDATION' = 'Found Validation',
  'SYSTEM_ERROR' = 'System Error'
}

// Message types that match the submission_message_type table
export enum SUBMISSION_MESSAGE_TYPE {
  'DUPLICATE_HEADER' = 'Duplicate Header',
  'UNKNOWN_HEADER' = 'Unknown Header',
  'MISSING_REQUIRED_HEADER' = 'Missing Required Header',
  'MISSING_RECOMMENDED_HEADER' = 'Missing Recommended Header',
  'DANGLING_PARENT_CHILD_KEY' = 'Missing Child Key from Parent',
  'MISCELLANEOUS' = 'Miscellaneous',
  'MISSING_REQUIRED_FIELD' = 'Missing Required Field',
  'UNEXPECTED_FORMAT' = 'Unexpected Format',
  'OUT_OF_RANGE' = 'Out of Range',
  'INVALID_VALUE' = 'Invalid Value',
  'MISSING_VALIDATION_SCHEMA' = 'Missing Validation Schema',
  'FAILED_GET_OCCURRENCE' = 'Failed to Get Occurrence Submission',
  'FAILED_GET_FILE_FROM_S3' = 'Failed to get file from S3',
  'FAILED_UPLOAD_FILE_TO_S3' = 'Failed to upload file to S3',
  'FAILED_PARSE_SUBMISSION' = 'Failed to parse submission',
  'FAILED_PREP_DWC_ARCHIVE' = 'Failed to prep DarwinCore Archive',
  'FAILED_PREP_XLSX' = 'Failed to prep XLSX',
  'FAILED_PERSIST_PARSE_ERRORS' = 'Failed to persist parse errors',
  'FAILED_GET_VALIDATION_RULES' = 'Failed to get validation rules',
  'FAILED_GET_TRANSFORMATION_RULES' = 'Failed to get transformation rules',
  'FAILED_PERSIST_TRANSFORMATION_RESULTS' = 'Failed to persist transformation results',
  'FAILED_TRANSFORM_XLSX' = 'Failed to transform XLSX',
  'FAILED_VALIDATE_DWC_ARCHIVE' = 'Failed to validate DarwinCore Archive',
  'FAILED_PERSIST_VALIDATION_RESULTS' = 'Failed to persist validation results',
  'FAILED_UPDATE_OCCURRENCE_SUBMISSION' = 'Failed to update occurrence submission',
  'FAILED_TO_GET_TRANSFORM_SCHEMA' = 'Unable to get transform schema for submission',
  'FAILED_TO_GET_TEMPLATE_NAME_VERSION' = 'Missing name or version number.',
  'INVALID_MEDIA' = 'Media is invalid',
  'INVALID_XLSX_CSV' = 'Media is not a valid XLSX CSV file.',
  'UNSUPPORTED_FILE_TYPE' = 'File submitted is not a supported type',
  'NON_UNIQUE_KEY' = 'Duplicate Key(s) found in file.',
  'MISMATCHED_TEMPLATE_SURVEY_SPECIES' = 'Mismatched template with survey focal species'
}

export enum MESSAGE_CLASS_NAME {
  NOTICE = 'Notice',
  ERROR = 'Error',
  WARNING = 'Warning'
}
