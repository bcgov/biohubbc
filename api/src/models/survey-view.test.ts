import { expect } from 'chai';
import { describe } from 'mocha';
import { GetSurveyProprietorData } from './survey-view';

describe('GetSurveyProprietorData', () => {
  describe('No values provided', () => {
    let data: GetSurveyProprietorData;

    before(() => {
      data = new GetSurveyProprietorData(null);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal('');
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal('');
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal('');
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal('');
    });

    it('sets data_sharing_agreement_required', () => {
      expect(data.data_sharing_agreement_required).to.equal('false');
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyProprietorData;

    const proprietorData = {
      proprietor_type_name: 'type',
      first_nations_name: 'fn name',
      rationale: 'rationale',
      proprietor_name: 'name',
      data_sharing_agreement_required: true
    };

    before(() => {
      data = new GetSurveyProprietorData(proprietorData);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal(proprietorData.proprietor_type_name);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(proprietorData.first_nations_name);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(proprietorData.rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(proprietorData.proprietor_name);
    });

    it('sets data_sharing_agreement_required', () => {
      expect(data.data_sharing_agreement_required).to.equal('true');
    });
  });
});
