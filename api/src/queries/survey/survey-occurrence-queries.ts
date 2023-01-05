import { SQL, SQLStatement } from 'sql-template-strings';
import {
  AppendSQLColumn,
  appendSQLColumns,
  AppendSQLColumnsEqualValues,
  appendSQLColumnsEqualValues,
  AppendSQLValue,
  appendSQLValues
} from '../../utils/sql-utils';

/**
 * SQL query to insert a survey occurrence submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} inputFileName
 * @param {(number | null)} templateMethodologyId
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveyOccurrenceSubmissionSQL = (data: {
  surveyId: number;
  source: string;
  inputFileName?: string;
  inputKey?: string;
  outputFileName?: string;
  outputKey?: string;
}): SQLStatement | null => {
  if (!data || !data.surveyId || !data.source) {
    return null;
  }

  const dataKeys = Object.keys(data);

  const columnItems: AppendSQLColumn[] = [];
  const valueItems: AppendSQLValue[] = [];

  if (dataKeys.includes('inputFileName')) {
    columnItems.push({ columnName: 'input_file_name' });
    valueItems.push({ columnValue: data.inputFileName });
  }

  if (dataKeys.includes('inputKey')) {
    columnItems.push({ columnName: 'input_key' });
    valueItems.push({ columnValue: data.inputKey });
  }

  if (dataKeys.includes('outputFileName')) {
    columnItems.push({ columnName: 'output_file_name' });
    valueItems.push({ columnValue: data.outputFileName });
  }

  if (dataKeys.includes('outputKey')) {
    columnItems.push({ columnName: 'output_key' });
    valueItems.push({ columnValue: data.outputKey });
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO occurrence_submission (
      survey_id,
      source,
      event_timestamp,
  `;

  appendSQLColumns(sqlStatement, columnItems);

  sqlStatement.append(SQL`
    ) VALUES (
      ${data.surveyId},
      ${data.source},
      now(),
  `);

  appendSQLValues(sqlStatement, valueItems);

  sqlStatement.append(SQL`
    )
    RETURNING
      occurrence_submission_id as id;
  `);

  return sqlStatement;
};

/**
 * SQL query to update a survey occurrence submission row.
 *
 * @param {{
 *   submissionId: number;
 *   inputKey?: string;
 *   outputFileName?: string;
 *   outputKey?: string;
 * }} data
 * @return {*}  {(SQLStatement | null)}
 */
export const updateSurveyOccurrenceSubmissionSQL = (data: {
  submissionId: number;
  inputFileName?: string;
  inputKey?: string;
  outputFileName?: string;
  outputKey?: string;
}): SQLStatement | null => {
  if (!data.submissionId || (!data.inputFileName && !data.inputKey && !data.outputFileName && !data.outputKey)) {
    return null;
  }

  const dataKeys = Object.keys(data);

  const items: AppendSQLColumnsEqualValues[] = [];

  if (dataKeys.includes('inputFileName')) {
    items.push({ columnName: 'input_file_name', columnValue: data.inputFileName });
  }

  if (dataKeys.includes('inputKey')) {
    items.push({ columnName: 'input_key', columnValue: data.inputKey });
  }

  if (dataKeys.includes('outputFileName')) {
    items.push({ columnName: 'output_file_name', columnValue: data.outputFileName });
  }

  if (dataKeys.includes('outputKey')) {
    items.push({ columnName: 'output_key', columnValue: data.outputKey });
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE occurrence_submission
    SET
  `;

  appendSQLColumnsEqualValues(sqlStatement, items);

  sqlStatement.append(SQL`
    WHERE
      occurrence_submission_id = ${data.submissionId}
    RETURNING occurrence_submission_id as id;
  `);

  return sqlStatement;
};

/**
 * SQL query to soft delete the occurrence submission entry by ID
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const deleteOccurrenceSubmissionSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  if (!occurrenceSubmissionId) {
    return null;
  }

  return SQL`
    UPDATE occurrence_submission
    SET delete_timestamp = now()
    WHERE occurrence_submission_id = ${occurrenceSubmissionId};
  `;
};

/**
 * SQL query to get the list of messages for an occurrence submission.
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getOccurrenceSubmissionMessagesSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  if (!occurrenceSubmissionId) {
    return null;
  }

  return SQL`
    SELECT
      sm.submission_message_id as id,
      smt.name as type,
      sst.name as status,
      smc.name as class,
      sm.message
    FROM
      occurrence_submission as os
    LEFT OUTER JOIN
      submission_status as ss
    ON
      os.occurrence_submission_id = ss.occurrence_submission_id
    LEFT OUTER JOIN
      submission_status_type as sst
    ON
      sst.submission_status_type_id = ss.submission_status_type_id
    LEFT OUTER JOIN
      submission_message as sm
    ON
      sm.submission_status_id = ss.submission_status_id
    LEFT OUTER JOIN
      submission_message_type as smt
    ON
      smt.submission_message_type_id = sm.submission_message_type_id
    LEFT OUTER JOIN
      submission_message_class smc
    ON
      smc.submission_message_class_id = smt.submission_message_class_id
    WHERE
      os.occurrence_submission_id = ${occurrenceSubmissionId}
    ORDER BY sm.submission_message_id;
  `;
};
