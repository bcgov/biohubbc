import { getLogger } from '../../utils/logger';
import { telemetryCronjob } from './cronjob';

const defaultLog = getLogger('telemetry-cronjob');

telemetryCronjob()
  .then((data) => {
    defaultLog.info({ message: 'Cronjob completed.', information: data });
    process.exit(0);
  })
  .catch((error) => {
    defaultLog.error({ message: 'Cronjob failed.', error });
    process.exit(1);
  });
