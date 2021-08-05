-- api_get_eml_data_package.sql

drop function if exists api_get_eml_data_package;

create or replace function api_get_eml_data_package(p_data_package_id data_package.data_package_id%type, p_supplied_title varchar) returns xml
language plpgsql
security definer
stable
as 
$$
-- *******************************************************************
-- Procedure: api_get_eml_data_package
-- Purpose: returns eml xml of a data package. 
--
-- MODIFICATION HISTORY
-- Person           Date        Comments
-- ---------------- ----------- --------------------------------------
-- charlie.garrettjones@quartech.com
--                  2021-07-29  initial release
-- *******************************************************************
declare
  _BIOHUB_EML_VERSION constant varchar := '1.0';
  _eml_xml_text varchar;
    
  _BIOHUB_PROVIDER_URL constant system_metadata_constant.character_value%type := api_xml_string_replace(api_get_character_system_metadata_constant('BIOHUB_PROVIDER_URL'));
  _SECURITY_PROVIDER_URL constant system_metadata_constant.character_value%type := api_xml_string_replace(api_get_character_system_metadata_constant('SECURITY_PROVIDER_URL'));
  _ORGANIZATION_NAME_FULL constant system_metadata_constant.character_value%type := api_xml_string_replace(api_get_character_system_metadata_constant('ORGANIZATION_NAME_FULL'));
  _ORGANIZATION_URL constant system_metadata_constant.character_value%type := api_xml_string_replace(api_get_character_system_metadata_constant('ORGANIZATION_URL'));
  _INTELLECTUAL_RIGHTS constant system_metadata_constant.character_value%type := api_xml_string_replace(api_get_character_system_metadata_constant('INTELLECTUAL_RIGHTS'));
  _TAXONOMIC_PROVIDER_URL constant system_metadata_constant.character_value%type := api_xml_string_replace(api_get_character_system_metadata_constant('TAXONOMIC_PROVIDER_URL'));

  _r_data_package data_package%rowtype;
  _r_occurrence_submission occurrence_submission%rowtype;
  _r_survey survey%rowtype;  
  _r_project project%rowtype;

  _exists boolean := false;
  _record record;
  _record2 record;
  _string varchar;
