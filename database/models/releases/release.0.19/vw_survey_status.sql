-- vw_survey_status.sql

create or replace view survey_status as 
with not_published as (select os.s_id, max(ss.id) as ss_id from occurrence_submission os, submission_status ss 
	where not exists (select 1 from submission_status ss2, submission_status_type sst, occurrence_submission os2
		where os2.s_id = os2.s_id
		and ss2.os_id = os2.id
		and sst.id = ss2.sst_id
		and sst.name = api_get_character_system_constant('SURVEY_STATE_PUBLISHED')
    and sst.record_end_date is null)
		group by os.s_id),
	published as (select os.s_id, max(ss.id) as ss_id from occurrence_submission os, submission_status ss, submission_status_type sst
		where ss.sst_id = sst.id 
		and sst.name = api_get_character_system_constant('SURVEY_STATE_PUBLISHED')
    and sst.record_end_date is null
		group by os.s_id)
select s.p_id project_id, np.s_id survey_id, sst.name survey_status from not_published np, submission_status ss3, submission_status_type sst, survey s
	where ss3.id = np.ss_id
	and sst.id = ss3.sst_id
	and s.id = np.s_id
union 
select s.p_id project_id, p.s_id survey_id, sst.name survey_status from published p, submission_status ss3, submission_status_type sst, survey s
	where ss3.id = p.ss_id
	and sst.id = ss3.sst_id
	and s.id = p.s_id
;