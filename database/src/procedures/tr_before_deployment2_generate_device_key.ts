import { Knex } from 'knex';

/**
 * Function Name: generate_device_key_for_deployment2_table
 *
 * Trigger Name: tr_before_deployment2_generate_device_key
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
    CREATE OR REPLACE FUNCTION biohub.generate_device_key_for_deployment2_table()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY invoker
    AS $function$
      DECLARE
        _device device%rowtype;
      BEGIN
        -- Get the device record for the incoming device_id
        SELECT * FROM device where device_id = new.device_id INTO _device;

        -- If no matching device record was found, raise an exception
        IF NOT found THEN
          RAISE EXCEPTION 'Failed to generate deployment2.device_key. The device_id (%) does not exist in the device table.', new.device_id;
        END IF;

        -- Assign the device.device_key to the deployment2.device_key
        new.device_key := _device.device_key;

        -- Return the new deployment2 record with the device_key value
        RETURN new;
      END;
    $function$;

    -- Drop the existing trigger, if one exists, and create a new one
    DROP TRIGGER IF EXISTS tr_before_deployment2_generate_device_key ON biohub.deployment2;
    CREATE TRIGGER tr_before_deployment2_generate_device_key BEFORE INSERT OR UPDATE ON biohub.deployment2 FOR EACH ROW EXECUTE PROCEDURE generate_device_key_for_deployment2_table();
  `);
}
