import { expect } from 'chai';
import sinon from 'sinon';
import { ExtendedDeploymentRecord } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getTelemetrySerialCellValidator, getTelemetryVendorCellValidator } from './device-header-configs';

describe('TelemetryHeaderConfigs', () => {
  describe('getTelemetryVendorCellValidator', () => {
    it('should return no errors if the vendor is supported', () => {
      const vendors = new Set(['lotek']);
      const cellValidator = getTelemetryVendorCellValidator(vendors);

      const result = cellValidator({ cell: 'lotek' } as CSVParams);
      expect(result).to.deep.equal([]);
    });

    it('should return an error if the vendor is not supported', () => {
      const vendors = new Set(['lotek']);
      const cellValidator = getTelemetryVendorCellValidator(vendors);

      const result = cellValidator({ cell: 'not-supported' } as CSVParams);
      expect(result).to.deep.equal([
        {
          error: 'Telemetry vendor not supported',
          solution: 'Use a valid telemetry vendor',
          values: ['lotek']
        }
      ]);
    });
  });

  describe('getTelemetrySerialCellValidator', () => {
    it('should return an error if the device is not found in the survey deployments', () => {
      const deployments = [
        {
          device_key: 'lotek:1234'
        }
      ];

      const surveyCritterAliasMap = new Map();

      const utils = {
        getCellValue: () => 'lotek'
      };

      const cellValidator = getTelemetrySerialCellValidator(
        deployments as ExtendedDeploymentRecord[],
        surveyCritterAliasMap,
        utils as any
      );

      const result = cellValidator({ cell: 5555 } as CSVParams);
      expect(result).to.deep.equal([
        {
          error: 'Device not found in deployments',
          solution: 'Check that the serial number and vendor match a deployment in the Survey'
        }
      ]);
    });

    it('should return an error if alias provided and does not match a deployment', () => {
      const deployments = [
        {
          device_key: 'lotek:1234',
          critterbase_critter_id: 'critter_id'
        }
      ];

      const surveyCritterAliasMap = new Map<string, any>([['alias', { critter_id: 'bad_critter_id' }]]);

      const getCellValueStub = sinon.stub();

      getCellValueStub.onCall(0).returns('lotek');
      getCellValueStub.onCall(1).returns('alias');

      const utils = {
        getCellValue: getCellValueStub
      };

      const cellValidator = getTelemetrySerialCellValidator(
        deployments as ExtendedDeploymentRecord[],
        surveyCritterAliasMap,
        utils as any
      );

      const result = cellValidator({ cell: 1234, row: { ALIAS: 'alias' } } as any);
      expect(result).to.deep.equal([
        {
          error: 'Device and alias does not match any deployments for the critter',
          solution: 'Check that the serial number, vendor and critter alias match a deployment in the Survey'
        }
      ]);
    });

    describe('matching deployments with acquisition timestamps', () => {
      it('should fail when two overlapping ambiguous timestamps (same device)', () => {
        const deployments = [
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id',
            attachment_start_timestamp: '2021-01-01 12:00:00'
          },
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id2',
            attachment_start_timestamp: '2021-01-01 12:00:00',
            attachment_end_timestamp: '2021-01-03 12:00:00'
          }
        ];

        const surveyCritterAliasMap = new Map<string, any>();

        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns('lotek');
        getCellValueStub.onCall(1).returns(undefined);

        const utils = {
          getCellValue: getCellValueStub
        };

        const cellValidator = getTelemetrySerialCellValidator(
          deployments as ExtendedDeploymentRecord[],
          surveyCritterAliasMap,
          utils as any
        );

        const result = cellValidator({ cell: 1234 } as any);
        expect(result[0].error).to.contain('uniquely identify');
      });

      it('should pass when two non-overlapping timestamps (same device)', () => {
        const deployments = [
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id',
            attachment_start_timestamp: '2021-01-01 12:00:00',
            attachment_end_timestamp: '2021-01-02 12:00:00'
          },
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id2',
            attachment_start_timestamp: '2021-01-03 12:00:00',
            attachment_end_timestamp: '2021-01-04 12:00:00'
          }
        ];

        const surveyCritterAliasMap = new Map<string, any>();

        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns('lotek');
        getCellValueStub.onCall(1).returns(undefined);
        getCellValueStub.onCall(2).returns('2021-01-03');
        getCellValueStub.onCall(3).returns('12:00:00');

        const utils = {
          getCellValue: getCellValueStub
        };

        const cellValidator = getTelemetrySerialCellValidator(
          deployments as ExtendedDeploymentRecord[],
          surveyCritterAliasMap,
          utils as any
        );

        const result = cellValidator({ cell: 1234 } as any);
        expect(result).to.deep.equal([]);
      });

      it('should pass when two overlapping ambiguous timestamps (same device) and alias pre-filters deployments', () => {
        const deployments = [
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id',
            attachment_start_timestamp: '2021-01-01 12:00:00',
            attachment_end_timestamp: '2021-01-02 12:00:00'
          },
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id2',
            attachment_start_timestamp: '2021-01-03 12:00:00',
            attachment_end_timestamp: '2021-01-04 12:00:00'
          },
          {
            device_key: 'lotek:1234',
            critterbase_critter_id: 'critter_id',
            attachment_start_timestamp: '2021-01-03 12:00:00',
            attachment_end_timestamp: '2021-01-04 12:00:00'
          }
        ];

        const surveyCritterAliasMap = new Map<string, any>([['alias', { critter_id: 'critter_id' }]]);

        const getCellValueStub = sinon.stub();

        getCellValueStub.onCall(0).returns('lotek');
        getCellValueStub.onCall(1).returns('alias');
        getCellValueStub.onCall(2).returns('2021-01-03');
        getCellValueStub.onCall(3).returns('12:00:00');

        const utils = {
          getCellValue: getCellValueStub
        };

        const cellValidator = getTelemetrySerialCellValidator(
          deployments as ExtendedDeploymentRecord[],
          surveyCritterAliasMap,
          utils as any
        );

        const result = cellValidator({ cell: 1234 } as any);
        expect(result).to.deep.equal([]);
      });
    });

    it('should return no errors if the device is found in the survey deployments', () => {
      const deployments = [
        {
          device_key: 'lotek:1234'
        }
      ];

      const surveyCritterAliasMap = new Map();

      const utils = {
        getCellValue: () => 'lotek'
      };

      const cellValidator = getTelemetrySerialCellValidator(
        deployments as ExtendedDeploymentRecord[],
        surveyCritterAliasMap,
        utils as any
      );

      const result = cellValidator({ cell: 1234 } as CSVParams);
      expect(result).to.deep.equal([]);
    });

    it('should mutate the mutateCell property to the deployment ID', () => {
      const deployments = [
        {
          device_key: 'lotek:1234',
          deployment_id: 1
        }
      ];

      const surveyCritterAliasMap = new Map();

      const utils = {
        getCellValue: () => 'lotek'
      };

      const cellValidator = getTelemetrySerialCellValidator(
        deployments as ExtendedDeploymentRecord[],
        surveyCritterAliasMap,
        utils as any
      );

      const params = { cell: 1234, row: {} } as CSVParams;
      cellValidator(params);
      expect(params.mutateCell).to.equal(1);
    });
  });
});
