import { expect } from 'chai';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVConfig, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../utils/nested-record';
import {
  getMarkingAliasCellSetter,
  getMarkingAliasCellValidator,
  getMarkingBodyLocationCellValidator,
  getMarkingIdentifierCellValidator,
  getMarkingTypeCellValidator
} from './marking-header-configs';

describe.only('marking-header-configs', () => {
  describe('getMarkingIdentifierCellValidator', () => {
    it('should allow a string with a length between 1 and 50', () => {
      const result = getMarkingIdentifierCellValidator()({ cell: 'string' } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should allow a number with a min value of 0', () => {
      const result = getMarkingIdentifierCellValidator()({ cell: 0 } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should allow an optional cell', () => {
      const result = getMarkingIdentifierCellValidator()({ cell: undefined } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should return a single error for these values', () => {
      const badValues = ['', ' ', 'a'.repeat(51), -1];

      badValues.forEach((cell) => {
        const result = getMarkingIdentifierCellValidator()({ cell } as CSVParams);

        expect(result.length).to.deep.equal(1);
      });
    });
  });

  describe('getMarkingAliasCellValidator', () => {
    it('should only allow values that exist in the surveyAliasMap', () => {
      const surveyAliasMap: any = new Map<string, string>([['alias', 'survey']]);

      const result = getMarkingAliasCellValidator(surveyAliasMap)({ cell: 'ALIAS' } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should return a single error if does not exist in the surveyAliasMap', () => {
      const surveyAliasMap: any = new Map<string, string>([['alias', 'survey']]);

      const result = getMarkingAliasCellValidator(surveyAliasMap)({ cell: 'bad' } as CSVParams);

      expect(result.length).to.be.equal(1);
    });
  });

  describe('getMarkingAliasCellSetter', () => {
    it('should return the critter_id if the alias is found', () => {
      const surveyAliasMap = new Map<string, any>([['alias', { critter_id: 'critter_id' }]]);

      const result = getMarkingAliasCellSetter(surveyAliasMap)({ cell: 'ALIAS' } as CSVParams);

      expect(result).to.be.equal('critter_id');
    });

    it('should throw an error if the alias is not found', () => {
      const surveyAliasMap = new Map<string, any>([['alias', 'survey']]);

      expect(() => getMarkingAliasCellSetter(surveyAliasMap)({ cell: 'bad' } as CSVParams)).to.throw();
    });
  });

  describe('getMarkingTypeCellValidator', () => {
    it('should only allow values from the markingTypes set', () => {
      const markingTypes = new Set<string>(['type']);

      const result = getMarkingTypeCellValidator(markingTypes)({ cell: 'TYPE' } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should return a single error if the value is not in the markingTypes set', () => {
      const markingTypes = new Set<string>(['type']);

      const result = getMarkingTypeCellValidator(markingTypes)({ cell: 'bad' } as CSVParams);

      expect(result.length).to.be.equal(1);
    });
  });

  describe('getMarkingBodyLocationCellValidator', () => {
    it('should return no errors for valid body locations', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingBodyLocationCellValidator(
        dictionary,
        utils
      )({
        cell: 'location',
        row: { ALIAS: 'alias' },
        header: '',
        rowIndex: 0
      } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should return a single error when alias has no body locations', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingBodyLocationCellValidator(
        dictionary,
        utils
      )({
        cell: 'bad',
        row: { ALIAS: 'invalidAlias' },
        header: '',
        rowIndex: 0
      } as CSVParams);

      expect(result[0].error).to.contain('body locations not found');
    });

    it('should return a single error when invalid body location option', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingBodyLocationCellValidator(
        dictionary,
        utils
      )({
        cell: 'bad',
        row: { ALIAS: 'alias' },
        header: '',
        rowIndex: 0
      } as CSVParams);

      expect(result[0].error).to.contain('Invalid taxon body location');
    });
  });

  describe('getMarkingBodyLocationCellSetter', () => {
    it('should return the body location id if the body location is found', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingBodyLocationCellValidator(
        dictionary,
        utils
      )({
        cell: 'location',
        row: { ALIAS: 'alias' },
        header: '',
        rowIndex: 0
      } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should throw an error if the body location is not found', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      expect(() =>
        getMarkingBodyLocationCellValidator(
          dictionary,
          utils
        )({
          cell: 'bad',
          row: { ALIAS: 'alias' },
          header: '',
          rowIndex: 0
        } as CSVParams)
      ).to.throw();
    });
  });

  describe('getMarkingCaptureDateCellSetter', () => {});
});
