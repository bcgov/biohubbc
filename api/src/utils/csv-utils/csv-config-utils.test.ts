import { expect } from 'chai';
import xlsx, { WorkSheet } from 'xlsx';
import { WorksheetRowIndexSymbol } from '../xlsx-utils/worksheet-utils';
import { CSVConfigUtils } from './csv-config-utils';
import { CSVConfig } from './csv-config-validation.interface';

describe('CSVConfigUtils', () => {
  describe('init', () => {
    it('should initialize the CSVConfigUtils', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { TEST: 'cellValue', ALIASED_HEADER: 'cellValue2', DYNAMIC_HEADER: 'dynamicValue' }
      ]);
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] },
          TEST_ALIAS: { aliases: ['ALIASED_HEADER'] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      expect(utils).to.be.instanceOf(CSVConfigUtils);
      expect(utils.config).to.be.equal(mockConfig);
      expect(utils.worksheet).to.be.equal(worksheet);

      expect(utils.worksheetRows[0]).to.deep.equal({
        TEST: 'cellValue',
        ALIASED_HEADER: 'cellValue2',
        DYNAMIC_HEADER: 'dynamicValue',
        [WorksheetRowIndexSymbol]: 1
      });
      expect(utils.worksheetHeaders).to.be.deep.equal(['TEST', 'ALIASED_HEADER', 'DYNAMIC_HEADER']);
      expect(utils.worksheetAliasedStaticHeaders).to.be.deep.equal(['TEST', 'ALIASED_HEADER']);
      expect(utils.worksheetStaticHeaders).to.be.deep.equal(['TEST', 'TEST_ALIAS']);
      expect(utils.worksheetDynamicHeaders).to.be.deep.equal(['DYNAMIC_HEADER']);
    });
  });

  describe('getCellValue', () => {
    it('should get the cell value from a CSV row', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' }]);
      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValue = utils.getCellValue('TEST', { TEST: 'cellValue' });

      expect(cellValue).to.be.equal('cellValue');
    });

    it('should return undefined if the header does not exist', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' }]);
      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValue = utils.getCellValue('UNKNOWN' as any, { TEST: 'cellValue' });

      expect(cellValue).to.be.equal(undefined);
    });

    it('should get the cell value by the alias', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST_ALIAS: 'cellValue' }]);
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          TEST: { aliases: ['OTHER_ALIAS', 'TEST_ALIAS'] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValue = utils.getCellValue('TEST', { TEST_ALIAS: 'cellValue' });

      expect(cellValue).to.be.equal('cellValue');
    });

    it('should return undefined for a bad header / alias', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST_ALIAS: 'cellValue' }]);
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          TEST: { aliases: ['OTHER_ALIAS'] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValue = utils.getCellValue('NOT_FOUND', { TEST_ALIAS: 'cellValue' });

      expect(cellValue).to.be.equal(undefined);
    });
  });

  describe('getCellValues', () => {
    it('should get the cell values from a CSV row', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' }]);
      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValues = utils.getCellValues('TEST');

      expect(cellValues).to.be.deep.equal(['cellValue']);
    });

    it('should get the cell values from a CSV row when using alias', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { TEST_ALIAS: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' }
      ]);

      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          TEST: { aliases: ['TEST_ALIAS'] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValues = utils.getCellValues('TEST');

      expect(cellValues).to.be.deep.equal(['cellValue']);
    });
  });

  describe('getUniqueCellValues', () => {
    it('should get the unique cell values from a CSV row', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' },
        { TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' },
        { TEST: 'cellValue2', DYNAMIC_HEADER: 'dynamicValue' }
      ]);

      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const cellValues = utils.getUniqueCellValues('TEST');

      expect(cellValues).to.be.deep.equal(['cellValue', 'cellValue2']);
    });
  });

  describe('isCellUnique', () => {
    it('should return true if the cell is unique', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' },
        { TEST: 'cellValue2', DYNAMIC_HEADER: 'dynamicValue' }
      ]);

      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const isUnique = utils.isCellUnique('TEST', 'cellValue');

      expect(isUnique).to.be.true;
    });

    it('should return false if the cell is not unique', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([
        { TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' },
        { TEST: 'cellValue', DYNAMIC_HEADER: 'dynamicValue' }
      ]);

      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const isUnique = utils.isCellUnique('TEST', 'cellValue');

      expect(isUnique).to.be.false;
    });
  });

  describe('setAllStaticHeaderConfigs', () => {
    it('should set all static header configs', () => {
      const worksheet: WorkSheet = xlsx.utils.json_to_sheet([{ TEST: 'cellValue' }]);
      const mockConfig: CSVConfig<'TEST'> = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils(worksheet, mockConfig);

      const validateCell = () => [];
      const setCellValue = () => 'test';

      utils.setAllStaticHeaderConfigs({
        TEST: { validateCell, setCellValue }
      });

      expect(utils.config).to.be.deep.equal({
        staticHeadersConfig: {
          TEST: { aliases: [], validateCell, setCellValue }
        },
        ignoreDynamicHeaders: false
      });
    });
  });

  describe('getWorksheetHeader', () => {
    it('should get the worksheet static header', () => {
      const mockConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils({}, mockConfig);

      const header = utils.getWorksheetHeader('TEST', { TEST: 'cellValue' });

      expect(header).to.be.equal('TEST');
    });

    it('should get the worksheet header alias', () => {
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          TEST: { aliases: ['OTHER'] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils({}, mockConfig);

      const header = utils.getWorksheetHeader('TEST', { OTHER: 'cellValue' });

      expect(header).to.be.equal('OTHER');
    });

    it('should return undefined if header not found', () => {
      const mockConfig: CSVConfig = {
        staticHeadersConfig: {
          TEST: { aliases: [] }
        },
        ignoreDynamicHeaders: false
      };

      const utils = new CSVConfigUtils({}, mockConfig);

      const header = utils.getWorksheetHeader('BAD', { TEST: 'cellValue' });

      expect(header).to.be.null;
    });
  });
});
