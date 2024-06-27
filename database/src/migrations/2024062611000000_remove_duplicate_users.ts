import { Knex } from 'knex';

/**
 * Fixes duplicate user records and references to duplicate user records
 *
 * - Removes references to duplicated users all tables referencing system_user_id
 * - Removes duplicate records in system_user table based on (user_identifier, user_identity_source_id, record_end_date) as the unique key
 * - Adds database constraints to prevent duplicates in system_user_id and administrative_activity
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    
    SET SEARCH_PATH='biohub';

    ----------------------------------------------------------------------------------------
    -- Alter existing system_user_role data
    ----------------------------------------------------------------------------------------

    -- Update references to duplicated user IDs
    WITH DeduplicatedUsers AS (
        SELECT 
            MIN(su.system_user_id) AS deduplicated_system_user_id,
            su.user_identity_source_id,
            su.user_identifier
        FROM 
            system_user su
        GROUP BY 
            su.user_identity_source_id, su.user_identifier, su.record_end_date
    )
    UPDATE 
        system_user_role AS sur
    SET 
        system_user_id = du.deduplicated_system_user_id
    FROM 
        DeduplicatedUsers AS du
    WHERE 
        sur.system_user_id IN (
            SELECT su.system_user_id
            FROM system_user su
            WHERE su.user_identity_source_id = du.user_identity_source_id
            AND su.user_identifier = du.user_identifier
        )
        AND sur.system_user_id NOT IN (
            SELECT deduplicated_system_user_id
            FROM DeduplicatedUsers
        )
        -- prevent updates that will introduce a duplicate and trigger a unique constraint error
        AND NOT EXISTS (
            SELECT 1
            FROM system_user_role sur_check
            WHERE sur_check.system_user_id = du.deduplicated_system_user_id
            AND sur_check.system_role_id = sur.system_role_id
            AND sur_check.system_user_role_id <> sur.system_user_role_id
    );

    ----------------------------------------------------------------------------------------
    -- Update references to duplicate user IDs in all tables with a system_user_id column
    ----------------------------------------------------------------------------------------

    -- Remove references to duplicated users in the project_participation table
    WITH DeduplicatedUsers AS (
        SELECT MIN(system_user_id) AS deduplicated_system_user_id,
        user_identity_source_id,
        user_identifier
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    )
    UPDATE project_participation AS pp
    SET system_user_id = dedup.deduplicated_system_user_id
    FROM DeduplicatedUsers AS dedup
    WHERE pp.system_user_id IN (
        SELECT system_user_id
        FROM system_user
        WHERE user_identity_source_id = dedup.user_identity_source_id
        AND user_identifier = dedup.user_identifier
    )
    AND pp.system_user_id NOT IN (
        SELECT deduplicated_system_user_id
        FROM DeduplicatedUsers
    );

    -- Deduplicate audit_log records
    WITH DeduplicatedUsers AS (
        SELECT MIN(system_user_id) AS deduplicated_system_user_id,
        user_identity_source_id,
        user_identifier
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    )
    UPDATE audit_log AS pp
    SET system_user_id = dedup.deduplicated_system_user_id
    FROM DeduplicatedUsers AS dedup
    WHERE pp.system_user_id IN (
        SELECT system_user_id
        FROM system_user
        WHERE user_identity_source_id = dedup.user_identity_source_id
        AND user_identifier = dedup.user_identifier
    )
    AND pp.system_user_id NOT IN (
        SELECT deduplicated_system_user_id
        FROM DeduplicatedUsers
    );

    -- Deduplicate webform_draft records
    WITH DeduplicatedUsers AS (
        SELECT MIN(system_user_id) AS deduplicated_system_user_id,
        user_identity_source_id,
        user_identifier
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    )
    UPDATE webform_draft AS pp
    SET system_user_id = dedup.deduplicated_system_user_id
    FROM DeduplicatedUsers AS dedup
    WHERE pp.system_user_id IN (
        SELECT system_user_id
        FROM system_user
        WHERE user_identity_source_id = dedup.user_identity_source_id
        AND LOWER(user_identifier) = LOWER(dedup.user_identifier)
    )
    AND pp.system_user_id NOT IN (
        SELECT deduplicated_system_user_id
        FROM DeduplicatedUsers
    );

    -- Deduplicate user_user_group records
    WITH DeduplicatedUsers AS (
        SELECT MIN(system_user_id) AS deduplicated_system_user_id,
        user_identity_source_id,
        user_identifier
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    )
    UPDATE user_user_group AS pp
    SET system_user_id = dedup.deduplicated_system_user_id
    FROM DeduplicatedUsers AS dedup
    WHERE pp.system_user_id IN (
        SELECT system_user_id
        FROM system_user
        WHERE user_identity_source_id = dedup.user_identity_source_id
        AND LOWER(user_identifier) = LOWER(dedup.user_identifierLOWER(
    )
    AND pp.system_user_id NOT IN (
        SELECT deduplicated_system_user_id
        FROM DeduplicatedUsers
    );

    -- Deduplicate grouping_participation records
    WITH DeduplicatedUsers AS (
        SELECT MIN(system_user_id) AS deduplicated_system_user_id,
        user_identity_source_id,
        user_identifier
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    )
    UPDATE grouping_participation AS pp
    SET system_user_id = dedup.deduplicated_system_user_id
    FROM DeduplicatedUsers AS dedup
    WHERE pp.system_user_id IN (
        SELECT system_user_id
        FROM system_user
        WHERE user_identity_source_id = dedup.user_identity_source_id
        AND LOWER(user_identifier) = LOWER(dedup.user_identifier)
    )
    AND pp.system_user_id NOT IN (
        SELECT deduplicated_system_user_id
        FROM DeduplicatedUsers
    );

    -- Deduplicate survey_participation records
    WITH DeduplicatedUsers AS (
        SELECT MIN(system_user_id) AS deduplicated_system_user_id,
        user_identity_source_id,
        user_identifier
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    )
    UPDATE survey_participation AS pp
    SET system_user_id = dedup.deduplicated_system_user_id
    FROM DeduplicatedUsers AS dedup
    WHERE pp.system_user_id IN (
        SELECT system_user_id
        FROM system_user
        WHERE user_identity_source_id = dedup.user_identity_source_id
        AND LOWER(user_identifier) = LOWER(dedup.user_identifier)
    )
    AND pp.system_user_id NOT IN (
        SELECT deduplicated_system_user_id
        FROM DeduplicatedUsers
    );

    ----------------------------------------------------------------------------------------
    -- Delete duplicate records
    ----------------------------------------------------------------------------------------

    -- Remove any duplicate system user role records
    DELETE FROM system_user_role
    WHERE system_role_id NOT IN (
        SELECT MIN(system_user_role_id)
        FROM system_user_role
        GROUP BY system_user_id, system_role_id
    );

    -- Remove any duplicate user records
    DELETE FROM system_user
    WHERE system_user_id NOT IN (
        SELECT MIN(system_user_id)
        FROM system_user
        GROUP BY user_identity_source_id, user_identifier, record_end_date
    );

    -- Remove any duplicate access request records
    DELETE FROM administrative_activity
    WHERE administrative_activity_id NOT IN (
        SELECT MIN(administrative_activity_id)
        FROM administrative_activity
        GROUP BY administrative_activity_type_id, reported_system_user_id
    );

    ----------------------------------------------------------------------------------------
    -- Add constraints and update views
    ----------------------------------------------------------------------------------------

    -- Add constraints and update views
    SET SEARCH_PATH='biohub,biohub_dapi_v1';

    -- Drop views
    DROP VIEW IF EXISTS biohub_dapi_v1.system_user;
    DROP VIEW IF EXISTS biohub_dapi_v1.administrative_activity;

    -- Add unique constraint to prevent duplicate users and access requests
    ALTER TABLE biohub.system_user ADD CONSTRAINT system_user_uk2 UNIQUE (LOWER(user_identifier), user_identity_source_id, record_end_date);
    ALTER TABLE biohub.administrative_activity ADD CONSTRAINT administrative_activity_uk1 UNIQUE (reported_system_user_id, administrative_activity_type_id);

    -- Recreate the view
    CREATE OR REPLACE VIEW biohub_dapi_v1.system_user AS SELECT * FROM biohub.system_user;
    CREATE OR REPLACE VIEW biohub_dapi_v1.administrative_activity AS SELECT * FROM biohub.administrative_activity;


  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
