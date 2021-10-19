import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/occurrence-view');

/**
 * Pre-processes GET occurrences data for view-only purposes
 *
 * @export
 * @class GetOccurrencesViewData
 */
export class GetOccurrencesViewData {
  occurrences: any[];

  constructor(occurrencesData?: any) {
    defaultLog.debug({
      label: 'GetOccurrencesViewData',
      message: 'params',
      occurrencesData: {
        ...occurrencesData,
        geometry: occurrencesData?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    this.occurrences = occurrencesData?.map((occurrence: any) => {
      const feature =
        (occurrence.geometry && { type: 'Feature', geometry: JSON.parse(occurrence.geometry), properties: {} }) || null;

      return {
        geometry: feature,
        taxonId: occurrence.taxonid,
        occurrenceId: occurrence.occurrence_id,
        individualCount: Number(occurrence.individualcount),
        lifeStage: occurrence.lifestage,
        sex: occurrence.sex,
        organismQuantity: Number(occurrence.organismquantity),
        organismQuantityType: occurrence.organismquantitytype,
        vernacularName: occurrence.vernacularname,
        eventDate: occurrence.eventdate
      };
    });
  }
}
