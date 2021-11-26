import { QueryResult } from 'pg';
import { IDBConnection } from '../database/db';

/**
 * Returns a mock `IDBConnection` with empty methods.
 *
 * @param {Partial<IDBConnection>} [config] Initial method overrides
 * @return {*}  {IDBConnection}
 */
export const getMockDBConnection = (config?: Partial<IDBConnection>): IDBConnection => {
  return {
    systemUserId: () => {
      return null;
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
    ...config
  };
};
