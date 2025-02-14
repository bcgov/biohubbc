--------------------------------------------------------------------------------------------------------------

drop table new_collar cascade;
drop table new_deployment cascade;
drop table new_collar_deployment cascade;
drop table sims_deployment cascade;

--------------------------------------------------------------------------------------------------------------
-- Create new tables
--------------------------------------------------------------------------------------------------------------

CREATE TABLE if not exists sims_deployment (
    internal_sims_deployment_id    INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    sims_project_id                INTEGER,
    sims_survey_id                 INTEGER,
    sims_survey_name               varchar,
    sims_critter_id                INTEGER,
    sims_critter_uuid              UUID,
    sims_deployment_id             INTEGER,
    sims_deployment_uuid           UUID,
    sims_create_date               timestamptz(6)
);

CREATE TABLE if not exists new_collar_deployment (
    new_collar_deployment_id       INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
--
    new_deployment_id              INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    new_deployment_uuid            UUID             DEFAULT public.gen_random_uuid(),
    bctw_deployment_uuid           UUID[],
--
    new_collar_id                  INTEGER          GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    new_collar_uuid                UUID             DEFAULT public.gen_random_uuid(),
    bctw_collar_uuid               UUID[],
--
    bctw_critter_uuid              UUID[],
--
    device_id                      VARCHAR(64),
    device_make                    VARCHAR(255)[],
    device_model                   VARCHAR(255)[],
    comment                        TEXT[],
    frequency                      DECIMAL[],
    frequency_unit                 VARCHAR(50)[],
    attachment_start               TIMESTAMP,
    attachment_end                 TIMESTAMP[],
--
    c_created_at                   timestamptz(6)[],
    c_created_by                   integer[],
    c_updated_at                   timestamptz(6)[],
    c_updated_by                   integer[],
    c_valid_to                     timestamptz(6)[],
    caa_created_at                 timestamptz(6)[],
    caa_created_by                 integer[],
    caa_updated_at                 timestamptz(6)[],
    caa_updated_by                 integer[],
    caa_valid_to                   timestamptz(6)[],
--
    internal_is_valid              boolean         DEFAULT FALSE,
    constraint new_collar_deployment_pk primary key (new_collar_deployment_id)
);

CREATE TABLE if not exists new_collar (
    new_collar_id            INTEGER,
    new_collar_uuid          UUID,
    bctw_collar_uuid         UUID,
--
    device_id                VARCHAR(64)       NOT NULL,
    device_make              VARCHAR(255),
    device_model             VARCHAR(255),
    comment                  TEXT,
    frequency                DECIMAL,
    frequency_unit           VARCHAR(50),
--
    create_date              timestamptz(6),
    create_user              integer,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer,
    constraint new_collar_pk primary key (new_collar_id)
);

CREATE TABLE if not exists new_deployment (
    new_deployment_id        INTEGER,
    new_deployment_uuid      UUID,
    sims_survey_id           INTEGER,
    bctw_deployment_uuid     UUID,
--
    sims_deployment_uuid     UUID,
--
    new_collar_id            INTEGER           NOT NULL,
--
    bctw_critter_uuid        UUID              NOT NULL,
--
    attachment_start         TIMESTAMP         NOT NULL,
    attachment_end           TIMESTAMP,
    frequency                DECIMAL,
    frequency_unit           VARCHAR(50),
    create_date              timestamptz(6),
    create_user              integer,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer,
    constraint new_deployment_pk primary key (new_deployment_id)
);
ALTER TABLE new_deployment ADD CONSTRAINT new_deployment_fk1 FOREIGN KEY (new_collar_id) REFERENCES new_collar(new_collar_id);
CREATE INDEX new_deployment_idx1 ON new_deployment(new_collar_id);


--------------------------------------------------------------------------------------------------------------
-- Merge collar and collar_animal_assignment tables, and insert into new_collar_deployment table;
-- 
-- Notes
-- Join on collar_id, group by attachment_start and device_id
--
-- TODO: Check if any device ids intersect between the vendor telemetry tables. If not, then we are good. 
--       If they do, then we wil have to revise this query.
--------------------------------------------------------------------------------------------------------------


