import { Knex } from 'knex';

/**
 * Makes the Project Coordinator properties on a project nullable, since the app no longer supports
 * entering or editing project coorindators.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    ALTER TABLE project
    ALTER COLUMN coordinator_first_name       DROP NOT NULL,
    ALTER COLUMN coordinator_last_name        DROP NOT NULL,
    ALTER COLUMN coordinator_email_address    DROP NOT NULL,
    ALTER COLUMN coordinator_agency_name      DROP NOT NULL,
    ALTER COLUMN coordinator_public           DROP NOT NULL;

    COMMENT ON COLUMN project.coordinator_first_name IS '(Deprecated) The first name of the person directly responsible for the project.';
    COMMENT ON COLUMN project.coordinator_last_name IS '(Deprecated) The last name of the person directly responsible for the project.';
    COMMENT ON COLUMN project.coordinator_email_address IS '(Deprecated) The coordinators email address.';
    COMMENT ON COLUMN project.coordinator_agency_name IS '(Deprecated) Name of agency the project coordinator works for.';
    COMMENT ON COLUMN project.coordinator_public IS '(Deprecated) A flag that determines whether personal coordinator details are public. A value of "Y" provides that personal details are public.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
