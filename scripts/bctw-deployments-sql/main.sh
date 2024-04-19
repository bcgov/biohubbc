#!/bin/bash


# Script Name: main.sh
# Description: This script generates SQL for SIMS from BCTW Caribou deployments.
# Author: Mac Deluca
# Date: April 15, 2024

# endpoint for caribou herd boundaries
BCGW_CARIBOU_FEATURES_ENDPOINT="https://openmaps.gov.bc.ca/geo/pub/wfs?request=GetFeature&service=WFS&version=2.0.0&typeNames=WHSE_WILDLIFE_INVENTORY.GCPB_CARIBOU_POPULATION_SP&outputFormat=json&srsName=EPSG:4326"

# retrieve caribou feature geometries
if test -f features.json; then
  # if features.json exists read from file
  CARIBOU_FEATURES=$(jq '.' features.json)
else
  # else retrieve caribou feature geometries and output to file
  CARIBOU_FEATURES=$(curl -s "$BCGW_CARIBOU_FEATURES_ENDPOINT" | jq '.features' > features.json)
fi

# 1. merge deployments and critters together by critter_id
# 2. group merged deployments by caribou herd (unit_name)
# 3. generate new json object
STEP_1=$(jq '[group_by(.critter_id)[]|add] | group_by(.unit_name) | .[] |=
  {
    herd: .[].unit_name,
    start_date: min_by(.attachment_start) | .attachment_start,
    end_date: max_by(.attachment_start) | .attachment_start,
    surveys: (group_by(.attachment_start | .[:4]) | .[] |=
      {
        year: (.[].attachment_start | .[:4]),
        deployments: (.[] |= {deployment_id, critter_id, attachment_start})
      })
  }
')
# inject matching caribou boundary (feature) by herd name
# using file because the features are too large for --argjson
STEP_2=$(echo $STEP_1 | jq --argfile features features.json 'map(. as $item | . + {feature: ($features | (.[] | select(.properties.HERD_NAME == $item.herd))) })')

# structure sql insert statements
STEP_3=$(echo $STEP_2 | jq '.[] | "
-- project meta
WITH p AS (INSERT INTO project (name, objectives, coordinator_first_name, coordinator_last_name, coordinator_email_address, start_date, end_date) VALUES ( $$Caribou - \(.herd) - BCTW Telemetry$$, $$BCTW telemetry deployments for \(.herd) Caribou$$, $$Macgregor$$, $$Aubertin-Young$$, $$Macgregor.Aubertin-Young@gov.bc.ca$$, $$\(.start_date)$$, $$\(.end_date)$$) RETURNING project_id
), ppp AS (INSERT INTO project_participation (project_id, system_user_id, project_role_id) SELECT project_id, (select system_user_id from system_user where user_identifier = $$mauberti$$), (select project_role_id from project_role where name = $$Coordinator$$) FROM p
), pp AS (INSERT INTO project_program (project_id, program_id) SELECT project_id, (select program_id from program where name = $$Wildlife$$) FROM p

-- survey meta
)\(. as $project | .surveys | map(", s\(.year) AS (INSERT INTO survey (project_id, name, lead_first_name, lead_last_name, start_date, end_date, progress_id) SELECT project_id, $$Caribou - \(.year) -\($project.herd) - BCTW Telemetry$$, $$Macgregor$$, $$Aubertin-Young$$, $$\($project.start_date)$$, $$\($project.end_date)$$, (select survey_progress_id from survey_progress where name = $$Completed$$) FROM p RETURNING survey_id
), st\(.year) AS (INSERT INTO survey_type (survey_id, type_id) SELECT survey_id, (select type_id from type where name = $$Monitoring$$) FROM s\(.year)
), ss\(.year) AS (INSERT INTO study_species (survey_id, is_focal, itis_tsn) SELECT survey_id, true, 180701 FROM s\(.year)
), sio1\(.year) AS (INSERT INTO survey_intended_outcome (survey_id, intended_outcome_id) SELECT survey_id, (select intended_outcome_id from intended_outcome where name = $$Mortality$$) FROM s\(.year)
), sio2\(.year) AS (INSERT INTO survey_intended_outcome (survey_id, intended_outcome_id) SELECT survey_id, (select intended_outcome_id from intended_outcome where name = $$Distribution or Range Map$$) FROM s\(.year)
), sl\(.year) AS (INSERT INTO survey_location (survey_id, name, description, geojson, geography) SELECT survey_id, $$\(.unit_name)$$, $$\(.survey_location_description)$$, $$[\($project.feature)]$$, public.geography(public.ST_GeomFromGeoJSON($$\($project.feature.geometry)$$)) FROM s\(.year)

-- critter + deployment meta
\(.deployments | map(", critter-\(.critter_id) AS (INSERT INTO critter (survey_id, critterbase_critter_id) SELECT survey_id, $$\(.critter_id
), deployment-\(.deployment_id) AS (INSERT INTO deployment (critter_id) SELECT critter_id FROM c\(.year)
") | join("\n"))

)") | join("\n")) SELECT project_id FROM p;"')


# ), c\(.year) AS (INSERT INTO critter (survey_id, critterbase_critter_id) SELECT survey_id, $$\(.critter_id)$$ FROM s\(.year) RETURNING critter_id
# ), d\(.year) AS (INSERT INTO deployment (critter_id) SELECT critter_id FROM c\(.year)

#echo $STEP_1 | jq
#echo $STEP_2 | jq
echo $STEP_3 | jq -r

# # merge caribou geometry features with formatted JSON by unit_name
# JQ_MERGE_FEATURES_WITH_DEPLOYMENTS='map(. as $item | . + {feature: ($features | (.[] | select(.properties.HERD_NAME == $item.unit_name))) })'
#
# # condense all filters into single var
# JQ_FILTERS="$JQ_CRITTER_MERGE | $JQ_YEAR_HERD_GROUP_BY | $JQ_FORMAT_JSON | $JQ_MERGE_FEATURES_WITH_DEPLOYMENTS"
#
# # generate JSON from filters and inject features.json file
# JSON=$(jq "$JQ_FILTERS" --argfile features features.json)
#
# # output SQL to stdout
# echo $JSON | jq -r "$JQ_FORMAT_SQL"
