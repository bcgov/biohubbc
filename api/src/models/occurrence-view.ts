import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/occurrence-view');

export class GetOccurrencesViewData {
  occurrences: any[];

  constructor(occurrencesData?: any) {
    defaultLog.debug({ label: 'GetOccurrencesViewData', message: 'params', occurrencesData });

    this.occurrences = occurrencesData?.map((occurrence: any) => {
      const feature = {
        type: 'Feature',
        geometry: JSON.parse(occurrence.geometry),
        properties: {}
      };

      return {
        geometry: feature,
        taxonId: occurrence.taxonid,
        individualCount: Number(occurrence.individualcount),
        lifeStage: occurrence.lifestage,
        organismQuantity: Number(occurrence.organismquantity),
        organismQuantityType: occurrence.organismquantitytype,
        vernacularName: occurrence.vernacularname
      };
    });
  }
}
