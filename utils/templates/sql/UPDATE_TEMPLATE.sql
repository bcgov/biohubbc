set search_path = biohub;
set schema 'biohub';

do $$
	declare
		_template_name varchar := '';
		_template_version varchar := '';
		_taxonomy_ids integer[] := array[1, 2]; -- wild taxonomic IDs from elastic search
		
		_validation_schema varchar := $v_s${}$v_s$;
		_transformation_schema varchar := $t_s${}$t_s$;
begin
	update template_methodology_species set validation = _validation_schema::json, "transform" = _transformation_schema::json
	where template_methodology_species_id in (
	select tms.template_methodology_species_id 
	from template_methodology_species tms, "template" t 
	where tms.template_id = t.template_id 
	and t.name = _template_name 
	and t.version = _template_version
	and wldtaxonomic_units_id = ANY(_taxonomy_ids::integer[]));
end $$