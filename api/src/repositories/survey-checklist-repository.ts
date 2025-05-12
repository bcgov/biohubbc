import { SurveyChecklistItemIgnoreModel } from '../database-models/survey_checklist_item_ignore';
import { BaseRepository } from './base-repository';

import { SQL } from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';

const SurveyChecklistItem = z.object({
  checklist_item_name: z.string(),
  applicable: z.boolean(),
  count: z.number().min(0)
});

export const SurveyChecklist = z.object({
  checklist: z.object({
    sampling: z.object({
      sites: SurveyChecklistItem,
      techniques: SurveyChecklistItem,
      periods: SurveyChecklistItem
    }),
    data: z.object({
      observations: SurveyChecklistItem,
      telemetry: z.object({
        locations: SurveyChecklistItem,
        devices: SurveyChecklistItem,
        deployments: SurveyChecklistItem
      }),
      animals: SurveyChecklistItem,
      habitat: SurveyChecklistItem
    }),
    attachments: SurveyChecklistItem,
    progress_percentage: z.number()
  })
});

export type SurveyChecklist = z.infer<typeof SurveyChecklist>;
/**
 * A repository class for accessing survey_checklist_item data.
 *
 * @export
 * @class SurveyChecklistRepository
 * @extends {BaseRepository}
 */
export class SurveyChecklistRepository extends BaseRepository {
  /**
   * Gets the checklist for a survey
   *
   * @param {number} surveyId
   * @return {*}
   * @memberof SurveyRepository
   */
  async getSurveyChecklist(surveyId: number): Promise<SurveyChecklist> {
    const knex = getKnex();

    const queryBuilder = knex
      .with('checklist_items', (qb) =>
        qb
          .select('checklist_item_id', 'name')
          .from('checklist_item')
          .whereIn('name', [
            'sites',
            'techniques',
            'periods',
            'observations',
            'devices',
            'deployments',
            'locations',
            'animals',
            'habitat',
            'attachments'
          ])
      )
      .with('ignored_items', (qb) =>
        qb
          .select('ci.name')
          .from('survey_checklist_item_ignore as scii')
          .join('checklist_item as ci', 'ci.checklist_item_id', 'scii.checklist_item_id')
          .where('scii.survey_id', surveyId)
      )
      .with('applicable_items', (qb) =>
        qb
          .select('ci.name')
          .from('checklist_items as ci')
          .whereNotExists((qb) => {
            qb.select('*').from('ignored_items as ii').whereRaw('ii.name = ci.name');
          })
      )
      .select(
        knex.raw(`
  jsonb_build_object(
    'sampling', jsonb_build_object(
      'sites', jsonb_build_object(
        'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'sites'),
        'count', COALESCE((
          SELECT COUNT(DISTINCT sss.survey_sample_site_id) 
          FROM survey_sample_site AS sss 
          WHERE sss.survey_id = s.survey_id
        ), 0),
        'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'sites' AND survey_id = ${surveyId})
      ),
      'techniques', jsonb_build_object(
        'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'techniques'),
        'count', COALESCE((
          SELECT COUNT(DISTINCT mt.method_technique_id) 
          FROM method_technique AS mt 
          WHERE mt.survey_id = s.survey_id
        ), 0),
        'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'techniques' AND survey_id = ${surveyId})
      ),
      'periods', jsonb_build_object(
        'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'periods'),
        'count', COALESCE((
          SELECT COUNT(DISTINCT ssp.survey_sample_period_id) 
          FROM survey_sample_period AS ssp 
          WHERE ssp.survey_id = s.survey_id
        ), 0),
        'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'periods' AND survey_id = ${surveyId})
      )
    ),
    'data', jsonb_build_object(
      'observations', jsonb_build_object(
        'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'observations'),
        'count', COALESCE((
          SELECT COUNT(DISTINCT so.survey_observation_id) 
          FROM survey_observation AS so 
          WHERE so.survey_id = s.survey_id
        ), 0),
        'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'observations' AND survey_id = ${surveyId})
      ),
      'telemetry', jsonb_build_object(
        'devices', jsonb_build_object(
          'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'devices'),
          'count', COALESCE((
            SELECT COUNT(DISTINCT dv.device_id) 
            FROM device AS dv 
            WHERE dv.survey_id = s.survey_id
          ), 0),
          'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'devices' AND survey_id = ${surveyId})
        ),
        'deployments', jsonb_build_object(
          'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'deployments'),
          'count', COALESCE((
            SELECT COUNT(DISTINCT d.deployment_id) 
            FROM deployment AS d 
            WHERE d.survey_id = s.survey_id
          ), 0),
          'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'deployments' AND survey_id = ${surveyId})
        ),
        'locations', jsonb_build_object(
          'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'locations'),
          'count', (
            COALESCE((
              SELECT COUNT(DISTINCT tm.telemetry_manual_id) 
              FROM deployment AS d 
              LEFT JOIN telemetry_manual AS tm ON d.deployment_id = tm.deployment_id 
              WHERE d.survey_id = s.survey_id
            ), 0) + 
            COALESCE((
              SELECT COUNT(DISTINCT tl.telemetry_lotek_id) 
              FROM deployment AS d 
              LEFT JOIN telemetry_lotek AS tl ON d.device_key = tl.device_key 
              WHERE d.survey_id = s.survey_id
            ), 0) + 
            COALESCE((
              SELECT COUNT(DISTINCT tv.telemetry_vectronic_id) 
              FROM deployment AS d 
              LEFT JOIN telemetry_vectronic AS tv ON d.device_key = tv.device_key 
              WHERE d.survey_id = s.survey_id
            ), 0) + 
            COALESCE((
              SELECT COUNT(DISTINCT ta.telemetry_ats_id) 
              FROM deployment AS d 
              LEFT JOIN telemetry_ats AS ta ON d.device_key = ta.device_key 
              WHERE d.survey_id = s.survey_id
            ), 0)
          ),
          'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'locations' AND survey_id = ${surveyId})
        )
      ),
      'animals', jsonb_build_object(
        'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'animals'),
        'count', COALESCE((
          SELECT COUNT(DISTINCT c.critter_id) 
          FROM critter AS c 
          WHERE c.survey_id = s.survey_id
        ), 0),
        'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'animals' AND survey_id = ${surveyId})
      ),
      'habitat', jsonb_build_object(
        'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'habitat'),
        'count', COALESCE((
          SELECT COUNT(DISTINCT shf.survey_habitat_feature_id) 
          FROM survey_habitat_feature AS shf 
          WHERE shf.survey_id = s.survey_id
        ), 0),
        'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'habitat' AND survey_id = ${surveyId})
      )
    ),
    'attachments', jsonb_build_object(
      'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'attachments'),
      'count', COALESCE((
        SELECT COUNT(DISTINCT sa.survey_attachment_id) 
        FROM survey_attachment AS sa 
        WHERE sa.survey_id = s.survey_id
      ), 0),
      'applicable', EXISTS (SELECT 1 FROM applicable_items WHERE name = 'attachments' AND survey_id = ${surveyId})
    ),
    'progress_percentage', 
      CASE 
        WHEN (SELECT COUNT(*) FROM applicable_items) = 0 THEN 0
        ELSE COALESCE(
          ROUND(
            (
              (CASE WHEN 'sites' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM survey_sample_site WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'techniques' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM method_technique WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'periods' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM survey_sample_period WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'observations' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM survey_observation WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'devices' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM device WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'deployments' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM deployment WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'locations' IN (SELECT name FROM applicable_items) AND EXISTS (
                SELECT 1 FROM deployment d
                LEFT JOIN telemetry_manual tm ON d.deployment_id = tm.deployment_id
                LEFT JOIN telemetry_lotek tl ON d.device_key = tl.device_key
                LEFT JOIN telemetry_vectronic tv ON d.device_key = tv.device_key
                LEFT JOIN telemetry_ats ta ON d.device_key = ta.device_key
                WHERE d.survey_id = s.survey_id
                AND (
                  tm.telemetry_manual_id IS NOT NULL OR
                  tl.telemetry_lotek_id IS NOT NULL OR
                  tv.telemetry_vectronic_id IS NOT NULL OR
                  ta.telemetry_ats_id IS NOT NULL
                )
              ) THEN 1 ELSE 0 END) +
              (CASE WHEN 'animals' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM critter WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'habitat' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM survey_habitat_feature WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END) +
              (CASE WHEN 'attachments' IN (SELECT name FROM applicable_items) AND EXISTS (SELECT 1 FROM survey_attachment WHERE survey_id = s.survey_id) THEN 1 ELSE 0 END)
            )::decimal / (SELECT COUNT(*) FROM applicable_items) * 100
          ),
          0
        )
      END
    ) AS checklist
`)
      )
      .from('survey as s')
      .where('s.survey_id', surveyId)
      .first();

    const response = await this.connection.knex(queryBuilder, SurveyChecklist);

    return response.rows[0];
  }

