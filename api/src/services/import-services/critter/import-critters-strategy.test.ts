import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import { getMockDBConnection } from '../../../__mocks__/db';
import { IBulkCreateResponse } from '../../critterbase-service';
import { ImportCrittersStrategy } from './import-critters-strategy';
import { CsvCritter } from './import-critters-strategy.interface';

chai.use(sinonChai);

const mockConnection = getMockDBConnection();

describe('ImportCrittersStrategy', () => {
  describe('_getRowsToValidate', () => {
    it('it should correctly format rows', () => {
      const rows = [
        {
          SEX: 'Male',
          ITIS_TSN: 1,
          WLH_ID: '10-1000',
          ALIAS: 'Carl',
          COMMENT: 'Test',
          COLLECTION: 'Unit',
          BAD_COLLECTION: 'Bad'
        }
      ];
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const parsedRow = service._getRowsToValidate(rows, ['COLLECTION'])[0];

      expect(parsedRow.sex).to.be.eq('Male');
      expect(parsedRow.itis_tsn).to.be.eq(1);
      expect(parsedRow.wlh_id).to.be.eq('10-1000');
      expect(parsedRow.animal_id).to.be.eq('Carl');
      expect(parsedRow.critter_comment).to.be.eq('Test');
      expect(parsedRow.COLLECTION).to.be.eq('Unit');
      expect(parsedRow.TEST).to.be.undefined;
      expect(parsedRow.BAD_COLLECTION).to.be.undefined;
    });
  });

  describe('_getCritterFromRow', () => {
    it('should get all critter properties', () => {
      const row: any = {
        critter_id: 'id',
        sex: 'Male',
        itis_tsn: 1,
        animal_id: 'Carl',
        wlh_id: '10-1000',
        critter_comment: 'comment',
        extra_property: 'test'
      };
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const critter = service._getCritterFromRow(row);

      expect(critter).to.be.eql({
        critter_id: 'id',
        sex: 'Male',
        itis_tsn: 1,
        animal_id: 'Carl',
        wlh_id: '10-1000',
        critter_comment: 'comment'
      });
    });
  });

  describe('_getCollectionUnitsFromRow', () => {
    it('should get all collection unit properties', () => {
      const row: any = {
        critter_id: 'id',
        sex: 'Male',
        itis_tsn: 1,
        animal_id: 'Carl',
        wlh_id: '10-1000',
        critter_comment: 'comment',
        COLLECTION: 'ID1',
        HERD: 'ID2'
      };
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const collectionUnits = service._getCollectionUnitsFromRow(row);

      expect(collectionUnits).to.be.deep.equal([
        { collection_unit_id: 'ID1', critter_id: 'id' },
        { collection_unit_id: 'ID2', critter_id: 'id' }
      ]);
    });
  });

  describe('_getValidTsns', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return unique list of tsns', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const getTaxonomyStub = sinon.stub(service.platformService, 'getTaxonomyByTsns').resolves([
        { tsn: '1', scientificName: 'a' },
        { tsn: '2', scientificName: 'b' }
      ]);

      const tsns = await service._getValidTsns([
        { critter_id: 'a', itis_tsn: 1 },
        { critter_id: 'b', itis_tsn: 2 }
      ]);

      expect(getTaxonomyStub).to.have.been.calledWith(['1', '2']);
      expect(tsns).to.deep.equal(['1', '2']);
    });
  });

  describe('_getCollectionUnitMap', () => {
    afterEach(() => {
      sinon.restore();
    });

    const collectionUnitsA = [
      {
        collection_unit_id: '1',
        collection_category_id: '2',
        category_name: 'COLLECTION',
        unit_name: 'UNIT_A',
        description: 'description'
      },
      {
        collection_unit_id: '2',
        collection_category_id: '3',
        category_name: 'COLLECTION',
        unit_name: 'UNIT_B',
        description: 'description'
      }
    ];

    const collectionUnitsB = [
      {
        collection_unit_id: '1',
        collection_category_id: '2',
        category_name: 'HERD',
        unit_name: 'UNIT_A',
        description: 'description'
      },
      {
        collection_unit_id: '2',
        collection_category_id: '3',
        category_name: 'HERD',
        unit_name: 'UNIT_B',
        description: 'description'
      }
    ];

    it('should return collection unit mapping', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const getColumnsStub = sinon.stub(service, '_getNonStandardColumns');
      const mockWorksheet = {} as unknown as WorkSheet;

      const findCollectionUnitsStub = sinon.stub(service.critterbaseService, 'findTaxonCollectionUnits');

      getColumnsStub.returns(['COLLECTION', 'HERD']);
      findCollectionUnitsStub.onCall(0).resolves(collectionUnitsA);
      findCollectionUnitsStub.onCall(1).resolves(collectionUnitsB);

      const mapping = await service._getCollectionUnitMap(mockWorksheet, ['1', '2']);
      expect(getColumnsStub).to.have.been.calledWith(mockWorksheet);
      expect(findCollectionUnitsStub).to.have.been.calledTwice;

      expect(mapping).to.be.instanceof(Map);
      expect(mapping.get('COLLECTION')).to.be.deep.equal({ collectionUnits: collectionUnitsA, tsn: 1 });
      expect(mapping.get('HERD')).to.be.deep.equal({ collectionUnits: collectionUnitsB, tsn: 2 });
    });

    it('should return empty map when no collection unit columns', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const getColumnsStub = sinon.stub(service, '_getNonStandardColumns');
      const mockWorksheet = {} as unknown as WorkSheet;

      const findCollectionUnitsStub = sinon.stub(service.critterbaseService, 'findTaxonCollectionUnits');
      getColumnsStub.returns([]);

      const mapping = await service._getCollectionUnitMap(mockWorksheet, ['1', '2']);
      expect(getColumnsStub).to.have.been.calledWith(mockWorksheet);
      expect(findCollectionUnitsStub).to.have.not.been.called;

      expect(mapping).to.be.instanceof(Map);
    });
  });

  describe('insert', () => {
    afterEach(() => {
      sinon.restore();
    });

    const critters: CsvCritter[] = [
      {
        critter_id: '1',
        sex: 'Male',
        itis_tsn: 1,
        animal_id: 'Carl',
        wlh_id: '10-1000',
        critter_comment: 'comment',
        COLLECTION: 'Collection Unit'
      },
      {
        critter_id: '2',
        sex: 'Female',
        itis_tsn: 2,
        animal_id: 'Carl',
        wlh_id: '10-1000',
        critter_comment: 'comment',
        HERD: 'Herd Unit'
      }
    ];

    it('should correctly parse collection units and critters and insert into sims / critterbase', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const critterbaseBulkCreateStub = sinon.stub(service.critterbaseService, 'bulkCreate');
      const simsAddSurveyCrittersStub = sinon.stub(service.surveyCritterService, 'addCrittersToSurvey');

      critterbaseBulkCreateStub.resolves({ created: { critters: 2, collections: 1 } } as IBulkCreateResponse);
      simsAddSurveyCrittersStub.resolves([1]);

      const ids = await service.insert(critters);

      expect(critterbaseBulkCreateStub).to.have.been.calledWithExactly({
        critters: [
          {
            critter_id: '1',
            sex: 'Male',
            itis_tsn: 1,
            animal_id: 'Carl',
            wlh_id: '10-1000',
            critter_comment: 'comment'
          },
          {
            critter_id: '2',
            sex: 'Female',
            itis_tsn: 2,
            animal_id: 'Carl',
            wlh_id: '10-1000',
            critter_comment: 'comment'
          }
        ],
        collections: [
          { collection_unit_id: 'Collection Unit', critter_id: '1' },
          { collection_unit_id: 'Herd Unit', critter_id: '2' }
        ]
      });

      expect(ids).to.be.deep.equal([1]);
    });

    it('should throw error if response from critterbase is less than provided critters', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const critterbaseBulkCreateStub = sinon.stub(service.critterbaseService, 'bulkCreate');
      const simsAddSurveyCrittersStub = sinon.stub(service.surveyCritterService, 'addCrittersToSurvey');

      critterbaseBulkCreateStub.resolves({ created: { critters: 1, collections: 1 } } as IBulkCreateResponse);
      simsAddSurveyCrittersStub.resolves([1]);

      try {
        await service.insert(critters);
        expect.fail();
      } catch (err: any) {
        expect(err.message).to.be.equal('Unable to fully import critters from CSV');
      }

      expect(simsAddSurveyCrittersStub).to.not.have.been.called;
    });
  });

  describe('validateRows', () => {
    afterEach(() => {
      sinon.restore();
    });

    const collectionUnitsA = [
      {
        collection_unit_id: '1',
        collection_category_id: '2',
        category_name: 'COLLECTION',
        unit_name: 'UNIT_A',
        description: 'description'
      },
      {
        collection_unit_id: '2',
        collection_category_id: '3',
        category_name: 'COLLECTION',
        unit_name: 'UNIT_B',
        description: 'description'
      }
    ];

    const collectionUnitsB = [
      {
        collection_unit_id: '1',
        collection_category_id: '2',
        category_name: 'HERD',
        unit_name: 'UNIT_A',
        description: 'description'
      },
      {
        collection_unit_id: '2',
        collection_category_id: '3',
        category_name: 'HERD',
        unit_name: 'UNIT_B',
        description: 'description'
      }
    ];

    it('should return successful', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const getColumnsStub = sinon.stub(service, '_getNonStandardColumns');
      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');
      const collectionMapStub = sinon.stub(service, '_getCollectionUnitMap');

      getColumnsStub.returns(['COLLECTION', 'HERD']);
      surveyAliasesStub.resolves(new Set(['Not Carl', 'Carlita']));
      getValidTsnsStub.resolves(['1', '2']);
      collectionMapStub.resolves(
        new Map([
          ['COLLECTION', { collectionUnits: collectionUnitsA, tsn: 1 }],
          ['HERD', { collectionUnits: collectionUnitsB, tsn: 2 }]
        ])
      );

      const rows = [
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A',
          COLLECTION: 'UNIT_A'
        },
        {
          ITIS_TSN: 2,
          SEX: 'Female',
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'B',
          HERD: 'UNIT_B'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        // Unable to spoof UUID so using contain
        expect(validation.data[0]).to.contain({
          sex: 'Male',
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'A',
          COLLECTION: '1'
        });

        expect(validation.data[1]).to.contain({
          sex: 'Female',
          itis_tsn: 2,
          animal_id: 'Carl2',
          wlh_id: '10-1000',
          critter_comment: 'B',
          HERD: '2'
        });
      } else {
        expect.fail();
      }
    });

    it('should return error when sex has an invalid value', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');

      surveyAliasesStub.resolves(new Set([]));
      getValidTsnsStub.resolves(['1']);

      const rows = [
        {
          ITIS_TSN: 1,
          SEX: 'NO', // invalid value
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        expect.fail();
      } else {
        expect(validation.error.issues).to.deep.equal([
          { row: 0, message: 'Invalid SEX. Expecting: UNKNOWN, MALE, FEMALE, HERMAPHRODITIC.' }
        ]);
      }
    });

    it('should return sex as UNKNOWN when sex is undefined in the imported csv', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');

      surveyAliasesStub.resolves(new Set([]));
      getValidTsnsStub.resolves(['1']);

      const rows = [
        {
          ITIS_TSN: 1,
          SEX: undefined,
          ALIAS: 'Carl',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        },
        {
          ITIS_TSN: 1,
          SEX: undefined,
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        expect(validation.data[0]).to.contain({
          sex: 'Unknown',
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'A'
        });
        expect(validation.data[1]).to.contain({
          sex: 'Unknown',
          itis_tsn: 1,
          animal_id: 'Carl2',
          wlh_id: '10-1000',
          critter_comment: 'A'
        });
      }
    });

    it('should return error when wlh_id invalid regex', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');

      surveyAliasesStub.resolves(new Set([]));
      getValidTsnsStub.resolves(['1']);

      const rows = [
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl',
          WLH_ID: '1-1000',
          DESCRIPTION: 'A'
        },
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl2',
          WLH_ID: '101000',
          DESCRIPTION: 'A'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        expect.fail();
      } else {
        expect(validation.error.issues).to.deep.equal([
          { row: 0, message: `Invalid WLH_ID. Example format '10-1000R'.` },
          { row: 1, message: `Invalid WLH_ID. Example format '10-1000R'.` }
        ]);
      }
    });

    it('should return error when itis_tsn invalid option or undefined', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');

      surveyAliasesStub.resolves(new Set([]));
      getValidTsnsStub.resolves(['1']);

      const rows = [
        {
          ITIS_TSN: undefined,
          SEX: 'Male',
          ALIAS: 'Carl',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        },
        {
          ITIS_TSN: 3,
          SEX: 'Male',
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        expect.fail();
      } else {
        expect(validation.error.issues).to.deep.equal([
          { row: 0, message: `Invalid ITIS_TSN.` },
          { row: 1, message: `Invalid ITIS_TSN.` }
        ]);
      }
    });

    it('should return error if alias undefined, duplicate or exists in surve', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');

      surveyAliasesStub.resolves(new Set(['Carl3']));
      getValidTsnsStub.resolves(['1']);

      const rows = [
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: undefined,
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        },
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        },
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        },
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl3',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        expect.fail();
      } else {
        expect(validation.error.issues).to.deep.equal([
          { row: 0, message: `Invalid ALIAS. Must be unique in Survey and CSV.` },
          { row: 1, message: `Invalid ALIAS. Must be unique in Survey and CSV.` },
          { row: 2, message: `Invalid ALIAS. Must be unique in Survey and CSV.` },
          { row: 3, message: `Invalid ALIAS. Must be unique in Survey and CSV.` }
        ]);
      }
    });

    it('should return error if collection unit invalid value', async () => {
      const service = new ImportCrittersStrategy(mockConnection, 1);

      const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
      const getValidTsnsStub = sinon.stub(service, '_getValidTsns');
      const collectionMapStub = sinon.stub(service, '_getCollectionUnitMap');
      const getColumnsStub = sinon.stub(service, '_getNonStandardColumns');

      surveyAliasesStub.resolves(new Set([]));
      getValidTsnsStub.resolves(['1', '2']);
      getColumnsStub.returns(['COLLECTION', 'HERD']);
      collectionMapStub.resolves(
        new Map([
          ['COLLECTION', { collectionUnits: collectionUnitsA, tsn: 1 }],
          ['HERD', { collectionUnits: collectionUnitsB, tsn: 2 }]
        ])
      );

      const rows = [
        {
          ITIS_TSN: 1,
          SEX: 'Male',
          ALIAS: 'Carl',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A',
          COLLECTION: 'UNIT_C'
        },
        {
          ITIS_TSN: 2,
          SEX: 'Male',
          ALIAS: 'Carl2',
          WLH_ID: '10-1000',
          DESCRIPTION: 'A',
          COLLECTION: 'UNIT_A'
        }
      ];

      const validation = await service.validateRows(rows, {});

      if (validation.success) {
        expect.fail();
      } else {
        expect(validation.error.issues).to.deep.equal([
          { row: 0, message: `Invalid COLLECTION. Cell value is not valid.` },
          { row: 1, message: `Invalid COLLECTION. Cell value not allowed for TSN.` }
        ]);
      }
    });
  });
});
