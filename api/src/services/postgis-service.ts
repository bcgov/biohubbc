import { Geometry } from 'geojson';
import { IDBConnection } from '../database/db';
import { PostgisRepository } from '../repositories/postgis-repository';
import { DBService } from './db-service';
import { Srid } from './geo-service';

export class PostgisService extends DBService {
  postgisRepository: PostgisRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.postgisRepository = new PostgisRepository(connection);
  }

  /**
   * Convert the provided geometry into Well-Known Text (WKT) in the provided Spatial Reference ID (SRID).
   *
   * @param {Geometry} geometry
   * @param {Srid} srid
   * @return {*}
   * @memberof PostgisRepository
   */
  async getGeoJsonGeometryAsWkt(geometry: Geometry, srid: Srid) {
    return this.postgisRepository.getGeoJsonGeometryAsWkt(geometry, srid);
  }
}
