import { Geometry } from 'geojson';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { Srid } from '../services/geo-service';
import { BaseRepository } from './base-repository';

export class PostgisRepository extends BaseRepository {
  /**
   * Convert the provided GeoJSON geometry into Well-Known Text (WKT) in the provided Spatial Reference ID (SRID).
   *
   * @param {Geometry} geometry
   * @param {Srid} srid
   * @return {*}
   * @memberof PostgisRepository
   */
  async getGeoJsonGeometryAsWkt(geometry: Geometry, srid: Srid) {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select(knex.raw(`ST_AsText(ST_TRANSFORM(ST_GeomFromGeoJSON(${geometry}), ${srid})) as geometry`));

    console.log(queryBuilder.toSQL().toNative().bindings);
    console.log(queryBuilder.toSQL().toNative().sql);

    const response = await this.connection.knex(queryBuilder, z.object({ geometry: z.string() }));

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to convert geometry to WKT', [
        'PostgisRepository->getGeometryAsWkt',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }
}
