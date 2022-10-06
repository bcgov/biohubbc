import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
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
      defaultLog.error({ label: 'xlsx process', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
