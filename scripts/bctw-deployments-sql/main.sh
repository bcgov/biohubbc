#!/bin/bash


# Script Name: main.sh
# Description: This script generates SQL for SIMS from BCTW Caribou deployments.
# Author: Mac Deluca
# Date: April 15, 2024


# endpoint for Caribou herd boundaries
BCGW_CARIBOU_FEATURES_ENDPOINT="https://openmaps.gov.bc.ca/geo/pub/wfs?request=GetFeature&service=WFS&version=2.0.0&typeNames=WHSE_WILDLIFE_INVENTORY.GCPB_CARIBOU_POPULATION_SP&outputFormat=json"

# retrieve caribou feature geometries and output to file
if test -f features.json; then
  CARIBOU_FEATURES=$(jq '.' features.json)
else
  CARIBOU_FEATURES=$(curl -s "$BCGW_CARIBOU_FEATURES_ENDPOINT" | jq '.features' > features.json)
fi

# merge deployments and critters together by critter_id
JQ_CRITTER_MERGE='[group_by(.critter_id)[]|add]'

# group merged deployments by heard name and year of deployment
# ie: `Population unit` + `2024-01-01` will be grouped with `Population unit` + `2024-09-09`
JQ_YEAR_HERD_GROUP_BY='group_by(.unit_name + "|" + (.create_timestamp | .[:4]))'

# structure JSON for easier sql formatting
JQ_FORMAT_JSON='.[] |=
  {
    first_name: "Macgregor",
    last_name: "Aubertin-Young",
    email: "Macgregor.Aubertin-Young@gov.bc.ca",
    species: "Caribou",
    unit_name: .[].unit_name,

    critter_id: .[].critter_id,

    project_name: .[].unit_name,
    project_objectives: ("Telemetry deployments for " + .[].unit_name + " in " + (.[].create_timestamp | .[:4])),
    project_program: "Wildlife",
    project_start: ((.[].create_timestamp | .[:4]) + "-01-01"),
    project_end: ((.[].create_timestamp | .[:4]) + "-12-31"),

    deployments: .,

    survey_name: (.[].unit_name + " " + (.[].create_timestamp | .[:4]) + " - telemetry"),
    survey_type: "Monitoring",
    survey_start: min_by(.create_timestamp) | .create_timestamp,
    survey_end: max_by(.create_timestamp) | .create_timestamp,
    survey_progress: "Completed",
    survey_ecological_vars: ["Mortality", "Distribution"],
    survey_site_strategy: "Opportunistic",
    survey_study_area: .[].unit_name,
    survey_location_description: (.[].unit_name + " herd boundary")
  }'

# format sql string:
#   inserts into: project, survey, critter, deployment, project_program and deployment
JQ_FORMAT_SQL='.[] | "
WITH p as(
  INSERT INTO project (name, objectives, coordinator_first_name, coordinator_last_name, coordinator_email_address, start_date, end_date)
  VALUES ($$\(.project_name)$$, $$\(.project_objectives)$$, $$\(.first_name)$$, $$\(.last_name)$$, $$\(.email)$$, $$\(.project_start)$$, $$\(.project_end)$$)
  RETURNING project_id
), s as (
  INSERT INTO survey (project_id, name, lead_first_name, lead_last_name, start_date, end_date, progress_id)
  SELECT project_id, $$\(.survey_name)$$, $$\(.first_name)$$, $$\(.last_name)$$, $$\(.survey_start)$$, $$\(.survey_end)$$,
  (select survey_progress_id from survey_progress where name = $$\(.survey_progress)$$)
  FROM p
  RETURNING survey_id
), c as (
  INSERT INTO critter (survey_id, critterbase_critter_id)
  SELECT survey_id, $$\(.critter_id)$$ FROM s
  RETURNING critter_id
), pp as (
  INSERT INTO project_program (project_id, program_id)
  SELECT project_id, (select program_id from program where name = $$\(.project_program)$$)
  FROM p
), l as (
  INSERT INTO survey_location (survey_id, name, description, geojson, geography)
  SELECT survey_id, $$\(.unit_name)$$, $$\(.survey_location_description)$$, $$\(.feature)$$,
    public.geography(public.ST_Force2D(public.ST_SetSRID(public.ST_Force2D(public.ST_GeomFromGeoJSON($$\(.feature.geometry)$$)), 4326)))
  FROM s
)
INSERT INTO deployment (critter_id, bctw_deployment_id)
VALUES
\(.deployments | map("((select critter_id from c), $$\(.deployment_id)$$)") | join(",\n"));

"'

JQ_MERGE_FEATURES_WITH_DEPLOYMENTS='map(. as $item | . + {feature: ($features | (.[] | select(.properties.HERD_NAME == $item.unit_name))) })'

JQ_FILTERS="$JQ_CRITTER_MERGE | $JQ_YEAR_HERD_GROUP_BY | $JQ_FORMAT_JSON | $JQ_MERGE_FEATURES_WITH_DEPLOYMENTS"

JSON=$(jq "$JQ_FILTERS" --argfile features features.json)

echo $CARIBOU_FEATURES | jq '.[0]'

echo $JSON | jq -r "$JQ_FORMAT_SQL"