begin
  select * into strict _r_data_package from data_package 
    where data_package_id = p_data_package_id;

  select a.* into strict _r_occurrence_submission from occurrence_submission a, occurrence_submission_data_package b, data_package c
    where c.data_package_id = _r_data_package.data_package_id
    and b.data_package_id = c.data_package_id
    and a.occurrence_submission_id = b.occurrence_submission_id;
  

  _eml_xml_text := format('<?xml version="1.0" encoding="UTF-8"?><eml:eml packageId="urn:uuid:%1$s" system="%2$s"
	  xmlns:eml="https://eml.ecoinformatics.org/eml-2.2.0"
	  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	  xmlns:stmml="http://www.xml-cml.org/schema/stmml-1.1"
	  xsi:schemaLocation="https://eml.ecoinformatics.org/eml-2.2.0 xsd/eml.xsd">
  	<access authSystem="%3$s" order="allowFirst"> 
		  <allow>
			  <principal>public</principal>
			  <permission>read</permission>
		  </allow>
    </access>
    <dataset id="%1$s" system="%2$s"> 
		  <title>%4$s</title>
		  <creator> 
			  <organizationName>%5$s</organizationName>
		  </creator>
		  <metadataProvider>
			  <organizationName>%5$s</organizationName>
			  <onlineUrl>%6$s</onlineUrl>
		  </metadataProvider>'
    , _r_data_package.uuid
    , _BIOHUB_PROVIDER_URL
    , _SECURITY_PROVIDER_URL
    , api_xml_string_replace(p_supplied_title)
    , _ORGANIZATION_NAME_FULL
    , _ORGANIZATION_URL
    );

  _eml_xml_text := _eml_xml_text||format('<pubDate>%1$s</pubDate>'
    , (select to_char(ss.event_timestamp, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE')) from submission_status ss, submission_status_type sst
	     where ss.submission_status_id = (select max(submission_status_id) from submission_status ss2
	      where ss2.occurrence_submission_id = _r_occurrence_submission.occurrence_submission_id)
	    and ss.submission_status_type_id = sst.submission_status_type_id 
	    and sst.name = api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED')
      and sst.record_end_date is null));
  
  _eml_xml_text := _eml_xml_text||format('<language>english</language>
		<intellectualRights>
			<para>%1$s</para>
		</intellectualRights>'
    , _INTELLECTUAL_RIGHTS);

  -- TODO: handle arbitrary sets of occurrence records
  if _r_occurrence_submission.survey_id is not null then
    -- occurrence submission is associated with survey
    select * into strict _r_survey from survey where survey_id = _r_occurrence_submission.survey_id;
    select * into strict _r_project from project where project_id = _r_survey.project_id;

    _eml_xml_text := _eml_xml_text||'<contact>';
    if _r_project.coordinator_public then
      _eml_xml_text := _eml_xml_text||format('
        <individualName>
			  	<givenName>%1$s</givenName>
			  	<surName>%2$s</surName>
			  </individualName>
			  <organizationName>%3$s</organizationName>
			  <electronicMailAddress>%4$s</electronicMailAddress>'
        , api_xml_string_replace(_r_project.coordinator_first_name)
        , api_xml_string_replace(_r_project.coordinator_last_name)
        , api_xml_string_replace(_r_project.coordinator_agency_name)
        , api_xml_string_replace(_r_project.coordinator_email_address));
    else
      _eml_xml_text := _eml_xml_text||format('
        <organizationName>%1$s</organizationName>
			  <onlineUrl>%2$s</onlineUrl>'
        , _ORGANIZATION_NAME_FULL
        , _ORGANIZATION_URL);
    end if;
    _eml_xml_text := _eml_xml_text||'</contact>';

    _eml_xml_text := _eml_xml_text||format('
      <project id="%1$s" system="%2$s">
	    		<title>%3$s</title>
	    		<personnel>'
      , _r_survey.UUID
      , _BIOHUB_PROVIDER_URL
      , api_xml_string_replace(_r_survey.name));

    if _r_project.coordinator_public then
      _eml_xml_text := _eml_xml_text||format('
        <individualName>
	      	<givenName>%1$s</givenName>
	      	<surName>%2$s</surName>
	      </individualName>
	      <organizationName>%3$s</organizationName>
	      <role>pointOfContact</role>'
        , api_xml_string_replace(_r_survey.lead_first_name)
        , api_xml_string_replace(_r_survey.lead_last_name)
        , api_xml_string_replace(_r_project.coordinator_agency_name));
    else
      _eml_xml_text := _eml_xml_text||format('
        <organizationName>%1$s</organizationName>
	  		<onlineUrl>%2$s</onlineUrl>
        <role>custodianSteward</role>'
        , _ORGANIZATION_NAME_FULL
        , _ORGANIZATION_URL);
      end if;
    _eml_xml_text := _eml_xml_text||'</personnel>';

    _eml_xml_text := _eml_xml_text||format('
      	<abstract>
	  			<section>
	  				<title>Objectives</title>
	  				<para>%1$s</para>
	  			</section>
	  		</abstract>'
        , api_xml_string_replace(_r_survey.objectives));

    select true into _exists from project_funding_source
      where exists (select project_funding_source_id from survey_funding_source where survey_id = _r_survey.survey_id);

    if _exists then
      _eml_xml_text := _eml_xml_text||'
        <funding>
				  <section>
					  <title>Funding Source</title>';

      for _record in (select a.*, b.name investment_action_category_name, c.name funding_source_name from project_funding_source a, investment_action_category b, funding_source c
        where project_funding_source_id in (select project_funding_source_id from survey_funding_source where survey_id = _r_survey.survey_id)
        and b.investment_action_category_id = a.investment_action_category_id 
        and c.funding_source_id = b.funding_source_id) loop

        _eml_xml_text := _eml_xml_text||format('
            <para>%1$s</para>
					  <section>
						  <title>Investment Action Category</title>
						  <para>%2$s</para>
              <section>
							  <title>Funding Source Project ID</title>
							  <para>%3$s</para>
						  </section>
						  <section>
						  	<title>Funding Amount</title>
						  	<para>%4$s</para>
						  </section>
						  <section>
						  	<title>Funding Start Date</title>
						  	<para>%5$s</para>
						  </section>
						  <section>
						  	<title>Funding Start Date</title>
						  	<para>%6$s</para>
						  </section>
            </section>'
            , api_xml_string_replace(_record.funding_source_name)
            , api_xml_string_replace(_record.investment_action_category_name)
            , _record.project_funding_source_id
            , _record.funding_amount
            , to_char(_record.funding_start_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE'))
            , to_char(_record.funding_end_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE')));
      end loop;

      _eml_xml_text := _eml_xml_text||'
          </section>
        </funding>';
    end if;
    _exists := false;

    -- TODO: this only provides us with the bounding box of the first polygon
    with envelope as (select ST_Envelope(geography::geometry) geom from survey s where survey_id = _r_survey.survey_id)
      select st_xmax(geom), st_ymax(geom), st_xmin(geom), st_ymin(geom) into _record from envelope;

    _eml_xml_text := _eml_xml_text||format('
      <studyAreaDescription>				
		  <coverage>
			  <geographicCoverage>
            <geographicDescription>%1$s</geographicDescription>
				    <boundingCoordinates>
				    	<westBoundingCoordinate>%2$s</westBoundingCoordinate>
				    	<eastBoundingCoordinate>%3$s</eastBoundingCoordinate>
				    	<northBoundingCoordinate>%4$s</northBoundingCoordinate>
				    	<southBoundingCoordinate>%5$s</southBoundingCoordinate>					  	
				    </boundingCoordinates>'
, case when _r_survey.location_description is not null then api_xml_string_replace(_r_survey.location_name||' - '||_r_survey.location_description)
    else api_xml_string_replace(_r_survey.location_name) end
--    , api_xml_string_replace(_r_survey.location_name||' - '||_r_survey.location_description)
    , _record.st_xmin
    , _record.st_xmax
    , _record.st_ymax
    , _record.st_ymin);

    for _record in (with polygons as (select (st_dumppoints(g.geom)).* from (select geography::geometry as geom from survey where survey_id = 1) as g)
      select distinct(path[1]) polygon from polygons) loop
      _eml_xml_text := _eml_xml_text||'
        <datasetGPolygon>
  				<datasetGPolygonOuterGRing>';

      for _record2 in (with polygons as (select (st_dumppoints(g.geom)).* from (select geography::geometry as geom from survey where survey_id = 1) as g)
        , points as (select geom from polygons where path[1] = _record.polygon)
        select st_x(geom) x, st_y(geom) y from points) loop
          _eml_xml_text := _eml_xml_text||format('
  					<gRingPoint>
  						<gRingLatitude>%1$s</gRingLatitude>
  						<gRingLongitude>%2$s</gRingLongitude>
  					</gRingPoint>'
            , _record2.y
            , _record2.x);
      end loop;

      _eml_xml_text := _eml_xml_text||' 
  				</datasetGPolygonOuterGRing>
  			</datasetGPolygon>';
    end loop;        
    _eml_xml_text := _eml_xml_text||'</geographicCoverage>';

    _eml_xml_text := _eml_xml_text||format('
  		<temporalCoverage>
			  <rangeOfDates>
			  	<beginDate>
			  		<calendarDate>%1$s</calendarDate>
			  	</beginDate>
			  	<endDate>
			  		<calendarDate>%2$s</calendarDate>
			  	</endDate>
			  </rangeOfDates>
			</temporalCoverage>'
      , to_char(_r_survey.start_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE'))
      , to_char(_r_survey.end_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE')));

    _eml_xml_text := _eml_xml_text||'
  		<taxonomicCoverage>
        <taxonomicClassification>';
    
    for _record in (select a.* from wldtaxonomic_units a, study_species b
      where a.wldtaxonomic_units_id = b.wldtaxonomic_units_id
      and b.survey_id = _r_survey.survey_id 
			and b.is_focal) loop
      _eml_xml_text := _eml_xml_text||format('
				<taxonRankName>%1$s</taxonRankName>
				<taxonRankValue>%2$s</taxonRankValue>
				<commonName>%3$s</commonName>
				<taxonId provider="%4$s">%5$s</taxonId>'
        , api_xml_string_replace(_record.tty_name)
        , api_xml_string_replace(_record.unit_name1||' '||_record.unit_name2)
        , api_xml_string_replace(_record.english_name)
        , _TAXONOMIC_PROVIDER_URL
        , api_xml_string_replace(_record.code));
    end loop;
    for _record in (select a.* from wldtaxonomic_units a, study_species b
      where a.wldtaxonomic_units_id = b.wldtaxonomic_units_id
      and b.survey_id = _r_survey.survey_id 
			and not b.is_focal) loop
      _eml_xml_text := _eml_xml_text||format('
        <taxonomicClassification>
				  <taxonRankName>%1$s</taxonRankName>
				  <taxonRankValue>%2$s</taxonRankValue>
				  <commonName>%3$s</commonName>
				  <taxonId provider="%4$s">%5$s</taxonId>
        </taxonomicClassification>'
        , api_xml_string_replace(_record.tty_name)
        , api_xml_string_replace(_record.unit_name1||' '||_record.unit_name2)
        , api_xml_string_replace(_record.english_name)
        , _TAXONOMIC_PROVIDER_URL
        , api_xml_string_replace(_record.code));
    end loop;
    _eml_xml_text := _eml_xml_text||'
  		  </taxonomicClassification>
			</taxonomicCoverage>';
    _eml_xml_text := _eml_xml_text||'
        </coverage>
			</studyAreaDescription>';

    _eml_xml_text := _eml_xml_text||format('
      <relatedProject id="%1$s" system="%2$s">
	    		<title>%3$s</title>
	    		<personnel>'
      , _r_project.UUID
      , _BIOHUB_PROVIDER_URL
      , api_xml_string_replace(_r_project.name));

    if _r_project.coordinator_public then
      _eml_xml_text := _eml_xml_text||format('
        <individualName>
	      	<givenName>%1$s</givenName>
	      	<surName>%2$s</surName>
	      </individualName>
	      <organizationName>%3$s</organizationName>
        <electronicMailAddress>%4$s</electronicMailAddress>
	      <role>pointOfContact</role>'
        , api_xml_string_replace(_r_project.coordinator_first_name)
        , api_xml_string_replace(_r_project.coordinator_last_name)
        , api_xml_string_replace(_r_project.coordinator_agency_name)
        , api_xml_string_replace(_r_project.coordinator_email_address));
    else
      _eml_xml_text := _eml_xml_text||format('
        <organizationName>%1$s</organizationName>
	  		<onlineUrl>%2$s</onlineUrl>
        <role>custodianSteward</role>'
        , _ORGANIZATION_NAME_FULL
        , _ORGANIZATION_URL);
      end if;
    _eml_xml_text := _eml_xml_text||'</personnel>';

    _eml_xml_text := _eml_xml_text||format('
      	<abstract>
	  			<section>
	  				<title>Objectives</title>
	  				<para>%1$s</para>
	  			</section>
          <section>
						<title>Caveates</title>
						<para>%2$s</para>
					</section>
					<section>
						<title>Comments</title>
						<para>%3$s</para>
					</section>
	  		</abstract>'
        , api_xml_string_replace(_r_project.objectives)
        , api_xml_string_replace(_r_project.caveats)
        , api_xml_string_replace(_r_project.comments));

    select true into _exists from project_funding_source
      where exists (select project_funding_source_id from project_funding_source  where project_id = _r_project.project_id);

    if _exists then
      _eml_xml_text := _eml_xml_text||'
        <funding>
				  <section>
					  <title>Funding Source</title>';  

      for _record in (select a.*, b.name investment_action_category_name, c.name funding_source_name from project_funding_source a, investment_action_category b, funding_source c
        where project_funding_source_id in (select project_funding_source_id from project_funding_source  where project_id = _r_project.project_id)
        and b.investment_action_category_id = a.investment_action_category_id 
        and c.funding_source_id = b.funding_source_id) loop

        _eml_xml_text := _eml_xml_text||format('
            <para>%1$s</para>
					  <section>
						  <title>Investment Action Category</title>
						  <para>%2$s</para>
              <section>
							  <title>Funding Source Project ID</title>
							  <para>%3$s</para>
						  </section>
						  <section>
						  	<title>Funding Amount</title>
						  	<para>%4$s</para>
						  </section>
						  <section>
						  	<title>Funding Start Date</title>
						  	<para>%5$s</para>
						  </section>
						  <section>
						  	<title>Funding Start Date</title>
						  	<para>%6$s</para>
						  </section>
            </section>'
            , api_xml_string_replace(_record.funding_source_name)
            , api_xml_string_replace(_record.investment_action_category_name)
            , _record.project_funding_source_id
            , _record.funding_amount
            , to_char(_record.funding_start_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE'))
            , to_char(_record.funding_end_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE')));
      end loop;

      _eml_xml_text := _eml_xml_text||'
          </section>
        </funding>';
    end if;
    _exists := false;

    -- TODO: this only provides us with the bounding box of the first polygon
    with envelope as (select ST_Envelope(geography::geometry) geom from project where project_id = _r_project.project_id)
      select st_xmax(geom), st_ymax(geom), st_xmin(geom), st_ymin(geom) into _record from envelope;

    _eml_xml_text := _eml_xml_text||format('
      <studyAreaDescription>				
		    <coverage>
			    <geographicCoverage>
              <geographicDescription>%1$s</geographicDescription>
				      <boundingCoordinates>
				      	<westBoundingCoordinate>%2$s</westBoundingCoordinate>
				      	<eastBoundingCoordinate>%3$s</eastBoundingCoordinate>
				      	<northBoundingCoordinate>%4$s</northBoundingCoordinate>
				      	<southBoundingCoordinate>%5$s</southBoundingCoordinate>					  	
				      </boundingCoordinates>'
    , coalesce(api_xml_string_replace(_r_project.location_description), api_get_character_system_constant('DATA_NOT_PROVIDED_MESSAGE'))
    , _record.st_xmin
    , _record.st_xmax
    , _record.st_ymax
    , _record.st_ymin);

    for _record in (with polygons as (select (st_dumppoints(g.geom)).* from (select geography::geometry as geom from project where project_id = _r_project.project_id) as g)
      select distinct(path[1]) polygon from polygons) loop
      _eml_xml_text := _eml_xml_text||'
        <datasetGPolygon>
  				<datasetGPolygonOuterGRing>';

      for _record2 in (with polygons as (select (st_dumppoints(g.geom)).* from (select geography::geometry as geom from project where project_id = _r_project.project_id) as g)
        , points as (select geom from polygons where path[1] = _record.polygon)
        select st_x(geom) x, st_y(geom) y from points) loop
          _eml_xml_text := _eml_xml_text||format('
  					<gRingPoint>
  						<gRingLatitude>%1$s</gRingLatitude>
  						<gRingLongitude>%2$s</gRingLongitude>
  					</gRingPoint>'
            , _record2.y
            , _record2.x);
      end loop;

      _eml_xml_text := _eml_xml_text||' 
  				</datasetGPolygonOuterGRing>
  			</datasetGPolygon>';
    end loop;        
    _eml_xml_text := _eml_xml_text||'</geographicCoverage>';

    _eml_xml_text := _eml_xml_text||format('
  		<temporalCoverage>
			  <rangeOfDates>
			  	<beginDate>
			  		<calendarDate>%1$s</calendarDate>
			  	</beginDate>
			  	<endDate>
			  		<calendarDate>%2$s</calendarDate>
			  	</endDate>
			  </rangeOfDates>
			</temporalCoverage>'
      , to_char(_r_project.start_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE'))
      , to_char(_r_project.end_date, api_get_character_system_constant('ISO_8601_DATE_FORMAT_WITHOUT_TIME_TIMEZONE')));
      
    _eml_xml_text := _eml_xml_text||'
        </coverage>
			</studyAreaDescription>';
    _eml_xml_text := _eml_xml_text||'</relatedProject>';
    _eml_xml_text := _eml_xml_text||'</project>';
    _eml_xml_text := _eml_xml_text||'</dataset>';

    select true into _exists from project_iucn_action_classification
      where exists (select project_id from project_iucn_action_classification where project_id = _r_project.project_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name level_1_name, b.name level_2_name, c.name level_3_name from iucn_conservation_action_level_1_classification a
        , iucn_conservation_action_level_2_subclassification b, iucn_conservation_action_level_3_subclassification c, project_iucn_action_classification d
        where d.project_id = _r_project.project_id
        and c.iucn_conservation_action_level_3_subclassification_id = d.iucn_conservation_action_level_3_subclassification_id 
        and b.iucn_conservation_action_level_2_subclassification_id = c.iucn_conservation_action_level_2_subclassification_id 
        and a.iucn_conservation_action_level_1_classification_id  = b.iucn_conservation_action_level_1_classification_id) loop

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
			      <IUCNConservationActions>
			      	<IUCNConservationAction>
			      		<IUCNConservationActionLevel1Classification>%1$s</IUCNConservationActionLevel1Classification>
			      		<IUCNConservationActionLevel2SubClassification>%1$s</IUCNConservationActionLevel2SubClassification>
			      		<IUCNConservationActionLevel3SubClassification>%1$s</IUCNConservationActionLevel3SubClassification>
			      	</IUCNConservationAction>					
			      </IUCNConservationActions>
		      </metadata>'
          , api_xml_string_replace(_record.level_1_name)
          , api_xml_string_replace(_record.level_2_name)
          , api_xml_string_replace(_record.level_3_name));
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;

    select true into _exists from stakeholder_partnership
      where exists (select project_id from stakeholder_partnership where project_id = _r_project.project_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name from stakeholder_partnership a
        where a.project_id = _r_project.project_id) loop

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
			      <stakeholderPartnerships>
					    <stakeholderPartnership>
						    <name>%1$s</name>
					    </stakeholderPartnership>
				    </stakeholderPartnerships>
		      </metadata>'
          , api_xml_string_replace(_record.name));
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;    

    select true into _exists from project_activity
      where exists (select project_id from project_activity where project_id = _r_project.project_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name from activity a, project_activity b
        where b.project_id = _r_project.project_id
        and a.activity_id = b.activity_id) loop

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
            <projectActivities>
				      <projectActivity>
					      <name>%1$s</name>
				      </projectActivity>
			      </projectActivities>
		      </metadata>'
          , api_xml_string_replace(_record.name));
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;        

    select true into _exists from project_climate_initiative
      where exists (select project_id from project_climate_initiative where project_id = _r_project.project_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name from climate_change_initiative a, project_climate_initiative b
        where b.project_id = _r_project.project_id
        and a.climate_change_initiative_id = b.climate_change_initiative_id) loop

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
            <climateChangeInitiatives>
				      <climateChangeInitiative>
					      <name>%1$s</name>
				      </climateChangeInitiative>
			      </climateChangeInitiatives>
		      </metadata>'
          , api_xml_string_replace(_record.name));
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;

    select true into _exists from project_first_nation
      where exists (select project_id from project_first_nation where project_id = _r_project.project_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name from first_nations a, project_first_nation b
        where b.project_id = _r_project.project_id
        and a.first_nations_id = b.first_nations_id) loop

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
            <firtNations>
				      <firtNation>
					      <name>%1$s</name>
				      </firtNation>
			      </firtNations>
		      </metadata>'
          , api_xml_string_replace(_record.name));
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;

    select true into _exists from project_management_actions
      where exists (select project_id from project_management_actions where project_id = _r_project.project_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name from management_action_type a, project_management_actions b
        where b.project_id = _r_project.project_id
        and a.management_action_type_id = b.management_action_type_id) loop

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
            <managementActionTypes>
				      <managementActionType>
					      <name>%1$s</name>
				      </managementActionType>
			      </managementActionTypes>
		      </metadata>'
          , api_xml_string_replace(_record.name));
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;    

    select true into _exists from survey_proprietor
      where exists (select survey_id from survey_proprietor where survey_id = _r_survey.survey_id);

    if _exists then  
      _eml_xml_text := _eml_xml_text||format('
        <additionalMetadata>
		      <describes>%1$s</describes>'
        , _r_project.UUID);

      for _record in (select a.name proprietor_type_name, b.name first_nations_name, c.* from proprietor_type a, first_nations b, survey_proprietor c
        where c.survey_id = _r_survey.survey_id
        and b.first_nations_id = c.first_nations_id
        and a.proprietor_type_id = c.proprietor_type_id) loop
        
        if _record.disa_required then
          _string := 'Yes';
        else
          _string := 'No';
        end if;

        _eml_xml_text := _eml_xml_text||format('
          <metadata>
            <surveyProprietors>
				      <surveyProprietor>
					      <firstNationsName>%1$s</firstNationsName>
					      <proprietorType>%2$s</proprietorType>
					      <rationale>%3$s</rationale>
					      <proprietorName>%4$s</proprietorName>
					      <DISARequired>%5$s</DISARequired>
				      </surveyProprietor>
			      </surveyProprietors>
		      </metadata>'
          , api_xml_string_replace(_record.first_nations_name)
          , api_xml_string_replace(_record.proprietor_type_name)
          , api_xml_string_replace(_record.rationale)
          , api_xml_string_replace(_record.proprietor_name)
          , _string
          );
      
      end loop;
      _eml_xml_text := _eml_xml_text||'
	      </additionalMetadata>';
    end if;
    _exists := false;    

    _eml_xml_text := _eml_xml_text||format('
      <additionalMetadata>
		    <describes>%1$s</describes>
		      <metadata>
			      <biohubEML>
				      <type>survey</type>
				      <version>%2$s</version>
			      </biohubEML>
		      </metadata>
	    </additionalMetadata>'
      , _r_data_package.UUID
      , _BIOHUB_EML_VERSION);

  -- end occurrence submission associated with survey
  end if;

  _eml_xml_text := _eml_xml_text||'</eml:eml>';
  return xmlparse(DOCUMENT _eml_xml_text);

exception
  when others then
    raise;
end;
$$;

grant execute on function api_get_eml_data_package to biohub_api;
