-- vw_survey_status.sql

create or replace view survey_status as 
with not_published as (select os.survey_id, max(ss.submission_status_id) as submission_status_id from occurrence_submission os, submission_status ss 
	where not exists (select 1 from submission_status ss2, submission_status_type sst, occurrence_submission os2
		where os2.survey_id = os2.survey_id
		and ss2.occurrence_submission_id = os2.occurrence_submission_id
		and sst.submission_status_type_id = ss2.submission_status_type_id
		and sst.name = api_get_character_system_constant('SURVEY_STATE_PUBLISHED')
    and sst.record_end_date is null)
		group by os.survey_id),
	published as (select os.survey_id, max(ss.submission_status_id) as submission_status_id from occurrence_submission os, submission_status ss, submission_status_type sst
		where ss.submission_status_type_id = sst.submission_status_type_id
		and sst.name = api_get_character_system_constant('SURVEY_STATE_PUBLISHED')
    and sst.record_end_date is null
		group by os.survey_id)
select s.project_id project_id, np.survey_id survey_id, sst.name survey_status, ss3.event_timestamp status_event_timestamp from not_published np, submission_status ss3, submission_status_type sst, survey s
	where ss3.submission_status_id = np.submission_status_id
	and sst.submission_status_type_id = ss3.submission_status_type_id
	and s.survey_id = np.survey_id
union 
select s.project_id project_id, p.survey_id survey_id, sst.name survey_status, ss3.event_timestamp status_event_timestamp from published p, submission_status ss3, submission_status_type sst, survey s
	where ss3.submission_status_id = p.submission_status_id
	and sst.submission_status_type_id = ss3.submission_status_type_id
	and s.survey_id = p.survey_id
;