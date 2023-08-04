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
   * @see https://postgis.net/docs/ST_AsText.html
   *
   * @param {Geometry} geometry
   * @param {Srid} srid
   * @return {*}  {Promise<string>}
   * @memberof PostgisRepository
   */
  async getGeoJsonGeometryAsWkt(geometry: Geometry, srid: Srid): Promise<string> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select(
        knex.raw(
          `public.ST_AsText(public.ST_TRANSFORM(public.ST_Force2D(public.ST_GeomFromGeoJSON('${JSON.stringify(
            geometry
          )}')), ${srid})) as geometry`
        )
      );

    const response = await this.connection.knex(queryBuilder, z.object({ geometry: z.string() }));

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to convert GeoJSON geometry to WKT', [
        'PostgisRepository->getGeoJsonGeometryAsWkt',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0].geometry;
  }
}
