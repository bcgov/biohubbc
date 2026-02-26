import * as fs from 'node:fs';

// Use SSL with CA verification when PG_SSL_CA_PATH is set (Crunchy); otherwise no SSL (legacy/PR).
const sslConfig = process.env.PG_SSL_CA_PATH ? { ca: fs.readFileSync(process.env.PG_SSL_CA_PATH) } : false;

export default {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ADMIN,
      password: process.env.DB_ADMIN_PASS,
      ...(sslConfig && { ssl: sslConfig })
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migration',
      schemaName: 'public',
      directory: './migrations'
    },
    seeds: {
      directory: ['./procedures', './seeds']
    }
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ADMIN,
      password: process.env.DB_ADMIN_PASS,
      ...(sslConfig && { ssl: sslConfig })
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migration',
      schemaName: 'public',
      directory: './migrations'
    },
    seeds: {
      // In production, only scripts in the `procedures` directory should run.
      directory: ['./procedures']
    }
  }
};
