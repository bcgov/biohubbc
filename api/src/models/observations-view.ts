import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/observations-view');

/**
 * Pre-processes GET observations data
 *
 * @export
 * @class GetObservationsData
 */
export class GetObservationsData {
  geometry: Feature[];

  constructor(observationsData?: any) {
    defaultLog.debug({
      label: 'GetObservationsData',
      message: 'params',
      observationsData
    });

    const observationsDataItem = observationsData && observationsData.length && observationsData[0];

    this.geometry = (observationsDataItem?.geometry?.length && [JSON.parse(observationsDataItem.geometry)]) || [];
  }
}
