import { Knex } from 'knex';

/**
 * Updates to environment tables:
 * - Add missing foreign key constraint for environment_qualitative_option table.
 * - Add indexes on 'name' column in environment_qualitative and environment_quantitative tables to improve search
 * performance.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    ----------------------------------------------------------------------------------------
    -- Add missing foreign key
    ----------------------------------------------------------------------------------------

    SET SEARCH_PATH=biohub, public;

    -- Add foreign key constraint
    ALTER TABLE environment_qualitative_option
      ADD CONSTRAINT environment_qualitative_option_fk1
      FOREIGN KEY (environment_qualitative_id)
      REFERENCES environment_qualitative(environment_qualitative_id);

    -- Add indexes for foreign keys
    CREATE INDEX environment_qualitative_option_idx1 ON environment_qualitative_option(environment_qualitative_id);

    ----------------------------------------------------------------------------------------
    -- Add indexes to improve search performance
    ----------------------------------------------------------------------------------------

    CREATE INDEX environment_qualitative_idx1 ON environment_qualitative(name);

    CREATE INDEX environment_quantitative_idx1 ON environment_quantitative(name);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
