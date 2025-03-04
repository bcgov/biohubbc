import { Knex } from 'knex';

/**
 * Update tables:
 *
 * device
 * - Add unique constraint on (survey_id, device_key), as required by deployment foreign key constraint.
 *
 * deployment
 * - Add foreign key constraint, with update on cascade, on device(survey_id, device_key).
 * - Add matching index.
 *
 * This prevents the following scenario: a `device.serial` column is updated, the `device.device_key` is auto
 * re-generated, but now the `deployment.device_key` for that `device` is out of sync.
 *
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET SEARCH_PATH=biohub;

    ----------------------------------------------------------------------------------------
    -- device
    ----------------------------------------------------------------------------------------

    -- Add unique constraint
    ALTER TABLE device ADD CONSTRAINT device_uk2 UNIQUE (survey_id, device_key);

    ----------------------------------------------------------------------------------------
    -- deployment
    ----------------------------------------------------------------------------------------

    -- Add foreign key constraint on deployment.device_key, which should automatically update when device.device_key is
    -- updated. This is to ensure that deployment.device_key stays in sync with its related device.device_key.
    ALTER TABLE deployment
      ADD CONSTRAINT deployment_fk6
      FOREIGN KEY (survey_id, device_key)
      REFERENCES device(survey_id, device_key) ON UPDATE CASCADE;

    -- Add index for foreign key
    CREATE INDEX deployment_idx6 ON device(survey_id, device_key);

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
