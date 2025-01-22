import { Knex } from 'knex';

/**
 * Add tables to store versioned text displayed in help dialogs. Versions can be up-scored or down-scored by users.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    SET SEARCH_PATH=biohub;
    
    --------------------------------------------------------
    -- Insert markdown help text for sampling periods
    --------------------------------------------------------

    INSERT INTO
        markdown_type (name, description)
    VALUES
        ('Sampling Periods', 'Help text about sampling periods.');

    INSERT INTO
        markdown (markdown_type_id, data)
    VALUES
        ((SELECT markdown_type_id FROM markdown_type WHERE name = 'Sampling Periods'), '## Sampling Periods\n\nSampling periods represent a time frame when you conducted a technique at a sampling site.\n\n- Entering precise start and end times for periods helps you measure sampling effort.\n- Species observations can be linked to a sampling site and technique through a sampling period.\n- If a site does not have any periods, it is implied that the site was not sampled.');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
