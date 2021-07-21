import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/template-observations');

/**
 * Pre-processes GET project/survey template observations data
 *
 * @export
 * @class GetTemplateObservationsData
 */
export class GetTemplateObservationsData {
  templateObservationsList: any[];

  constructor(templateObservationsData?: any) {
    defaultLog.debug({ label: 'GetTemplateObservationsData', message: 'params', templateObservationsData });

    this.templateObservationsList =
      (templateObservationsData?.length &&
        templateObservationsData.map((item: any) => {
          return {
            id: item.id,
            fileName: item.key,
            lastModified: item.update_date || item.create_date,
            size: item.file_size
          };
        })) ||
      [];
  }
}
