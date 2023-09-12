import { Knex } from 'knex';

/**
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`--sql
  SET search_path=biohub;

  -- Populate new identity source
  INSERT INTO user_identity_source (name, description, notes, record_effective_date) VALUES ('SYSTEM', 'SYSTEM user source system.', 'A system user.', now());

  -- Populate new SIM service account user
  insert into system_user (user_identity_source_id, user_identifier, user_guid, display_name, email, record_effective_date, create_date, create_user)
  values ((select user_identity_source_id from user_identity_source where name = 'SYSTEM' and record_end_date is null), 'service-account-SIMS-SVC-4464', 'SIMS-SVC-4464', 'service-account-SIMS-SVC-4464', 'sims@email.com', now(), now(), 1);

`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
