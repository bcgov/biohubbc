import { expect } from 'chai';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVConfig, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../utils/nested-record';
import {
  getMarkingAliasCellValidator,
  getMarkingBodyLocationCellValidator,
  getMarkingCaptureDateCellValidator,
  getMarkingColourCellValidator,
  getMarkingIdentifierCellValidator,
  getMarkingTypeCellValidator
} from './marking-header-configs';

describe('marking-header-configs', () => {
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
      const surveyAliasMap: any = new Map<string, string>([['alias', { captures: [{ capture_id: 'uuid' }] } as any]]);

      const result = getMarkingAliasCellValidator(surveyAliasMap)({ cell: 'ALIAS' } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should update the mutateCell value to the critter_id', () => {
      const surveyAliasMap = new Map([['alias', { critter_id: 'critter', captures: [{ capture_id: 'uuid' }] } as any]]);

      const params = { cell: 'ALIAS', mutateCell: 'ALIAS' } as CSVParams;

      const result = getMarkingAliasCellValidator(surveyAliasMap)(params);

      expect(params.mutateCell).to.deep.equal('critter');
      expect(result.length).to.deep.equal(0);
    });

    it('should return a single error if does not exist in the surveyAliasMap', () => {
      const surveyAliasMap: any = new Map<string, string>([['alias', 'survey']]);

      const result = getMarkingAliasCellValidator(surveyAliasMap)({ cell: 'bad' } as CSVParams);

      expect(result[0].error).to.contain('find a matching survey critter');
    });

    it('should return a error if the critter has no captures', () => {
      const surveyAliasMap: any = new Map<string, string>([['alias', { captures: [] } as any]]);

      const result = getMarkingAliasCellValidator(surveyAliasMap)({ cell: 'alias' } as CSVParams);

      expect(result[0].error).to.contain('no captures');
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
        mutateCell: 'body_location_id',
        cell: 'location',
        row: { ALIAS: 'alias' },
        header: '',
        rowIndex: 0
      } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should update the mutateCell value to the body_location_id', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      const params = {
        mutateCell: 'body_location_id',
        cell: 'location',
        row: { ALIAS: 'alias' },
        header: '',
        rowIndex: 0
      } as CSVParams;

      const result = getMarkingBodyLocationCellValidator(dictionary, utils)(params);

      expect(params.mutateCell).to.deep.equal('uuid');
      expect(result.length).to.deep.equal(0);
    });

    it('should return a single error when alias has no body locations', () => {
      const dictionary = new NestedRecord({ alias: { location: 'uuid' } });
      const mockConfig: CSVConfig = { staticHeadersConfig: { ALIAS: { aliases: [] } }, ignoreDynamicHeaders: true };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingBodyLocationCellValidator(
        dictionary,
        utils
      )({
        mutateCell: 'body_location_id',
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
        mutateCell: 'body_location_id',
        cell: 'bad',
        row: { ALIAS: 'alias' },
        header: '',
        rowIndex: 0
      } as CSVParams);

      expect(result[0].error).to.contain('Invalid taxon marking body location');
    });
  });

  describe('getMarkingColourCellValidator', () => {
    it('should return no errors for valid colours', () => {
      const colours = new Set<string>(['colour']);

      const result = getMarkingColourCellValidator(colours)({ cell: 'COLOUR' } as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should return a single error if the value is not in the colours set', () => {
      const colours = new Set<string>(['colour']);

      const result = getMarkingColourCellValidator(colours)({ cell: 'bad' } as CSVParams);

      expect(result.length).to.be.equal(1);
    });
  });

  describe('getMarkingCaptureDateCellValidator', () => {
    it('should return no errors when alias does not map to survey aliases', () => {
      const surveyAliasMap: any = new Map<string, string>([['alias', { captures: [{ capture_id: 'uuid' }] } as any]]);
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: { aliases: [] },
          CAPTURE_DATE: { aliases: [] },
          CAPTURE_TIME: { aliases: [] }
        },
        ignoreDynamicHeaders: true
      };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingCaptureDateCellValidator(
        surveyAliasMap,
        utils
      )({ cell: '2024-01-01', row: { ALIAS: 'bad', CAPTURE_TIME: '20:20:10' } } as unknown as CSVParams);

      expect(result).to.deep.equal([]);
    });

    it('should update the mutateCell value to the capture_id', () => {
      const surveyAliasMap: any = new Map<string, string>([
        ['alias', { captures: [{ capture_id: 'uuid', capture_date: '2021-01-01' }] } as any]
      ]);
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: { aliases: [] },
          CAPTURE_DATE: { aliases: [] },
          CAPTURE_TIME: { aliases: [] }
        },
        ignoreDynamicHeaders: true
      };
      const utils = new CSVConfigUtils({}, mockConfig);

      const params = { cell: '2021-01-01', row: { ALIAS: 'alias' } } as unknown as CSVParams;

      const result = getMarkingCaptureDateCellValidator(surveyAliasMap, utils)(params);

      expect(params.mutateCell).to.deep.equal('uuid');
      expect(result.length).to.deep.equal(0);
    });

    it('should return error when capture not found for critter', () => {
      const surveyAliasMap: any = new Map<string, string>([
        ['alias', { captures: [{ capture_id: 'uuid', capture_date: '2021-01-01' }] } as any]
      ]);
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: { aliases: [] },
          CAPTURE_DATE: { aliases: [] },
          CAPTURE_TIME: { aliases: [] }
        },
        ignoreDynamicHeaders: true
      };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingCaptureDateCellValidator(
        surveyAliasMap,
        utils
      )({ cell: '2024-01-01', row: { ALIAS: 'alias', CAPTURE_TIME: '20:20:10' } } as unknown as CSVParams);

      expect(result[0].error).to.contain('not found');
    });

    it('should return error when multiple captures found for critter', () => {
      const surveyAliasMap: any = new Map<string, string>([
        [
          'alias',
          {
            captures: [
              { capture_id: 'uuid', capture_date: '2021-01-01' },
              { capture_id: 'uuid2', capture_date: '2021-01-01' }
            ]
          } as any
        ]
      ]);

      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          ALIAS: { aliases: [] },
          CAPTURE_DATE: { aliases: [] },
          CAPTURE_TIME: { aliases: [] }
        },
        ignoreDynamicHeaders: true
      };
      const utils = new CSVConfigUtils({}, mockConfig);

      const result = getMarkingCaptureDateCellValidator(
        surveyAliasMap,
        utils
      )({ cell: '2021-01-01', row: { ALIAS: 'alias' } } as unknown as CSVParams);

      expect(result[0].error).to.contain('ultiple captures found');
    });
  });
});
