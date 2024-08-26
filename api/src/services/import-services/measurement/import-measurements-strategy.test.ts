import { expect } from 'chai';
import sinon from 'sinon';
import { MediaFile } from '../../../utils/media/media-file';
import * as worksheetUtils from '../../../utils/xlsx-utils/worksheet-utils';
import { getMockDBConnection } from '../../../__mocks__/db';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  IBulkCreateResponse
} from '../../critterbase-service';
import { importCSV } from '../import-csv';
import { ImportMeasurementsStrategy } from './import-measurements-strategy';

describe('importMeasurementsStrategy', () => {
  describe('importCSV', () => {
    beforeEach(() => {
      sinon.restore();
    });

    it('should import the csv file correctly', async () => {
      const worksheet = {
        A1: { t: 's', v: 'ALIAS' },
        B1: { t: 's', v: 'CAPTURE_DATE' },
        C1: { t: 's', v: 'CAPTURE_TIME' },
        D1: { t: 's', v: 'tail length' },
        E1: { t: 's', v: 'skull condition' },
        F1: { t: 's', v: 'unknown' },
        A2: { t: 's', v: 'carl' },
        B2: { z: 'm/d/yy', t: 'd', v: '2024-10-10T07:00:00.000Z', w: '10/10/24' },
        C2: { t: 's', v: '10:10:12' },
        D2: { t: 'n', w: '2', v: 2 },
        E2: { t: 'n', w: '0', v: 'good' },
        A3: { t: 's', v: 'carlita' },
        B3: { z: 'm/d/yy', t: 'd', v: '2024-10-10T07:00:00.000Z', w: '10/10/24' },
        C3: { t: 's', v: '10:10:12' },
        D3: { t: 'n', w: '2', v: 2 },
        E3: { t: 'n', w: '0', v: 'good' },
        '!ref': 'A1:F3'
      };

      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const getDefaultWorksheetStub = sinon.stub(worksheetUtils, 'getDefaultWorksheet');
      const critterbaseInsertStub = sinon.stub(strategy.surveyCritterService.critterbaseService, 'bulkCreate');
      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');

      const critterAliasMap = new Map([
        [
          'carl',
          {
            critter_id: 'A',
            animal_id: 'carl',
            itis_tsn: 'tsn1',
            captures: [{ capture_id: 'B', capture_date: '10/10/2024', capture_time: '10:10:12' }]
          } as any
        ],
        [
          'carlita',
          {
            critter_id: 'B',
            animal_id: 'carlita',
            itis_tsn: 'tsn2',
            captures: [{ capture_id: 'B', capture_date: '10/10/2024', capture_time: '10:10:12' }]
          } as any
        ]
      ]);

      getDefaultWorksheetStub.returns(worksheet);
      nonStandardColumnsStub.returns(['TAIL LENGTH', 'SKULL CONDITION']);
      critterAliasMapStub.resolves(critterAliasMap);
      critterbaseInsertStub.resolves({
        created: { qualitative_measurements: 1, quantitative_measurements: 1 }
      } as IBulkCreateResponse);
      getTsnMeasurementMapStub.resolves(
        new Map([
          [
            'tsn1',
            {
              qualitative: [
                {
                  taxon_measurement_id: 'Z',
                  measurement_name: 'skull condition',
                  options: [{ qualitative_option_id: 'C', option_label: 'good' }]
                }
              ],
              quantitative: [
                { taxon_measurement_id: 'Z', measurement_name: 'tail length', min_value: 0, max_value: 10 }
              ]
            } as any
          ],
          [
            'tsn2',
            {
              qualitative: [
                {
                  taxon_measurement_id: 'Z',
                  measurement_name: 'skull condition',

                  options: [{ qualitative_option_id: 'C', option_label: 'good' }]
                }
              ],
              quantitative: [
                { taxon_measurement_id: 'Z', measurement_name: 'tail length', min_value: 0, max_value: 10 }
              ]
            } as any
          ]
        ])
      );

      try {
        const data = await importCSV(new MediaFile('test', 'test', 'test' as unknown as Buffer), strategy);
        expect(data).to.be.eql(2);
        expect(critterbaseInsertStub).to.have.been.calledOnceWithExactly({
          qualitative_measurements: [
            {
              critter_id: 'A',
              capture_id: 'B',
              taxon_measurement_id: 'Z',
              qualitative_option_id: 'C'
            },
            {
              critter_id: 'B',
              capture_id: 'B',
              taxon_measurement_id: 'Z',
              qualitative_option_id: 'C'
            }
          ],
          quantitative_measurements: [
            {
              critter_id: 'A',
              capture_id: 'B',
              taxon_measurement_id: 'Z',
              value: 2
            },
            {
              critter_id: 'B',
              capture_id: 'B',
              taxon_measurement_id: 'Z',
              value: 2
            }
          ]
        });
      } catch (e: any) {
        expect.fail();
      }
    });
  });
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

    it('should return error when unable to map alias to critter', async () => {
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

    it('should return error when unable to map capture to critter', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');
      const validateQualitativeMeasurementCellStub = sinon.stub(strategy, '_validateQualitativeMeasurementCell');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: 'tsn1', capture_id: undefined });
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
          { row: 0, message: 'Unable to find matching Capture with date and time.' }
        ]);
      } else {
        expect.fail();
      }
    });

    it('should return error when unable to map tsn to critter', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');
      const validateQualitativeMeasurementCellStub = sinon.stub(strategy, '_validateQualitativeMeasurementCell');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: undefined, capture_id: 'C' });
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
        expect(result.error.issues).to.be.deep.equal([{ row: 0, message: 'Unable to find ITIS TSN for Critter.' }]);
      } else {
        expect.fail();
      }
    });

    it('should return error when qualitative measurement validation fails', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');
      const validateQualitativeMeasurementCellStub = sinon.stub(strategy, '_validateQualitativeMeasurementCell');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: 'tsn1', capture_id: 'C' });
      getTsnMeasurementMapStub.resolves(
        new Map([
          [
            'tsn1',
            { qualitative: [{ taxon_measurement_id: 'Z', measurement_name: 'measurement' }], quantitative: [] } as any
          ]
        ])
      );
      validateQualitativeMeasurementCellStub.returns({ error: 'qualitative failed', optionId: undefined });

      const rows = [{ ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10', measurement: 'length' }];

      const result = await strategy.validateRows(rows, {});

      if (!result.success) {
        expect(result.error.issues).to.be.deep.equal([{ row: 0, col: 'MEASUREMENT', message: 'qualitative failed' }]);
      } else {
        expect.fail();
      }
    });

    it('should return error when quantitative measurement validation fails', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');
      const validateQuantitativeMeasurementCellStub = sinon.stub(strategy, '_validateQuantitativeMeasurementCell');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: 'tsn1', capture_id: 'C' });
      getTsnMeasurementMapStub.resolves(
        new Map([
          [
            'tsn1',
            { quantitative: [{ taxon_measurement_id: 'Z', measurement_name: 'measurement' }], qualitative: [] } as any
          ]
        ])
      );
      validateQuantitativeMeasurementCellStub.returns({ error: 'quantitative failed', value: undefined });

      const rows = [{ ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10', measurement: 'length' }];

      const result = await strategy.validateRows(rows, {});

      if (!result.success) {
        expect(result.error.issues).to.be.deep.equal([{ row: 0, col: 'MEASUREMENT', message: 'quantitative failed' }]);
      } else {
        expect.fail();
      }
    });

    it('should return error when no measurements exist for taxon', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: 'tsn1', capture_id: 'C' });
      getTsnMeasurementMapStub.resolves(new Map([['tsn1', { quantitative: [], qualitative: [] } as any]]));

      const rows = [{ ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10', measurement: 'length' }];

      const result = await strategy.validateRows(rows, {});

      if (!result.success) {
        expect(result.error.issues).to.be.deep.equal([
          { row: 0, col: 'MEASUREMENT', message: 'No measurements exist for this taxon.' }
        ]);
      } else {
        expect.fail();
      }
    });

    it('should return error when no measurements exist for taxon', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const nonStandardColumnsStub = sinon.stub(strategy, '_getNonStandardColumns');
      const critterAliasMapStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterAliasMap');
      const getRowMetaStub = sinon.stub(strategy, '_getRowMeta');
      const getTsnMeasurementMapStub = sinon.stub(strategy, '_getTsnsMeasurementMap');

      nonStandardColumnsStub.returns(['MEASUREMENT']);
      critterAliasMapStub.resolves(critterAliasMap);
      getRowMetaStub.returns({ critter_id: 'A', tsn: 'tsn1', capture_id: 'C' });
      getTsnMeasurementMapStub.resolves(
        new Map([
          [
            'tsn1',
            { quantitative: [{ measurement_name: 'notfound' }], qualitative: [{ measurement_name: 'notfound' }] } as any
          ]
        ])
      );

      const rows = [{ ALIAS: 'alias', CAPTURE_DATE: '10/10/2024', CAPTURE_TIME: '10:10:10', measurement: 'length' }];

      const result = await strategy.validateRows(rows, {});

      if (!result.success) {
        expect(result.error.issues).to.be.deep.equal([
          { row: 0, col: 'MEASUREMENT', message: 'Unable to match column name to an existing measurement.' }
        ]);
      } else {
        expect.fail();
      }
    });
  });
  describe('insert', () => {
    it('should correctly format the insert payload for critterbase bulk insert', async () => {
      const conn = getMockDBConnection();
      const strategy = new ImportMeasurementsStrategy(conn, 1);

      const rows = [
        { critter_id: 'A', capture_id: 'B', taxon_measurement_id: 'C', qualitative_option_id: 'D' },
        { critter_id: 'E', capture_id: 'F', taxon_measurement_id: 'G', qualitative_option_id: 'H' }
      ];

      const result = strategy.insert(rows);

      expect(result).to.be.deep.equal([
        {
          critter_id: 'A',
          capture_id: 'B',
          taxon_measurement_id: 'C',
          qualitative_option_id: 'D',
          survey_id: 1
        }
      ]);
    });
  });
});
