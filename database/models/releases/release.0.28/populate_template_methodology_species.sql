-- populate_template_methodology_species.sql
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Skeena'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Skeena'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Omineca'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Omineca'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Cariboo'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Cariboo'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Okanagan'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Okanagan'));

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Kootenay'));
insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id) 
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Composition')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose SRB or Composition Survey Kootenay'));    

insert into template_methodology_species (common_survey_methodology_id, wldtaxonomic_units_id, template_id)
  values ((select common_survey_methodology_id from common_survey_methodology where name = 'Recruitment')
  , (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')
  , (select template_id from template where name = 'Moose Recruitment Survey'));