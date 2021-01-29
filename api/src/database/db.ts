import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';
import { SYSTEM_USER_TYPE } from '../constants/database';
import { setSystemUserContextSQL } from '../queries/user-context-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('database/db');

const DB_HOST: string = process.env.DB_HOST || 'localhost';
const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
const DB_USERNAME: string = process.env.DB_USER_API || 'postgres';
const DB_PASSWORD: string = process.env.DB_USER_API_PASS || 'postgres';
const DB_DATABASE: string = process.env.DB_DATABASE || 'biohubbc';

const DB_POOL_SIZE: number = Number(process.env.DB_POOL_SIZE) || 20;
const DB_CONNECTION_TIMEOUT: number = Number(process.env.DB_CONNECTION_TIMEOUT) || 0;
const DB_IDLE_TIMEOUT: number = Number(process.env.DB_IDLE_TIMEOUT) || 10000;

const poolConfig: PoolConfig = {
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
  host: DB_HOST,
  max: DB_POOL_SIZE,
  connectionTimeoutMillis: DB_CONNECTION_TIMEOUT,
  idleTimeoutMillis: DB_IDLE_TIMEOUT
};

defaultLog.debug({ label: 'create db pool', message: 'pool config', poolConfig });

let pool: Pool;

try {
  pool = new Pool(poolConfig);
} catch (error) {
  defaultLog.error({ label: 'create db pool', message: 'failed to create pool', error, poolConfig });
  process.exit(1);
}

export interface IDBConnection {
  open: () => Promise<void>;
  release: () => void;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  query: (text: string, values?: any[]) => Promise<QueryResult<any> | void>;
}

/**
 * Wraps the pg client, exposing various functions for use when making database calls.
 *
 * Note: Using this will automatically set up the necessary database contexts, etc, for you.
 *
 * @returns {IDBConnection}
 */
export const getDBConnection = function (keycloakToken: string): IDBConnection {
  let _client: PoolClient;

  const _token = keycloakToken;

  /**
   * Opens a new connection, and begins a transaction.
   */
  const open = async () => {
    if (_client) {
      return;
    }

    await _getNewClientAndBeginTransaction();
  };

  /**
   * Releases (closes) the connection.
   */
  const release = () => {
    if (!_client) {
      return;
    }

    _client.release();
  };

  /**
   * Commits the transaction that was opened by calling `.open()`.
   */
  const commit = async () => {
    if (!_client) {
      return;
    }

    await _client.query('COMMIT');
  };

  /**
   * Rollsback the transaction, undoing any queries performed by this connection.
   */
  const rollback = async () => {
    if (!_client) {
      return;
    }

    _client.query('ROLLBACK');
  };

  /**
   * Performs a query agaisnt this connection, returning the results.
   *
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @return {*}  {(Promise<QueryResult<any> | void>)}
   */
  const query = async (text: string, values?: any[]): Promise<QueryResult<any> | void> => {
    if (!_client) {
      return;
    }

    return _client.query(text, values || []);
  };

  const _getNewClientAndBeginTransaction = async () => {
    _client = await pool.connect();

    await _client.query('BEGIN');

    // Strip the `@<alias>` from the end of the username, which is added in keycloak to IDIR and BCeID usernames
    const idir = _token['preferred_username']?.split('@')[0];
    const bceid = _token['preferred_username']?.split('@')[0];

    if (!idir && !bceid) {
      throw {
        status: 400,
        message: 'Failed to identify user ID'
      };
    }

    const userIdentifier = idir || bceid;
    const systemUserType = (idir && SYSTEM_USER_TYPE.IDIR) || (bceid && SYSTEM_USER_TYPE.BCEID) || null;

    // Set the user context for all queries made using this connection
    const setSystemUserContextSQLStatement = setSystemUserContextSQL(userIdentifier, systemUserType);

    if (!setSystemUserContextSQLStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    await _client.query(setSystemUserContextSQLStatement.text, setSystemUserContextSQLStatement.values);
  };

  return { open: open, query: query, release: release, commit: commit, rollback: rollback };
};
