/**
 * Pre-processes GET occurrences data for view-only purposes
 *
 * @export
 * @class GetOccurrencesViewData
 */
export class GetOccurrencesViewData {
  occurrences: any[];

  constructor(occurrencesData?: any) {
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
