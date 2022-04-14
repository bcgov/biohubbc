import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to unsecure an attachment record.
 *
 * @param {string} tableName
 * @param {any} securityToken
 * @returns {SQLStatement} sql query object
 */
export const unsecureAttachmentRecordSQL = (tableName: string, securityToken: any): SQLStatement | null => {
  if (!securityToken || !tableName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`select api_unsecure_attachment_record(${tableName}, ${securityToken})`;

  return sqlStatement;
};

/**
 * SQL query to secure an attachment record.
 *
 * @param {number} attachmentId
 * @param {string} tableName
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const secureAttachmentRecordSQL = (
  attachmentId: number,
  tableName: string,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'secureAttachmentRecordSQL', message: 'params', attachmentId, tableName, projectId });

  if (!attachmentId || !tableName || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`select api_secure_attachment_record(${attachmentId}, ${tableName}, ${projectId})`;

  defaultLog.debug({
    label: 'secureAttachmentRecordSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
