-- populate_template_methodology_species.sql
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Skeena' and version = '1.0'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Skeena' and version = '1.0'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Omineca' and version = '1.0'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Omineca' and version = '1.0'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Cariboo' and version = '1.0'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Cariboo' and version = '1.0'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Okanagan' and version = '1.0'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Okanagan' and version = '1.0'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Kootenay' and version = '1.0'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Kootenay' and version = '1.0'));    

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id)
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Recruitment' and version = '1.0')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose Recruitment Survey' and version = '1.0'));