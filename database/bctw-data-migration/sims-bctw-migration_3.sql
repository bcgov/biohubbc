-- TODO: Insert data into SIMS from sims_bctw.
-- Insert SIMS devices
with 
w_insert_devices as (
  insert
    into
      biohub.device (
        survey_id,
        serial,
        model,
        device_make_id,
        comment
      )
      select
        survey_id,
        serial,
        model,
        device_make_id,
        comment
      from
        sims_bctw.device
  returning *
),
w_insert_deployments as (
  insert
    into
      biohub.deployment (
        survey_id,
        critter_id,
        -- TODO: get device_id fk from result of previous device insert
        (
          select
            w_insert_devices.device_id
          from
            w_insert_devices
          where
            w_insert_devices.survey_id = sims_bctw.deployment.survey_id
            and w_insert_devices.serial = sims_bctw.device_id
        ) as device_id,
        (
          -- Generate device_key
          select
            (
              (
                -- Get device make name
                select
                  biohub.device_make.name
                from
                  biohub.device_make
                where
                  biohub.device_make.device_make_id = w_insert_devices.device_make_id
              ) || ':' || w_insert_devices.serial
            ),
          from
            w_insert_devices
          where
            w_insert_devices.survey_id = sims_bctw.deployment.survey_id
            and w_insert_devices.serial = sims_bctw.device_id
        ) as device_id,
        frequency,
        frequency_unit,
        attachment_start_date,
        attachment_start_time,
        attachment_end_date,
        attachment_end_time,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      )
      select
        survey_id,
        critter_id,
        device_id,
        device_key,
        frequency,
        frequency_unit,
        attachment_start_date,
        attachment_start_time,
        attachment_end_date,
        attachment_end_time,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      from
        sims_bctw.deployment
)