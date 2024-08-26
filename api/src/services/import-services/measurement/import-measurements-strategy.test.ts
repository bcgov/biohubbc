import { expect } from 'chai';
import sinon from 'sinon';
import { getMockDBConnection } from '../../../__mocks__/db';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../../critterbase-service';
import { ImportMeasurementsStrategy } from './import-measurements-strategy';

describe.only('importMeasurementsStrategy', () => {
  describe('_getTsnsMeasurementMap', () => {
    it('should return correct taxon measurement mapping', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const getTaxonMeasurementsStub = sinon.stub(
        strategy.surveyCritterService.critterbaseService,
        'getTaxonMeasurements'
      );

      const measurementA: any = { qualitative: [{ tsn: 'tsn1', measurement: 'measurement1' }], quantitative: [] };
      const measurementB: any = { quantitative: [{ tsn: 'tsn2', measurement: 'measurement2', qualitative: [] }] };

      getTaxonMeasurementsStub.onCall(0).resolves(measurementA);

      getTaxonMeasurementsStub.onCall(1).resolves(measurementB);

      const tsns = ['tsn1', 'tsn2', 'tsn2'];

      const result = await strategy._getTsnsMeasurementMap(tsns);

      const expectedResult = new Map([
        ['tsn1', measurementA],
        ['tsn2', measurementB]
      ]);

      expect(result).to.be.deep.equal(expectedResult);
    });
  });

  describe('_getRowMeta', () => {
    it('should return correct row meta', () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const row = { ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10' };
      const critterAliasMap = new Map([
        [
          'alias',
          {
            critter_id: 'A',
            animal_id: 'alias',
            itis_tsn: 'tsn1',
            captures: [{ capture_id: 'B', capture_date: '10/10/2024', capture_time: '10:10:10' }]
          } as any
        ]
      ]);

      const result = strategy._getRowMeta(row, critterAliasMap);

      expect(result).to.be.deep.equal({ critter_id: 'A', tsn: 'tsn1', capture_id: 'B' });
    });

    it('should return all undefined properties if unable to match critter', () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const row = { ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10' };
      const critterAliasMap = new Map([
        [
          'alias2',
          {
            critter_id: 'A',
            animal_id: 'alias2',
            itis_tsn: 'tsn1',
            captures: [{ capture_id: 'B', capture_date: '10/10/2024', capture_time: '10:10:10' }]
          } as any
        ]
      ]);

      const result = strategy._getRowMeta(row, critterAliasMap);

      expect(result).to.be.deep.equal({ critter_id: undefined, tsn: undefined, capture_id: undefined });
    });

    it('should undefined capture_id if unable to match timestamps', () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const row = { ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10' };
      const critterAliasMap = new Map([
        [
          'alias',
          {
            critter_id: 'A',
            animal_id: 'alias',
            itis_tsn: 'tsn1',
            captures: [{ capture_id: 'B', capture_date: '11/11/2024', capture_time: '10:10:10' }]
          } as any
        ]
      ]);

      const result = strategy._getRowMeta(row, critterAliasMap);

      expect(result).to.be.deep.equal({ critter_id: 'A', tsn: 'tsn1', capture_id: undefined });
    });
  });

  describe('_validateQualitativeMeasurementCell', () => {
    it('should return option_id when valid', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: 'A',
        measurement_name: 'measurement',
        measurement_desc: null,
        options: [{ qualitative_option_id: 'C', option_label: 'measurement', option_value: 0, option_desc: 'desc' }]
      };

      const result = strategy._validateQualitativeMeasurementCell('measurement', measurement);

      expect(result.error).to.be.undefined;
      expect(result.optionId).to.be.equal('C');
    });

    it('should return error when invalid value', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: 'A',
        measurement_name: 'measurement',
        measurement_desc: null,
        options: [{ qualitative_option_id: 'C', option_label: 'measurement', option_value: 0, option_desc: 'desc' }]
      };

      const result = strategy._validateQualitativeMeasurementCell('bad', measurement);

      expect(result.error).to.exist;
      expect(result.optionId).to.be.undefined;
    });
  });

  describe('_validateQuantitativeMeasurementCell', () => {
    it('should return value when valid', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const measurement: CBQuantitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: 'A',
        measurement_name: 'measurement',
        unit: 'centimeter',
        min_value: 0,
        max_value: 10,
        measurement_desc: null
      };

      const resultA = strategy._validateQuantitativeMeasurementCell(0, measurement);

      expect(resultA.error).to.be.undefined;
      expect(resultA.value).to.be.equal(0);

      const resultB = strategy._validateQuantitativeMeasurementCell(10, measurement);

      expect(resultB.error).to.be.undefined;
      expect(resultB.value).to.be.equal(10);
    });

    it('should return error when invalid value', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const measurement: CBQuantitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: 'A',
        measurement_name: 'measurement',
        unit: 'centimeter',
        min_value: 0,
        max_value: 10,
        measurement_desc: null
      };

      const resultA = strategy._validateQuantitativeMeasurementCell(-1, measurement);

      expect(resultA.error).to.exist;
      expect(resultA.value).to.be.undefined;

      const resultB = strategy._validateQuantitativeMeasurementCell(11, measurement);

      expect(resultB.error).to.exist;
      expect(resultB.value).to.be.undefined;
    });
  });

  describe('_validateMeasurementCell', () => {
    const critterAliasMap = new Map([
      [
        'alias',
        {
          critter_id: 'A',
          animal_id: 'alias',
          itis_tsn: 'tsn1',
          captures: [{ capture_id: 'B', capture_date: '10/10/2024', capture_time: '10:10:10' }]
        } as any
      ]
    ]);

    it('should return no errors and data when valid rows', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');
      const validateQualitativeMeasurementCellStub = sinon.stub(strategy, '_validateQualitativeMeasurementCell');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: 'tsn1', capture_id: 'B' });
      getTsnMeasurementMapStub.resolves(
        new Map([
          [
            'tsn1',
            { qualitative: [{ taxon_measurement_id: 'Z', measurement_name: 'measurement' }], quantitative: [] } as any
          ]
        ])
      );
      validateQualitativeMeasurementCellStub.returns({ error: undefined, optionId: 'C' });

      const rows = [{ ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10', measurement: 'length' }];

      const result = await strategy.validateRows(rows, {});

      if (!result.success) {
        expect.fail();
      } else {
        expect(result.data).to.be.deep.equal([
          { critter_id: 'A', capture_id: 'B', taxon_measurement_id: 'Z', qualitative_option_id: 'C' }
        ]);
      }
    });

    it('should return errors when unable to map alias to critter', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');
      const validateQualitativeMeasurementCellStub = sinon.stub(strategy, '_validateQualitativeMeasurementCell');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: undefined, tsn: undefined, capture_id: undefined });
      getTsnMeasurementMapStub.resolves(
        new Map([
          [
            'tsn1',
            { qualitative: [{ taxon_measurement_id: 'Z', measurement_name: 'measurement' }], quantitative: [] } as any
          ]
        ])
      );
      validateQualitativeMeasurementCellStub.returns({ error: undefined, optionId: 'C' });

      const rows = [{ ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10', measurement: 'length' }];

      const result = await strategy.validateRows(rows, {});

      if (!result.success) {
        expect(result.error.issues).to.be.deep.equal([
          { row: 0, message: 'Unable to find matching Critter with alias.' }
        ]);
      } else {
        expect.fail();
      }
    });
  });
});
