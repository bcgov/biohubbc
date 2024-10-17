import SQL from 'sql-template-strings';
import { DeploymentRecord } from '../../database-models/deployment';
import { ApiExecuteSQLError, ProjectPermissionError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import { CreateDeployment, UpdateDeployment } from './deployment-repository.interface';

/**
 * Repository layer for survey deployments
 *
 * @export
 * @class DeploymentRepository
 * @extends {BaseRepository}
 */
export class DeploymentRepository extends BaseRepository {
  async createDeployment(surveyId: number, deployment: CreateDeployment): Promise<void> {
    if (deployment.survey_id !== surveyId) {
      throw new ProjectPermissionError('Failed to create deployment', [
        `User is not authorized to create a deployment for survey ${deployment.survey_id}`
      ]);
    }

    const sqlStatement = SQL`
      INSERT INTO deployment2 (
        survey_id,
        critter_id,
        device_id,
        device_key,
        attachment_start,
        attachment_end,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      ) VALUES (
        ${deployment.survey_id},
        ${deployment.critter_id},
        ${deployment.device_id},
        ${deployment.device_key},
        ${deployment.attachment_start},
        ${deployment.attachment_end},
        ${deployment.critterbase_start_capture_id},
        ${deployment.critterbase_end_capture_id},
        ${deployment.critterbase_end_mortality_id}
      );
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to create deployment', [
        'DeploymentRepository->createDeployment',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  async getDeploymentById(surveyId: number, deploymentId: number): Promise<DeploymentRecord> {
    const sqlStatement = SQL`
      SELECT
        deployment2_id,
        survey_id,
        critter_id,
        device_id,
        device_key,
        attachment_start,
        attachment_end,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      FROM
        deployment2
      WHERE
        deployment2_id = ${deploymentId} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, DeploymentRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get deployment', [
        'DeploymentRepository->getDeploymentById',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  async getDeploymentsForSurveyId(surveyId: number): Promise<DeploymentRecord[]> {
    const sqlStatement = SQL`
      SELECT
        deployment2_id,
        survey_id,
        critter_id,
        device_id,
        device_key,
        attachment_start,
        attachment_end,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      FROM
        deployment2
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, DeploymentRecord);

    return response.rows;
  }

  async getDeploymentsForCritterId(surveyId: number, critterId: number): Promise<DeploymentRecord[]> {
    const sqlStatement = SQL`
      SELECT
        deployment2_id,
        survey_id,
        critter_id,
        device_id,
        device_key,
        attachment_start,
        attachment_end,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      FROM
        deployment2
      WHERE
        critter_id = ${critterId} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, DeploymentRecord);

    return response.rows;
  }

  async updateDeployment(surveyId: number, deployment: UpdateDeployment): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        deployment2
      SET
        critter_id = ${deployment.critter_id},
        device_id = ${deployment.device_id},
        device_key = ${deployment.device_key},
        attachment_start = ${deployment.attachment_start},
        attachment_end = ${deployment.attachment_end},
        critterbase_start_capture_id = ${deployment.critterbase_start_capture_id},
        critterbase_end_capture_id = ${deployment.critterbase_end_capture_id},
        critterbase_end_mortality_id = ${deployment.critterbase_end_mortality_id}
      WHERE
        deployment2_id = ${deployment.deployment2_id} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update deployment', [
        'DeploymentRepository->updateDeployment',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  async deleteDeployment(surveyId: number, deploymentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        deployment2
      WHERE
        deployment2_id = ${deploymentId} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete deployment', [
        'DeploymentRepository->deleteDeployment',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }
}
