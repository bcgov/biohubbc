import { IDBConnection } from '../database/db';
import { getS3SignedURL, uploadBufferToS3 } from '../utils/file-utils';
import { DBService } from './db-service';
import { ObservationService } from './observation-service';
import { SampleLocationService } from './sample-location-service';
import { SurveyService } from './survey-service';
import { TelemetryService } from './telemetry-service';

export type ExportConfig = {
  metadata: boolean;
  sampling_data: boolean;
  observation_data: boolean;
  telemetry_data: boolean;
  animal_data: boolean;
  artifacts: boolean;
};

/**
 * Provides functionality for exporting survey data.
 *
 * @export
 * @class ExportService
 * @extends {DBService}
 */
export class ExportService extends DBService {
  surveyService: SurveyService;
  sampleLocationService: SampleLocationService;
  observationService: ObservationService;
  telemetryService: TelemetryService;
  //   critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.surveyService = new SurveyService(connection);
    this.sampleLocationService = new SampleLocationService(connection);
    this.observationService = new ObservationService(connection);
    this.telemetryService = new TelemetryService(connection);
  }

  async exportSurvey(surveyId: number, config: ExportConfig): Promise<string> {
    const surveyData = config.metadata ? await this._getSurveyData(surveyId) : null;
    // const sampleLocations = config.sampling_data ? this._getSampleLocationsForSurveyId(surveyId) : null;
    // const observationData = config.observation_data ? this._getObservationDataForSurveyId(surveyId) : null;
    // const telemetryData = config.telemetry_data ? this._getTelemetryDataForSurveyId(surveyId) : null;
    // const animalData = config.animal_data ? this._getAnimalDataForSurveyId(surveyId) : null;
    // const artifacts = config.artifacts ? this._getArtifactsForSurveyId(surveyId) : null;

    const s3Key = `exports/${surveyId}_data_${Date.now()}.json`;

    const result = await uploadBufferToS3(Buffer.from(JSON.stringify(surveyData)), 'application/json', s3Key, {
      survey_id: String(surveyId),
      created_at: new Date().toISOString()
    });

    console.log('result', result);

    const s3SignedURL = await getS3SignedURL(s3Key);

    if (!s3SignedURL) {
      throw new Error('Failed to generate signed URL');
    }

    return s3SignedURL;
  }

  async _getSurveyData(surveyId: number) {
    return this.surveyService.getSurveyById(surveyId);
  }

  async _getSampleLocationsForSurveyId(surveyId: number) {
    return this.sampleLocationService.getSampleLocationsForSurveyId(surveyId);
  }

  async _getObservationDataForSurveyId(surveyId: number) {
    return this.observationService.getAllSurveyObservations(surveyId);
  }

  //   async _getTelemetryDataForSurveyId(surveyId: number) {
  //     return this.telemetryService.getAllSurveyObservations(surveyId);
  //   }

  //   async _getAnimalDataForSurveyId(surveyId: number) {
  //     return this.critterbaseService.getAllSurveyObservations(surveyId);
  //   }

  //   async _getArtifactsForSurveyId(surveyId: number) {
  //     return this.surveyService.getAllSurveyObservations(surveyId);
  //   }

  async _uploadJsonToS3(data: Record<string, any>, s3Key: string) {
    const s3Key = `exports/${surveyId}_data_${Date.now()}.json`;

    const result = await uploadBufferToS3(Buffer.from(JSON.stringify(surveyData)), 'application/json', s3Key, {
      survey_id: String(surveyId),
      created_at: new Date().toISOString()
    });

    console.log('result', result);
  }

  async _getSignedURL(s3Key: string) {
    const s3SignedURL = await getS3SignedURL(s3Key);

    if (!s3SignedURL) {
      throw new Error('Failed to generate signed URL');
    }

    return s3SignedURL;
  }
}
