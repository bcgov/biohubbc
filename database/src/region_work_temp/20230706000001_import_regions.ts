import { Knex } from 'knex';
import * as nrm_regions from './ADM_NR_REGIONS_SP.json';

/**
 * // add new table for region lookup and connection table to project and survey
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  const nrm_features = nrm_regions['features'];

  nrm_features.forEach(async (feature: any) => {
    const properties = feature['properties'];
    const region_name = properties['REGION_NAME'];
    const org_unit = properties['ORG_UNIT'];
    const org_unit_name = properties['ORG_UNIT_NAME'];
    const feature_code = properties['FEATURE_CODE'];
    const feature_name = properties['FEATURE_NAME'];
    const object_id = properties['OBJECTID'];
    const geojson = JSON.stringify(feature);

    const geoCollection = generateGeometryCollectionSQL(feature);

    const insert = `
      INSERT INTO biohub.region_lookup (
        region_name,
        org_unit,
        org_unit_name,
        feature_code,
        feature_name,
        object_id,
        geojson,
        geography
      ) VALUES (
        '${region_name}',
        '${org_unit}',
        '${org_unit_name}',
        '${feature_code}',
        '${feature_name}',
        ${object_id},
        '${geojson}',
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
              ${geoCollection}, 4326
            )
          )
        )
      ) returning region_id;
    `;
    await knex.raw(insert);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

function generateGeometryCollectionSQL(geometry: any): any {
  const geo = JSON.stringify(geometry.geometry);

  return `public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))`;
}
