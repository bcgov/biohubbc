import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import { MediaFile } from '../../utils/media/media-file';
import { getMockDBConnection } from '../../__mocks__/db';
import { IBulkCreateResponse } from '../critterbase-service';
import { ImportCrittersService } from './import-critters-service';
import { CsvCritter, PartialCsvCritter } from './import-critters-service.interface';

chai.use(sinonChai);

const mockConnection = getMockDBConnection();

describe.only('ImportCrittersService', () => {
  describe('_getCritterRowsToValidate', () => {
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
      const service = new ImportCrittersService(mockConnection);

      const parsedRow = service._getCritterRowsToValidate(rows, ['COLLECTION', 'TEST'])[0];

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
      const service = new ImportCrittersService(mockConnection);

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
      const service = new ImportCrittersService(mockConnection);

      const collectionUnits = service._getCollectionUnitsFromRow(row);

      expect(collectionUnits).to.be.deep.equal([
        { collection_unit_id: 'ID1', critter_id: 'id' },
        { collection_unit_id: 'ID2', critter_id: 'id' }
      ]);
    });
  });

  describe('_getValidTsns', () => {
    const service = new ImportCrittersService(mockConnection);

    const mockWorksheet = {} as unknown as WorkSheet;
    const getRowsStub = sinon
      .stub(service, '_getRows')
      .returns([{ itis_tsn: 1 }, { itis_tsn: 2 }, { itis_tsn: 2 }] as any);
    const getTaxonomyStub = sinon.stub(service.platformService, 'getTaxonomyByTsns').resolves([
      { tsn: '1', scientificName: 'a' },
      { tsn: '2', scientificName: 'b' }
    ]);

    it('should return unique list of tsns', async () => {
      const tsns = await service._getValidTsns(mockWorksheet);
      expect(getRowsStub).to.have.been.calledWith(mockWorksheet);
      expect(getTaxonomyStub).to.have.been.calledWith(['1', '2']);
      expect(tsns).to.deep.equal(['1', '2']);
    });
  });

  describe('_getCollectionUnitMap', () => {
    const service = new ImportCrittersService(mockConnection);

    const getColumnsStub = sinon.stub(service, '_getNonStandardColumns');
    const mockWorksheet = {} as unknown as WorkSheet;
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

    const findCollectionUnitsStub = sinon.stub(service.critterbaseService, 'findTaxonCollectionUnits');

    beforeEach(() => {
      findCollectionUnitsStub.reset();
      getColumnsStub.reset();
    });

    it('should return collection unit mapping', async () => {
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
      getColumnsStub.returns([]);

      const mapping = await service._getCollectionUnitMap(mockWorksheet, ['1', '2']);
      expect(getColumnsStub).to.have.been.calledWith(mockWorksheet);
      expect(findCollectionUnitsStub).to.have.not.been.called;

      expect(mapping).to.be.instanceof(Map);
    });
  });

  describe('_insertCsvCrittersIntoSimsAndCritterbase', () => {
    const service = new ImportCrittersService(mockConnection);

    const critterbaseBulkCreateStub = sinon.stub(service.critterbaseService, 'bulkCreate');

    const simsAddSurveyCrittersStub = sinon.stub(service.surveyCritterService, 'addCrittersToSurvey');

    beforeEach(() => {
      critterbaseBulkCreateStub.reset();
      simsAddSurveyCrittersStub.reset();
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
      critterbaseBulkCreateStub.resolves({ created: { critters: 2, collections: 1 } } as IBulkCreateResponse);
      simsAddSurveyCrittersStub.resolves([1]);

      const ids = await service._insertCsvCrittersIntoSimsAndCritterbase(1, critters);

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
      critterbaseBulkCreateStub.resolves({ created: { critters: 1, collections: 1 } } as IBulkCreateResponse);
      simsAddSurveyCrittersStub.resolves([1]);

      try {
        await service._insertCsvCrittersIntoSimsAndCritterbase(1, critters);
      } catch (err: any) {
        expect(err.message).to.be.string;
      }

      expect(simsAddSurveyCrittersStub).to.not.have.been.called;
    });
  });

  describe('_validateRows', () => {
    const service = new ImportCrittersService(mockConnection);
    const getRowsStub = sinon.stub(service, '_getRows');
    const getColumnsStub = sinon.stub(service, '_getNonStandardColumns');
    const surveyAliasesStub = sinon.stub(service.surveyCritterService, 'getUniqueSurveyCritterAliases');
    const getValidTsnsStub = sinon.stub(service, '_getValidTsns');
    const collectionMapStub = sinon.stub(service, '_getCollectionUnitMap');

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

    getColumnsStub.returns(['COLLECTION', 'HERD']);
    surveyAliasesStub.resolves(new Set(['Not Carl', 'Carlita']));
    getValidTsnsStub.resolves(['1', '2']);
    collectionMapStub.resolves(
      new Map([
        ['COLLECTION', { collectionUnits: collectionUnitsA, tsn: 1 }],
        ['HERD', { collectionUnits: collectionUnitsB, tsn: 2 }]
      ])
    );

    it('should return successful', async () => {
      const validRows: CsvCritter[] = [
        {
          critter_id: 'A',
          sex: 'Male',
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        },
        {
          critter_id: 'B',
          sex: 'Male',
          itis_tsn: 2,
          animal_id: 'Test',
          wlh_id: '10-1000',
          critter_comment: 'comment',
          HERD: 'UNIT_B'
        }
      ];

      getRowsStub.returns(validRows);

      const validation = await service._validateRows(1, {} as WorkSheet);

      expect(validation.success).to.be.true;

      if (validation.success) {
        expect(validation.data).to.be.deep.equal([
          {
            critter_id: 'A',
            sex: 'Male',
            itis_tsn: 1,
            animal_id: 'Carl',
            wlh_id: '10-1000',
            critter_comment: 'comment',
            COLLECTION: '1'
          },
          {
            critter_id: 'B',
            sex: 'Male',
            itis_tsn: 2,
            animal_id: 'Test',
            wlh_id: '10-1000',
            critter_comment: 'comment',
            HERD: '2'
          }
        ]);
      }
    });

    it('should throw error when sex is undefined or invalid', async () => {
      const invalidRows: PartialCsvCritter[] = [
        {
          critter_id: 'A',
          sex: undefined,
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        },
        {
          critter_id: 'A',
          sex: 'Whoops' as any,
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        }
      ];

      getRowsStub.returns(invalidRows);

      const validation = await service._validateRows(1, {} as WorkSheet);

      expect(validation.success).to.be.false;
      if (!validation.success) {
        expect(validation.errors.length).to.be.eq(2);
        expect(validation.errors).to.be.deep.equal([
          {
            message: 'Invalid SEX. Expecting: UNKNOWN, MALE, FEMALE.',
            row: 0
          },
          {
            message: 'Invalid SEX. Expecting: UNKNOWN, MALE, FEMALE.',
            row: 1
          }
        ]);
      }
    });

    it('should throw error when wlh_id is invalid regex / shape', async () => {
      const invalidRows: PartialCsvCritter[] = [
        {
          critter_id: 'A',
          sex: 'Male',
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '101000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        },
        {
          critter_id: 'A',
          sex: 'Male',
          itis_tsn: 1,
          animal_id: 'Carl',
          wlh_id: '1-1000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        }
      ];

      getRowsStub.returns(invalidRows);

      const validation = await service._validateRows(1, {} as WorkSheet);

      expect(validation.success).to.be.false;
      if (!validation.success) {
        expect(validation.errors.length).to.be.eq(2);
        expect(validation.errors).to.be.deep.equal([
          {
            message: `Invalid WLH_ID. Example format '10-1000R'.`,
            row: 0
          },
          {
            message: `Invalid WLH_ID. Example format '10-1000R'.`,
            row: 1
          }
        ]);
      }
    });

    it('should throw error when itis_tsn undefined or invalid option', async () => {
      const invalidRows: PartialCsvCritter[] = [
        {
          critter_id: 'A',
          sex: 'Male',
          itis_tsn: undefined,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        },
        {
          critter_id: 'A',
          sex: 'Male',
          itis_tsn: 10,
          animal_id: 'Carl',
          wlh_id: '10-1000',
          critter_comment: 'comment',
          COLLECTION: 'UNIT_A'
        }
      ];

      getRowsStub.returns(invalidRows);

      const validation = await service._validateRows(1, {} as WorkSheet);

      expect(validation.success).to.be.false;
      if (!validation.success) {
        expect(validation.errors.length).to.be.eq(4);
        expect(validation.errors).to.be.deep.equal([
          {
            message: `Invalid ITIS_TSN.`,
            row: 0
          },
          {
            message: `Invalid COLLECTION. Cell value not allowed for TSN.`,
            row: 0
          },
          {
            message: `Invalid ITIS_TSN.`,
            row: 1
          },
          {
            message: `Invalid COLLECTION. Cell value not allowed for TSN.`,
            row: 1
          }
        ]);
      }
    });
  });

  describe('import', () => {
    it('should pass values to correct methods', async () => {
      const service = new ImportCrittersService(mockConnection);
      const csv = new MediaFile('file', 'mime', new Buffer('asdfadf'));

      const critter: CsvCritter = {
        critter_id: 'id',
        sex: 'Male',
        itis_tsn: 1,
        animal_id: 'Carl',
        wlh_id: '10-1000',
        critter_comment: 'comment',
        COLLECTION: 'Unit'
      };

      const getWorksheetStub = sinon.stub(service, '_getWorksheet').returns({} as unknown as WorkSheet);
      const validateStub = sinon.stub(service, '_validate').resolves([critter]);
      const insertStub = sinon.stub(service, '_insertCsvCrittersIntoSimsAndCritterbase').resolves([1]);

      const data = await service.import(1, csv);

      expect(getWorksheetStub).to.have.been.calledWithExactly(csv);
      expect(validateStub).to.have.been.calledWithExactly(1, {});
      expect(insertStub).to.have.been.calledWithExactly(1, [critter]);

      expect(data).to.be.deep.equal([1]);
    });
  });
});
