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
      ('Animal Support', 'Description for Type A'),
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
        md.data
    FROM
        (VALUES
            ('Type A', '## Type A Content\\n\\nThis is some markdown content for Type A.'),
            ('Type B', '## Type B Content\\n\\nThis is some markdown content for Type B.'),
            ('Type C', '## Type C Content\\n\\nThis is some markdown content for Type C.'),
            ('Type D', '## Type D Content\\n\\nThis is some markdown content for Type D.'),
            ('Type E', '## Type E Content\\n\\nThis is some markdown content for Type E.'),
            ('Type F', '## Type F Content\\n\\nThis is some markdown content for Type F.'),
            ('Type G', '## Type G Content\\n\\nThis is some markdown content for Type G.'),
            ('Type H', '## Type H Content\\n\\nThis is some markdown content for Type H.'),
            ('Type I', '## Type I Content\\n\\nThis is some markdown content for Type I.'),
            ('Type J', '## Type J Content\\n\\nThis is some markdown content for Type J.')
        ) AS md(name, data)
    JOIN
        markdown_type mt ON mt.name = md.name;
  `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(``);
  }
  