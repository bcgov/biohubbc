import { Knex } from 'knex';

/**
 * Fixes duplicate system_user_ids AND references to duplicate system_user_ids
 *
 * Updates the following tables:
 * - system_user: Update/end-dates duplicate system_user records.
 * - system_user_role: Delete duplicate system_user_role records.
 * - project_participation: Update system_user_id to the canonical system_user_id, and delete duplicate records.
 * - survey_participation: Update system_user_id to the canonical system_user_id, and delete duplicate records.
 * - webform_draft: Update system_user_id to the canonical system_user_id.
 * - administrative_activity: Delete duplicate administrative_activity records.
 *
 * Updates/fixes several constraints:
 * - system_user_nuk1: Don't allow more than 1 active record with the same user_guid.
 * - system_user_nuk2: Don't allow more than 1 active record with the same user_identifier (case-insensitive) AND user_identity_source_id.
 *
 * Does not update the following tables:
 * - audit_log: This table tracks the history of all changes to the database, including changes from this migration.
 * - user_user_group: No data exists in this table at the time of writing.
 * - grouping_participation: No data exists in this table at the time of writing.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Drop existing constraints
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH = 'biohub';

    DROP INDEX IF EXISTS system_user_uk1;
    DROP INDEX IF EXISTS system_user_nuk1;

    -- Drop old out-dated unique index
    DROP INDEX IF EXISTS biohub.project_participation_uk1;
    -- Drop constraint temporarily (added back at the end)
    ALTER TABLE project_participation DROP CONSTRAINT IF EXISTS project_participation_uk2;

    ----------------------------------------------------------------------------------------
    -- Find AND migrate duplicate system_user_ids
    ----------------------------------------------------------------------------------------

    WITH
    -- Get all system_user records with a unique user_identifier (case-insensitive) and user_identity_source_id,
    -- preferring the lowest system_user_id WHERE record_end_date is null
    w_system_user_1 AS (
      SELECT
        DISTINCT ON (
          LOWER(user_identifier),
          user_identity_source_id
        )
        LOWER(user_identifier) AS user_identifier,
        user_identity_source_id,
        system_user_id
      FROM
        system_user
      ORDER BY
        LOWER(user_identifier),
        user_identity_source_id,
        CASE WHEN record_end_date IS NULL THEN 0 ELSE 1 END,
        system_user_id
    ),
    w_system_user_2 AS (
      -- Get all system_user records with a unique user_identifier (case-insensitive) and user_identity_source_id,
      -- aggregating all additional duplicate system_user_ids into an array
      SELECT
        LOWER(system_user.user_identifier) AS user_identifier,
        user_identity_source_id,
        array_remove(array_agg(system_user.system_user_id), null) duplicate_system_user_ids,
        -- Get the first non-null value for each of the remaining user detail columns
        (array_remove(array_agg(system_user.user_guid), null))[1] user_guid,
        (array_remove(array_agg(system_user.display_name), null))[1] display_name,
        (array_remove(array_agg(system_user.given_name), null))[1] given_name,
        (array_remove(array_agg(system_user.family_name), null))[1] family_name,
        (array_remove(array_agg(system_user.email), null))[1] email,
        (array_remove(array_agg(system_user.agency), null))[1] agency,
        (array_remove(array_agg(system_user.notes), null))[1] notes
      FROM
        system_user
      GROUP BY
        LOWER(system_user.user_identifier),
        system_user.user_identity_source_id
    ),
    w_system_user_3 AS (
      -- Combine the two previous CTEs to get the canonical system_user_id to use when there are duplicate users, and
      -- and a list of all system_user_ids that are duplicates (which does not include the canonical system_user_id).
      SELECT
        w_system_user_1.system_user_id,
        w_system_user_1.user_identity_source_id,
        array_remove(w_system_user_2.duplicate_system_user_ids, w_system_user_1.system_user_id) AS duplicate_system_user_ids,
        w_system_user_2.user_guid,
        w_system_user_2.display_name,
        w_system_user_2.given_name,
        w_system_user_2.family_name,
        w_system_user_2.email,
        w_system_user_2.agency,
        w_system_user_2.notes
      FROM
        w_system_user_1
      left join
        w_system_user_2
      ON w_system_user_1.user_identifier = w_system_user_2.user_identifier
      AND w_system_user_1.user_identity_source_id = w_system_user_2.user_identity_source_id
    ),
    -- Get all project_participation records for each project with a system_user_id that is a duplicate, unless there is 
    -- already a record for that project with the canonical system_user_id.
    w_project_participation_1 as (
        SELECT 
           array_agg(pp.project_participation_id) duplicate_project_participation_ids, 
           wsu3.system_user_id
        FROM project_participation AS pp
        JOIN w_system_user_3 AS wsu3
            ON pp.system_user_id = ANY(wsu3.duplicate_system_user_ids)
        WHERE NOT EXISTS (
            SELECT 1
            FROM project_participation AS pp_check
            WHERE pp_check.system_user_id = wsu3.system_user_id
            AND pp_check.project_id = pp.project_id
         )
         GROUP BY 
           wsu3.system_user_id,
           pp.project_id
     ),
    -- For each project_participation record from the previous CTE, update the system_user_id to the canonical 
    -- system_user_id.
    w_project_participation_2 AS (
        UPDATE project_participation AS pp
        SET system_user_id = wpp1.system_user_id
        FROM w_project_participation_1 AS wpp1
        where wpp1.duplicate_project_participation_ids[1] = pp.project_participation_id
    ),
    -- Delete all remaining references to duplicate system_user_ids in the project_participation table.
    w_project_participation_3 AS (
        DELETE FROM project_participation AS pp 
        USING w_system_user_3 
        WHERE pp.system_user_id = ANY(w_system_user_3.duplicate_system_user_ids)
    ),
    -- Get all survey_participation records for each survey with a system_user_id that is a duplicate, unless there is 
    -- already a record for that survey with the canonical system_user_id.
    w_survey_participation_1 as (
        SELECT 
           array_agg(sp.survey_participation_id) duplicate_survey_participation_ids, 
           wsu3.system_user_id
        FROM survey_participation AS sp
        JOIN w_system_user_3 AS wsu3
            ON sp.system_user_id = ANY(wsu3.duplicate_system_user_ids)
        WHERE NOT EXISTS (
            SELECT 1
            FROM survey_participation AS sp_check
            WHERE sp_check.system_user_id = wsu3.system_user_id
            AND sp_check.survey_id = sp.survey_id
         )
         GROUP BY 
           wsu3.system_user_id,
           sp.survey_id
     ),
    -- For each survey_participation record from the previous CTE, update the system_user_id to the canonical 
    -- system_user_id.
    w_survey_participation_2 AS (
        UPDATE survey_participation AS sp
        SET system_user_id = wsp1.system_user_id
        FROM w_survey_participation_1 AS wsp1
        where wsp1.duplicate_survey_participation_ids[1] = sp.survey_participation_id
    ),
    -- Delete all remaining references to duplicate system_user_ids in the survey_participation table.
    w_survey_participation_3 AS (
        DELETE FROM survey_participation AS sp 
        USING w_system_user_3 
        WHERE sp.system_user_id = ANY(w_system_user_3.duplicate_system_user_ids)
    ),
    -- Update duplicate system_user_ids in the webform_draft table to the canonical system_user_id
    w_end_date_duplicate_webform_draft as (
        UPDATE webform_draft  
        SET 
          system_user_id = wsu3.system_user_id
        FROM w_system_user_3 wsu3
        WHERE webform_draft.system_user_id = ANY(wsu3.duplicate_system_user_ids)
    ),
    -- Delete duplicate system_user_role records for duplicate system_user_ids
    w_end_date_duplicate_system_user_role AS (
      DELETE FROM system_user_role
      USING w_system_user_3 wsu3
      WHERE system_user_role.system_user_id = ANY(wsu3.duplicate_system_user_ids)
    ),
    -- End date all duplicate system_user records for duplicate system_user_ids
    w_end_date_duplicate_system_user AS (
      UPDATE system_user su
      SET
        record_end_date = NOW(),
        notes = 'Duplicate user record; merged into system_user_id ' || wsu3.system_user_id || '.'
      FROM w_system_user_3 wsu3
      WHERE su.system_user_id = ANY(wsu3.duplicate_system_user_ids)
    ),
    -- Update the user details for the canonical system user record
    w_update_system_user AS (
      UPDATE system_user su
      SET
        user_guid = wsu3.user_guid,
        display_name = wsu3.display_name,
        given_name = wsu3.given_name,
        family_name = wsu3.family_name,
        email = wsu3.email,
        agency = wsu3.agency
      FROM w_system_user_3 wsu3
      WHERE su.system_user_id = wsu3.system_user_id
    )
    -- Return the combined results of the original CTEs (have to select something to run the query)
    SELECT * FROM w_system_user_3;

    ----------------------------------------------------------------------------------------
    -- Additional cleanup
    ----------------------------------------------------------------------------------------

    -- Remove any duplicate access request records, keeping the most recently updated or created record for each reported_system_user_id.
    WITH w_ranked_administrative_activity AS (
      SELECT
        administrative_activity_id,
        reported_system_user_id,
        create_date,
        update_date,
        ROW_NUMBER() OVER (
          PARTITION BY reported_system_user_id
          ORDER BY
            COALESCE(update_date, create_date) DESC
        ) AS rank
      FROM
        administrative_activity
    )
    DELETE FROM administrative_activity
    WHERE
      administrative_activity_id IN (
        SELECT
          administrative_activity_id
        FROM
          w_ranked_administrative_activity
        WHERE
          rank > 1
      );

    ----------------------------------------------------------------------------------------
    -- Add updated constraints
    ----------------------------------------------------------------------------------------

    -- Don't allow more than 1 active record with the same user_guid.
    CREATE UNIQUE INDEX system_user_nuk1 ON system_user (user_guid, (record_end_date is null)) WHERE record_end_date is null;

    -- Don't allow more than 1 active record with the same user_identifier (case-insensitive) AND user_identity_source_id.
    CREATE UNIQUE INDEX system_user_nuk2 ON system_user(LOWER(user_identifier), user_identity_source_id, (record_end_date is null)) WHERE record_end_date is null;

    -- Don't allow the same system user to have more than one project role within a project.
    ALTER TABLE biohub.project_participation ADD CONSTRAINT project_participation_uk1 UNIQUE (system_user_id, project_id);

    -- Don't allow the same system user to have more than one survey role within a survey.
    ALTER TABLE biohub.survey_participation ADD CONSTRAINT survey_participation_uk1 UNIQUE (system_user_id, survey_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
