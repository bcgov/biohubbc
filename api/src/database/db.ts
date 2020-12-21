import { Pool, PoolClient, PoolConfig } from 'pg';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('database/db');

const DB_HOST: string = process.env.DB_HOST || 'localhost';
const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
const DB_USERNAME: string = process.env.DB_USER || 'postgres';
const DB_PASSWORD: string = process.env.DB_PASS || 'postgres';
const DB_DATABASE: string = process.env.DB_DATABASE || 'biohubbc';
const DB_SCHEMA: string = process.env.DB_SCHEMA || 'biohubbc';

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

let pool: Pool = null;

try {
  pool = new Pool(poolConfig);
} catch (error) {
  defaultLog.error({ label: 'create db pool', message: 'failed to create pool', error, poolConfig });
  process.exit(1);
}

/**
 * Waits for availability, and returns a pool client from the existing `pool`.
 *
 * Note: Sets the initial `search_path` and `SCHEMA` based on the DB_SCHEMA env variable.
 * Note: Callers should call `client.release()` when finished with the pool client.
 *
 * @returns {Promise<PoolClient>}
 */
export const getDBConnection = async function (): Promise<PoolClient> {
  let client: PoolClient = null;

  try {
    client = await pool.connect();

    await client.query(`SET search_path TO ${client.escapeLiteral(DB_SCHEMA)}, public;`);
    await client.query(`SET SCHEMA ${client.escapeLiteral(DB_SCHEMA)};`);
  } catch (error) {
    defaultLog.error({ label: 'getDBConnection', message: 'error', error });
    throw error;
  }

  return client;
};
