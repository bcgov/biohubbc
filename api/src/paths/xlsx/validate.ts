import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ErrorService } from '../../services/error-service';
import { ValidationService } from '../../services/validation-service';
import { getLogger } from '../../utils/logger';
import { getValidateAPIDoc } from '../dwc/validate';

const defaultLog = getLogger('paths/xlsx/validate');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  validate()
];

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates an XLSX survey observation submission.',
    'Validate XLSX survey observation submission OK',
    ['survey', 'observation', 'xlsx']
  )
};

export function validate(): RequestHandler {
  return async (req, res, next) => {
    const submissionId = req.body.occurrence_submission_id;
    if (!submissionId) {
      throw new HTTP400('Missing required paramter `occurrence field`');
    }

    res.status(200).json({ status: 'success' });

    const connection = getDBConnection(req['keycloak_token']);
    try {
      await connection.open();

      const service = new ValidationService(connection);
      await service.validateFile(submissionId);

      await connection.commit();
    } catch (error) {
      defaultLog.error({ label: 'validate xlsx', message: 'error', error });
      // Unexpected error occured, rolling DB back to safe state
      await connection.rollback();

      // We still want to track that the submission failed to present to the user
      const errorService = new ErrorService(connection);
      await errorService.insertSubmissionStatus(submissionId, SUBMISSION_STATUS_TYPE.SYSTEM_ERROR);
      await connection.commit();
      throw error;
    } finally {
      connection.release();
    }
  };
}
