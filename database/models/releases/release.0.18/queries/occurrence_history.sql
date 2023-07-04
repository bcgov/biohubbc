select a.id, b.name from biohub.submission_status a, biohub.submission_status_type b
where a.sst_id = b.id;

with last_status as (select os_id, max(event_timestamp) from biohub.submission_status
  group by os_id)
select * from last_status;
