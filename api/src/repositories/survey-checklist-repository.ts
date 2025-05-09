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
            'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'sites')
          ),
          'techniques', jsonb_build_object(
            'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'techniques'),
            'count', COALESCE((
              SELECT COUNT(DISTINCT mt.method_technique_id) 
              FROM method_technique AS mt 
              WHERE mt.survey_id = s.survey_id
            ), 0),
            'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'techniques')
          ),
          'periods', jsonb_build_object(
            'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'periods'),
            'count', COALESCE((
              SELECT COUNT(DISTINCT ssp.survey_sample_period_id) 
              FROM survey_sample_period AS ssp 
              WHERE ssp.survey_id = s.survey_id
            ), 0),
            'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'periods')
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
            'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'observations')
          ),
          'telemetry', jsonb_build_object(
            'devices', jsonb_build_object(
              'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'devices'),
              'count', COALESCE((
                SELECT COUNT(DISTINCT dv.device_id) 
                FROM device AS dv 
                WHERE dv.survey_id = s.survey_id
              ), 0),
              'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'devices')
            ),
            'deployments', jsonb_build_object(
              'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'deployments'),
              'count', COALESCE((
                SELECT COUNT(DISTINCT d.deployment_id) 
                FROM deployment AS d 
                WHERE d.survey_id = s.survey_id
              ), 0),
              'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'deployments')
            ),
            'locations', jsonb_build_object(
              'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'locations'),
              'count', COALESCE((
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
              ), 0),
              'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'locations')
            )
          ),
          'animals', jsonb_build_object(
            'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'animals'),
            'count', COALESCE((
              SELECT COUNT(DISTINCT c.critter_id) 
              FROM critter AS c 
              WHERE c.survey_id = s.survey_id
            ), 0),
            'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'animals')
          ),
          'habitat', jsonb_build_object(
            'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'habitat'),
            'count', COALESCE((
              SELECT COUNT(DISTINCT shf.survey_habitat_feature_id) 
              FROM survey_habitat_feature AS shf 
              WHERE shf.survey_id = s.survey_id
            ), 0),
            'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'habitat')
          )
        ),
        'attachments', jsonb_build_object(
          'checklist_item_name', (SELECT name FROM checklist_items WHERE name = 'attachments'),
          'count', COALESCE((
            SELECT COUNT(DISTINCT sa.survey_attachment_id) 
            FROM survey_attachment AS sa 
            WHERE sa.survey_id = s.survey_id
          ), 0),
          'applicable', NOT EXISTS (SELECT 1 FROM ignored_items WHERE name = 'attachments')
        ),
        'progress_percentage', (
          SELECT ROUND(
            (
              (
                (CASE WHEN EXISTS (SELECT 1 FROM survey_sample_site AS sss WHERE sss.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM method_technique AS mt WHERE mt.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM survey_sample_period AS ssp WHERE ssp.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM survey_observation AS so WHERE so.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM device AS dv WHERE dv.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM deployment AS d WHERE d.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (
                  SELECT 1 FROM deployment AS d
                  JOIN telemetry_manual AS tm ON d.deployment_id = tm.deployment_id
                  WHERE d.survey_id = s.survey_id
                ) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (
                  SELECT 1 FROM deployment AS d
                  JOIN telemetry_lotek AS tl ON d.device_key = tl.device_key
                  WHERE d.survey_id = s.survey_id
                ) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (
                  SELECT 1 FROM deployment AS d
                  JOIN telemetry_vectronic AS tv ON d.device_key = tv.device_key
                  WHERE d.survey_id = s.survey_id
                ) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (
                  SELECT 1 FROM deployment AS d
                  JOIN telemetry_ats AS ta ON d.device_key = ta.device_key
                  WHERE d.survey_id = s.survey_id
                ) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM critter AS c WHERE c.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM survey_habitat_feature AS shf WHERE shf.survey_id = s.survey_id) THEN 1 ELSE 0 END) +
                (CASE WHEN EXISTS (SELECT 1 FROM survey_attachment AS sa WHERE sa.survey_id = s.survey_id) THEN 1 ELSE 0 END)
              )::decimal / 13 * 100
            ), 0
          )
        )
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
   * @param {number} checklistItemId
   * @return {*}  {Promise<void>}
   * @memberof SurveyChecklistRepository
   */
  async insertSurveyChecklistItemIgnore(surveyId: number, checklistItemId: number): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO survey_checklist_item_ignore (survey_id, checklist_item_id)
      VALUES (${surveyId}, ${checklistItemId})
      RETURNING *
    `;

    const response = await this.connection.sql(sqlStatement, SurveyChecklistItemIgnoreModel);

    if (response.rowCount !== 1) {
      throw new Error('Failed to insert into survey_checklist_item_ignore');
    }
  }
}
