import { Knex } from 'knex';

/**
 * Adds multiple new markdown_type records, then adds new markdown records using a join on markdown_type.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SEARCH_PATH=biohub, public;

    ----------------------------------------------------------------------------------------
    -- Insert into markdown_type
    ----------------------------------------------------------------------------------------
    INSERT INTO markdown_type (name, description)
    VALUES
      ('Animal Support', 'Description for Animal Support'),
      ('Type B', 'Description for Type B'),
      ('Type C', 'Description for Type C'),
      ('Type D', 'Description for Type D'),
      ('Type E', 'Description for Type E'),
      ('Type F', 'Description for Type F'),
      ('Type G', 'Description for Type G'),
      ('Type H', 'Description for Type H'),
      ('Type I', 'Description for Type I'),
      ('Type J', 'Description for Type J');

    ----------------------------------------------------------------------------------------
    -- Insert into markdown by selecting markdown_type_id based on markdown_type.name
    ----------------------------------------------------------------------------------------
    INSERT INTO markdown (markdown_type_id, data)
    SELECT
      mt.markdown_type_id,
      '## Animal data represents information about identifiable individuals within your surveying effort.\\n\\nManaging animal data through SIMS has the benefit of allowing you to establish a centralized repository of animal information for species in British Columbia. Contributing to this baseline dataset provides a powerful foundation for research, enabling a more comprehensive understanding of the history of animal handling events, animal survival, and animal health and fertility. Animal data can be managed independently in SIMS or serve as foundational data for managing other datasets. For instance, telemetry data in SIMS is attributed as an extension of an animal, seamlessly linking the two for a comprehensive understanding of individual animal movements and behaviors.'
    FROM
      markdown_type mt
    WHERE
      mt.name = 'Animal Support';
  `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }
