export const PG_ERROR_CLASS: Record<string, string> = {
  '00': 'Successful Completion',
  '01': 'Warning',
  '02': 'No Data (this is also a warning class per the SQL standard)',
  '03': 'SQL Statement Not Yet Complete',
  '08': 'Connection Exception',
  '09': 'Triggered Action Exception',
  '0A': 'Feature Not Supported',
  '0B': 'Invalid Transaction Initiation',
  '0F': 'Locator Exception',
  '0L': 'Invalid Grantor',
  '0P': 'Invalid Role Specification',
  '0Z': 'Diagnostics Exception',
  '20': 'Case Not Found',
  '21': 'Cardinality Violation',
  '22': 'Data Exception',
  '23': 'Integrity Constraint Violation',
  '24': 'Invalid Cursor State',
  '25': 'Invalid Transaction State',
  '26': 'Invalid SQL Statement Name',
  '27': 'Triggered Data Change Violation',
  '28': 'Invalid Authorization Specification',
  '2B': 'Dependent Privilege Descriptors Still Exist',
  '2D': 'Invalid Transaction Termination',
  '2F': 'SQL Routine Exception',
  '34': 'Invalid Cursor Name',
  '38': 'External Routine Exception',
  '39': 'External Routine Invocation Exception',
  '3B': 'Savepoint Exception',
  '3D': 'Invalid Catalog Name',
  '3F': 'Invalid Schema Name',
  '40': 'Transaction Rollback',
  '42': 'Syntax Error or Access Rule Violation',
  '44': 'WITH CHECK OPTION Violation',
  '53': 'Insufficient Resources',
  '54': 'Program Limit Exceeded',
  '55': 'Object Not In Prerequisite State',
  '57': 'Operator Intervention',
  '58': 'System Error (errors external to PostgreSQL itself)',
  '72': 'Snapshot Failure',
  F0: 'Configuration File Error',
  HV: 'Foreign Data Wrapper Error (SQL/MED)',
  P0: 'PL/pgSQL Error',
  XX: 'Internal Error'
};

/**
 * Get the error class of a PostgreSQL error.
 *
 * @see https://www.postgresql.org/docs/12/errcodes-appendix.html
 *
 * @param {*} error
 * @return {*}  {(string | null)}
 */
export const getPGErrorClass = (error: any): string | null => {
  if (!('code' in error)) {
    return null;
  }

  const codeClassPrefix = error.code.slice(0, 2);

  return PG_ERROR_CLASS[codeClassPrefix] ?? null;
};