with w_data as (
    select
--
        (array_remove(array_agg(distinct caa.critter_id), null)) AS bctw_critter_uuid,
        (array_remove(array_agg(distinct caa.deployment_id), null)) AS bctw_deployment_uuid,
        (array_remove(array_agg(distinct c.collar_id), null)) AS bctw_collar_uuid,
        c.device_id,
        (array_remove(array_agg(distinct c.device_make), null)) AS device_make,
        (array_remove(ARRAY_AGG(DISTINCT c.device_model) FILTER (WHERE c.device_model IS NOT NULL AND c.device_model != ''), '')) AS device_model,
        (array_remove(ARRAY_AGG(DISTINCT c.device_comment) FILTER (WHERE c.device_comment IS NOT NULL AND c.device_comment != ''), '')) AS comment,
        (array_remove(array_agg(distinct c.frequency), null)) AS frequency,
        (array_remove(array_agg(distinct c.frequency_unit), null)) AS frequency_unit,
--
        attachment_start,
        (array_remove(array_agg(distinct caa.attachment_end), null)) AS attachment_end,
--
        (array_remove(array_agg(distinct c.created_at), null)) AS c_created_at,
        (array_remove(array_agg(distinct c.created_by_user_id), null)) AS c_created_by,
        (array_remove(array_agg(distinct c.updated_at), null)) AS c_updated_at,
        (array_remove(array_agg(distinct c.updated_by_user_id), null)) AS c_updated_by,
                     (array_agg(distinct c.valid_to)) AS c_valid_to,
--
        (array_remove(array_agg(distinct caa.created_at), null)) AS caa_created_at,
        (array_remove(array_agg(distinct caa.created_by_user_id), null)) AS caa_created_by,
        (array_remove(array_agg(distinct caa.updated_at), null)) AS caa_updated_at,
        (array_remove(array_agg(distinct caa.updated_by_user_id), null)) AS caa_updated_by,
                     (array_agg(distinct caa.valid_to)) AS caa_valid_to
    FROM
        collar_animal_assignment caa
    JOIN
        collar c ON c.collar_id = caa.collar_id
    where
      bctw.is_valid(caa.valid_to) and 
      bctw.is_valid(c.valid_to) 
    GROUP BY
        attachment_start, device_id
)
INSERT INTO new_collar_deployment (
    bctw_critter_uuid,
    bctw_deployment_uuid,
    bctw_collar_uuid,
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    attachment_start,
    attachment_end,
    c_created_at,
    c_created_by,
    c_updated_at,
    c_updated_by,
    c_valid_to,
    caa_created_at,
    caa_created_by,
    caa_updated_at,
    caa_updated_by,
    caa_valid_to
)
select
    bctw_critter_uuid,    
    bctw_deployment_uuid,
    bctw_collar_uuid,
    device_id,
    device_make,
    device_model,
    comment,
    frequency,
    frequency_unit,
    attachment_start,
    attachment_end,
    c_created_at,
    c_created_by,
    c_updated_at,
    c_updated_by,
    c_valid_to,
    caa_created_at,
    caa_created_by,
    caa_updated_at,
    caa_updated_by,
    caa_valid_to
FROM
    w_data;

--------------------------------------------------------------------------------------------------------------
-- Mark new_collar_deployment rows as valid
--------------------------------------------------------------------------------------------------------------

-- Mark all rows as valid, if they only have 1 distinct value in the important columns. This will include records that may have had multuple soft deleted rows, but because all of the key fields are unchanged, we should be able to safely merge them into 1 record.
update new_collar_deployment set internal_is_valid = true where new_collar_deployment_id in (
    select
      new_collar_deployment_id
    from
      new_collar_deployment
    WHERE (
      ARRAY_LENGTH(bctw_critter_uuid, 1) IS NULL
      OR ARRAY_LENGTH(bctw_critter_uuid, 1) <= 1
    ) AND (
      ARRAY_LENGTH(bctw_deployment_uuid, 1) IS NULL
      OR ARRAY_LENGTH(bctw_deployment_uuid, 1) <= 1
    ) AND (
      ARRAY_LENGTH(bctw_collar_uuid, 1) IS NULL
      OR ARRAY_LENGTH(bctw_collar_uuid, 1) <= 1
--    ) AND (
--      ARRAY_LENGTH(device_make, 1) IS NULL
--      OR ARRAY_LENGTH(device_make, 1) <= 1
--    ) AND (
--      ARRAY_LENGTH(device_model, 1) IS NULL
--      OR ARRAY_LENGTH(device_model, 1) <= 1
--    ) AND (
--      ARRAY_LENGTH(comment, 1) IS NULL
--      OR ARRAY_LENGTH(comment, 1) <= 1
--    ) AND (
--      ARRAY_LENGTH(frequency, 1) IS NULL
--      OR ARRAY_LENGTH(frequency, 1) <= 1
--    ) AND (
--      ARRAY_LENGTH(frequency_unit, 1) IS NULL
--      OR ARRAY_LENGTH(frequency_unit, 1) <= 1
    ) AND (
      ARRAY_LENGTH(attachment_end, 1) IS NULL
      OR ARRAY_LENGTH(attachment_end, 1) <= 1
    )
);

