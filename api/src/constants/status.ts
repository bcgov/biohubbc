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

  'FAILED_OCCURRENCE_PREPERATION' = 'Failed to prepare occurrence submission',
  'INVALID_MEDIA' = 'Media is not valid',
  'FAILED_VALIDATION' = 'Failed to validate',
  'FAILED_TRANSFORMED' = 'Failed to transform',
  'FAILED_PROCESSING_OCCURRENCE_DATA' = 'Failed to process occurrence data'
}

/*

'Rejected',
  'Darwin Core Validated',
  'Template Validated',
  'Template Transformed',
  'System Error'

*/

// this appears in the validation of the files data (missing column, inccorect type)
export enum SUBMISSION_MESSAGE_TYPE {
  //message types that match the submission_message_type table

  'DUPLICATE_HEADER' = 'Duplicate header',
  'UNKNOWN_HEADER' = 'Unknown Header',
  'MISSING_REQUIRED_HEADER' = 'Missing Required Header',
  'MISSING_RECOMMENDED_HEADER' = 'Missing Recommended Header',
  'MISCELLANEOUS' = 'Miscellaneous',
  'MISSING_REQUIRED_FIELD' = 'Missing Required Field',
  'UNEXPECTED_FORMAT' = 'Unexpected Format',
  'OUT_OF_RANGE' = 'Out of Range',
  'INVALID_VALUE' = 'Invalid Value',
  'MISSING_VALIDATION_SCHEMA' = 'Missing Validation Schema',
  'ERROR' = 'Error',
  'PARSE_ERROR' = 'Parse error',

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
  'INVALID_MEDIA' = 'Media is invalid',
  'UNSUPPORTED_FILE_TYPE' = 'File submitted is not a supported type'
}


/*

What do we do with SQL errors like this?
if (!updateSqlStatement) {
  throw new HTTP400('Failed to build SQL update statement');
}
*/