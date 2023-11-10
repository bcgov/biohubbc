import { Knex } from 'knex';

/**
 * Adds comments to survey.ecological_season_id and ecological_season table to indicate deprecation
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    COMMENT ON COLUMN survey.ecological_season_id IS '(Deprecated) System generated surrogate primary key identifier.';

    COMMENT ON TABLE ecological_season IS '(Deprecated) Broad classification for the ecological season of a survey.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
