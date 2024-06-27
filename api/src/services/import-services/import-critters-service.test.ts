import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import { getMockDBConnection } from '../../__mocks__/db';
import { ImportCrittersService } from './import-critters-service';

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
});
