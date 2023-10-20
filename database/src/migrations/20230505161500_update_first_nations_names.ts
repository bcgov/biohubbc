import { Knex } from 'knex';

/**
 * Update first nations band names that contain `?` (question marks) as the original populate script didn't escape them,
 * and Knex inserted them with `$N` placeholder values. (Knex uses `?` placeholders for binding values. See
 * https://knexjs.org/guide/raw.html#raw-parameter-binding).
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=biohub;

    update first_nations SET name = 'St. Mary''s Indian Band (\\?Aq''am)' where name = 'St. Mary''s Indian Band ($3Aq''am)';
    update first_nations SET name = 'Columbia Lake Indian Band (\\?Akisq''nuk First Nation)' where name = 'Columbia Lake Indian Band ($4Akisq''nuk First Nation)';
    update first_nations SET name = 'Lower Kootenay Indian Band (Yaqan nu\\?kiy)' where name = 'Lower Kootenay Indian Band (Yaqan nu$5kiy)';
    update first_nations SET name = 'Alexandria Indian Band (\\?Esdilagh First Nation)' where name = 'Alexandria Indian Band ($6Esdilagh First Nation)';
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