-- Mark rows as invalid if they have overlapping attachment dates for the same device id
update 
    new_collar_deployment 
set 
    internal_is_valid = false 
where new_collar_deployment_id in (
    WITH w_data AS (
        select
          *
        from
          new_collar_deployment
    )
    SELECT
        t1.new_collar_deployment_id
    FROM
        w_data as t1
    WHERE EXISTS (
        SELECT 
            1
        FROM
            w_data AS t2
        WHERE 
            t1.new_collar_deployment_id <> t2.new_collar_deployment_id and 
            t1.device_id = t2.device_id and 
            (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
    )
) returning new_collar_deployment_id;

--------------------------------------------------------------------------------------------------------------
-- Insert valid data into new collar and new deployment tables
-- 
-- Notes 
-- This should only include rows where there is only 1 deployment for 1 critter for 1 make for 1 model, etc. 
-- We only take the MAX for the create/update/user values, in order to squash the soft delete timestamps down.
--------------------------------------------------------------------------------------------------------------

WITH w_data_array AS (
    select
      *
    from
      new_collar_deployment
    WHERE
      internal_is_valid is true
),
w_data_row as (
    select
        new_deployment_id,
        bctw_critter_uuid[1],
        bctw_deployment_uuid[1],
        new_collar_deployment_id,
        new_collar_id,
        bctw_collar_uuid[1],
        device_id,
        device_make[1],
        device_model[1],
        comment[1],
        frequency[1],
        frequency_unit[1],
        attachment_start,
        attachment_end[1],
        max_vals.c_created_at,
        max_vals.c_created_by,
        max_vals.c_updated_at,
        max_vals.c_updated_by,
        c_valid_to,
        max_vals.caa_created_at,
        max_vals.caa_created_by,
        max_vals.caa_updated_at,
        max_vals.caa_updated_by,
        caa_valid_to
    FROM
        w_data_array
    CROSS JOIN LATERAL (
      SELECT
        MAX(c_created_at) as c_created_at,
        MAX(c_created_by) as c_created_by,
        MAX(c_updated_at) as c_updated_at,
        MAX(c_updated_by) as c_updated_by,
        MAX(caa_created_at) as caa_created_at,
        MAX(caa_created_by) as caa_created_by,
        MAX(caa_updated_at) as caa_updated_at,
        MAX(caa_updated_by) as caa_updated_by
      FROM (
        SELECT
          UNNEST(c_created_at) AS c_created_at,
          UNNEST(c_created_by) AS c_created_by,
          UNNEST(c_updated_at) AS c_updated_at,
          UNNEST(c_updated_by) AS c_updated_by,
          UNNEST(caa_created_at) as caa_created_at,
          UNNEST(caa_created_by) as caa_created_by,
          UNNEST(caa_updated_at) as caa_updated_at,
          UNNEST(caa_updated_by) as caa_updated_by
        FROM new_collar_deployment ncd_inner
        WHERE ncd_inner.new_collar_deployment_id = w_data_array.new_collar_deployment_id
      ) AS unnested
    ) AS max_vals
),
-- Insert new collar
w_insert_collar AS (
    INSERT INTO new_collar (
        new_collar_id,
        bctw_collar_uuid,
        device_id,
        device_make,
        device_model,
        comment,
        frequency,
        frequency_unit,
        create_date,
        create_user,
        update_date,
        update_user,
        revision_count
    )
    select
        new_collar_id,
        bctw_collar_uuid,
        device_id,
        device_make,
        device_model,
        comment,
        frequency,
        frequency_unit,
        c_created_at,
        c_created_by,
        c_updated_at,
        c_updated_by,
        0
    FROM
        w_data_row
    RETURNING
        new_collar_id
)
-- Insert into new_deployment
INSERT INTO new_deployment (
    new_deployment_id,
    new_collar_id,
    bctw_critter_uuid,
    bctw_deployment_uuid,
    attachment_start,
    attachment_end,
    frequency,
    frequency_unit,
    create_date,
    create_user,
    update_date,
    update_user,
    revision_count
)
select
    w_data_row.new_deployment_id,
    w_insert_collar.new_collar_id,
    w_data_row.bctw_critter_uuid,
    w_data_row.bctw_deployment_uuid,
    w_data_row.attachment_start,
    w_data_row.attachment_end,
    w_data_row.frequency,
    w_data_row.frequency_unit,
    w_data_row.caa_created_at,
    w_data_row.caa_created_by,
    w_data_row.caa_updated_at,
    w_data_row.caa_updated_by,
    0
FROM
    w_insert_collar
JOIN
    w_data_row
ON
  w_data_row.new_collar_id = w_insert_collar.new_collar_id;

--------------------------------------------------------------------------------------------------------------
-- Insert into the sims_deployment table all sims records which have no matching BCTW record
-- 
-- Notes
-- This excludes any deployments for surveys that have 'bctw' in the name. Why? These are all surveys generated
-- by the scripts to ETL bctw project data into SIMS, which have already been run.
--------------------------------------------------------------------------------------------------------------

insert into sims_deployment (
    sims_project_id,
    sims_survey_id,
    sims_survey_name,
    sims_critter_id,
    sims_critter_uuid,
    sims_deployment_id,
    sims_deployment_uuid,
    sims_create_date
)
select 
    distinct on
    (bctw_deployment_id)
    survey.project_id as sims_project_id,
    critter.survey_id as sims_survey_id,
    survey.name as sims_survey_name,
    deployment_old.critter_id as sims_critter_id,
    critter.critterbase_critter_id as sims_critter_uuid,
    deployment_old.deployment_id as sims_deployment_id,
    deployment_old.bctw_deployment_id as sims_deployment_uuid,
    deployment_old.create_date as sims_create_date
from
    biohub.deployment_old
left join biohub.critter
    on biohub.deployment_old.critter_id = biohub.critter.critter_id
left join biohub.survey
    on critter.survey_id = survey.survey_id
where
    1 = 1 and 
    survey."name" not ilike '%bctw%' and
    not exists (
        select
            1
        from
            bctw.collar_animal_assignment
        where
           bctw.collar_animal_assignment.deployment_id = bctw_deployment_id
    );

--------------------------------------------------------------------------------------------------------------
-- Update new_deployment records with matching SIMS deployment data, based on the critter matching, and the 
-- create date difference being less than 1 second apart
--------------------------------------------------------------------------------------------------------------

update new_deployment 
    set sims_deployment_uuid = sims_deployment.sims_deployment_uuid,
    sims_survey_id = sims_deployment.sims_survey_id
from sims_deployment
where 
    sims_deployment.sims_critter_uuid = new_deployment.bctw_critter_uuid
and ABS(EXTRACT(EPOCH FROM sims_deployment.sims_create_date) - EXTRACT(EPOCH FROM new_deployment.create_date)) < 1;

--------------------------------------------------------------------------------------------------------------
-- Update new_deployment records with their corresponding SIMS deployment data for all remaining records, based  
-- on the bctw_deployment_uuid, which should already match an existing SIMS deployment uuid.
--------------------------------------------------------------------------------------------------------------

update new_deployment 
    set sims_deployment_uuid = sims_tables.bctw_deployment_id,
    sims_survey_id = sims_tables.survey_id
from (
    select 
        critter.survey_id,
        critter.critter_id,
        critter.critterbase_critter_id,
        deployment_old.deployment_id,
        deployment_old.bctw_deployment_id
    from
        biohub.deployment_old
    left join biohub.critter
        on deployment_old.critter_id = critter.critter_id
) as sims_tables
where 
  sims_tables.critterbase_critter_id = new_deployment.bctw_critter_uuid and
  sims_tables.bctw_deployment_id = new_deployment.bctw_deployment_uuid and
  new_deployment.sims_survey_id is null;

--------------------------------------------------------------------------------------------------------------
-- Update new_deployment records with their corresponding SIMS deployment data for all remaining records based 
-- on the critter matching, and the create date difference being less than 1 second apart
--------------------------------------------------------------------------------------------------------------

update new_deployment 
    set sims_deployment_uuid = sims_tables.bctw_deployment_id,
    sims_survey_id = sims_tables.survey_id
from (
    select 
        critter.survey_id,
        critter.critter_id,
        critter.critterbase_critter_id,
        deployment_old.deployment_id,
        deployment_old.bctw_deployment_id,
        deployment_old.create_date
    from
        biohub.deployment_old
    left join biohub.critter
        on deployment_old.critter_id = critter.critter_id
) as sims_tables
where 
    sims_tables.critterbase_critter_id = new_deployment.bctw_critter_uuid and 
    ABS(EXTRACT(EPOCH FROM sims_tables.create_date) - EXTRACT(EPOCH FROM new_deployment.create_date)) < 1 and
    new_deployment.sims_survey_id is null;


--------------------------------------------------------------------------------------------------------------
-- Update new_deployment records with their corresponding SIMS deployment data for all remaining records, based  
-- on the bctw_critter_uuid, which should already match an existing SIMS critter uuid.
--------------------------------------------------------------------------------------------------------------

update new_deployment 
    set sims_survey_id = sims_tables.survey_id
from (
    select 
        critter.survey_id,
        critter.critter_id,
        critter.critterbase_critter_id
    from
        biohub.critter
) as sims_tables
where 
    sims_tables.critterbase_critter_id = new_deployment.bctw_critter_uuid and 
    new_deployment.sims_survey_id is null;





--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------





--------------------------------------------------------------------------------------------------------------
-- Investigate remaining invalid bctw deployment records
--------------------------------------------------------------------------------------------------------------

select * from new_collar_deployment where internal_is_valid is false;

--------------------------------------------------------------------------------------------------------------
-- Other useful sql
--------------------------------------------------------------------------------------------------------------

-- Select all records from new_collar_deployment that have at least 1 array with more than 1 value
select
  *
from 
  new_collar_deployment
where (
  ARRAY_LENGTH(bctw_collar_uuid, 1) > 1
  OR ARRAY_LENGTH(device_make, 1) > 1
  OR ARRAY_LENGTH(device_model, 1) > 1
--  OR ARRAY_LENGTH(comment, 1) > 1
  OR ARRAY_LENGTH(frequency, 1) > 1
  OR ARRAY_LENGTH(frequency_unit, 1) > 1
  OR ARRAY_LENGTH(attachment_end, 1) > 1
  OR ARRAY_LENGTH(bctw_critter_uuid, 1) > 1
  OR ARRAY_LENGTH(bctw_deployment_uuid, 1) > 1 
)
and new_collar_deployment_id not in (
  SELECT
    t1.new_collar_deployment_id 
  FROM
    new_collar_deployment as t1
  WHERE EXISTS (
      SELECT 1
      FROM
      new_collar_deployment AS t2
      WHERE t1.new_collar_deployment_id <> t2.new_collar_deployment_id
      and t1.device_id = t2.device_id
      and (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
  )
)

-- Find records that are almost Valid except for having multiple values in some less important columns and which have no overlapping dates
select
  *
from 
  new_collar_deployment
where 
internal_is_valid is false and
(
  ARRAY_LENGTH(bctw_collar_uuid, 1) = 1
  and 
  (
       ARRAY_LENGTH(device_make, 1) > 1
    OR ARRAY_LENGTH(device_model, 1) > 1
    OR ARRAY_LENGTH(comment, 1) > 1
    OR ARRAY_LENGTH(frequency, 1) > 1
    OR ARRAY_LENGTH(frequency_unit, 1) > 1  
    OR ARRAY_LENGTH(attachment_end, 1) > 1
  )
  and ARRAY_LENGTH(bctw_critter_uuid, 1) = 1
  and ARRAY_LENGTH(bctw_deployment_uuid, 1) = 1 
)
and new_collar_deployment_id not in (
  SELECT
    t1.new_collar_deployment_id 
  FROM
    new_collar_deployment as t1
  WHERE EXISTS (
      SELECT 1
      FROM
      new_collar_deployment AS t2
      WHERE t1.new_collar_deployment_id <> t2.new_collar_deployment_id
      and t1.device_id = t2.device_id
      and (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
  )
)

-- Find all invalid records whose attachment dates overlap for the same device id
SELECT
  t1.new_collar_deployment_id 
FROM
  new_collar_deployment as t1
WHERE EXISTS (
    SELECT 1
    FROM
    new_collar_deployment AS t2
    WHERE t1.new_collar_deployment_id <> t2.new_collar_deployment_id
    and t1.device_id = t2.device_id
    and (t1.attachment_start, t1.attachment_end[1]) OVERLAPS (t2.attachment_start, t2.attachment_end[1])
)


select
  *
from 
  new_collar_deployment
where 
internal_is_valid is false and
(
  ARRAY_LENGTH(bctw_collar_uuid, 1) = 1
--  OR ARRAY_LENGTH(device_make, 1) > 1
--  OR ARRAY_LENGTH(device_model, 1) > 1
--  OR ARRAY_LENGTH(comment, 1) > 1
--  OR ARRAY_LENGTH(frequency, 1) > 1
--  OR ARRAY_LENGTH(frequency_unit, 1) > 1
  and ARRAY_LENGTH(attachment_end, 1) = 1
  and ARRAY_LENGTH(bctw_critter_uuid, 1) = 1
  and ARRAY_LENGTH(bctw_deployment_uuid, 1) = 1 
);


-- Select all records from new_collar_deployment that have arrays with <= 1 value EXCEPT have more than 1 frequency_unit (change to whichever you want to investigate).
select
  *
from
  new_collar_deployment
WHERE (
  ARRAY_LENGTH(bctw_critter_uuid, 1) IS NULL
  OR ARRAY_LENGTH(bctw_critter_uuid, 1) <= 1
) AND (
  ARRAY_LENGTH(bctw_deployment_uuid, 1) IS NULL
  OR ARRAY_LENGTH(bctw_deployment_uuid, 1) <= 1
) AND (
  ARRAY_LENGTH(bctw_collar_uuid, 1) IS NULL
  OR ARRAY_LENGTH(bctw_collar_uuid, 1) <= 1
) AND (
  ARRAY_LENGTH(device_make, 1) IS NULL
  OR ARRAY_LENGTH(device_make, 1) <= 1
) AND (
  ARRAY_LENGTH(device_model, 1) IS NULL
  OR ARRAY_LENGTH(device_model, 1) <= 1
--) AND (
--  ARRAY_LENGTH(comment, 1) IS NULL
--  OR ARRAY_LENGTH(comment, 1) <= 1
) AND (
  ARRAY_LENGTH(frequency, 1) IS not NULL
  and ARRAY_LENGTH(frequency, 1) > 1
) AND (
  ARRAY_LENGTH(frequency_unit, 1) IS NULL
  OR ARRAY_LENGTH(frequency_unit, 1) <= 1
) AND (
  ARRAY_LENGTH(attachment_end, 1) IS NULL
  OR ARRAY_LENGTH(attachment_end, 1) <= 1
);

-- Select all sims records joined with the new deployment records, where the critter uuid is the same, and the create dates for both records is very close
select * 
from sims_deployment
join new_deployment 
on sims_deployment.sims_critter_uuid = new_deployment.bctw_critter_uuid 
where ABS(EXTRACT(EPOCH FROM sims_deployment.sims_create_date) - EXTRACT(EPOCH FROM new_deployment.create_date)) < 1
and new_deployment.create_user = 139;


-- Check if any attachment dates, for a given device, overlap in the new_collar and new_deployment tables
SELECT
  t1.new_deployment_id
FROM
  (new_deployment join new_collar on new_collar.new_collar_id = new_deployment.new_collar_id) as t1
WHERE EXISTS (
    SELECT 1
    FROM
      (new_deployment join new_collar on new_collar.new_collar_id = new_deployment.new_collar_id) AS t2
    WHERE t1.new_deployment_id <> t2.new_deployment_id
    and t1.device_id = t2.device_id
    and (t1.attachment_start, t1.attachment_end) OVERLAPS (t2.attachment_start, t2.attachment_end)
)

-- Find SIMS deployments that have no matching bctw deployment, and where no critter id matches
select
  *
from
  sims_deployment
where
  internal_sims_deployment_id not in (
    select
      internal_sims_deployment_id
    from
      sims_deployment,
      new_deployment
    where
      sims_deployment.sims_critter_uuid = new_deployment.bctw_critter_uuid
  );
