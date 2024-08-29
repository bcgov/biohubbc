import { Knex } from 'knex';

/**
 * Inserted new method_lookup values 
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  ----------------------------------------------------------------------------------------
  ----- inserting method lookup names into method_lookup table ---- 
    INSERT INTO biohub.method_lookup (create_date, name, description)
    values (now(), 'Visual Encounter', 'This recording was made through direct visual observation'),
    (now(), 'Angling','This recording was made through the use of Angling'),
    (now(), 'Audio Encounter','This recording or observation was made through hearing'),
    (now(), 'Drone', 'This recording was made through the use of a Drone or UAV'),
    (now(), 'Gun Net', 'This recording method relied on the use of a Net Gun'), 
    (now(), 'Hair Snag', 'This recording was facilitated by the implementation of a Hair Snag'), 
    (now(), 'Radar', 'This recording was made using Radar technology'),
    (now(), 'Radio', 'This recording was facilitated using Radio technology'), 
    (now(), 'Trap Net','This recording method relied on the use of a Trap Net'),
    (now(), 'Undetermined', 'The method used to make this recording has not been determined');
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
