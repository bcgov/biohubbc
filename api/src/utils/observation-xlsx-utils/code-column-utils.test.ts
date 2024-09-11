import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import { CodeRepository } from '../../repositories/code-repository';
import { getMockDBConnection } from '../../__mocks__/db';
import { CellObject } from '../xlsx-utils/column-validator-utils';
import { getCodeTypeDefinitions, isCodeValueValid, validateCodes } from './code-column-utils';

describe('environment-column-utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCodeTypeDefinitions', async () => {
    const dbConnectionObj = getMockDBConnection();

    const codeRepository = new CodeRepository(dbConnectionObj);

    const getObservationSubcountSignsStub = sinon
      .stub(CodeRepository.prototype, 'getObservationSubcountSigns')
      .resolves([
        {
          id: 1,
          name: 'Sign 1',
          description: 'Sign 1 Desc'
        },
        {
          id: 1,
          name: 'Sign 2',
          description: 'Sign 2 Desc'
        }
      ]);

    const result = await getCodeTypeDefinitions(codeRepository);

    expect(getObservationSubcountSignsStub).to.have.been.calledOnce;
    expect(result).to.eql({
      OBSERVATION_SUBCOUNT_SIGN: [
        {
          id: 1,
          name: 'Sign 1',
          description: 'Sign 1 Desc'
        },
        {
          id: 1,
          name: 'Sign 2',
          description: 'Sign 2 Desc'
        }
      ]
    });
  });

  describe('validateCodes', async () => {
    it('should return false if any codes are invalid', () => {
      const codesToValidate: CellObject[] = [
        {
          column: 'sign',
          cell: 'sign 1'
        },
        {
          column: 'sign',
          cell: 'sign 1'
        },
        {
          column: 'sign',
          cell: null
        },
        {
          column: 'Sign',
          cell: undefined
        },
        {
          column: 'SIGN',
          cell: 'sign invalid' // invalid
        },
        {
          column: 'Sign',
          cell: 'sign 1'
        }
      ];

      const codeTypeDefinitions = {
        OBSERVATION_SUBCOUNT_SIGN: [
          {
            id: 1,
            name: 'Sign 1',
            description: 'Sign 1 Desc'
          },
          {
            id: 1,
            name: 'Sign 2',
            description: 'Sign 2 Desc'
          }
        ]
      };

      const result = validateCodes(codesToValidate, codeTypeDefinitions);

      expect(result).to.be.false;
    });

    it('should return true if all codes are valid', () => {
      const codesToValidate: CellObject[] = [
        {
          column: 'sign',
          cell: 'sign 1'
        },
        {
          column: 'sign',
          cell: 'sign 1'
        },
        {
          column: 'sign',
          cell: null
        },
        {
          column: 'Sign',
          cell: undefined
        },
        {
          column: 'sign',
          cell: 'sign 2'
        },
        {
          column: 'SIGN',
          cell: 'sign 2'
        },
        {
          column: 'Sign',
          cell: 'sign 1'
        }
      ];

      const codeTypeDefinitions = {
        OBSERVATION_SUBCOUNT_SIGN: [
          {
            id: 1,
            name: 'Sign 1',
            description: 'Sign 1 Desc'
          },
          {
            id: 1,
            name: 'Sign 2',
            description: 'Sign 2 Desc'
          }
        ]
      };

      const result = validateCodes(codesToValidate, codeTypeDefinitions);

      expect(result).to.be.true;
    });
  });

  describe('isCodeValueValid', async () => {
    it('should return false if the code is not in the array of allowed values', () => {
      const cellValue = 'sign fake';

      const allowedValues = ['sign 1', 'sign 2'];

      const result = isCodeValueValid(cellValue, allowedValues);

      expect(result).to.be.false;
    });

    it('should return false if the code is in the array of allowed values', () => {
      const cellValue = 'sign 2';

      const allowedValues = ['sign 1', 'sign 2'];

      const result = isCodeValueValid(cellValue, allowedValues);

      expect(result).to.be.true;
    });
  });
});