  /**
   * Insert a checklist item to ignore using its name in the survey_checklist_item_ignore table.
   *
   * @param {number} surveyId
   * @param {string} checklistItemName
   * @return {*}  {Promise<void>}
   * @memberof SurveyChecklistRepository
   */
  async insertSurveyChecklistItemIgnore(surveyId: number, checklistItemName: string): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO survey_checklist_item_ignore (survey_id, checklist_item_id)
      VALUES (
        ${surveyId},
        (SELECT checklist_item_id FROM checklist_item WHERE name = ${checklistItemName})
      )
      RETURNING *;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyChecklistItemIgnoreModel);

    console.log('inserted!', response.rows);

    if (response.rowCount !== 1) {
      throw new Error('Failed to insert into survey_checklist_item_ignore');
    }
  }

  /**
   * Delete an ignored checklist item for the survey
   *
   * @param {number} surveyId
   * @param {string} checklistItemName
   * @return {*}  {Promise<void>}
   * @memberof SurveyChecklistRepository
   */
  async deleteSurveyChecklistItemIgnore(surveyId: number, checklistItemName: string): Promise<void> {
    const sqlStatement = SQL`
        DELETE FROM 
          survey_checklist_item_ignore
        WHERE 
          survey_id = ${surveyId} AND checklist_item_id = (SELECT checklist_item_id FROM checklist_item WHERE name = ${checklistItemName})
        `;

    await this.connection.sql(sqlStatement, SurveyChecklistItemIgnoreModel);
  }
}
