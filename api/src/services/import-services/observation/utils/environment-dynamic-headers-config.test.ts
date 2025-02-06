import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CSVRowState } from '../../../../utils/csv-utils/csv-config-validation.interface';
import * as environment from './environment-dynamic-headers-config';

chai.use(sinonChai);

describe('environment-dynamic-headers-config', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('getDynamicEnvironmentCellValidator', () => {
    it('should return an empty array when the cell is undefined', () => {
      const environmentMap = new Map();
      const validator = environment.getDynamicEnvironmentCellValidator(environmentMap);

      const result = validator({ cell: undefined } as any);
      expect(result).to.be.deep.equal([]);
    });

    it('should return an error when the column header does not exist', () => {
      const environmentMap = new Map();
      const validator = environment.getDynamicEnvironmentCellValidator(environmentMap);

      const result = validator({ cell: 'test', header: 'bad' } as any);
      expect(result[0].error).to.contain("'bad' does not exist");
    });

    it('should call the qualitative environment cell validator when the environment is qualitative', () => {
      const environmentMap = new Map();
      const environmentData = {
        environment_qualitative_id: true,
        options: []
      };

      environmentMap.set('header', environmentData);

      const validateQualitativeStub = sinon.stub(environment, 'validateQualitativeEnvironmentCell').returns([]);

      const validator = environment.getDynamicEnvironmentCellValidator(environmentMap);

      expect(validateQualitativeStub).to.not.have.been.calledOnce;

      const result = validator({ cell: 'test', header: 'header' } as any);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should call the quantitative environment cell validator when the environment is quantitative', () => {
      const environmentMap = new Map();
      const environmentData = {
        environment_quantitative_id: true,
        unit: true
      };

      environmentMap.set('header', environmentData);

      const validateQuantitativeStub = sinon.stub(environment, 'validateQuantitativeEnvironmentCell').returns([]);

      const validator = environment.getDynamicEnvironmentCellValidator(environmentMap);

      expect(validateQuantitativeStub).to.not.have.been.calledOnce;

      const result = validator({ cell: 'test', header: 'header' } as any);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when the environment type is invalid', () => {
      const environmentMap = new Map();
      const environmentData = {
        invalid: true
      };

      environmentMap.set('header', environmentData);

      const validator = environment.getDynamicEnvironmentCellValidator(environmentMap);

      const result = validator({ cell: 'test', header: 'header' } as any);
      expect(result[0].error.toLowerCase()).to.contain('invalid environment type');
    });
  });

  describe('validateQualitativeEnvironmentCell', () => {
    it('should validate the qualitative environment cell value', () => {
      const params = {
        cell: 'good',
        header: 'header',
        row: {}
      } as any;

      const environmentData = {
        options: [
          {
            environment_qualitative_option_id: 'id',
            name: 'good'
          }
        ]
      } as any;

      const result = environment.validateQualitativeEnvironmentCell(params, environmentData);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when the qualitative value is invalid', () => {
      const params = {
        cell: 'bad',
        header: 'header',
        row: {}
      } as any;

      const environmentData = {
        options: [
          {
            environment_qualitative_option_id: 'id',
            name: 'good'
          }
        ]
      } as any;

      const result = environment.validateQualitativeEnvironmentCell(params, environmentData);
      expect(result[0].error.length).to.be.greaterThan(0);
    });

    it('should update the row state with the environment qualitative option id', () => {
      const params = {
        cell: 'good',
        header: 'header',
        row: {}
      } as any;

      const environmentData = {
        environment_qualitative_id: 'id',
        options: [
          {
            environment_qualitative_option_id: 'id',
            name: 'good'
          }
        ]
      } as any;

      environment.validateQualitativeEnvironmentCell(params, environmentData);
      expect(params.row[CSVRowState].header).to.deep.equal({
        environment_qualitative_id: environmentData.environment_qualitative_id,
        environment_qualitative_option_id: environmentData.options[0].environment_qualitative_option_id
      });
    });
  });

  describe('validateQuantitativeEnvironmentCell', () => {
    it('should validate the quantitative environment cell value', () => {
      const params = {
        cell: 1,
        header: 'header',
        row: {}
      } as any;

      const environmentData = {
        environment_quantitative_id: 'id',
        unit: 'unit'
      } as any;

      const result = environment.validateQuantitativeEnvironmentCell(params, environmentData);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when the quantitative value is invalid', () => {
      const params = {
        cell: 'bad',
        header: 'header',
        row: {}
      } as any;

      const environmentData = {
        environment_quantitative_id: 'id',
        unit: 'unit'
      } as any;

      const result = environment.validateQuantitativeEnvironmentCell(params, environmentData);
      expect(result[0].error.length).to.be.greaterThan(0);
    });

    it('should update the row state with the environment quantitative value', () => {
      const params = {
        cell: 1,
        header: 'header',
        row: {}
      } as any;

      const environmentData = {
        environment_quantitative_id: 'id',
        unit: 'unit'
      } as any;

      environment.validateQuantitativeEnvironmentCell(params, environmentData);
      expect(params.row[CSVRowState].header).to.deep.equal({
        environment_quantitative_id: environmentData.environment_quantitative_id,
        value: params.cell
      });
    });
  });
});
