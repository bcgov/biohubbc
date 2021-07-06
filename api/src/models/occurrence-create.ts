export class PostOccurrence {
  associatedtaxa: string;
  lifestage: string;
  data: object;
  verbatimCoordinates: string;
  individualCount: number;
  vernacularName: string;
  organismQuantity: string;
  organismQuantityType: string;
  eventDate: string;

  constructor(obj?: any) {
    this.associatedtaxa = obj?.associatedtaxa || null;
    this.lifestage = obj?.lifestage || null;
    this.data = obj?.data || null;
    this.verbatimCoordinates = obj?.verbatimCoordinates || null;
    this.individualCount = obj?.individualCount || null;
    this.vernacularName = obj?.vernacularName || null;
    this.organismQuantity = obj?.organismQuantity || null;
    this.organismQuantityType = obj?.organismQuantityType || null;
    this.eventDate = obj?.eventDate || null;
  }
}
