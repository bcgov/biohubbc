import { Knex } from 'knex';

/**
 * Function Name: generate_device_key_for_device_table
 *
 * Trigger Name: tr_before_device_generate_device_key
 *
 * Affected Tables: Device
 *
 * Purpose: Generates the 'device_key' column value for a new/updated device record.
 *
 * Note: The 'device_key' column is a concatenation of the 'name' column value from the 'device_make' code table and the
 * 'serial' column value from the 'device' table.
 *
 * @example
 * device_make_id = 'vendor:123456'
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`--sql
    SET search_path = 'biohub';

    -- Function to generate the device_key value for a new/updated device record
    CREATE OR REPLACE FUNCTION biohub.generate_device_key_for_device_table()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY invoker
    AS $function$
      DECLARE
        _device_make device_make%rowtype;
      BEGIN
        -- Get the device_make record for the incoming device_make_id
        SELECT * FROM device_make where device_make_id = new.device_make_id INTO _device_make;

        -- If no matching device_make record was found, raise an exception
        IF NOT found THEN
          RAISE EXCEPTION 'Failed to generate device.device_key. The device_make_id (%) does not exist in the device_make table.', new.device_make_id;
        END IF;

        -- Generate the device_key value and assign it to the device.device_key
        new.device_key := (_device_make.name || ':' || new.serial);

        -- Return the new device record with the device_key value
        RETURN new;
      END;
    $function$;

    -- Drop the existing trigger, if one exists, and create a new one
    DROP TRIGGER IF EXISTS tr_before_device_generate_device_key ON biohub.device;
    CREATE TRIGGER tr_before_device_generate_device_key BEFORE INSERT OR UPDATE ON biohub.device FOR EACH ROW EXECUTE PROCEDURE generate_device_key_for_device_table();
  `);
}
