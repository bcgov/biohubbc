import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';

import {
  IQualitativeAttributePostData,
  IQuantitativeAttributePostData,
  TechniqueAttributeRepository,
  TechniqueAttributesLookupObject,
  TechniqueAttributesObject
} from '../repositories/technique-attribute-repository';
import { TechniqueAttributeService } from './technique-attributes-service';

chai.use(sinonChai);

describe('TechniqueAttributeService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getAttributeDefinitionsByMethodLookupIds', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesLookupObject = {
        method_lookup_id: 1,
        quantitative_attributes: [],
        qualitative_attributes: []
      };

      sinon
        .stub(TechniqueAttributeRepository.prototype, 'getAttributeDefinitionsByMethodLookupIds')
        .resolves([mockRecord]);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodLookupIds = [1];

      const response = await service.getAttributeDefinitionsByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('getAttributesByTechniqueId', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesObject = {
        quantitative_attributes: [],
        qualitative_attributes: []
      };

      sinon.stub(TechniqueAttributeRepository.prototype, 'getAttributesByTechniqueId').resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodTechniqueId = 1;

      const response = await service.getAttributesByTechniqueId(methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('insertQuantitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = {
        method_technique_attribute_quantitative_id: 1
      };

      const _areAttributesValidForTechniqueStub = sinon
        .stub(TechniqueAttributeService.prototype, '_areAttributesValidForTechnique')
        .resolves();

      sinon
        .stub(TechniqueAttributeRepository.prototype, 'insertQuantitativeAttributesForTechnique')
        .resolves([mockRecord]);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodTechniqueId = 1;
      const attributes: IQuantitativeAttributePostData[] = [
        {
          method_technique_attribute_quantitative_id: 1,
          method_lookup_attribute_quantitative_id: '123-456-22',
          value: 3
        }
      ];

      const response = await service.insertQuantitativeAttributesForTechnique(methodTechniqueId, attributes);

      expect(_areAttributesValidForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, attributes);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('insertQualitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = {
        method_technique_attribute_qualitative_id: 1
      };

      const _areAttributesValidForTechniqueStub = sinon
        .stub(TechniqueAttributeService.prototype, '_areAttributesValidForTechnique')
        .resolves();

      sinon
        .stub(TechniqueAttributeRepository.prototype, 'insertQualitativeAttributesForTechnique')
        .resolves([mockRecord]);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodTechniqueId = 1;
      const attributes: IQualitativeAttributePostData[] = [
        {
          method_technique_attribute_qualitative_id: 1,
          method_lookup_attribute_qualitative_option_id: '123-456-22',
          method_lookup_attribute_qualitative_id: '123-456-33'
        }
      ];

      const response = await service.insertQualitativeAttributesForTechnique(methodTechniqueId, attributes);

      expect(_areAttributesValidForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, attributes);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('deleteQuantitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = {
        method_technique_attribute_quantitative_id: 1
      };

      sinon
        .stub(TechniqueAttributeRepository.prototype, 'deleteQuantitativeAttributesForTechnique')
        .resolves([mockRecord]);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;
      const methodLookupAttributeQuantitativeIds = [3, 4];

      const response = await service.deleteQuantitativeAttributesForTechnique(
        surveyId,
        methodTechniqueId,
        methodLookupAttributeQuantitativeIds
      );

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('deleteQualitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = {
        method_technique_attribute_qualitative_id: 1
      };

      sinon
        .stub(TechniqueAttributeRepository.prototype, 'deleteQualitativeAttributesForTechnique')
        .resolves([mockRecord]);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;
      const methodLookupAttributeQualitativeIds = [3, 4];

      const response = await service.deleteQualitativeAttributesForTechnique(
        surveyId,
        methodTechniqueId,
        methodLookupAttributeQualitativeIds
      );

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('deleteAllTechniqueAttributes', () => {
    it('should run successfully', async () => {
      const mockRecord = {
        qualitative_attributes: [{ method_technique_attribute_qualitative_id: 3 }],
        quantitative_attributes: [{ method_technique_attribute_quantitative_id: 4 }]
      };

      sinon.stub(TechniqueAttributeRepository.prototype, 'deleteAllTechniqueAttributes').resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const response = await service.deleteAllTechniqueAttributes(surveyId, methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('insertUpdateDeleteQuantitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesObject = {
        quantitative_attributes: [
          {
            method_technique_id: 1,
            method_technique_attribute_quantitative_id: 1,
            method_lookup_attribute_quantitative_id: '123-456-22',
            value: 22
          },
          {
            method_technique_id: 2,
            method_technique_attribute_quantitative_id: 2,
            method_lookup_attribute_quantitative_id: '123-456-33',
            value: 33
          }
        ],
        qualitative_attributes: []
      };

      const _areAttributesValidForTechniqueStub = sinon
        .stub(TechniqueAttributeService.prototype, '_areAttributesValidForTechnique')
        .resolves();
      const getAttributesByTechniqueIdStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'getAttributesByTechniqueId')
        .resolves(mockRecord);
      const deleteQuantitativeAttributesForTechniqueStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'deleteQuantitativeAttributesForTechnique')
        .resolves();
      const insertQuantitativeAttributesForTechniqueStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'insertQuantitativeAttributesForTechnique')
        .resolves();
      const updateQuantitativeAttributeForTechniqueStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'updateQuantitativeAttributeForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection({
        knex: sinon
          .stub()
          .onFirstCall()
          .resolves({ rows: [mockRecord], rowCount: 1 })
          .resolves()
      });

      const service = new TechniqueAttributeService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;
      const attributes: IQuantitativeAttributePostData[] = [
        {
          method_technique_attribute_quantitative_id: 1,
          method_lookup_attribute_quantitative_id: '123-456-22',
          value: 66
        },
        {
          method_lookup_attribute_quantitative_id: '123-456-33',
          value: 33
        }
      ];

      const response = await service.insertUpdateDeleteQuantitativeAttributesForTechnique(
        surveyId,
        methodTechniqueId,
        attributes
      );

      expect(_areAttributesValidForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, attributes);
      expect(getAttributesByTechniqueIdStub).to.have.been.calledOnceWith(methodTechniqueId);
      expect(deleteQuantitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, [
        2
      ]);
      expect(insertQuantitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, [
        {
          method_lookup_attribute_quantitative_id: '123-456-33',
          value: 33
        }
      ]);
      expect(updateQuantitativeAttributeForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, {
        method_technique_attribute_quantitative_id: 1,
        method_lookup_attribute_quantitative_id: '123-456-22',
        value: 66
      });

      expect(response).to.be.undefined;
    });
  });

  describe('insertUpdateDeleteQualitativeAttributesForTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueAttributesObject = {
        quantitative_attributes: [],
        qualitative_attributes: [
          {
            method_technique_id: 1,
            method_technique_attribute_qualitative_id: 1,
            method_lookup_attribute_qualitative_id: '123-456-22',
            method_lookup_attribute_qualitative_option_id: '123-456-33'
          },
          {
            method_technique_id: 2,
            method_technique_attribute_qualitative_id: 2,
            method_lookup_attribute_qualitative_option_id: '123-456-44',
            method_lookup_attribute_qualitative_id: '123-456-55'
          }
        ]
      };

      const _areAttributesValidForTechniqueStub = sinon
        .stub(TechniqueAttributeService.prototype, '_areAttributesValidForTechnique')
        .resolves();
      const getAttributesByTechniqueIdStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'getAttributesByTechniqueId')
        .resolves(mockRecord);
      const deleteQualitativeAttributesForTechniqueStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'deleteQualitativeAttributesForTechnique')
        .resolves();
      const insertQualitativeAttributesForTechniqueStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'insertQualitativeAttributesForTechnique')
        .resolves();
      const updateQualitativeAttributeForTechniqueStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'updateQualitativeAttributeForTechnique')
        .resolves();

      const dbConnection = getMockDBConnection({
        knex: sinon
          .stub()
          .onFirstCall()
          .resolves({ rows: [mockRecord], rowCount: 1 })
          .resolves()
      });

      const service = new TechniqueAttributeService(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;
      const attributes: IQualitativeAttributePostData[] = [
        {
          method_technique_attribute_qualitative_id: 1,
          method_lookup_attribute_qualitative_id: '123-456-22',
          method_lookup_attribute_qualitative_option_id: '123-456-99'
        },
        {
          method_lookup_attribute_qualitative_id: '123-456-66',
          method_lookup_attribute_qualitative_option_id: '123-456-77'
        }
      ];

      const response = await service.insertUpdateDeleteQualitativeAttributesForTechnique(
        surveyId,
        methodTechniqueId,
        attributes
      );

      expect(_areAttributesValidForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, attributes);
      expect(getAttributesByTechniqueIdStub).to.have.been.calledOnceWith(methodTechniqueId);
      expect(deleteQualitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(surveyId, methodTechniqueId, [2]);
      expect(insertQualitativeAttributesForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, [
        {
          method_lookup_attribute_qualitative_id: '123-456-66',
          method_lookup_attribute_qualitative_option_id: '123-456-77'
        }
      ]);
      expect(updateQualitativeAttributeForTechniqueStub).to.have.been.calledOnceWith(methodTechniqueId, {
        method_technique_attribute_qualitative_id: 1,
        method_lookup_attribute_qualitative_id: '123-456-22',
        method_lookup_attribute_qualitative_option_id: '123-456-99'
      });

      expect(response).to.be.undefined;
    });
  });

  describe('_areAttributesValidForTechnique', () => {
    it('throws if a qualitative attribute is not valid', async () => {
      const mockRecord: TechniqueAttributesLookupObject = {
        method_lookup_id: 1,
        quantitative_attributes: [
          {
            method_lookup_attribute_quantitative_id: '123-456-22',
            name: 'quant definition 1',
            description: 'quant desc 1',
            unit: 'unit 1',
            min: 0,
            max: null
          }
        ],
        qualitative_attributes: [
          {
            method_lookup_attribute_qualitative_id: '123-456-66',
            name: 'qual definition 1',
            description: 'qual desc 1',
            options: [
              {
                method_lookup_attribute_qualitative_option_id: '123-456-77',
                name: 'option 1',
                description: 'option desc 1'
              }
            ]
          }
        ]
      };

      const getAttributeDefinitionsByTechniqueIdStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'getAttributeDefinitionsByTechniqueId')
        .resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodTechniqueId = 2;
      const attributes: (IQualitativeAttributePostData | IQuantitativeAttributePostData)[] = [
        {
          method_technique_attribute_quantitative_id: 1,
          method_lookup_attribute_quantitative_id: '123-456-22',
          value: 3
        },
        {
          method_technique_attribute_qualitative_id: 3,
          method_lookup_attribute_qualitative_id: '123-456-invalid', // invalid option
          method_lookup_attribute_qualitative_option_id: '123-456-77'
        }
      ];

      try {
        await service._areAttributesValidForTechnique(methodTechniqueId, attributes);
      } catch (error) {
        expect(getAttributeDefinitionsByTechniqueIdStub).to.have.been.calledOnceWith(methodTechniqueId);

        expect((error as Error).message).to.equal('Invalid attributes for method_lookup_id');
      }
    });

    it('throws if a quantitative attribute is not valid', async () => {
      const mockRecord: TechniqueAttributesLookupObject = {
        method_lookup_id: 1,
        quantitative_attributes: [
          {
            method_lookup_attribute_quantitative_id: '123-456-22',
            name: 'quant definition 1',
            description: 'quant desc 1',
            unit: 'unit 1',
            min: 0,
            max: null
          }
        ],
        qualitative_attributes: [
          {
            method_lookup_attribute_qualitative_id: '123-456-66',
            name: 'qual definition 1',
            description: 'qual desc 1',
            options: [
              {
                method_lookup_attribute_qualitative_option_id: '123-456-77',
                name: 'option 1',
                description: 'option desc 1'
              }
            ]
          }
        ]
      };

      const getAttributeDefinitionsByTechniqueIdStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'getAttributeDefinitionsByTechniqueId')
        .resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodTechniqueId = 2;
      const attributes: (IQualitativeAttributePostData | IQuantitativeAttributePostData)[] = [
        {
          method_technique_attribute_quantitative_id: 1,
          method_lookup_attribute_quantitative_id: '123-456-99', // invalid option
          value: 3
        },
        {
          method_technique_attribute_qualitative_id: 3,
          method_lookup_attribute_qualitative_id: '123-456-66',
          method_lookup_attribute_qualitative_option_id: '123-456-77'
        }
      ];

      try {
        await service._areAttributesValidForTechnique(methodTechniqueId, attributes);
      } catch (error) {
        expect(getAttributeDefinitionsByTechniqueIdStub).to.have.been.calledOnceWith(methodTechniqueId);

        expect((error as Error).message).to.equal('Invalid attributes for method_lookup_id');
      }
    });

    it('should not throw if the attributes are valid', async () => {
      const mockRecord: TechniqueAttributesLookupObject = {
        method_lookup_id: 1,
        quantitative_attributes: [
          {
            method_lookup_attribute_quantitative_id: '123-456-22',
            name: 'quant definition 1',
            description: 'quant desc 1',
            unit: 'unit 1',
            min: 0,
            max: null
          }
        ],
        qualitative_attributes: [
          {
            method_lookup_attribute_qualitative_id: '123-456-66',
            name: 'qual definition 1',
            description: 'qual desc 1',
            options: [
              {
                method_lookup_attribute_qualitative_option_id: '123-456-77',
                name: 'option 1',
                description: 'option desc 1'
              }
            ]
          }
        ]
      };

      const getAttributeDefinitionsByTechniqueIdStub = sinon
        .stub(TechniqueAttributeRepository.prototype, 'getAttributeDefinitionsByTechniqueId')
        .resolves(mockRecord);

      const dbConnection = getMockDBConnection();

      const service = new TechniqueAttributeService(dbConnection);

      const methodTechniqueId = 2;
      const attributes: (IQualitativeAttributePostData | IQuantitativeAttributePostData)[] = [
        {
          method_technique_attribute_quantitative_id: 1,
          method_lookup_attribute_quantitative_id: '123-456-22',
          value: 3
        },
        {
          method_technique_attribute_qualitative_id: 3,
          method_lookup_attribute_qualitative_id: '123-456-66',
          method_lookup_attribute_qualitative_option_id: '123-456-77'
        }
      ];

      const response = await service._areAttributesValidForTechnique(methodTechniqueId, attributes);

      expect(getAttributeDefinitionsByTechniqueIdStub).to.have.been.calledOnceWith(methodTechniqueId);

      expect(response).to.be.undefined;
    });
  });
});
