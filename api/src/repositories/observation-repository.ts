import { FeatureCollection, GeoJsonProperties } from 'geojson';
import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { getKnex } from '../database/db';
import { appendSQLColumnsEqualValues, AppendSQLColumnsEqualValues } from '../utils/sql-utils';
import { SubmissionErrorFromMessageType } from '../utils/submission-error';
import { BaseRepository } from './base-repository';


export class ObservationRepository extends BaseRepository {
  
}
