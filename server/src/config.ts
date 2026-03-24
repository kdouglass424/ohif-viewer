import { z } from 'zod';

export class SecretStr {
  #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  getSecretValue(): string {
    return this.#value;
  }

  toString(): string {
    return '**********';
  }

  toJSON(): string {
    return '**********';
  }
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  // use `localhost` for developing on host or `postgres` for devcontainers
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres').pipe(z.string().transform((val) => new SecretStr(val))),
  DB_NAME: z.string().default('pacs'),
  ORTHANC_API_KEY: z.string().default('dev-orthanc-key'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  ORTHANC_INTERNAL_URL: z.string().default('http://localhost:8042'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const config: EnvConfig = envSchema.parse(process.env);
