-- populate_common_survey_methodology_species_template.sql
insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Skeena' and version = '1.0')
);
insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Skeena' and version = '1.0')
);

insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Omineca' and version = '1.0')
);
insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Omineca' and version = '1.0')
);

insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Cariboo' and version = '1.0')
);
insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Cariboo' and version = '1.0')
);

insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Okanagan' and version = '1.0')
);
insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Okanagan' and version = '1.0')
);

insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Stratified Random Block' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Kootenay' and version = '1.0')
);
insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose SRB or Composition Survey Kootenay' and version = '1.0')
);

insert into common_survey_methodology_species_template (common_survey_methodology_species_id, template_id) values (
  (select common_survey_methodology_species_id from common_survey_methodology_species 
    where common_survey_methodology_id = (select common_survey_methodology_id from common_survey_methodology where name = 'Composition' and version = '1.0')
    and wldtaxonomic_units_id = (select wldtaxonomic_units_id from wldtaxonomic_units where code = 'M-ALAM')    
  ),
  (select template_id from template where name = 'Moose Recruitment Survey' and version = '1.0')
);