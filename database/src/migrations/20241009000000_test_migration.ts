import { Knex } from 'knex';

/**
 * Bug fix:
 * Observation subcount sign id cannot be null, so this updates observation subcount records to change null values to 'direct sighting'.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ----------------------------------------------------------------------------------------
    -- Create new tables
    ----------------------------------------------------------------------------------------
    SET SEARCH_PATH=biohub;

    CREATE TABLE parent (
      parent_id                   integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      vendor_device_id            varchar(255)       NOT NULL,
      device_make                 varchar(255)       NOT NULL,
      device_id                   varchar(255)       GENERATED ALWAYS AS (lower(device_make) || ':' || lower(vendor_device_id)) STORED,
      CONSTRAINT parent_pk PRIMARY KEY (parent_id)
    );

    CREATE INDEX parent_device_id_idx ON parent (device_id);

    CREATE TABLE child (
      child_id                    integer            GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
      vendor_device_id            varchar(255)       NOT NULL,
      device_make                 varchar(255)       NOT NULL,
      device_id                   varchar(255)       GENERATED ALWAYS AS (lower(device_make) || ':' || lower(vendor_device_id)) STORED,
      CONSTRAINT child_pk PRIMARY KEY (child_id)
    );

    CREATE INDEX child_device_id_idx ON child (device_id);


    INSERT INTO parent (vendor_device_id, device_make) VALUES ('1234', 'Lotek');
    INSERT INTO parent (vendor_device_id, device_make) VALUES ('1234', 'Vectronic');
    INSERT INTO parent (vendor_device_id, device_make) VALUES ('1234', 'ATS');

    INSERT INTO child (vendor_device_id, device_make) VALUES ('1234', 'Lotek');
    INSERT INTO child (vendor_device_id, device_make) VALUES ('1234', 'Vectronic');
    INSERT INTO child (vendor_device_id, device_make) VALUES ('1234', 'ATS');
    INSERT INTO child (vendor_device_id, device_make) VALUES ('1234', 'Other');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
