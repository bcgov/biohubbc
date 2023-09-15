import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import * as db from '../database/db';
import { IDBConnection } from '../database/db';

/**
 * Registers and returns a mock `IDBConnection` with empty methods.
 *
 * @param {Partial<IDBConnection>} [config] Initial method overrides
 * @return {*}  {IDBConnection}
 */
export const registerMockDBConnection = (config?: Partial<IDBConnection>): IDBConnection => {
  const mockDBConnection = getMockDBConnection(config);

  sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

  return mockDBConnection;
};

/**
 * Returns a mock `IDBConnection` with empty methods.
 *
 * @param {Partial<IDBConnection>} [config] Initial method overrides
 * @return {*}  {IDBConnection}
 */
export const getMockDBConnection = (config?: Partial<IDBConnection>): IDBConnection => {
  return {
    systemUserId: () => {
      return (null as unknown) as number;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      return (undefined as unknown) as QueryResult<any>;
    },
    sql: async () => {
      return (undefined as unknown) as QueryResult<any>;
    },
    knex: async () => {
      return (undefined as unknown) as QueryResult<any>;
    },
    ...config
  };
};

export type ExtendedMockReq = MockReq & Request;
export class MockReq {
  query = {};
  params = {};
  body = {};
  files: any[] = [];
}

export type ExtendedMockRes = MockRes & Response;
export class MockRes {
  statusValue: any;
  status = sinon.fake((value: any) => {
    this.statusValue = value;

    return this;
  });

  jsonValue: any;
  json = sinon.fake((value: any) => {
    this.jsonValue = value;

    return this;
  });

  sendValue: any;
  send = sinon.fake((value: any) => {
    this.sendValue = value;

    return this;
  });
}

/**
 * Returns several mocks for testing RequestHandler responses.
 *
 * @return {*}
 */
export const getRequestHandlerMocks = () => {
  const mockReq = new MockReq() as ExtendedMockReq;

  const mockRes = new MockRes() as ExtendedMockRes;

  const mockNext = sinon.fake();

  return { mockReq, mockRes, mockNext };
};
