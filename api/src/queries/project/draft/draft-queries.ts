import SQL, { SQLStatement } from 'sql-template-strings';


/**
 * SQL query to update a row in the webform_draft table.
 *
 * @param {number} id row id
 * @param {string} name name of the draft record
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const putDraftSQL = (id: number, name: string, data: unknown): SQLStatement | null => {
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
      webform_draft_id = ${id}
    RETURNING
      webform_draft_id as id,
      name,
      create_date::timestamptz,
      update_date::timestamptz;
  `;

  return sqlStatement;
};

