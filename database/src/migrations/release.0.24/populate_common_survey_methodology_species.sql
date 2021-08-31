-- populate_common_survey_methodology_species.sql
insert into common_survey_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM'));
insert into common_survey_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM'));
insert into common_survey_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Recruitment' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM'));    