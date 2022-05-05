import { SQL, SQLStatement } from 'sql-template-strings';
import { IPostPermitNoSampling } from '../../models/permit-no-sampling';
import { PostCoordinatorData } from '../../models/project-create';

/**
 * SQL query to insert a permit row for permit associated to a project.
 *
 * @param {string} permitNumber
 * @param {string} permitType
 * @param {number} projectId
 * @param {number} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const postProjectPermitSQL = (
  permitNumber: string,
  permitType: string,
  projectId: number,
  systemUserId: number
): SQLStatement | null => {
  if (!permitNumber || !permitType || !projectId || !systemUserId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO permit (
        project_id,
        number,
        type,
        system_user_id
      ) VALUES (
        ${projectId},
        ${permitNumber},
        ${permitType},
        ${systemUserId}
      )
      RETURNING
        permit_id as id;
    `;

  return sqlStatement;
};

/**
 * SQL query to insert a no sample permit row.
 *
 * @param {(IPostPermit & PostCoordinatorData)} noSamplePermit
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const postPermitNoSamplingSQL = (
  noSamplePermit: IPostPermitNoSampling & PostCoordinatorData,
  systemUserId: number | null
): SQLStatement | null => {
  if (!noSamplePermit || !systemUserId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO permit (
        number,
        type,
        coordinator_first_name,
        coordinator_last_name,
        coordinator_email_address,
        coordinator_agency_name,
        system_user_id
      ) VALUES (
        ${noSamplePermit.permit_number},
        ${noSamplePermit.permit_type},
        ${noSamplePermit.first_name},
        ${noSamplePermit.last_name},
        ${noSamplePermit.email_address},
        ${noSamplePermit.coordinator_agency},
        ${systemUserId}
      )
      RETURNING
        permit_id as id;
    `;

  return sqlStatement;
};
