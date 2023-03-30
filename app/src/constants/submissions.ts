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
