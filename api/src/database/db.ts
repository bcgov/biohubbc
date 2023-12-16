import knex, { Knex } from 'knex';
import * as pg from 'pg';
import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiExecuteSQLError } from '../errors/api-error';
import {
  DatabaseUserInformation,
  getUserGuid,
  getUserIdentitySource,
  KeycloakUserInformation,
  ServiceClientUserInformation
} from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import {
  asyncErrorWrapper,
  getGenericizedKeycloakUserInformation,
  getZodQueryResult,
  syncErrorWrapper
} from './db-utils';

const defaultLog = getLogger('database/db');

const getDbHost = () => process.env.DB_HOST;
const getDbPort = () => Number(process.env.DB_PORT);
const getDbUsername = () => process.env.DB_USER_API;
const getDbPassword = () => process.env.DB_USER_API_PASS;
const getDbDatabase = () => process.env.DB_DATABASE;

const DB_POOL_SIZE: number = Number(process.env.DB_POOL_SIZE) || 20;
const DB_CONNECTION_TIMEOUT: number = Number(process.env.DB_CONNECTION_TIMEOUT) || 0;
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
   * // Create a basic SQLStatement object
   * const sqlStatement = SQL`select * from table where name = ${name}`;
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
   * @see {@link getKnex} to get a knex instance.
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
 * @param {object} keycloakToken
 * @return {*} {IDBConnection}
 */
export const getDBConnection = function (keycloakToken: KeycloakUserInformation): IDBConnection {
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

  const _getSystemUserID = (): number => {
    if (!_client || !_isOpen) {
      throw Error('DBConnection is not open');
    }

    return _systemUserId as number;
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
    if (process.env.NODE_ENV === 'production') {
      // Don't run timers or zod schemas in production
      return _query(sqlStatement.text, sqlStatement.values);
    }

    const queryStart = Date.now();
    const response = await _query(sqlStatement.text, sqlStatement.values);
    const queryEnd = Date.now();

    if (!zodSchema) {
      defaultLog.silly({ label: '_sql', message: sqlStatement.text, queryExecutionTime: queryEnd - queryStart });
      return response;
    }

    // Validate the response against the zod schema
    const zodStart = Date.now();
    const validatedResponse = getZodQueryResult(zodSchema).parseAsync(response);
    const zodEnd = Date.now();

    defaultLog.silly({
      label: '_sql + zod',
      message: sqlStatement.text,
      queryExecutionTime: queryEnd - queryStart,
      zodExecutionTime: zodEnd - zodStart
    });
    return validatedResponse;
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

    if (process.env.NODE_ENV === 'production') {
      // Don't run timers or zod schemas in production
      return _query(sql, bindings as any[]);
    }

    const queryStart = Date.now();
    const response = await _query(sql, bindings as any[]);
    const queryEnd = Date.now();

    if (!zodSchema) {
      defaultLog.silly({ label: '_knex', message: sql, queryExecutionTime: queryEnd - queryStart });
      return response;
    }

    // Validate the response against the zod schema
    const zodStart = Date.now();
    const validatedResponse = getZodQueryResult(zodSchema).parseAsync(response);
    const zodEnd = Date.now();

    defaultLog.silly({
      label: '_knex + zod',
      message: sql,
      queryExecutionTime: queryEnd - queryStart,
      zodExecutionTime: zodEnd - zodStart
    });
    return validatedResponse;
  };

  /**
   * Set the user context.
   *
   * Sets the `_systemUserId` if successful.
   *
   * @return {*}  {Promise<void>}
   */
  const _setUserContext = async (): Promise<void> => {
    defaultLog.debug({ label: '_setUserContext', _token });

    // Update the logged in user with their latest information from Keycloak (if it has changed)
    await _updateSystemUserInformation(_token);

    try {
      // Set the user context in the database, so database queries are aware of the calling user when writing to audit
      // tables, etc.
      _systemUserId = await _setSystemUserContext(getUserGuid(_token), getUserIdentitySource(_token));
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to set user context', [error as object]);
    }
  };

  /**
   * Update a system user's record with the latest information from a verified Keycloak token.
   *
   * Note: Does nothing if the user is an internal database user.
   *
   * @param {KeycloakUserInformation} keycloakUserInformation
   * @return {*}  {Promise<void>}
   */
  const _updateSystemUserInformation = async (keycloakUserInformation: KeycloakUserInformation): Promise<void> => {
    const data = getGenericizedKeycloakUserInformation(keycloakUserInformation);

    if (!data) {
      return;
    }

    const patchSystemUserSQLStatement = SQL`
      SELECT api_patch_system_user(
        ${data.user_guid},
        ${data.user_identifier},
        ${data.user_identity_source},
        ${data.email},
        ${data.display_name},
        ${data.given_name || null},
        ${data.family_name || null},
        ${data.agency || null}
      )
    `;

    await _client.query(patchSystemUserSQLStatement.text, patchSystemUserSQLStatement.values);
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
    open: asyncErrorWrapper(_open),
    query: asyncErrorWrapper(_query),
    sql: asyncErrorWrapper(_sql),
    knex: asyncErrorWrapper(_knex),
    release: syncErrorWrapper(_release),
    commit: asyncErrorWrapper(_commit),
    rollback: asyncErrorWrapper(_rollback),
    systemUserId: syncErrorWrapper(_getSystemUserID)
  };
};

/**
 * Returns an IDBConnection where the system user context is set to a service client user.
 *
 * Note: Spoofs a keycloak token in order to leverage the same keycloak/database code that would normally be
 * called when queries are executed on behalf of a real human user.
 *
 * Future enhancement: Service client users do have real keycloak tokens, and so this/related code could be enhanced to
 * process a service client token in a similar fashion to a regular token, rather than spoofing the token.
 *
 * @param {SOURCE_SYSTEM} sourceSystem
 * @return {*}  {IDBConnection}
 */
export const getServiceClientDBConnection = (sourceSystem: SOURCE_SYSTEM): IDBConnection => {
  return getDBConnection({
    database_user_guid: sourceSystem,
    identity_provider: SYSTEM_IDENTITY_SOURCE.SYSTEM.toLowerCase(),
    username: `service-account-${sourceSystem}`
  } as ServiceClientUserInformation);
};

/**
 * Returns an IDBConnection where the system user context is set to the API's system user.
 *
 * Note: Spoofs a keycloak token in order to leverage the same keycloak/database code that would normally be
 * called when queries are executed on behalf of a real human user.
 *
 * Note: Use of this should be limited to requests that are impossible to initiated under a real user context (ie: when
 * an unknown user is requesting access to BioHub and therefore does not yet have a user in the system).
 *
 * @return {*}  {IDBConnection}
 */
export const getAPIUserDBConnection = (): IDBConnection => {
  return getDBConnection({
    database_user_guid: getDbUsername(),
    identity_provider: SYSTEM_IDENTITY_SOURCE.DATABASE.toLowerCase(),
    username: getDbUsername()
  } as DatabaseUserInformation);
};

/**
 * Get a Knex instance.
 *
 * @template TRecord
 * @template TResult
 * @return {*}  {Knex<TRecord,TResult>}
 */
export const getKnex = <TRecord extends Record<string, any> = any, TResult = Record<string, any>[]>(): Knex<
  TRecord,
  TResult
> => {
  return knex<TRecord, TResult>({ client: DB_CLIENT });
};
