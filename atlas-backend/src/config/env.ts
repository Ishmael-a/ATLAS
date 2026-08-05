import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') }); //load dotenv

//expected schema
interface Config {
  PORT: number;
  ENVIRONMENT: 'development' | 'production';
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  GOOGLE_GENAI_API_KEY: string;
  GROQ_API_KEY: string;
  GROQ_MODEL_NAME?: string;
  OPENAI_MODEL_NAME?: string;
}

const REQUIRED_VARS: (keyof Config)[] = [
  'PORT',
  'ENVIRONMENT',
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'GROQ_API_KEY',
  'GOOGLE_GENAI_API_KEY',
];

function loadConfig(): Config {
  const missingVars: (keyof Config)[] = [];

  for (const envVar of REQUIRED_VARS) {
    if (!process.env[envVar]) missingVars.push(envVar);
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing critical environment variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}\n\nPlease add them to your .env file.`
    );
  }

  return {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL!,
    ENVIRONMENT: (process.env.ENVIRONMENT as Config['ENVIRONMENT']) || 'development',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY!,
    GROQ_API_KEY: process.env.GROQ_API_KEY!,
    ...(process.env.GROQ_MODEL_NAME !== undefined && {
      GROQ_MODEL_NAME: process.env.GROQ_MODEL_NAME,
    }),
    ...(process.env.OPENAI_MODEL_NAME !== undefined && {
      OPENAI_MODEL_NAME: process.env.OPENAI_MODEL_NAME,
    }),
  };
}

export const env = loadConfig();
