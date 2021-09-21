import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/occurrence-view');

export class GetOccurrenceGeometriesData {
  occurrenceGeometries: any[];

  constructor(occurrenceGeometriesData?: any) {
    defaultLog.debug({ label: 'GetOccurrenceGeometriesData', message: 'params', occurrenceGeometriesData });

    this.occurrenceGeometries = occurrenceGeometriesData?.map((occurrenceGeometry: any) => {
      return JSON.parse(occurrenceGeometry.geometry);
    });
  }
}
