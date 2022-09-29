/**
 * Pre-processes POST occurrences data
 *
 * @export
 * @class PostOccurrence
 */
export class PostOccurrence {
  associatedTaxa: string;
  lifeStage: string;
  sex: string;
  data: object;
  verbatimCoordinates: string;
  individualCount: number;
  vernacularName: string;
  organismQuantity: string;
  organismQuantityType: string;
  eventDate: string;

  constructor(obj?: any) {
    this.associatedTaxa = obj?.associatedTaxa || null;
    this.lifeStage = obj?.lifeStage || null;
    this.sex = obj?.sex || null;
    this.data = obj?.data || null;
    this.verbatimCoordinates = obj?.verbatimCoordinates || null;
    this.individualCount = obj?.individualCount || null;
    this.vernacularName = obj?.vernacularName || null;
    this.organismQuantity = obj?.organismQuantity || null;
    this.organismQuantityType = obj?.organismQuantityType || null;
    this.eventDate = obj?.eventDate || null;
  }
}
