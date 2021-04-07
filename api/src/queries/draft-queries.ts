import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/draft-queries');

/**
 * SQL query to insert a row in the webform_draft table.
 *
 * @param {number} systemUserId the ID of the user in context
 * @param {string} name name of the draft record
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const postDraftSQL = (systemUserId: number, name: string, data: unknown): SQLStatement | null => {
  defaultLog.debug({ label: 'postDraftSQL', message: 'params', name, data });

  if (!systemUserId || !name || !data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO webform_draft (
      su_id,
      name,
      data
    ) VALUES (
      ${systemUserId},
      ${name},
      ${data}
    )
    RETURNING
      id,
      create_date::timestamptz,
      update_date::timestamptz;
  `;

  defaultLog.debug({
    label: 'postDraftSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a row in the webform_draft table.
 *
 * @param {number} id row id
 * @param {string} name name of the draft record
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const putDraftSQL = (id: number, name: string, data: unknown): SQLStatement | null => {
  defaultLog.debug({ label: 'putDraftSQL', message: 'params', name, data });

  if (!id || !name || !data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      webform_draft
    SET
      name = ${name},
      data = ${data}
    WHERE
      id = ${id}
    RETURNING
      id,
      create_date::timestamptz,
      update_date::timestamptz;
  `;

  defaultLog.debug({
    label: 'putDraftSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
