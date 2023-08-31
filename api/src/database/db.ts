import knex, { Knex } from 'knex';
import * as pg from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiExecuteSQLError, ApiGeneralError } from '../errors/api-error';
import * as UserQueries from '../queries/database/user-context-queries';
import { getUserGuid, getUserIdentitySource } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import { asyncErrorWrapper, getZodQueryResult, syncErrorWrapper } from './db-utils';

export const DB_CLIENT = 'pg';

const defaultLog = getLogger('database/db');

const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USERNAME = process.env.DB_USER_API;
const DB_PASSWORD = process.env.DB_USER_API_PASS;
const DB_DATABASE = process.env.DB_DATABASE;

const DB_POOL_SIZE: number = Number(process.env.DB_POOL_SIZE) || 20;
const DB_CONNECTION_TIMEOUT: number = Number(process.env.DB_CONNECTION_TIMEOUT) || 0;
const DB_IDLE_TIMEOUT: number = Number(process.env.DB_IDLE_TIMEOUT) || 10000;

export const defaultPoolConfig: pg.PoolConfig = {
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
  host: DB_HOST,
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

  defaultLog.debug({ label: 'create db pool', message: 'pool config', poolConfig });

  try {
    DBPool = new pg.Pool(poolConfig);
  } catch (error) {
    defaultLog.error({ label: 'create db pool', message: 'failed to create db pool', error });
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
   * @param {SQLStatement} sqlStatement SQL statement object
   * @return {*}  {(Promise<QueryResult<any>>)}
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  query: <T extends pg.QueryResultRow = any>(text: string, values?: any[]) => Promise<pg.QueryResult<T>>;
  /**
   * Performs a query against this connection, returning the results.
   *
   * @param {SQLStatement} sqlStatement SQL statement object
   * @param {z.Schema<T, any, any>} zodSchema An optional zod schema
   * @return {*}  {(Promise<QueryResult<any>>)}
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  sql: <T extends pg.QueryResultRow = any>(
    sqlStatement: SQLStatement,
    zodSchema?: z.Schema<T, any, any>
  ) => Promise<pg.QueryResult<T>>;
  /**
   * Performs a query against this connection, returning the results.
   *
   * @param {Knex.QueryBuilder} queryBuilder Knex query builder object
   * @param {z.Schema<T, any, any>} zodSchema An optional zod schema
   * @return {*}  {(Promise<QueryResult<any>>)}
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  knex: <T extends pg.QueryResultRow = any>(
    queryBuilder: Knex.QueryBuilder,
    zodSchema?: z.Schema<T, any, any>
  ) => Promise<pg.QueryResult<T>>;
  /**
   * Get the ID of the system user in context.
   *
   * Note: will always return `null` if the connection is not open.
   *
   * @throws If the connection is not open.
   * @memberof IDBConnection
   */
  systemUserId: () => number;
}

/**
 * Wraps the pg client, exposing various functions for use when making database calls.
 *
 * Usage Example:
 *
 * const connection = await getDBConnection(req['keycloak_token']);
 * try {
 *   await connection.open();
 *   await connection.sql(sqlStatement1);
 *   await connection.sql(sqlStatement2);
 *   await connection.sql(sqlStatement3);
 *   await connection.commit();
 * } catch (error) {
 *   await connection.rollback();
 * } finally {
 *   connection.release();
 * }
 *
 * @param {object} keycloakToken
 * @return {*} {IDBConnection}
 */
export const getDBConnection = function (keycloakToken: object): IDBConnection {
  if (!keycloakToken) {
    throw Error('Keycloak token is undefined');
  }

  let _client: pg.PoolClient;

  let _isOpen = false;
  let _isReleased = false;

  let _systemUserId: number | null = null;

  const _token = keycloakToken;

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
   * @param {z.Schema<T, any, any>} zodSchema An optional zod schema
   * @throws {Error} if the connection is not open
   * @return {*}  {Promise<pg.QueryResult<T>>}
   */
  const _sql = async <T extends pg.QueryResultRow = any>(
    sqlStatement: SQLStatement,
    zodSchema?: z.Schema<T, any, any>
  ): Promise<pg.QueryResult<T>> => {
    const response = await _query(sqlStatement.text, sqlStatement.values);

    if (zodSchema) {
      // Validate the response against the zod schema
      return getZodQueryResult(zodSchema).parseAsync(response);
    }

    return response;
  };

  /**
   * Performs a query against this connection, returning the results.
   *
   * @template T
   * @param {Knex.QueryBuilder} queryBuilder Knex query builder object
   * @param {z.Schema<T, any, any>} zodSchema An optional zod schema
   * @throws {Error} if the connection is not open
   * @return {*}  {Promise<pg.QueryResult<T>>}
   */
  const _knex = async <T extends pg.QueryResultRow = any>(
    queryBuilder: Knex.QueryBuilder,
    zodSchema?: z.Schema<T, any, any>
  ) => {
    const { sql, bindings } = queryBuilder.toSQL().toNative();

    const response = await _query(sql, bindings as any[]);

    if (zodSchema) {
      // Validate the response against the zod schema
      return getZodQueryResult(zodSchema).parseAsync(response);
    }

    return response;
  };

  /**
   * Get the ID of the system user in context.
   *
   * Note: will always return `null` if the connection is not open.
   *
   * @return {*}  {number}
   */
  const _getSystemUserID = (): number => {
    if (!_client || !_isOpen) {
      throw Error('DBConnection is not open');
    }

    return _systemUserId as number;
  };

  /**
   * Set the user context.
   *
   * Sets the _systemUserId if successful.
   */
  const _setUserContext = async () => {
    const userGuid = getUserGuid(_token);

    const userIdentitySource = getUserIdentitySource(_token);

    if (!userGuid || !userIdentitySource) {
      throw new ApiGeneralError('Failed to identify authenticated user');
    }

    // Set the user context for all queries made using this connection
    const setSystemUserContextSQLStatement = UserQueries.setSystemUserContextSQL(userGuid, userIdentitySource);

    if (!setSystemUserContextSQLStatement) {
      throw new ApiExecuteSQLError('Failed to build SQL user context statement');
    }

    try {
      const response = await _client.query(
        setSystemUserContextSQLStatement.text,
        setSystemUserContextSQLStatement.values
      );

      _systemUserId = response?.rows?.[0].api_set_context;
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to set user context', [error as object]);
    }
  };

  return {
    open: asyncErrorWrapper(_open),
    query: asyncErrorWrapper(_query),
    sql: asyncErrorWrapper(_sql),
    knex: asyncErrorWrapper(_knex),
    commit: asyncErrorWrapper(_commit),
    rollback: asyncErrorWrapper(_rollback),
    release: syncErrorWrapper(_release),
    systemUserId: syncErrorWrapper(_getSystemUserID)
  };
};

/**
 * Returns an IDBConnection where the system user context is set to the API's system user.
 *
 * Note: Use of this should be limited to requests that are impossible to initiated under a real user context (ie: when
 * an unknown user is requesting access to BioHub and therefore does not yet have a user in the system).
 *
 * @return {*}  {IDBConnection}
 */
export const getAPIUserDBConnection = (): IDBConnection => {
  return getDBConnection({
    preferred_username: `${DB_USERNAME}@${SYSTEM_IDENTITY_SOURCE.DATABASE}`,
    identity_provider: SYSTEM_IDENTITY_SOURCE.DATABASE
  });
};

/**
 * Returns an IDBConnection where the system user context is set to a service client user.
 *
 * Note: Use of this should be limited to requests that are sent by an external system that is participating in BioHub
 * by submitting data to the BioHub Platform Backbone.
 *
 * @param {SOURCE_SYSTEM} sourceSystem
 * @return {*}  {IDBConnection}
 */
export const getServiceAccountDBConnection = (sourceSystem: SOURCE_SYSTEM): IDBConnection => {
  return getDBConnection({
    preferred_username: `service-account-${sourceSystem}@${SYSTEM_IDENTITY_SOURCE.SYSTEM}`,
    identity_provider: SYSTEM_IDENTITY_SOURCE.SYSTEM
  });
};

/**
 * Get a Knex queryBuilder instance.
 *
 * @template TRecord
 * @template TResult
 * @return {*}  {Knex.QueryBuilder<TRecord, TResult>}
 */
export const getKnexQueryBuilder = <
  TRecord extends Record<string, any> = any,
  TResult = Record<string, any>[]
>(): Knex.QueryBuilder<TRecord, TResult> => {
  return knex<TRecord, TResult>({ client: DB_CLIENT }).queryBuilder();
};

/**
 * Get a Knex instance.
 *
 * @template TRecord
 * @template TResult
 * @return {*}  {Knex<TRecord, TResult>}
 */
export const getKnex = <TRecord extends Record<string, any> = any, TResult = Record<string, any>[]>(): Knex<
  TRecord,
  TResult
> => {
  return knex<TRecord, TResult>({ client: DB_CLIENT });
};
