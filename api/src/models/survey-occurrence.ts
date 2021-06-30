export class PostSurveyOccurrence {
  associatedtaxa: string;
  lifestage: string;
  data: object;
  verbatimCoordinates: string;

  constructor(obj?: any) {
    this.associatedtaxa = obj?.associatedtaxa || null;
    this.lifestage = obj?.lifestage || null;
    this.data = obj?.data || null;
    this.verbatimCoordinates = obj?.verbatimCoordinates || null;
  }
}
