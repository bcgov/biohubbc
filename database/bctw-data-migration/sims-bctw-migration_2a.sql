-- Select all records from biohub.deployment_old that are from the 'bctw' surveys and have a matching deployment uuid in bctw
select
    *
from
    biohub.deployment_old
left join biohub.critter
    on biohub.deployment_old.critter_id = biohub.critter.critter_id
left join biohub.survey
    on critter.survey_id = survey.survey_id
where
    1 = 1 and
    survey."name" ilike '%bctw%' and
    biohub.deployment_old.bctw_deployment_id in (select deployment_id from bctw.collar_animal_assignment);
