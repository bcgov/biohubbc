import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { IBulkCreateResponse, ICritterDetailed } from '../../critterbase-service';
import { ImportMarkingsStrategy } from './import-markings-strategy';
import { CsvMarking } from './import-markings-strategy.interface';

chai.use(sinonChai);

describe('ImportMarkingsStrategy', () => {
  describe('getTaxonBodyLocationsCritterIdMap', () => {
    it('should return a critter_id mapping of body locations', async () => {
      const mockDBConnection = getMockDBConnection();
      const strategy = new ImportMarkingsStrategy(mockDBConnection, 1);

      const taxonBodyLocationsStub = sinon.stub(
        strategy.surveyCritterService.critterbaseService,
        'getTaxonBodyLocations'
      );
      const mockBodyLocationsA = [
        { id: 'A', key: 'column', value: 'Right Ear' },
        { id: 'B', key: 'column', value: 'Antlers' }
      ];

      const mockBodyLocationsB = [
        { id: 'C', key: 'column', value: 'Nose' },
        { id: 'D', key: 'column', value: 'Tail' }
      ];

      taxonBodyLocationsStub.onCall(0).resolves(mockBodyLocationsA);
      taxonBodyLocationsStub.onCall(1).resolves(mockBodyLocationsB);

      const critterMap = await strategy.getTaxonBodyLocationsCritterIdMap([
        { critter_id: 'ACRITTER', itis_tsn: 1 },
        { critter_id: 'BCRITTER', itis_tsn: 2 },
        { critter_id: 'CCRITTER', itis_tsn: 2 }
      ] as ICritterDetailed[]);

      expect(taxonBodyLocationsStub).to.have.been.calledTwice;
      expect(taxonBodyLocationsStub.getCall(0).args[0]).to.be.eql('1');
      expect(taxonBodyLocationsStub.getCall(1).args[0]).to.be.eql('2');
      expect(critterMap).to.be.deep.equal(
        new Map([
          ['ACRITTER', mockBodyLocationsA],
          ['BCRITTER', mockBodyLocationsB],
          ['CCRITTER', mockBodyLocationsB]
        ])
      );
    });
  });

  describe('validateRows', () => {
    it('should validate the rows successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      const strategy = new ImportMarkingsStrategy(mockDBConnection, 1);

      const mockCritterA = {
        critter_id: '4df8fd4c-4d7b-4142-8f03-92d8bf52d8cb',
        itis_tsn: 1,
        captures: [
          { capture_id: 'e9087545-5b1f-4b86-bf1d-a3372a7b33c7', capture_date: '10-10-2024', capture_time: '10:10:10' }
        ]
      } as ICritterDetailed;

      const mockCritterB = {
        critter_id: '4540d43a-7ced-4216-b49e-2a972d25dfdc',
        itis_tsn: 1,
        captures: [
          { capture_id: '21f3c699-9017-455b-bd7d-49110ca4b586', capture_date: '10-10-2024', capture_time: '10:10:10' }
        ]
      } as ICritterDetailed;

      const aliasStub = sinon.stub(strategy.surveyCritterService, 'getSurveyCritterIdAliasMap');
      const colourStub = sinon.stub(strategy.surveyCritterService.critterbaseService, 'getColours');
      const markingTypeStub = sinon.stub(strategy.surveyCritterService.critterbaseService, 'getMarkingTypes');
      const taxonBodyLocationStub = sinon.stub(strategy, 'getTaxonBodyLocationsCritterIdMap');

      aliasStub.resolves(
        new Map([
          ['carl', mockCritterA],
          ['carlita', mockCritterB]
        ])
      );

      colourStub.resolves([
        { id: 'A', key: 'colour', value: 'red' },
        { id: 'B', key: 'colour', value: 'blue' }
      ]);

      markingTypeStub.resolves([
        { id: 'C', key: 'markingType', value: 'ear tag' },
        { id: 'D', key: 'markingType', value: 'nose band' }
      ]);

      taxonBodyLocationStub.resolves(
        new Map([
          ['4df8fd4c-4d7b-4142-8f03-92d8bf52d8cb', [{ id: 'D', key: 'bodylocation', value: 'ear' }]],
          ['4540d43a-7ced-4216-b49e-2a972d25dfdc', [{ id: 'E', key: 'bodylocation', value: 'tail' }]]
        ])
      );

      const rows = [
        {
          CAPTURE_DATE: '10-10-2024',
          CAPTURE_TIME: '10:10:10',
          ALIAS: 'carl',
          BODY_LOCATION: 'Ear',
          MARKING_TYPE: 'ear tag',
          IDENTIFIER: 'identifier',
          PRIMARY_COLOUR: 'Red',
          SECONDARY_COLOUR: 'blue',
          DESCRIPTION: 'comment'
        }
      ];

      const validation = await strategy.validateRows(rows);

      if (!validation.success) {
        expect.fail();
      } else {
        expect(validation.success);
        // TODO: check validation object
      }
    });
  });
  describe('insert', () => {
    it('should return the count of inserted markings', async () => {
      const mockDBConnection = getMockDBConnection();
      const strategy = new ImportMarkingsStrategy(mockDBConnection, 1);

      const bulkCreateStub = sinon.stub(strategy.surveyCritterService.critterbaseService, 'bulkCreate');

      bulkCreateStub.resolves({ created: { markings: 1 } } as IBulkCreateResponse);

      const data = await strategy.insert([{ critter_id: 'id' } as unknown as CsvMarking]);

      expect(bulkCreateStub).to.have.been.calledWith({ markings: [{ critter_id: 'id' }] });
      expect(data).to.be.eql(1);
    });
  });
});
