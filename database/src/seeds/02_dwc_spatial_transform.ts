import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Add spatial transform
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA}, ${DB_SCHEMA_DAPI_V1};
  `);

  const response = await knex.raw(`
    ${checkTransformExists()}
  `);

  if (!response?.rows?.[0]) {
    await knex.raw(`
      ${insertSpatialTransform()}
    `);
  }
}

const checkTransformExists = () => `
  SELECT
    spatial_transform_id
  FROM
    spatial_transform
  WHERE
    name = 'DwC Occurrences';
`;

/**
 * SQL to insert DWC Occurrences transform
 *
 */
const insertSpatialTransform = () => `
  INSERT into spatial_transform
    (name, description, record_effective_date, transform)
  VALUES (
    'DwC Occurrences', 'Extracts occurrences and properties from DwC JSON source.', now(),
    $transform$
      with submission as (select *
        from occurrence_submission
        where occurrence_submission_id = ?)
          , occurrences as (select occurrence_submission_id, occs
        from submission, jsonb_path_query(darwin_core_source, '$.occurrence') occs)
          , occurrence as (select occurrence_submission_id, jsonb_array_elements(occs) occ
        from occurrences)
          , events as (select evns
        from submission, jsonb_path_query(darwin_core_source, '$.location') evns)
          , event as (select jsonb_array_elements(evns) evn
        from events)
          , event_coord as (select st_x(pt) x, st_y(pt) y, evn
        from event, ST_SetSRID(ST_MakePoint((evn->>'decimalLongitude')::float, (evn->>'decimalLatitude')::float), 4326) pt)
          , normal as (select distinct o.occurrence_submission_id, o.occ, e.*
        from occurrence o
        left outer join event_coord e on
        (e.evn->'eventID' = o.occ->'eventID'))


        select jsonb_build_object('type', 'FeatureCollection'
                      , 'features', jsonb_build_array(jsonb_build_object('type', 'Feature'
                      , 'geometry', jsonb_build_object('type', 'Point', 'coordinates', json_build_array(n.x, n.y))
                      , 'properties', jsonb_build_object('type', 'Occurrence', 'dwc', jsonb_build_object(
                        'type', 'PhysicalObject', 'basisOfRecord', 'Occurrence', 'datasetID', n.occurrence_submission_id, 'occurrenceID', n.occ->'occurrenceID'
                        , 'sex', n.occ->'sex', 'lifeStage', n.occ->'lifeStage', 'taxonID', n.occ->'taxonID', 'individualCount', n.occ->'individualCount'
                        , 'eventDate', n.evn->'eventDate', 'verbatimSRS', n.evn->'verbatimSRS', 'verbatimCoordinates', n.evn->'verbatimCoordinates'
                        ))))
                )result_data
        from normal n;
    $transform$
  );
`;
