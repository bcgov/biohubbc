import { SQL, SQLStatement } from 'sql-template-strings';
import { PostTemplateObj } from '../models/template';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/template-queries');

/**
 * SQL query to insert a new templateObj, and return the inserted record.
 *
 * @param {PostTemplateObj} templateObj
 * @returns {SQLStatement} sql query object
 */
export const postTemplateSQL = (templateObj: PostTemplateObj): SQLStatement | null => {
  defaultLog.debug({ label: 'postTemplateSQL', message: 'params', postTemplateSQL });

  if (!templateObj) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO template (
      name,
      description,
      tags,
      data_template,
      ui_template
    ) VALUES (
      ${templateObj.name},
      ${templateObj.description},
      ${templateObj.tags},
      ${templateObj.data_template},
      ${templateObj.ui_template}
    )
    RETURNING
      id,
      name,
      description,
      tags,
      data_template,
      ui_template;
  `;

  defaultLog.debug({
    label: 'postTemplateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a single template.
 *
 * @param {number} templateId
 * @returns {SQLStatement} sql query object
 */
export const getTemplateSQL = (templateId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getTemplateSQL', message: 'params', templateId });

  if (!templateId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      name,
      description,
      tags,
      data_template,
      ui_template
    from
      template
    where
      id = ${templateId};
  `;

  defaultLog.debug({
    label: 'getTemplateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
