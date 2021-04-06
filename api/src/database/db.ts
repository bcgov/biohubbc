import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';
import { SYSTEM_USER_TYPE } from '../constants/database';
import { setSystemUserContextSQL } from '../queries/user-context-queries';
import { getLogger } from '../utils/logger';
import { HTTP400, HTTP500 } from '../errors/CustomError';

const defaultLog = getLogger('database/db');

const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USERNAME = process.env.DB_USER_API;
const DB_PASSWORD = process.env.DB_USER_API_PASS;
const DB_DATABASE = process.env.DB_DATABASE;

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
 * Usage Example:
 *
 * const connection = await getDBConnection(req['keycloak_token']);
 * try {
 *   await connection.open();
 *   await connection.query(sqlStatement1.text, sqlStatement1.values);
 *   await connection.query(sqlStatement2.text, sqlStatement2.values);
 *   await connection.query(sqlStatement3.text, sqlStatement3.values);
 *   await connection.commit();
 * } catch (error) {
 *   await connection.rollback();
 * } finally {
 *   connection.release();
 * }
 *
 * @returns {IDBConnection}
 */
export const getDBConnection = function (keycloakToken: string): IDBConnection {
  let _client: PoolClient;

  let _isOpen = false;

  const _token = keycloakToken;

  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   */
  const open = async () => {
    if (_client || _isOpen) {
      return;
    }

    _client = await pool.connect();

    _isOpen = true;

    await _setUserContext();

    await _client.query('BEGIN');
  };

  /**
   * Releases (closes) the connection.
   *
   * Note: Does nothing if the connection is already released.
   */
  const release = () => {
    if (!_client || !_isOpen) {
      return;
    }

    _client.release();

    _isOpen = false;
  };

  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * Note: Does nothing if the connection is not open, or was released.
   */
  const commit = async () => {
    if (!_client || !_isOpen) {
      return;
    }

    await _client.query('COMMIT');
  };

  /**
   * Rollsback the transaction, undoing any queries performed by this connection.
   *
   * Note: Does nothing if the connection is not open, or was released.
   */
  const rollback = async () => {
    if (!_client || !_isOpen) {
      return;
    }

    await _client.query('ROLLBACK');
  };

  /**
   * Performs a query agaisnt this connection, returning the results.
   *
   * Note: Does nothing if the connection is not open, or was released.
   *
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @return {*}  {(Promise<QueryResult<any> | void>)}
   */
  const query = async (text: string, values?: any[]): Promise<QueryResult<any> | void> => {
    if (!_client || !_isOpen) {
      return;
    }

    return _client.query(text, values || []);
  };

  /**
   * Internal function to set the user context.
   */
  const _setUserContext = async () => {
    // Strip the `@<alias>` from the end of the username, which is added in keycloak to IDIR and BCeID usernames
    const idir = _token['preferred_username']?.split('@')[0];
    const bceid = _token['preferred_username']?.split('@')[0];

    if (!idir && !bceid) {
      throw new HTTP400('Failed to identify user ID');
    }

    const userIdentifier = idir || bceid;
    const systemUserType = (idir && SYSTEM_USER_TYPE.IDIR) || (bceid && SYSTEM_USER_TYPE.BCEID) || null;

    // Set the user context for all queries made using this connection
    const setSystemUserContextSQLStatement = setSystemUserContextSQL(userIdentifier, systemUserType);

    if (!setSystemUserContextSQLStatement) {
      throw new HTTP400('Failed to build SQL user context statement');
    }

    try {
      await _client.query(setSystemUserContextSQLStatement.text, setSystemUserContextSQLStatement.values);
    } catch (error) {
      throw new HTTP500('Failed to set user context', [error]);
    }
  };

  return { open: open, query: query, release: release, commit: commit, rollback: rollback };
};
