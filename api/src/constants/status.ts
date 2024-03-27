// Message types that match the submission_message_type table
export enum SUBMISSION_MESSAGE_TYPE {
  'DUPLICATE_HEADER' = 'Duplicate Header',
  'UNKNOWN_HEADER' = 'Unknown Header',
  'MISSING_REQUIRED_HEADER' = 'Missing Required Header',
  'MISSING_RECOMMENDED_HEADER' = 'Missing Recommended Header',
  'DANGLING_PARENT_CHILD_KEY' = 'Missing Child Key from Parent',
  'MISSING_REQUIRED_FIELD' = 'Missing Required Field',
  'UNEXPECTED_FORMAT' = 'Unexpected Format',
  'OUT_OF_RANGE' = 'Out of Range',
  'INVALID_VALUE' = 'Invalid Value',
  'NON_UNIQUE_KEY' = 'Duplicate Key(s) found in file.'
}
