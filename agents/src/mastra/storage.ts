import { Pool } from 'pg';
import { PostgresStore } from '@mastra/pg';
import { mastraConfig } from './config';

export const postgresConnectionConfig = mastraConfig.DATABASE_URL
  ? { connectionString: mastraConfig.DATABASE_URL }
  : {
      database: mastraConfig.MASTRA_PG_DATABASE,
      host: mastraConfig.MASTRA_PG_HOST,
      password: mastraConfig.MASTRA_PG_PASSWORD,
      port: mastraConfig.MASTRA_PG_PORT,
      user: mastraConfig.MASTRA_PG_USER,
    };

export const postgresPool = new Pool(postgresConnectionConfig);

export const mastraStorage = new PostgresStore({
  id: 'mastra-storage',
  schemaName: mastraConfig.MASTRA_STORAGE_SCHEMA,
  ...postgresConnectionConfig,
});
