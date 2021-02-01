export default {
  local: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ADMIN,
      password: process.env.DB_ADMIN_PASS
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
      directory: './seeds'
    }
  },
  dev: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ADMIN,
      password: process.env.DB_ADMIN_PASS
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
      directory: './seeds'
    }
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ADMIN,
      password: process.env.DB_ADMIN_PASS
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
      directory: './seeds'
    }
  },
  prod: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_ADMIN,
      password: process.env.DB_ADMIN_PASS
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
      directory: './seeds'
    }
  }
};
