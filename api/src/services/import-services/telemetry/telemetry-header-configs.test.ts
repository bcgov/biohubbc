import { expect } from 'chai';
import { ExtendedDeploymentRecord } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getTelemetrySerialCellValidator, getTelemetryVendorCellValidator } from './telemetry-header-configs';

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

      const utils = {
        getCellValue: () => 'lotek'
      };

      const cellValidator = getTelemetrySerialCellValidator(deployments as ExtendedDeploymentRecord[], utils as any);

      const result = cellValidator({ cell: 5555 } as CSVParams);
      expect(result).to.deep.equal([
        {
          error: 'Device not found in deployments',
          solution: 'Check that the serial number and vendor match a deployment in the Survey'
        }
      ]);
    });

    it('should return no errors if the device is found in the survey deployments', () => {
      const deployments = [
        {
          device_key: 'lotek:1234'
        }
      ];

      const utils = {
        getCellValue: () => 'lotek'
      };

      const cellValidator = getTelemetrySerialCellValidator(deployments as ExtendedDeploymentRecord[], utils as any);

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

      const utils = {
        getCellValue: () => 'lotek'
      };

      const cellValidator = getTelemetrySerialCellValidator(deployments as ExtendedDeploymentRecord[], utils as any);

      const params = { cell: 1234, row: {} } as CSVParams;
      cellValidator(params);
      expect(params.mutateCell).to.equal(1);
    });
  });
});
