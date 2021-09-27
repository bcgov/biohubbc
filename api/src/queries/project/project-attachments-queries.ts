import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-attachments-queries');

/**
 * SQL query to apply security rule for project attachments table
 *
 * @param {number | null} securityRuleId
 * @returns {SQLStatement} sql query object
 */
export const applyProjectAttachmentSecurityRuleSQL = (securityRuleId: number | null): SQLStatement | null => {
  defaultLog.debug({ label: 'applyProjectAttachmentSecurityRuleSQL', message: 'params', securityRuleId });

  if (!securityRuleId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`SELECT api_apply_security_rule(${securityRuleId})`;

  defaultLog.debug({
    label: 'applyProjectAttachmentSecurityRuleSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add security rule for project attachments table
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const addProjectAttachmentSecurityRuleSQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'addProjectAttachmentSecurityRuleSQL', message: 'params', projectId, attachmentId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const ruleDefinition = [{ target: 'project_attachment', rule: `project_attachment_id=${attachmentId}` }];

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO security_rule (
      project_id,
      rule_definition,
      record_effective_date
    ) VALUES (
      ${projectId},
      ${JSON.stringify(ruleDefinition)},
      now()
    )
    RETURNING
      security_rule_id as id;
  `;

  defaultLog.debug({
    label: 'addProjectAttachmentSecurityRuleSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get security rule for project attachments table
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentSecurityRuleSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentSecurityRuleSQL', message: 'params', attachmentId });

  if (!attachmentId) {
    return null;
  }

  const query = `project_attachment_id=${attachmentId}`;

  const sqlStatement: SQLStatement = SQL`
    select security_rule_id as id
    from security_rule sr
    where sr.rule_definition->0 ->> 'rule' = ${query};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentSecurityRuleSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to set security token to null for a project attachment row.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const removeProjectAttachmentSecurityTokenSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'removeProjectAttachmentSecurityTokenSQL', message: 'params', attachmentId });

  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE project_attachment
    SET security_token = ${null}
    WHERE project_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'removeProjectAttachmentSecurityTokenSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to remove row from security table.
 *
 * @param {any} securityToken
 * @returns {SQLStatement} sql query object
 */
export const removeSecurityRecordSQL = (securityToken: any): SQLStatement | null => {
  defaultLog.debug({ label: 'removeSecurityRecordSQL', message: 'params', securityToken });

  if (!securityToken) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE from security
    WHERE security_token = ${securityToken};
  `;

  defaultLog.debug({
    label: 'removeSecurityRecordSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_attachment_id as id,
      file_name,
      file_type,
      update_date,
      create_date,
      file_size,
      key,
      security_token
    from
      project_attachment
    where
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete an attachment for a single project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectAttachmentSQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteProjectAttachmentSQL', message: 'params', projectId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_attachment_id = ${attachmentId}
    RETURNING
      key;
  `;

  defaultLog.debug({
    label: 'deleteProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get S3 key of an attachment for a single project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentS3KeySQL', message: 'params', projectId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      project_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project attachment row.
 *
 * @param fileName
 * @param fileSize
 * @param fileType
 * @param projectId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postProjectAttachmentSQL = (
  fileName: string,
  fileSize: number,
  fileType: string,
  projectId: number,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    fileType,
    projectId,
    key
  });

  if (!fileName || !fileSize || !fileType || !projectId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_attachment (
      project_id,
      file_name,
      file_size,
      file_type,
      key
    ) VALUES (
      ${projectId},
      ${fileName},
      ${fileSize},
      ${fileType},
      ${key}
    )
    RETURNING
      project_attachment_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get an attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentByFileNameSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentByFileNameSQL', message: 'params', projectId });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      project_attachment
    where
      project_id = ${projectId}
    and
      file_name = ${fileName};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentByFileNameSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update an attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @param {string} fileType
 * @returns {SQLStatement} sql query object
 */
export const putProjectAttachmentSQL = (projectId: number, fileName: string, fileType: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putProjectAttachmentSQL', message: 'params', projectId, fileName, fileType });

  if (!projectId || !fileName || !fileType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      project_attachment
    SET
      file_name = ${fileName},
      file_type = ${fileType}
    WHERE
      file_name = ${fileName}
    AND
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'putProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
