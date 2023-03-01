do $$
	declare
		_template_id integer := 1;
		_template_name varchar := 'Template Name';
		_template_version varchar := '2.0';
		_tempalte_description varchar := '';
		_field_method_name varchar := 'Stratified Random Block';
		_field_method_id integer := 0;

		_taxonomy_id integer := 1;
		_validation_schema varchar := $v_s${}$v_s$;
		_transformation_schema varchar := $t_s${}$t_s$;
begin
	insert into
	  biohub.template (name, version, record_effective_date, description)
	values
	  (_template_name, _template_version, now(), _tempalte_description)
	 returning template_id into _template_id;

	select field_method_id into _field_method_id from field_method  where name = _field_method_name and record_end_date is null;

	INSERT INTO
		biohub.template_methodology_species (field_method_id, wldtaxonomic_units_id, template_id, validation, transform)
	VALUES
    (
      _field_method_id,
      _taxonomy_id,
      _template_id,
      _validation_schema::json,
      _transformation_schema::json
    );

	RAISE NOTICE 'All done!';
end $$