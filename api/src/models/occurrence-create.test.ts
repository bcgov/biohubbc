import { expect } from 'chai';
import { describe } from 'mocha';
import { PostOccurrence } from './occurrence-create';

describe('PostOccurrence', () => {
  describe('No values provided', () => {
    let data: PostOccurrence;

    before(() => {
      data = new PostOccurrence(null);
    });

    it('sets associatedtaxa', () => {
      expect(data.associatedtaxa).to.equal(null);
    });

    it('sets lifestage', () => {
      expect(data.lifestage).to.equal(null);
    });

    it('sets data', () => {
      expect(data.data).to.eql(null);
    });

    it('sets verbatimCoordinates', () => {
      expect(data.verbatimCoordinates).to.eql(null);
    });

    it('sets individualCount', () => {
      expect(data.individualCount).to.equal(null);
    });

    it('sets vernacularName', () => {
      expect(data.vernacularName).to.equal(null);
    });

    it('sets organismQuantity', () => {
      expect(data.organismQuantity).to.equal(null);
    });

    it('sets organismQuantityType', () => {
      expect(data.organismQuantityType).to.equal(null);
    });

    it('sets eventDate', () => {
      expect(data.eventDate).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PostOccurrence;

    before(() => {
      data = new PostOccurrence({
        associatedtaxa: 'associatedtaxa',
        lifestage: 'lifestage',
        data: 'data',
        verbatimCoordinates: 'verbatimCoordinates',
        individualCount: 'individualCount',
        vernacularName: 'vernacularName',
        organismQuantity: 'organismQuantity',
        organismQuantityType: 'organismQuantityType',
        eventDate: 'eventDate'
      });
    });

    it('sets associatedtaxa', () => {
      expect(data.associatedtaxa).to.equal('associatedtaxa');
    });

    it('sets lifestage', () => {
      expect(data.lifestage).to.equal('lifestage');
    });

    it('sets data', () => {
      expect(data.data).to.eql('data');
    });

    it('sets verbatimCoordinates', () => {
      expect(data.verbatimCoordinates).to.eql('verbatimCoordinates');
    });

    it('sets individualCount', () => {
      expect(data.individualCount).to.equal('individualCount');
    });

    it('sets vernacularName', () => {
      expect(data.vernacularName).to.equal('vernacularName');
    });

    it('sets organismQuantity', () => {
      expect(data.organismQuantity).to.equal('organismQuantity');
    });

    it('sets organismQuantityType', () => {
      expect(data.organismQuantityType).to.equal('organismQuantityType');
    });

    it('sets eventDate', () => {
      expect(data.eventDate).to.equal('eventDate');
    });
  });
});
