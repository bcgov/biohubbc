import { Request, Response } from 'express';
import { PoolClient, QueryResult } from 'pg';
import sinon from 'sinon';
import xlsx from 'xlsx';
import * as db from '../database/db';
import { IDBConnection } from '../database/db';
import { DEFAULT_XLSX_SHEET_NAME } from '../utils/xlsx-utils/worksheet-utils';

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
      return null as unknown as number;
    },
    systemUserGUID: () => {
      return null as unknown as string;
    },
    systemUserIdentifier: () => {
      return null as unknown as string;
    },
    getClient: async () => {
      return null as unknown as PoolClient;
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
    sql: async () => {
      return undefined as unknown as QueryResult<any>;
    },
    knex: async () => {
      return undefined as unknown as QueryResult<any>;
    },
    ...config
  };
};

export type ExtendedMockReq = MockReq & Request;
export class MockReq {
  query = {};
  params = {};
  body = {};
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

  headerValue: any;
  setHeader = sinon.fake((header: any) => {
    this.headerValue = header;

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

/**
 * Returns a mock XLSX workbook buffer.
 *
 * @param {Record<string, any>[]} data The data to inject into the workbook.
 * @return {*}  {Buffer}
 */
export const getMockXLSXWorkbookBuffer = (data: Record<string, any>[]) => {
  // Create a new empty workbook
  const workbook = xlsx.utils.book_new();

  // Create a new worksheet with the array of records
  const worksheet = xlsx.utils.json_to_sheet(data);

  // Inject the worksheet data into the workbook with the default name
  xlsx.utils.book_append_sheet(workbook, worksheet, DEFAULT_XLSX_SHEET_NAME);

  // Convert the workbook to a xlsx buffer
  const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  return buffer;
};
