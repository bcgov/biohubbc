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
  'PUBLISHED' = 'Published',
  'REJECTED' = 'Rejected',
  'ON HOLD' = 'On Hold',
  'SYSTEM_ERROR' = 'System Error'
}
