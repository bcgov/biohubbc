import { Request, RequestHandler } from 'express';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { HistoryPublishService } from '../../services/history-publish-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/submission/resolveSubmissionToSurvey');

/**
 * Middleware that resolves submissionId (UUID) to survey_id and sets req.survey_id_for_submission for authorization.
 */
export const resolveSubmissionToSurvey: RequestHandler = async (req, res, next) => {
  const submissionId = req.params.submissionId as string;
  if (!submissionId) {
    return res.status(400).json({ message: 'submissionId is required' });
  }

  const connection = getDBConnection(req.keycloak_token);
  try {
    await connection.open();
    const historyPublishService = new HistoryPublishService(connection);
    const record = await historyPublishService.getSurveyMetadataPublishRecordBySubmissionUuid(submissionId);
    if (!record) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    req.survey_id_for_submission = record.survey_id;
    next();
  } catch (error) {
    defaultLog.error({ label: 'resolveSubmissionToSurvey', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Returns the auth config for submission routes (coordinator/collaborator or system admin).
 * Use with authorizeRequestHandler(getSubmissionAuthRequestHandler).
 */
export function getSubmissionAuthRequestHandler(req: Request) {
  return {
    or: [
      {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
        surveyId: req.survey_id_for_submission!,
        discriminator: 'ProjectPermission' as const
      },
      {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        discriminator: 'SystemRole' as const
      }
    ]
  };
}

export const submissionAuthorizeRequestHandler = authorizeRequestHandler(getSubmissionAuthRequestHandler);
