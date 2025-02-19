truncate
  table biohub.deployment cascade;

truncate
  table biohub.device cascade;

-- Insert SIMS devices
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
  sims_bctw.device;

-- Insert SIMS deployments
insert
  into
    biohub.deployment (
      survey_id,
      critter_id,
      device_id,
      frequency,
      frequency_unit_id,
      attachment_start_date,
      attachment_start_time,
      attachment_end_date,
      attachment_end_time,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id
  )
    select
      sims_bctw.deployment.survey_id,
      sims_bctw.deployment.critter_id,
      biohub.device.device_id,
      frequency,
      case
        when frequency is not null then
          coalesce(
            frequency_unit,
            (
              select
                      frequency_unit_id
              from
                      frequency_unit
              where
                      name = 'mhz'
            )
          )
        else null
      end as frequency_unit,
      attachment_start_date,
      attachment_start_time,
      attachment_end_date,
      attachment_end_time,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id
from
      sims_bctw.deployment
left join biohub.device
    on
      sims_bctw.deployment.survey_id = biohub.device.survey_id
  and
       sims_bctw.deployment.serial = biohub.device.serial
returning *;