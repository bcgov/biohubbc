import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { DraftRepository } from './draft-repository';

chai.use(sinonChai);

describe('DraftRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('deleteDraft', () => {
    it('should run without issue', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ webform_draft_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new DraftRepository(mockConnection);
      const response = await repo.deleteDraft(1);

      expect(response.webform_draft_id).to.be.eql(1);
    });

    it('throws an error when delete fails', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return (null as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new DraftRepository(mockConnection);
      try {
        await repo.deleteDraft(1);
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eql('Failed to delete draft');
      }
    });
  });

  describe('getDraft', () => {
    it('should run without issue', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 1,
            rows: [
              {
                webform_draft_id: 2,
                name: 'draft project',
                data: '{}',
                create_date: '2023-06-29',
                update_date: ''
              }
            ]
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);
      const response = await repo.getDraft(2);

      expect(response.webform_draft_id).to.be.eql(2);
    });

    it('throws an error when get fails', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return (null as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new DraftRepository(mockConnection);
      try {
        await repo.getDraft(1);
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eql('Failed to get draft');
      }
    });
  });

  describe('getDraftList', () => {
    it('should run without issue', async () => {
      const data = [
        {
          webform_draft_id: 1,
          name: 'draft project',
          data: '{}',
          create_date: '2023-06-29',
          update_date: ''
        },
        {
          webform_draft_id: 2,
          name: 'draft project',
          data: '{}',
          create_date: '2023-06-29',
          update_date: ''
        }
      ];
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 2,
            rows: data
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);
      const response = await repo.getDraftList(1);

      expect(data).to.be.eql(response);
    });

    it('should return empty array if sql fails', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 2,
            rows: []
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);
      const response = await repo.getDraftList(1);

      expect(response).to.be.empty;
    });
  });

  describe('createDraft', () => {
    it('should create and return new draft', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 1,
            rows: [
              {
                webform_draft_id: 1,
                name: 'Draft name',
                data: '{}',
                create_date: '2023-06-29',
                update_date: ''
              }
            ]
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);
      const response = await repo.createDraft(1, 'Draft name', {});

      expect(response.name).to.be.eql('Draft name');
    });

    it('should throw an error if SQL fails', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 0,
            rows: []
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);

      try {
        await repo.createDraft(1, 'Draft name', {});
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eql('Failed to create draft');
      }
    });
  });

  describe('updateDraft', () => {
    it('should create and return new draft', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 1,
            rows: [
              {
                webform_draft_id: 1,
                name: 'New Draft Name',
                data: '{}',
                create_date: '2023-06-29',
                update_date: ''
              }
            ]
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);
      const response = await repo.updateDraft(1, 'New Draft Name', {});

      expect(response.name).to.be.eql('New Draft Name');
    });

    it('should throw an error if SQL fails', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({
            rowCount: 0,
            rows: []
          } as any) as Promise<QueryResult<any>>;
        }
      });
      const repo = new DraftRepository(mockConnection);

      try {
        await repo.updateDraft(1, 'Draft name', {});
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eql('Failed to update draft');
      }
    });
  });
});
