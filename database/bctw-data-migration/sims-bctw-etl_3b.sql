--------------------------------------------------------------------------------------------------------------
-- Populate sims_matched_deployments table
--------------------------------------------------------------------------------------------------------------

-- Insert all sims deployment records that have a matching bctw deployment record
INSERT INTO bctw.sims_mismatched_deployments (
    survey_id,
    deployment_id,
    critter_id,
    critterbase_critter_id,
    bctw_deployment_id,
    create_date,
    create_user,
    update_date,
    update_user,
    revision_count,
    critterbase_start_capture_id,
    critterbase_end_capture_id,
    critterbase_end_mortality_id
) 
SELECT 
    survey.survey_id,
    deployment_old.deployment_id,
    deployment_old.critter_id,
    critter.critterbase_critter_id,
    deployment_old.bctw_deployment_id,
    deployment_old.create_date,
    deployment_old.create_user,
    deployment_old.update_date,
    deployment_old.update_user,
    deployment_old.revision_count,
    deployment_old.critterbase_start_capture_id,
    deployment_old.critterbase_end_capture_id,
    deployment_old.critterbase_end_mortality_id
from 
    biohub.deployment_old
left join 
    biohub.critter
on
    biohub.critter.critter_id = biohub.deployment_old.critter_id
left join
    biohub.survey
on 
    biohub.survey.survey_id = biohub.critter.survey_id
where
    biohub.deployment_old.bctw_deployment_id in (
        select
            deployment_id
        from
            bctw.collar_animal_assignment
    );
