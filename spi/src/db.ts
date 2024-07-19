import * as pg from 'pg';
import SQL, { SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from './constants/database';

const getDbHost = () => process.env.DB_HOST;
const getDbPort = () => Number(process.env.DB_PORT);
const getDbUsername = () => process.env.DB_USER_API;
const getDbPassword = () => process.env.DB_USER_API_PASS;
const getDbDatabase = () => process.env.DB_DATABASE;

const DB_POOL_SIZE: number = Number(process.env.DB_POOL_SIZE) || 20;
const DB_CONNECTION_TIMEOUT: number = Number(process.env.DB_CONNECTION_TIMEOUT) || 10000;
const DB_IDLE_TIMEOUT: number = Number(process.env.DB_IDLE_TIMEOUT) || 10000;

export const DB_CLIENT = 'pg';

export const defaultPoolConfig: pg.PoolConfig = {
  user: getDbUsername(),
  password: getDbPassword(),
  database: getDbDatabase(),
  port: getDbPort(),
  host: getDbHost(),
  max: DB_POOL_SIZE,
  connectionTimeoutMillis: DB_CONNECTION_TIMEOUT,
  idleTimeoutMillis: DB_IDLE_TIMEOUT
};

// Custom type handler for psq `DATE` type to prevent local time/zone information from being added.
// Why? By default, node-postgres assumes local time/zone for any psql `DATE` or `TIME` types that don't have timezone information.
// This Can lead to unexpected behavior when the original psql `DATE` value was intentionally omitting time/zone information.
// PSQL date types: https://www.postgresql.org/docs/12/datatype-datetime.html
// node-postgres type handling (see bottom of page): https://node-postgres.com/features/types
pg.types.setTypeParser(pg.types.builtins.DATE, (stringValue: string) => {
  return stringValue; // 1082 for `DATE` type
});

// Adding a TIMESTAMP type parser to keep all dates used in the system consistent
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (stringValue: string) => {
  return stringValue; // 1082 for `TIMESTAMP` type
});
// Adding a TIMESTAMPTZ type parser to keep all dates used in the system consistent
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (stringValue: string) => {
  return stringValue; // 1082 for `DATE` type
});
// NUMERIC column types return as strings to maintain precision. Converting this to a float so it is usable by the system
// Explanation of why Numeric returns as a string: https://github.com/brianc/node-postgres/issues/811
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (stringValue: string) => {
  return parseFloat(stringValue);
});

// singleton pg pool instance used by the api
let DBPool: pg.Pool | undefined;

/**
 * Initializes the singleton pg pool instance used by the api.
 *
 * If the pool cannot be created successfully, `process.exit(1)` is called to terminate the API.
 * Why? The API is of no use if the database can't be reached.
 *
 * @param {pg.PoolConfig} [poolConfig]
 */
