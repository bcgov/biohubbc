import { BaseRepository } from '../base-repository';

/**
 * A repository class for working with Manual telemetry data.
 *
 * @export
 * @class TelemetryManualRepository
 * @extends {BaseRepository}
 */
export class TelemetryManualRepository extends BaseRepository {
  async createManualTelemetry(surveyId: number) {}
  async updateManualTelemetry(surveyId: number) {}
  async deleteManualTelemetry(surveyId: number) {}
}
