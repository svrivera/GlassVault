// knexfile.js
module.exports = {
    development: {
      client: 'pg',
      connection: {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_USER || '',
        database: 'glass_vault_development',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: './migrations',
      },
      seeds: {
        directory: './seeds',
      },
    },
    production: {
      client: 'pg',
      connection: process.env.DATABASE_URL,
      migrations: {
        tableName: 'knex_migrations',
        directory: './migrations',
      },
      seeds: {
        directory: './seeds',
      },
    },
  };