export const initDBPool = function (poolConfig?: pg.PoolConfig): void {
  if (DBPool) {
    // the pool has already been initialized, do nothing
    return;
  }

  try {
    DBPool = new pg.Pool(poolConfig);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

/**
 * Get the singleton pg pool instance used by the api.
 *
 * Note: pool will be undefined if `initDBPool` has not been called.
 *
 * @return {*}  {(pg.Pool | undefined)}
 */
export const getDBPool = function (): pg.Pool | undefined {
  return DBPool;
};

export interface IDBConnection {
  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @memberof IDBConnection
   */
  open: () => Promise<void>;
  /**
   * Releases (closes) the connection.
   *
   * Note: Does nothing if the connection is already released.
   *
   * @memberof IDBConnection
   */
  release: () => void;
  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  commit: () => Promise<void>;
  /**
   * Rolls back the transaction, undoing any queries performed by this connection.
   *
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  rollback: () => Promise<void>;
  /**
   * Performs a query against this connection, returning the results.
   *
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @return {*}  {(Promise<QueryResult<any>>)}
   * @throws If the connection is not open.
   * @deprecated Prefer using `.sql` (pass entire statement object) or `.knex` (pass knex query builder object)
   * @memberof IDBConnection
   */
  query: <T extends pg.QueryResultRow = any>(text: string, values?: any[]) => Promise<pg.QueryResult<T>>;
  /**
   * Performs a query against this connection, returning the results.
   *
   * @example
   * const sqlStatement = SQL`select * from table where name = ${name}`;
   * const response = await connection.sql(sqlStatement, ZodSchema);
   *
   * @param {SQLStatement} sqlStatement SQL statement object
   * @param {z.ZodSchema<T, any, any>} [ZodSchema] An optional zod schema that defines the expected shape of a `row`.
   * @return {*}  {(Promise<QueryResult<T>>)}
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  sql: <T extends pg.QueryResultRow = any>(sqlStatement: SQLStatement) => Promise<pg.QueryResult<T>>;
}

/**
 * Wraps the pg client, exposing various functions for use when making database calls.
 *
 * Usage Example:
 *
 * const sqlStatement = SQL\`select * from table where id = ${id};\`;
 *
 * const connection = await getDBConnection(req['keycloak_token']);
 *
 * try {
 *   await connection.open();
 *   await connection.query(sqlStatement1.text, sqlStatement1.values);
 *   await connection.sql(sqlStatement2);
 *   await connection.commit();
 * } catch (error) {
 *   await connection.rollback();
 * } finally {
 *   connection.release();
 * }
 *
 * @return {*} {IDBConnection}
 */
export const getDBConnection = function (): IDBConnection {
  let _client: pg.PoolClient;
  let _isOpen = false;
  let _isReleased = false;

  /**
   * Opens a new connection, begins a transaction, and sets the user context.
   *
   * Note: Does nothing if the connection is already open.
   *
   * @throws {Error} if called when the DBPool has not been initialized via `initDBPool`
   */
  const _open = async () => {
    if (_client || _isOpen) {
      return;
    }

    const pool = getDBPool();

    if (!pool) {
      throw Error('DBPool is not initialized');
    }

    _client = await pool.connect();
    _isOpen = true;
    _isReleased = false;

    await _setUserContext();
    await _client.query('BEGIN');
  };

  /**
   * Releases (closes) the connection.
   *
   * Note: Does nothing if the connection is already released.
   */
  const _release = () => {
    if (_isReleased) {
      return;
    }

    if (!_client || !_isOpen) {
      return;
    }

    _client.release();
    _isOpen = false;
    _isReleased = true;
  };

  /**
   * Commits the transaction that was opened by calling `.open()`.
   *
   * @throws {Error} if the connection is not open
   */
  const _commit = async () => {
    if (!_client || !_isOpen) {
      throw Error('DBConnection is not open');
    }

    await _client.query('COMMIT');
  };

  /**
   * Rolls back the transaction, undoing any queries performed by this connection.
   *
   * @throws {Error} if the connection is not open
   */
  const _rollback = async () => {
    if (!_client || !_isOpen) {
      throw Error('DBConnection is not open');
    }

    await _client.query('ROLLBACK');
  };

  /**
   * Performs a query against this connection, returning the results.
   *
   * @template T
   * @param {string} text SQL text
   * @param {any[]} [values] SQL values array (optional)
   * @throws {Error} if the connection is not open
   * @return {*}  {Promise<pg.QueryResult<T>>}
   */
  const _query = async <T extends pg.QueryResultRow = any>(
    text: string,
    values?: any[]
  ): Promise<pg.QueryResult<T>> => {
    if (!_client || !_isOpen) {
      throw Error('DBConnection is not open');
    }

    return _client.query<T>(text, values || []);
  };

  /**
   * Performs a query against this connection, returning the results.
   *
   * @template T
   * @param {SQLStatement} sqlStatement SQL statement object
   * @param {z.ZodSchema<T, any, any>} [ZodSchema] An optional zod schema that defines the expected shape of a `row`.
   * @throws {Error} if the connection is not open
   * @return {*}  {Promise<pg.QueryResult<T>>}
   */
  const _sql = async <T extends pg.QueryResultRow = any>(sqlStatement: SQLStatement): Promise<pg.QueryResult<T>> => {
    const response = await _query(sqlStatement.text, sqlStatement.values);

    return response;
  };

  /**
   * Set the user context.
   *
   * Sets the `_systemUserId` if successful.
   *
   * @return {*}  {Promise<void>}
   */
  const _setUserContext = async (): Promise<void> => {
    // defaultLog.debug({ label: "_setUserContext", _token });

    // Update the logged in user with their latest information from Keycloak (if it has changed)
    // await _updateSystemUserInformation(_token);
    const userGuid = 'spi';
    const userIdentitySource = 'DATABASE' as SYSTEM_IDENTITY_SOURCE;

    // Set the user context in the database, so database queries are aware of the calling user when writing to audit
    // tables, etc.
    await _setSystemUserContext(userGuid, userIdentitySource);
  };

  /**
   * Set the user context for all queries made using this connection.
   *
   * This is necessary in order for the database audit triggers to function properly.
   *
   * @param {string} userGuid
   * @param {SYSTEM_IDENTITY_SOURCE} userIdentitySource
   * @return {*}
   */
  const _setSystemUserContext = async (userGuid: string, userIdentitySource: SYSTEM_IDENTITY_SOURCE) => {
    const setSystemUserContextSQLStatement = SQL`
      SELECT api_set_context(${userGuid}, ${userIdentitySource});
    `;

    const response = await _client.query(
      setSystemUserContextSQLStatement.text,
      setSystemUserContextSQLStatement.values
    );

    return response?.rows?.[0].api_set_context;
  };

  return {
    open: _open,
    query: _query,
    sql: _sql,
    release: _release,
    commit: _commit,
    rollback: _rollback
  };
};
