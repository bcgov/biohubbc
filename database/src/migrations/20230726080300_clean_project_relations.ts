import { Knex } from 'knex';

/**
 * Remove caveats and climate relations
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -------------------------------------------------------------------------
    -- Remove old views
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;
    DROP VIEW project;
    DROP VIEW survey;
    DROP VIEW climate_change_initiative;
    DROP VIEW project_climate_initiative;

    -------------------------------------------------------------------------
    -- Remove Climate initiative tables
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;
    DROP TABLE project_climate_initiative;
    DROP TABLE climate_change_initiative;
    

    -------------------------------------------------------------------------
    -- Add comments column to survey
    -------------------------------------------------------------------------
    ALTER TABLE survey ADD COLUMN comments varchar(3000);
    COMMENT ON COLUMN survey.comments IS 'Comments about the Survey.';


    -------------------------------------------------------------------------
    -- Move caveats to survey comments
    -------------------------------------------------------------------------
    -- only 1 project currently in production has a caveat and it only has 1 survey so this is safe move like this
    UPDATE survey s 
    SET comments = concat(s.comments,' ', (
      SELECT caveats  
      FROM project p
      WHERE s.project_id = p.project_id 
    ));

    -------------------------------------------------------------------------
    -- Remove caveats table
    -------------------------------------------------------------------------
    ALTER TABLE project DROP COLUMN caveats;

    SET SEARCH_PATH=biohub_dapi_v1;
    CREATE OR REPLACE VIEW project as select * from biohub.project;
    CREATE OR REPLACE VIEW survey as select * from biohub.survey;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
