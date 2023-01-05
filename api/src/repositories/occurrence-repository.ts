import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostOccurrence } from '../models/occurrence-create';
import { parseLatLongString, parseUTMString } from '../utils/spatial-utils';
import { appendSQLColumnsEqualValues, AppendSQLColumnsEqualValues } from '../utils/sql-utils';
import { SubmissionErrorFromMessageType } from '../utils/submission-error';
import { BaseRepository } from './base-repository';

export interface IOccurrenceSubmission {
  occurrence_submission_id: number;
  survey_id: number;
  template_methodology_species_id: number;
  source: string;
  input_key: string;
  input_file_name: string;
  output_key: string;
  output_file_name: string;
}

export class OccurrenceRepository extends BaseRepository {
  async updateDWCSourceForOccurrenceSubmission(submissionId: number, jsonData: string): Promise<number> {
    try {
      const sql = SQL`
      UPDATE
        occurrence_submission
      SET
        darwin_core_source = ${jsonData}
      WHERE
        occurrence_submission_id = ${submissionId}
      RETURNING
        occurrence_submission_id;
    `;
      const response = await this.connection.sql<{ occurrence_submission_id: number }>(sql);

      if (!response.rowCount) {
        throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
      }
      return response.rows[0].occurrence_submission_id;
    } catch (error) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }
  }

  /**
   * Gets an `occurrence_submission` for an id or null if nothing is found
   *
   * @param {number} submissionId
   * @return {*}  {Promise<IOccurrenceSubmission | null>}
   */
  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission> {
    const sql = SQL`
      SELECT
        *
      FROM
        occurrence_submission
      WHERE
        occurrence_submission_id = ${submissionId};
    `;

    const response = await this.connection.query<IOccurrenceSubmission>(sql.text, sql.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE);
    }
    return result;
  }

  /**
   * Upload scraped occurrence data.
   *
   * @param {number} occurrenceSubmissionId
   * @param {any} scrapedOccurrence
   */
  async insertPostOccurrences(occurrenceSubmissionId: number, scrapedOccurrence: PostOccurrence): Promise<any> {
    const sqlStatement = SQL`
    INSERT INTO occurrence (
      occurrence_submission_id,
      taxonid,
      lifestage,
      sex,
      data,
      vernacularname,
      eventdate,
      individualcount,
      organismquantity,
      organismquantitytype,
      geography
    ) VALUES (
      ${occurrenceSubmissionId},
      ${scrapedOccurrence.associatedTaxa},
      ${scrapedOccurrence.lifeStage},
      ${scrapedOccurrence.sex},
      ${scrapedOccurrence.data},
      ${scrapedOccurrence.vernacularName},
      ${scrapedOccurrence.eventDate},
      ${scrapedOccurrence.individualCount},
      ${scrapedOccurrence.organismQuantity},
      ${scrapedOccurrence.organismQuantityType}
  `;

    const utm = parseUTMString(scrapedOccurrence.verbatimCoordinates);
    const latLong = parseLatLongString(scrapedOccurrence.verbatimCoordinates);

    if (utm) {
      // transform utm string into point, if it is not null
      sqlStatement.append(SQL`
      ,public.ST_Transform(
        public.ST_SetSRID(
          public.ST_MakePoint(${utm.easting}, ${utm.northing}),
          ${utm.zone_srid}
        ),
        4326
      )
    `);
    } else if (latLong) {
      // transform latLong string into point, if it is not null
      sqlStatement.append(SQL`
      ,public.ST_Transform(
        public.ST_SetSRID(
          public.ST_MakePoint(${latLong.long}, ${latLong.lat}),
          4326
        ),
        4326
      )
    `);
    } else {
      // insert null geography
      sqlStatement.append(SQL`
        ,null
      `);
    }

    sqlStatement.append(');');

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to insert occurrence data', [
        'OccurrenceRepository->insertPostOccurrences',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  /**
   * Gets a list of `occurrence` for a `occurrence_submission` id.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<any[]>}
   */
  async getOccurrencesForView(submissionId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        public.ST_asGeoJSON(o.geography) as geometry,
        o.taxonid,
        o.occurrence_id,
        o.lifestage,
        o.sex,
        o.vernacularname,
        o.individualcount,
        o.organismquantity,
        o.organismquantitytype,
        o.eventdate
      FROM
        occurrence as o
      LEFT OUTER JOIN
        occurrence_submission as os
      ON
        o.occurrence_submission_id = os.occurrence_submission_id
      WHERE
        o.occurrence_submission_id = ${submissionId}
      AND
        os.delete_timestamp is null;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get occurrences view data', [
        'OccurrenceRepository->getOccurrencesForView',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  /**
   * Update existing `occurrence_submission` record with outputKey and outputFileName.
   *
   * @param {number} submissionId
   * @param {string} outputFileName
   * @param {string} outputKey
   * @return {*}  {Promise<any>}
   */
  async updateSurveyOccurrenceSubmissionWithOutputKey(
    submissionId: number,
    outputFileName: string,
    outputKey: string
  ): Promise<any> {
    const items: AppendSQLColumnsEqualValues[] = [];

    items.push({ columnName: 'output_file_name', columnValue: outputFileName });

    items.push({ columnName: 'output_key', columnValue: outputKey });

    const sqlStatement = SQL`
      UPDATE occurrence_submission
      SET
    `;

    appendSQLColumnsEqualValues(sqlStatement, items);

    sqlStatement.append(SQL`
      WHERE
        occurrence_submission_id = ${submissionId}
      RETURNING occurrence_submission_id as id;
    `);

    const updateResponse = await await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!updateResponse || !updateResponse.rowCount) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }

    return updateResponse.rows[0];
  }
}
