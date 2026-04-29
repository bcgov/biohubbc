import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CSVRowState } from '../../../../utils/csv-utils/csv-config-validation.interface';
import {
  habitatFeatureDynamicHeaderDependencies as dynamicHeadersConfig,
  getDynamicHabitatFeatureAttributeCellValidator
} from './habitat-feature-attribute-dynamic-headers-config';

chai.use(sinonChai);

describe('habitat-feature-attribute-dynamic-headers-config', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('getDynamicHabitatFeatureAttributeCellValidator', () => {
    it('should return an empty array when the cell is undefined', () => {
      const habitatFeatureDefinitionMap = new Map();
      const validator = getDynamicHabitatFeatureAttributeCellValidator(habitatFeatureDefinitionMap);

      const result = validator({ cell: undefined } as any);
      expect(result).to.be.deep.equal([]);
    });

    it('should return an error when the column header does not exist', () => {
      const habitatFeatureDefinitionMap = new Map();
      const validator = getDynamicHabitatFeatureAttributeCellValidator(habitatFeatureDefinitionMap);

      const result = validator({ cell: 'test', header: 'bad' } as any);
      expect(result[0].error).to.contain("'bad' does not exist");
    });

    it('should call the qualitative cell validator when the attribute is qualitative', () => {
      const habitatFeatureDefinitionMap = new Map();
      const habitatFeatureAttributeData = {
        habitat_feature_qualitative_definition_id: true,
        options: []
      };

      habitatFeatureDefinitionMap.set('header', habitatFeatureAttributeData);

      const validateQualitativeStub = sinon
        .stub(dynamicHeadersConfig, 'validateQualitativeHabitatFeatureAttributeCell')
        .returns([]);

      const validator = getDynamicHabitatFeatureAttributeCellValidator(habitatFeatureDefinitionMap);

      expect(validateQualitativeStub).to.not.have.been.calledOnce;

      const result = validator({ cell: 'test', header: 'header' } as any);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should call the quantitative cell validator when the attribute is quantitative', () => {
      const habitatFeatureDefinitionMap = new Map();
      const habitatFeatureAttributeData = {
        habitat_feature_quantitative_definition_id: true,
        unit: true
      };

      habitatFeatureDefinitionMap.set('header', habitatFeatureAttributeData);

      const validateQuantitativeStub = sinon
        .stub(dynamicHeadersConfig, 'validateQuantitativeHabitatFeatureAttributeCell')
        .returns([]);

      const validator = getDynamicHabitatFeatureAttributeCellValidator(habitatFeatureDefinitionMap);

      expect(validateQuantitativeStub).to.not.have.been.calledOnce;

      const result = validator({ cell: 'test', header: 'header' } as any);
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when the attribute type is invalid', () => {
      const habitatFeatureDefinitionMap = new Map();
      const habitatFeatureAttributeData = {
        invalid: true
      };

      habitatFeatureDefinitionMap.set('header', habitatFeatureAttributeData);

      const validator = getDynamicHabitatFeatureAttributeCellValidator(habitatFeatureDefinitionMap);

      const result = validator({ cell: 'test', header: 'header' } as any);
      expect(result[0].error.toLowerCase()).to.contain('invalid habitat feature attribute type');
    });
  });

  describe('validateQualitativeHabitatFeatureAttributeCell', () => {
    it('should validate the qualitative attribute cell value', () => {
      const params = {
        cell: 'good',
        header: 'header',
        row: {}
      } as any;

      const habitatFeatureAttributeData = {
        options: [
          {
            habitat_feature_qualitative_definition_option_id: 'id',
            name: 'good'
          }
        ]
      } as any;

      const result = dynamicHeadersConfig.validateQualitativeHabitatFeatureAttributeCell(
        params,
        habitatFeatureAttributeData
      );
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when the qualitative value is invalid', () => {
      const params = {
        cell: 'bad',
        header: 'header',
        row: {}
      } as any;

      const habitatFeatureAttributeData = {
        options: [
          {
            habitat_feature_qualitative_definition_option_id: 'id',
            name: 'good'
          }
        ]
      } as any;

      const result = dynamicHeadersConfig.validateQualitativeHabitatFeatureAttributeCell(
        params,
        habitatFeatureAttributeData
      );
      expect(result[0].error.length).to.be.greaterThan(0);
    });

    it('should update the row state with the qualitative option id', () => {
      const params = {
        cell: 'good',
        header: 'header',
        row: {}
      } as any;

      const habitatFeatureAttributeData = {
        habitat_feature_qualitative_definition_id: 'id',
        options: [
          {
            habitat_feature_qualitative_definition_option_id: 'id',
            name: 'good'
          }
        ]
      } as any;

      dynamicHeadersConfig.validateQualitativeHabitatFeatureAttributeCell(params, habitatFeatureAttributeData);
      expect(params.row[CSVRowState].header).to.deep.equal({
        habitat_feature_qualitative_definition_id:
          habitatFeatureAttributeData.habitat_feature_qualitative_definition_id,
        habitat_feature_qualitative_definition_option_id:
          habitatFeatureAttributeData.options[0].habitat_feature_qualitative_definition_option_id
      });
    });
  });

  describe('validateQuantitativeHabitatFeatureAttributeCell', () => {
    it('should validate the quantitative cell value', () => {
      const params = {
        cell: 1,
        header: 'header',
        row: {}
      } as any;

      const habitatFeatureAttributeData = {
        habitat_feature_quantitative_definition_id: 'id',
        unit: 'unit'
      } as any;

      const result = dynamicHeadersConfig.validateQuantitativeHabitatFeatureAttributeCell(
        params,
        habitatFeatureAttributeData
      );
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when the quantitative value is invalid', () => {
      const params = {
        cell: 'bad',
        header: 'header',
        row: {}
      } as any;

      const habitatFeatureAttributeData = {
        habitat_feature_quantitative_definition_id: 'id',
        unit: 'unit'
      } as any;

      const result = dynamicHeadersConfig.validateQuantitativeHabitatFeatureAttributeCell(
        params,
        habitatFeatureAttributeData
      );
      expect(result[0].error.length).to.be.greaterThan(0);
    });

    it('should update the row state with the quantitative value', () => {
      const params = {
        cell: 1,
        header: 'header',
        row: {}
      } as any;

      const habitatFeatureAttributeData = {
        habitat_feature_quantitative_definition_id: 'id',
        unit: 'unit'
      } as any;

      dynamicHeadersConfig.validateQuantitativeHabitatFeatureAttributeCell(params, habitatFeatureAttributeData);
      expect(params.row[CSVRowState].header).to.deep.equal({
        habitat_feature_quantitative_definition_id:
          habitatFeatureAttributeData.habitat_feature_quantitative_definition_id,
        value: params.cell
      });
    });
  });
});
