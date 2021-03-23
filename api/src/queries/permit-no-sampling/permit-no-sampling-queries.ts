import { SQL, SQLStatement } from 'sql-template-strings';
import { IPostPermitNoSampling } from '../../models/permit-no-sampling';
import { PostCoordinatorData } from '../../models/project';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit-no-sampling/permit-no-sampling-queries');

/**
 * SQL query to insert a no sample permit row.
 *
 * @param {(IPostPermit & PostCoordinatorData)} noSamplePermit
 * @returns {SQLStatement} sql query object
 */
export const postPermitNoSamplingSQL = (
  noSamplePermit: IPostPermitNoSampling & PostCoordinatorData
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postPermitNoSamplingSQL',
    message: 'params',
    noSamplePermit
  });

  if (!noSamplePermit) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO no_sample_permit (
        number,
        coordinator_first_name,
        coordinator_last_name,
        coordinator_email_address,
        coordinator_agency_name
      ) VALUES (
        ${noSamplePermit.permit_number},
        ${noSamplePermit.first_name},
        ${noSamplePermit.last_name},
        ${noSamplePermit.email_address},
        ${noSamplePermit.coordinator_agency}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'postPermitNoSamplingSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
