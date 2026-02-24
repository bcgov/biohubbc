// When PGSSLMODE=require (e.g. Crunchy Postgres with self-signed cert), use SSL and accept self-signed for this connection only.
const sslConfig = process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false;

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
